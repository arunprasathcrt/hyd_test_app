/**
 * Adds products to a Shopify presentation collection.
 *
 * SERVER ONLY. It calls the Admin API, so it must not reach the browser.
 *
 * The local draft and addition flows are not touched. This only runs for
 * Shopify presentation targets.
 */
import {
  ADD_PRODUCTS_TO_PRESENTATION_MUTATION,
  CREATE_PRESENTATION_SOURCE_MUTATION,
  PRESENTATION_COLLECTION_SOURCES_QUERY,
} from '~/features/presentations/queries/collection-add-products';
import {
  adminCollectionAddProductsResponseSchema,
  adminPresentationCollectionSourcesResponseSchema,
  type AddProductsResult,
  type AddProductsToPresentationInput,
} from '~/features/presentations/schemas/collection.schema';
import { adminQuery } from '~/lib/shopify/admin.server';
import { createLogger } from '~/lib/logger';

const log = createLogger('presentations.addProducts');
const PRESENTATION_SOURCE_TITLE = 'Presentation products';

export async function addProductsToPresentationCollection(
  env: Env,
  input: AddProductsToPresentationInput,
): Promise<AddProductsResult> {
  try {
    const sourcePayload = await adminQuery({
      env,
      query: PRESENTATION_COLLECTION_SOURCES_QUERY,
      variables: {id: input.collectionId},
    });
    const {collection} =
      adminPresentationCollectionSourcesResponseSchema.parse(sourcePayload);
    const source = collection?.sources.find(
      (candidate) =>
        candidate.__typename === 'CollectionConditionsSource' &&
        candidate.title === PRESENTATION_SOURCE_TITLE,
    );

    if (!source) {
      const createSourcePayload = await adminQuery({
        env,
        query: CREATE_PRESENTATION_SOURCE_MUTATION,
        variables: {
          collectionId: input.collectionId,
          title: PRESENTATION_SOURCE_TITLE,
          selections: input.productIds.map((productId) => ({
            productId,
          })),
        },
      });
      log.info('Presentation source created', {
        id: input.collectionId,
        response: createSourcePayload,
      });
      return {
        ok: true,
        addedCount: input.productIds.length,
      };
    }

    if (!collection) {
      log.error('Presentation collection not found', {
        id: input.collectionId,
      });
      return {ok: false};
    }

    const payload = await adminQuery({
      env,
      query: ADD_PRODUCTS_TO_PRESENTATION_MUTATION,
      variables: {
        collectionId: input.collectionId,
        sourceId: source.id,
        selections: input.productIds.map((productId) => ({productId})),
      },
    });

    const { collectionUpdate } =
      adminCollectionAddProductsResponseSchema.parse(payload);

    if (collectionUpdate.userErrors.length > 0 || !collectionUpdate.collection) {
      log.error('Products were not added to the presentation collection', {
        id: input.collectionId,
        userErrors: collectionUpdate.userErrors,
      });
      return { ok: false };
    }

    log.info('Products added to the presentation collection', {
      id: input.collectionId,
      count: input.productIds.length,
    });

    return { ok: true, addedCount: input.productIds.length };
  } catch (error) {
    log.error('Adding products to the presentation collection failed', {
      id: input.collectionId,
      cause: error instanceof Error ? error.message : String(error),
    });

    return { ok: false };
  }
}
