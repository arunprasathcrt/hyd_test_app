import {useLayoutEffect, useMemo, useRef} from 'react';
import {orderTotals} from '../lib/order-detail';
import type {OrderDetail} from '../types/order-detail';
import {HoldsAndDatesCard} from './order-detail/HoldsAndDatesCard';
import {ActivityCard, OtherOrdersCard, ShipmentsCard} from './order-detail/OrderHistoryCards';
import {OrderHeader} from './order-detail/OrderHeader';
import {OrderItemsCard} from './order-detail/OrderItemsCard';
import {OrderStatusCard} from './order-detail/OrderStatusCard';
import {OrderSummaryAside} from './order-detail/OrderSummaryAside';
import {OrderTotalsCard} from './order-detail/OrderTotalsCard';

export function OrderDetailPage({order}: {order: OrderDetail}) {
  const totals = useMemo(() => orderTotals(order), [order]);
  const pageRef = useRef<HTMLDivElement>(null);

  // The page scrolls inside PageLayout's `<main>`, which `<ScrollRestoration>` does not
  // reset, so opening another order from "Other orders" would keep the old scroll position.
  useLayoutEffect(() => {
    const scroller = pageRef.current?.closest('main');
    if (scroller) scroller.scrollTo({top: 0});
    else window.scrollTo({top: 0});
  }, [order.id]);

  return (
    <div
      key={order.id}
      ref={pageRef}
      className="w-full bg-white p-4 font-sans text-[13px] leading-[1.5] text-[#111113] antialiased min-[721px]:p-8"
    >
      <OrderHeader order={order} />
      <div className="grid items-start gap-5 min-[1100px]:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-5">
          <OrderStatusCard order={order} />
          <HoldsAndDatesCard order={order} />
          <OrderItemsCard order={order} units={totals.units} />
          <OrderTotalsCard order={order} totals={totals} />
          <ShipmentsCard order={order} />
          <OtherOrdersCard order={order} />
          <ActivityCard order={order} />
        </div>
        <OrderSummaryAside order={order} total={totals.total} />
      </div>
    </div>
  );
}
