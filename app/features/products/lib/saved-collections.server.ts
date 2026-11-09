import {
  COLLECTION_CUSTOMER_NAME_METAFIELD,
  COLLECTION_METAFIELD_KEYS,
  COLLECTION_METAFIELD_NAMESPACE,
  UTX_SAVED_COLLECTION_TAG,
} from '~/shared/constants/metafields';
import {adminQuery} from '~/lib/shopify/admin.server';
import {createLogger} from '~/lib/logger';
import type {SavedCollection} from '../schemas/saved-collection.schema';
import {
  companyNameResponseSchema,
  savedCollectionCreateResponseSchema,
  savedCollectionOwnerResponseSchema,
  savedCollectionsResponseSchema,
  savedCollectionUpdateResponseSchema,
} from '../schemas/saved-collection.schema';
import {
  COMPANY_NAME_QUERY,
  SAVED_COLLECTION_ADD_PRODUCT_MUTATION,
  SAVED_COLLECTION_CREATE_MUTATION,
  SAVED_COLLECTION_OWNER_QUERY,
  SAVED_COLLECTIONS_QUERY,
} from '../queries/saved-collections';

const log = createLogger('products.savedCollections');
const SAVED_COLLECTION_SOURCE_TITLE = 'Saved products';
const COLLECTION_PAGE_SIZE = 100;

export async function loadSavedCollections(
  env: Env,
  ownerId: string,
): Promise<SavedCollection[]> {
  const collections: SavedCollection[] = [];
  let after: string | null = null;
  let hasNextPage = true;

  try {
    while (hasNextPage) {
      const payload = await adminQuery({
        env,
        query: SAVED_COLLECTIONS_QUERY,
        variables: {first: COLLECTION_PAGE_SIZE, after},
      });
      const response = savedCollectionsResponseSchema.parse(payload);
      response.collections.edges.forEach(({node}) => {
        if (
          node.tags?.value === UTX_SAVED_COLLECTION_TAG &&
          node.createdBy?.value === ownerId
        ) {
          collections.push({
            id: node.id,
            name: node.title,
            productCount: node.productsCount.count,
          });
        }
      });
      hasNextPage = response.collections.pageInfo.hasNextPage;
      after = response.collections.pageInfo.endCursor;
    }
  } catch (error) {
    log.error('Saved collection lookup failed', {
      ownerId,
      cause: error instanceof Error ? error.message : String(error),
    });
  }

  return collections;
}

async function loadCompanyName(env: Env, companyId: string): Promise<string> {
  try {
    const payload = await adminQuery({
      env,
      query: COMPANY_NAME_QUERY,
      variables: {id: companyId},
    });
    return companyNameResponseSchema.parse(payload).company?.name ?? '';
  } catch (error) {
    log.warn('Company name lookup failed', {
      companyId,
      cause: error instanceof Error ? error.message : String(error),
    });
    return '';
  }
}

export async function saveProductToCollection(
  env: Env,
  ownerId: string,
  input:
    | {operation: 'add'; collectionId: string; productIds: string[]}
    | {
        operation: 'create';
        name: string;
        customerId: string;
        productIds: string[];
      },
): Promise<{ok: true; collectionId: string} | {ok: false}> {
  try {
    let collectionId: string;
    if (input.operation === 'create') {
      const customerName = input.customerId
        ? await loadCompanyName(env, input.customerId)
        : '';
      const payload = await adminQuery({
        env,
        query: SAVED_COLLECTION_CREATE_MUTATION,
        variables: {
          collection: {
            title: input.name,
            sortOrder: 'MANUAL',
            metafields: [
              {
                namespace: COLLECTION_METAFIELD_NAMESPACE,
                key: COLLECTION_METAFIELD_KEYS.tags,
                type: 'single_line_text_field',
                value: UTX_SAVED_COLLECTION_TAG,
              },
              {
                namespace: COLLECTION_METAFIELD_NAMESPACE,
                key: COLLECTION_METAFIELD_KEYS.createdBy,
                type: 'single_line_text_field',
                value: ownerId,
              },
              // ❓ TO CONFIRM — same `custom.customer` company reference the presentation collections write
              ...(input.customerId
                ? [
                    {
                      namespace: COLLECTION_METAFIELD_NAMESPACE,
                      key: COLLECTION_METAFIELD_KEYS.customer,
                      type: 'company_reference',
                      value: input.customerId,
                    },
                  ]
                : []),
              ...(customerName
                ? [
                    {
                      ...COLLECTION_CUSTOMER_NAME_METAFIELD,
                      type: 'single_line_text_field',
                      value: customerName,
                    },
                  ]
                : []),
            ],
            sources: [
              {
                source: {
                  title: SAVED_COLLECTION_SOURCE_TITLE,
                  targetType: 'PRODUCTS',
                  inclusion: {
                    matchType: 'ALL',
                    selections: input.productIds.map((productId) => ({productId})),
                  },
                },
              },
            ],
          },
        },
      });
      const {collectionCreate} = savedCollectionCreateResponseSchema.parse(payload);
      if (collectionCreate.userErrors.length || !collectionCreate.collection) {
        log.error('Saved collection was not created', {
          ownerId,
          userErrors: collectionCreate.userErrors,
        });
        return {ok: false};
      }
      collectionId = collectionCreate.collection.id;
      return {ok: true, collectionId};
    } else {
      const payload = await adminQuery({
        env,
        query: SAVED_COLLECTION_OWNER_QUERY,
        variables: {id: input.collectionId},
      });
      const {collection} = savedCollectionOwnerResponseSchema.parse(payload);
      if (
        !collection ||
        collection.tags?.value !== UTX_SAVED_COLLECTION_TAG ||
        collection.createdBy?.value !== ownerId
      ) {
        log.warn('Saved collection ownership check failed', {
          ownerId,
          collectionId: input.collectionId,
        });
        return {ok: false};
      }
      collectionId = collection.id;
      const source = collection.sources.find(
        (candidate) =>
          candidate.__typename === 'CollectionConditionsSource' &&
          candidate.title === SAVED_COLLECTION_SOURCE_TITLE,
      );
      if (!source) {
        log.error('Saved collection has no UTX product source', {
          ownerId,
          collectionId,
        });
        return {ok: false};
      }

      const updatePayload = await adminQuery({
        env,
        query: SAVED_COLLECTION_ADD_PRODUCT_MUTATION,
        variables: {
          collectionId,
          sourceId: source.id,
          selections: input.productIds.map((productId) => ({productId})),
        },
      });
      const {collectionUpdate} =
        savedCollectionUpdateResponseSchema.parse(updatePayload);
      if (collectionUpdate.userErrors.length || !collectionUpdate.collection) {
        log.error('Products were not added to saved collection', {
          ownerId,
          collectionId,
          userErrors: collectionUpdate.userErrors,
        });
        return {ok: false};
      }
      return {ok: true, collectionId};
    }
  } catch (error) {
    log.error('Saving product to collection failed', {
      ownerId,
      cause: error instanceof Error ? error.message : String(error),
    });
    return {ok: false};
  }
}
