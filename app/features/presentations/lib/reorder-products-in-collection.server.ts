import { adminQuery } from '~/lib/shopify/admin.server';
import { createLogger } from '~/lib/logger';

import { REORDER_PRODUCTS_IN_PRESENTATION_COLLECTION_MUTATION } from '~/features/presentations/queries/collection-reorder-products';
import { adminCollectionReorderProductsResponseSchema } from '~/features/presentations/schemas/collection.schema';

const log = createLogger('presentations.reorderProducts');

interface ReorderProductsInPresentationCollectionInput {
  collectionId: string;
  productId: string;
  newPosition: number;
}

export async function reorderProductsInPresentationCollection(
  env: Env,
  input: ReorderProductsInPresentationCollectionInput,
): Promise<{ ok: boolean }> {
  try {
    const payload = await adminQuery({
      env,
      query: REORDER_PRODUCTS_IN_PRESENTATION_COLLECTION_MUTATION,
      variables: {
        id: input.collectionId,
        moves: [
          {
            id: input.productId,
            newPosition: String(input.newPosition),
          },
        ],
      },
    });

    const { collectionReorderProducts } =
      adminCollectionReorderProductsResponseSchema.parse(payload);

    if (collectionReorderProducts.userErrors.length > 0) {
      log.error('Products were not reordered in the presentation collection', {
        id: input.collectionId,
        userErrors: collectionReorderProducts.userErrors,
      });

      return { ok: false };
    }

    log.info('Products reordered in the presentation collection', {
      id: input.collectionId,
      productId: input.productId,
      newPosition: input.newPosition,
    });

    return { ok: true };
  } catch (error) {
    log.error('Reordering products in the presentation collection failed', {
      id: input.collectionId,
      error
    });

    return { ok: false };
  }
}