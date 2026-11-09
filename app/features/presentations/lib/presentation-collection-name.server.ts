/**
 * Reads the name of a Shopify Presentation collection, for the Products page's
 * target strip.
 *
 * SERVER ONLY. It calls the Admin API, so it must not reach the browser.
 */
import { PRESENTATION_COLLECTION_NAME_QUERY } from '~/features/presentations/queries/collection-name';
import { adminPresentationCollectionNameResponseSchema } from '~/features/presentations/schemas/collection.schema';
import { adminQuery } from '~/lib/shopify/admin.server';
import { createLogger } from '~/lib/logger';

const log = createLogger('presentations.target');

export async function loadPresentationCollectionName(
  env: Env,
  id: string,
): Promise<string | null> {
  try {
    const payload = await adminQuery({
      env,
      query: PRESENTATION_COLLECTION_NAME_QUERY,
      variables: { id },
    });

    const { collection } =
      adminPresentationCollectionNameResponseSchema.parse(payload);

    if (collection === null) {
      log.warn('Presentation collection not found', { id });
      return null;
    }

    return collection.title;
  } catch (error) {
    log.error('Presentation collection name lookup failed', {
      id,
      cause: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}
