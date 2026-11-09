/**
 * Presentation customer list for the loaders. Reads the Shopify Companies that
 * the Accounts feature already queries, and falls back to the mock list when
 * Shopify returns none.
 *
 * SERVER ONLY. It calls the Admin API, so it must not reach the browser.
 */

import type { PresentationCustomer } from '~/features/presentations/types/presentations';
import { adminQuery } from '~/lib/shopify/admin.server';
import { createLogger } from '~/lib/logger';
import { PRESENTATION_CUSTOMERS_QUERY } from '../queries/presentation-customer';
import { presentationCustomersResponseSchema } from '../schemas/presentation-customer.schema';

const log = createLogger('presentations.customers');

export async function loadPresentationCustomers(
	env: Env,
): Promise<PresentationCustomer[]> {
	try {
		const payload = await adminQuery({
			env,
			query: PRESENTATION_CUSTOMERS_QUERY,
			variables: { first: 50 },
		});
		const { companies } = presentationCustomersResponseSchema.parse(payload);
				
		const customers = companies.nodes.map((company) => ({
			id: company.id,
			name: company.name,
			shortName: '',
			segment: company.segment?.value?.trim() ?? '',
			tier: company.tier?.value?.trim() ?? '',
			customerCode: company.customerCode?.value?.trim() ?? '',
			repName: company.repName?.value?.trim() ?? '',
			contact: [
				company.mainContact?.customer?.firstName,
				company.mainContact?.customer?.lastName,
			]
				.filter(Boolean)
				.join(' ')
				.trim(),
		}));
		

		if (customers.length > 0) {
			return customers;
		}
	} catch (error) {
		log.error('Company lookup failed', {
			cause: error instanceof Error ? error.message : String(error),
		});
	}

	return [];
}
