import { COLLECTION_UPDATE_MUTATION } from '~/features/presentations/queries/collections';
import { adminQuery } from '~/lib/shopify/admin.server';
import { createLogger } from '~/lib/logger';

const log = createLogger('presentations.collectionUpdate');

export async function updatePresentationCollection(
	env: Env,
	collectionId: string,
	customer: string,
	neededBy: string,
): Promise<{ ok: true } | { ok: false }> {
	try {
		const response: any = await adminQuery({
			env,
			query: COLLECTION_UPDATE_MUTATION,
			variables: {
				input: {
					id: collectionId,
					metafields: [
						{
							namespace: 'custom',
							key: 'customer',
							type: 'company_reference',
							value: customer,
						},
						{
							namespace: 'custom',
							key: 'needed_by',
							type: 'date',
							value: neededBy,
						},
					],
				},
			},
		});

		const userErrors =
			response?.collectionUpdate?.userErrors ?? [];

		if (userErrors.length > 0) {
			log.error(
				'Presentation collection update user errors',
				{
					collectionId,
					userErrors,
				},
			);

			return { ok: false };
		}
		return { ok: true };
	} catch (error) {
		log.error('Presentation collection update failed', {
			collectionId,
			cause:
				error instanceof Error
					? error.message
					: String(error),
		});

		return { ok: false };
	}
}