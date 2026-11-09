/**
 * Creates the Shopify Collection behind a new presentation.
 *
 * SERVER ONLY. It calls the Admin API, so it must not reach the browser.
 * Shopify collection id when successful.
 */
import { COLLECTION_CREATE_MUTATION } from '~/features/presentations/queries/collections';
import {
  adminCollectionCreateResponseSchema,
  type CreatePresentationCollectionInput,
} from '~/features/presentations/schemas/collection.schema';
import { adminQuery } from '~/lib/shopify/admin.server';
import { createLogger } from '~/lib/logger';

const log = createLogger('presentations.collectionCreate');
const PRESENTATION_SOURCE_TITLE = 'Presentation products';

export type CreatePresentationCollectionResult =
  | { ok: true; collectionId: string }
  | { ok: false };

/**
 * `createdBy` is the signed-in user's Customer Account id, resolved by the
 * action from the session — never taken from the submitted form.
 */
export async function createPresentationCollection(
  env: Env,
  input: CreatePresentationCollectionInput,
  createdBy: string,
  productIds: string[] = [],
): Promise<CreatePresentationCollectionResult> {
  try {
    const payload = await adminQuery({
      env,
      query: COLLECTION_CREATE_MUTATION,
      variables: {
        collection: {
          title: input.name,
          sortOrder: 'MANUAL',
          metafields: [
            {
              namespace: 'custom',
              key: 'tags',
              type: 'single_line_text_field',
              value: 'Presentation',
            },
            {
              namespace: 'custom',
              key: 'customer',
              type: 'company_reference',
              value: input.customer,
            },
            {
              namespace: 'custom',
              key: 'needed_by',
              type: 'date',
              value: input.neededBy,
            },
            {
              namespace: 'custom',
              key: 'status',
              type: 'single_line_text_field',
              value: 'draft',
            },
            {
              namespace: 'custom',
              key: 'created_by',
              type: 'single_line_text_field',
              value: createdBy,
            },
          ],
          ...(productIds.length > 0
            ? {
                sources: [
                  {
                    source: {
                      title: PRESENTATION_SOURCE_TITLE,
                      targetType: 'PRODUCTS',
                      inclusion: {
                        matchType: 'ALL',
                        selections: productIds.map((productId) => ({
                          productId,
                        })),
                      },
                    },
                  },
                ],
              }
            : {}),
        },
      },
    });

    const { collectionCreate } = adminCollectionCreateResponseSchema.parse(payload);

    if (
      collectionCreate.userErrors.length > 0 ||
      collectionCreate.collection === null
    ) {
      log.error('Presentation collection was not created', {
        userErrors: collectionCreate.userErrors,
      });
      return { ok: false };
    }

    log.info('Presentation collection created', {
      id: collectionCreate.collection.id,
    });

    return { ok: true, collectionId: collectionCreate.collection.id };
  } catch (error) {
    log.error('Presentation collection create failed', {
      cause: error instanceof Error ? error.message : String(error),
    });

    return { ok: false };
  }
}
