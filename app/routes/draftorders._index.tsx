import { useLoaderData, type ShouldRevalidateFunction } from 'react-router';
import type { Route } from './+types/draftorders._index';
import { DraftOrdersPage } from '~/features/draft-orders/components/DraftOrdersPage';
import { loadDraftOrdersList } from '~/features/draft-orders/lib/draftorders-list-loader.server';

export const handle = {
  i18n: ['draftOrders', 'newDraftOrder', 'common'],
};

// The list filters are URL search params, read on the client. A change to only
// the query string does not change the draft orders, so skip the reload. Any
// action still revalidates through the default.
export const shouldRevalidate: ShouldRevalidateFunction = (args) =>
  args.actionResult === undefined &&
  args.currentUrl.pathname === args.nextUrl.pathname &&
  args.currentUrl.search !== args.nextUrl.search
    ? false
    : args.defaultShouldRevalidate;

export async function loader({ context }: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  return loadDraftOrdersList(context);
}

export default function DraftOrdersIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <main className="w-full bg-utds-page p-6 min-p-8">
      <DraftOrdersPage
        draftOrders={data?.draftOrders ?? []}
        availableBrands={data?.availableBrands ?? []}
      />
    </main>
  );
}