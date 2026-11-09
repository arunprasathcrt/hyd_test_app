import { useLoaderData } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Route } from './+types/presentations.details';
import PresentationsDetails from '~/features/presentations/components/PresentationsDetails/PresentationsDetails';
import { loadPresentationCustomers } from '~/features/presentations/lib/presentation-customers.server';
import { loadPresentationCollectionDetail } from '~/features/presentations/lib/presentation-detail.server';
import type { PresentationDetail } from '~/features/presentations/types/presentations';
import { removeProductsFromPresentationCollection } from '~/features/presentations/lib/remove-products-from-collection.server';
import { addProductsToPresentationSchema, reorderProductsInPresentationCollectionSchema, updatePresentationCollectionSchema } from '~/features/presentations/schemas/collection.schema';
import { reorderProductsInPresentationCollection } from '~/features/presentations/lib/reorder-products-in-collection.server';
import { updatePresentationCollection } from '~/features/presentations/lib/update-presentation-collection.server';
import { assertSameOrigin } from '~/lib/same-origin.server';

export const handle = {
	i18n: ['presentations', 'common', 'errors', 'enums'],
};

export async function loader({ request, context }: Route.LoaderArgs) {
	await context.customerAccount.handleAuthStatus();
	const id = new URL(request.url).searchParams.get('id');
	const customers = await loadPresentationCustomers(context.env);

	if (!id) {
		return {
			presentation: null as PresentationDetail | null,
			customers,
		};
	}

	const shopifyPresentation = await loadPresentationCollectionDetail(
		context.env,
		id,
		customers,
	);

	return {
		presentation: shopifyPresentation,
		customers,
	}
}

export async function action({ request, context }: Route.ActionArgs) {
	await context.customerAccount.handleAuthStatus();
  assertSameOrigin(request);
	const formData = await request.formData();

	const intent = formData.get('intent');

	if (intent === 'reorder') {
		const parsed =
			reorderProductsInPresentationCollectionSchema.safeParse({
				collectionId: formData.get('collectionId'),
				productId: formData.get('productId'),
				newPosition: formData.get('newPosition'),
			});

		if (!parsed.success) {
			return { ok: false as const };
		}

		return reorderProductsInPresentationCollection(
			context.env,
			parsed.data,
		);
	}

	if (intent === 'update-header') {
		const parsed = updatePresentationCollectionSchema.safeParse({
			collectionId: formData.get('collectionId'),
			customer: formData.get('customer'),
			neededBy: formData.get('neededBy'),
		});

		if (!parsed.success) {
			return { ok: false as const };
		}

		if (!parsed.data.customer || !parsed.data.neededBy) {
			return { ok: false as const };
		}

		return updatePresentationCollection(
			context.env,
			parsed.data.collectionId,
			parsed.data.customer,
			parsed.data.neededBy,
		);
	}

	if (intent === 'remove-product') {
		const parsed = addProductsToPresentationSchema.safeParse({
			collectionId: formData.get('collectionId'),
			productIds: formData.getAll('productIds'),
		});

		if (!parsed.success) {
			return { ok: false as const };
		}

		return removeProductsFromPresentationCollection(
			context.env,
			parsed.data,
		);
	}

	return { ok: false as const };
}

export default function PresentationsDetailsRoute() {
	const { presentation, customers } = useLoaderData<typeof loader>();
	return (
		<PresentationsDetails
			presentation={presentation}
			customers={customers}
		/>
	);
}

export function ErrorBoundary() {
	const { t } = useTranslation('errors');
	return (
		<main className="p-8 text-utds-ink">
			<h1 className="text-xl font-semibold">{t('boundary.title')}</h1>
			<p className="mt-2 text-sm text-utds-secondary">
				{t('boundary.unknown')}
			</p>
		</main>
	);
}
