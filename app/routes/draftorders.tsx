import {
  isRouteErrorResponse,
  Outlet,
  useRouteError,
} from 'react-router';
import {useTranslation} from 'react-i18next';
import type {Route} from './+types/draftorders';

export const handle = {
  i18n: [
    'draftOrders',
    'newDraftOrder',
    'common',
    'errors',
  ],
};

// Auth gate only. Several child routes (duplicate, preview, staff, order-type)
// have no auth check of their own, so this must stay here. The draft order list
// is loaded by the index route, not on every builder visit or save.
export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  return null;
}

export default function DraftOrdersRoute() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const {t} = useTranslation('errors');

  let message = t('boundary.unknown');

  if (isRouteErrorResponse(error)) {
    message =
      typeof error.data === 'string'
        ? error.data
        : error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  return (
    <main className="p-8 text-utds-ink">
      <h1 className="text-xl font-semibold">{t('boundary.title')}</h1>
      <p className="mt-2 text-sm text-utds-secondary">
        {message}
      </p>
    </main>
  );
}
