import {useTranslation} from 'react-i18next';
import {OrderDetailPage} from '~/features/orders/components/OrderDetailPage';
import {ORDER_DETAIL_MOCKS} from '../../mocks/order-detail';
import type {Route} from './+types/orders_.$id';

export const handle = {i18n: ['orders', 'enums', 'common', 'errors']};

export async function loader({context, params}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  const order = params.id ? ORDER_DETAIL_MOCKS[params.id] : undefined;
  if (!order) {
    throw new Response('Not found', {status: 404});
  }
  return {order};
}

export default function OrderDetailRoute({loaderData}: Route.ComponentProps) {
  return <OrderDetailPage order={loaderData.order} />;
}

export function ErrorBoundary() {
  const {t} = useTranslation('errors');

  return (
    <main className="p-8 text-utds-ink">
      <h1 className="text-xl font-semibold">{t('boundary.title')}</h1>
      <p className="mt-2 text-sm text-utds-secondary">
        {t('boundary.unknown')}
      </p>
    </main>
  );
}
