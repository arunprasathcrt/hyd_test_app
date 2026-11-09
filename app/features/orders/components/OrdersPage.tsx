import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router';
import {useTranslation} from 'react-i18next';
import {OrdersHeader} from './orders-page/OrdersHeader';
import {OrdersBrandFilter} from './orders-page/OrdersBrandFilter';
import {OrdersToolbar} from './orders-page/OrdersToolbar';
import {OrdersTable} from './orders-page/OrdersTable';
import {ORDERS} from '../lib/orders';
import type {
  OrderTableSortColumn,
  OrderTableSortDirection,
} from './orders-page/OrdersTable';

import type {
  BrandFilter,
  Order,
  OrderBrand,
  OrderStatus,
  StatusFilter,
} from '../types/order';

import {Button} from '~/shared/components/ui/Button';

const BRAND_KEYS: Record<OrderBrand | 'all', string> = {
  all: 'brands.all',
  underArmour: 'brands.underArmour',
  champion: 'brands.champion',
  other: 'brands.other',
};

const STATUS_KEYS: Record<OrderStatus | 'all', string> = {
  all: 'statuses.all',
  pendingProof: 'statuses.pendingProof',
  inProduction: 'statuses.inProduction',
  shipped: 'statuses.shipped',
  delivered: 'statuses.delivered',
};

function parseMonthDay(value: string) {
  const parsed = new Date(`${value} 2000`).getTime();

  return Number.isNaN(parsed) ? Number.MIN_SAFE_INTEGER : parsed;
}

function compareSortValues(left: number | string, right: number | string) {
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

export interface OrdersPageProps {
  orders?: Order[];
}

export function OrdersPage({orders = ORDERS}: OrdersPageProps) {
  const {t} = useTranslation('orders');
  const {t: tCommon} = useTranslation('common');
  const navigate = useNavigate();

  const [activeBrand, setActiveBrand] = useState<BrandFilter>('all');

  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');

  const [search, setSearch] = useState('');

  const [sortColumn, setSortColumn] = useState<OrderTableSortColumn | null>(
    null,
  );

  const [sortDirection, setSortDirection] =
    useState<OrderTableSortDirection>('asc');

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesBrand = activeBrand === 'all' || order.brand === activeBrand;

      const matchesStatus =
        activeStatus === 'all' || order.status === activeStatus;

      /*
       * Match against every value rendered in the table row
       * (including translated brand/status labels, the ship-to
       * city shown in the tooltip, and the formatted total).
       */
      const matchesSearch =
        !query ||
        [
          order.id,
          t(BRAND_KEYS[order.brand]),
          order.po,
          order.account,
          order.shipTo,
          order.city,
          order.placed,
          order.shipBy,
          t(STATUS_KEYS[order.status]),
          String(order.total),
          tCommon('format.money', {
            value: order.total,
          }),
        ]
          .join('\n')
          .toLowerCase()
          .includes(query);

      return matchesBrand && matchesStatus && matchesSearch;
    });
  }, [activeBrand, activeStatus, orders, search, t, tCommon]);

  const sortedOrders = useMemo(() => {
    if (sortColumn === null) {
      return filteredOrders;
    }

    const direction = sortDirection === 'asc' ? 1 : -1;

    return [...filteredOrders].sort((left, right) => {
      let leftValue: number | string;
      let rightValue: number | string;

      switch (sortColumn) {
        case 'order':
          leftValue = left.id;
          rightValue = right.id;
          break;

        case 'brand':
          leftValue = t(BRAND_KEYS[left.brand]);
          rightValue = t(BRAND_KEYS[right.brand]);
          break;

        case 'po':
          leftValue = left.po;
          rightValue = right.po;
          break;

        case 'account':
          leftValue = left.account;
          rightValue = right.account;
          break;

        case 'shipTo':
          leftValue = left.shipTo;
          rightValue = right.shipTo;
          break;

        case 'placed':
          leftValue = parseMonthDay(left.placed);
          rightValue = parseMonthDay(right.placed);
          break;

        case 'shipBy':
          leftValue = parseMonthDay(left.shipBy);
          rightValue = parseMonthDay(right.shipBy);
          break;

        case 'status':
          leftValue = t(STATUS_KEYS[left.status]);
          rightValue = t(STATUS_KEYS[right.status]);
          break;

        case 'total':
          leftValue = left.total;
          rightValue = right.total;
          break;

        default:
          leftValue = left.id;
          rightValue = right.id;
      }

      return compareSortValues(leftValue, rightValue) * direction;
    });
  }, [filteredOrders, sortColumn, sortDirection, t]);

  /*
   * Prototype:
   *
   * `${_filteredOrders.length} of ${_allOrders.length} orders
   *  · ${fmt$(_filteredOrders.reduce((s,o)=>s+o.total,0))} placed`
   */
  const filteredTotalValue = filteredOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  const handleOrderSelect = (order: Order) => {
    void navigate(`/orders/${order.id}`);
  };

  const handleSortChange = (column: OrderTableSortColumn) => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection('asc');
      return;
    }

    setSortDirection((previousDirection) =>
      previousDirection === 'asc' ? 'desc' : 'asc',
    );
  };

  return (
    <main
      className="
                w-full
                bg-utds-page
                p-6
                font-sans
                text-[14px]
                font-normal
                leading-[1.5]
                text-utds-ink
                antialiased
                min-[721px]:p-8
            "
    >
      <OrdersHeader
        filteredOrdersCount={filteredOrders.length}
        totalOrdersCount={orders.length}
        filteredTotalValue={filteredTotalValue}
      />
      <OrdersBrandFilter
        activeBrand={activeBrand}
        onBrandChange={setActiveBrand}
      />
      <OrdersToolbar
        search={search}
        onSearchChange={setSearch}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />
      <OrdersTable
        orders={sortedOrders}
        onOrderSelect={handleOrderSelect}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />
    </main>
  );
}
