import {isRouteErrorResponse, useRouteError, type ShouldRevalidateFunction} from 'react-router';
import {isCompletedDraftSave} from '~/features/draft-orders/lib/draftorders-new-revalidation';
import {useTranslation} from 'react-i18next';
import {NewDraftOrderPage} from '../features/draft-orders/components/NewDraftOrderPage';
import {saveDraftOrderAction} from '~/features/draft-orders/lib/draftorders-new-action.server';
import {createDeliveryLocationAction} from '~/features/draft-orders/lib/draftorders-delivery-location-action.server';
import {deleteDeliveryLocationAction} from '~/features/draft-orders/lib/draftorders-delete-delivery-location-action.server';
import {loadDraftOrdersNewView} from '~/features/draft-orders/lib/draftorders-new-loader.server';
import {assertSameOrigin} from '~/lib/same-origin.server';
import {SEARCH_PARAMS} from '~/shared/constants/routes';
import {getSelectedDraftProducts} from '~/lib/product/draft-products.server';
import type {DraftProduct} from '~/features/draft-orders/schemas/draft-product.schema';
import type {Route} from './+types/draftorders.new';

export const handle = {
  i18n: ['newDraftOrder', 'draftOrders', 'products', 'common', 'errors'],
};

// A successful save does not change the builder's reference data. Keep its
// local values and let the action result complete without another loader pass.
// A save that created Company Locations does, so the customer's list reloads.
export const shouldRevalidate: ShouldRevalidateFunction = (args) =>
  Array.isArray(args.actionResult?.createdLocations) && args.actionResult.createdLocations.length > 0
    ? true
    : args.actionResult?.intent === 'deleteDeliveryLocation'
      ? args.actionResult.ok === true
      : isCompletedDraftSave(args) ||
      (args.actionResult?.intent === 'createDeliveryLocation' && args.actionResult?.ok === true)
      ? false
      : args.defaultShouldRevalidate;

export async function loader({context, request}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  const url = new URL(request.url);
  const draftId = url.searchParams.get(SEARCH_PARAMS.draftId)?.trim() || undefined;

  const {view} = await loadDraftOrdersNewView(context, draftId);

  let selectedProducts: DraftProduct[] = [];
  let productError: string | null = null;
  try {
    selectedProducts = await getSelectedDraftProducts(
      url.searchParams.getAll(SEARCH_PARAMS.productId),
      context,
    );
  } catch {
    productError = 'newDraftOrder.products.loadError';
  }

  return {view, selectedProducts, productError};
}

export async function action(args: Route.ActionArgs) {
  await args.context.customerAccount.handleAuthStatus();
  assertSameOrigin(args.request);
  const formData = await args.request.clone().formData();
  if (formData.get('intent') === 'createDeliveryLocation') {
    return createDeliveryLocationAction(args);
  }
  if (formData.get('intent') === 'deleteDeliveryLocation') {
    return deleteDeliveryLocationAction(args);
  }
  return saveDraftOrderAction(args);
}


export default function DraftOrdersNewRoute({loaderData}: Route.ComponentProps) {
  return (
    <main className="w-full bg-utds-page p-6 min-[721px]:p-8">
      <NewDraftOrderPage
        view={loaderData.view}
        selectedProducts={loaderData.selectedProducts}
        productError={loaderData.productError}
      />
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const {t} = useTranslation('errors');

  let message = t('boundary.unknown');

  if (isRouteErrorResponse(error)) {
    message =
      typeof error.data === 'string' ? error.data : error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  return (
    <main className="p-8 text-utds-ink">
      <h1 className="text-xl font-semibold">{t('boundary.title')}</h1>
      <p className="mt-2 text-sm text-utds-secondary">{message}</p>
    </main>
  );
}
