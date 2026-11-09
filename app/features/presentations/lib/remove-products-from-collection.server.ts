import { REMOVE_PRODUCTS_FROM_PRESENTATION_MUTATION } from '~/features/presentations/queries/collection-remove-products';
import {
  adminCollectionRemoveProductsResponseSchema,
  type AddProductsResult,
  type AddProductsToPresentationInput,
} from '~/features/presentations/schemas/collection.schema';
import { adminQuery } from '~/lib/shopify/admin.server';
import { createLogger } from '~/lib/logger';

const log = createLogger('presentations.removeProducts');

export async function removeProductsFromPresentationCollection(
  env: Env,
  input: AddProductsToPresentationInput,
): Promise<AddProductsResult> {
  try {
    const payload = await adminQuery({
      env,
      query: REMOVE_PRODUCTS_FROM_PRESENTATION_MUTATION,
      variables: {
        id: input.collectionId,
        productIds: input.productIds,
      },
    });

    const { collectionRemoveProducts } =
      adminCollectionRemoveProductsResponseSchema.parse(payload);

    if (collectionRemoveProducts.userErrors.length > 0) {
      log.error('Products were not removed from the presentation collection', {
        id: input.collectionId,
        userErrors: collectionRemoveProducts.userErrors,
      });

      return { ok: false };
    }

    log.info('Products removed from the presentation collection', {
      id: input.collectionId,
      count: input.productIds.length,
    });

    return {
      ok: true,
      addedCount: input.productIds.length,
    };

  } catch (error) {
    log.error('Removing products from the presentation collection failed', {
      id: input.collectionId,
      cause: error instanceof Error ? error.message : String(error),
    });

    return { ok: false };
  }
}