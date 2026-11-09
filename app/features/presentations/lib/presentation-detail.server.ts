/**
 * Loads one Shopify-backed presentation for the Details page.
 *
 * SERVER ONLY. It calls the Admin API, so it must not reach the browser.
 */
import { PRESENTATION_COLLECTION_DETAIL_QUERY } from '~/features/presentations/queries/collections';
import { adminPresentationCollectionDetailResponseSchema } from '~/features/presentations/schemas/collection.schema';
import { mapShopifyCollectionToPresentationDetail } from '~/features/presentations/lib/presentation-detail.mapper';
import { loadCustomerName } from '~/features/presentations/lib/customer-name.server';
import type {
  PresentationCustomer,
  PresentationDetail,
} from '~/features/presentations/types/presentations';
import { adminQuery } from '~/lib/shopify/admin.server';
import { createLogger } from '~/lib/logger';

const log = createLogger('presentations.detail');

export async function loadPresentationCollectionDetail(
  env: Env,
  id: string,
  customers: PresentationCustomer[],
): Promise<PresentationDetail | null> {
  try {
    const payload = await adminQuery({
      env,
      query: PRESENTATION_COLLECTION_DETAIL_QUERY,
      variables: { id },
    });

    const { collection } =
      adminPresentationCollectionDetailResponseSchema.parse(payload);

    if (collection === null) {
      log.warn('Presentation collection not found', { id });
      return null;
    }

    if (collection.tags?.value !== 'Presentation') {
      log.warn('Collection is not a Presentation', { id });
      return null;
    }

    log.info('Presentation collection detail response', {
      collectionId: collection.id,
      collectionTitle: collection.title,
      productIds: collection.products.nodes.map((product) => product.id),
      productTitles: collection.products.nodes.map((product) => product.title),
    });

    const createdById = collection.createdBy?.value ?? '';
    const createdByName = createdById
      ? (await loadCustomerName(env, createdById)) ?? ''
      : '';

    return mapShopifyCollectionToPresentationDetail(
      collection,
      customers,
      createdByName,
    );
  } catch (error) {
    log.error('Presentation collection detail lookup failed', {
      id,
      cause: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}
