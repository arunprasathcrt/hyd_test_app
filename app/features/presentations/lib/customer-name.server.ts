/**
 * Reads a Customer's display name from their GID, for the Presentation Details
 * header's "created by" fact.
 *
 * SERVER ONLY. It calls the Admin API, so it must not reach the browser.
 */
import { CUSTOMER_NAME_QUERY } from '~/features/presentations/queries/customer-name';
import { adminCustomerNameResponseSchema } from '~/features/presentations/schemas/collection.schema';
import { adminQuery } from '~/lib/shopify/admin.server';
import { createLogger } from '~/lib/logger';

const log = createLogger('presentations.customerName');

export async function loadCustomerName(
  env: Env,
  id: string,
): Promise<string | null> {
  try {
    const payload = await adminQuery({
      env,
      query: CUSTOMER_NAME_QUERY,
      variables: { id },
    });

    const { customer } = adminCustomerNameResponseSchema.parse(payload);

    if (customer === null) {
      log.warn('Customer not found', { id });
      return null;
    }

    return customer.displayName;
  } catch (error) {
    log.error('Customer name lookup failed', {
      id,
      cause: error instanceof Error ? error.message : String(error),
    });

    return null;
  }
}
