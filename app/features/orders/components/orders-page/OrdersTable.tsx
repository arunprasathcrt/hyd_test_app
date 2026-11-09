import {useTranslation} from 'react-i18next';
import {ArrowDown, ArrowUp, ArrowUpDown} from 'lucide-react';
import {OrderRow} from './OrderRow';
import type {Order} from 'app/features/orders/types/order';
import {Button} from '~/shared/components/ui/Button';

const ORDER_TABLE_COLUMNS = [
  'order',
  'brand',
  'po',
  'account',
  'shipTo',
  'placed',
  'shipBy',
  'status',
  'total',
] as const;

export type OrderTableSortColumn = (typeof ORDER_TABLE_COLUMNS)[number];

export type OrderTableSortDirection = 'asc' | 'desc';

export interface OrdersTableProps {
  orders: Order[];
  onOrderSelect: (order: Order) => void;
  sortColumn: OrderTableSortColumn | null;
  sortDirection: OrderTableSortDirection;
  onSortChange: (column: OrderTableSortColumn) => void;
}

export function OrdersTable({
  orders,
  onOrderSelect,
  sortColumn,
  sortDirection,
  onSortChange,
}: OrdersTableProps) {
  const {t} = useTranslation('orders');

  const getAriaSort = (
    column: OrderTableSortColumn,
  ): 'none' | 'ascending' | 'descending' => {
    if (sortColumn !== column) {
      return 'none';
    }

    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  const getSortAriaLabel = (column: OrderTableSortColumn) => {
    const columnLabel = t(`page.columns.${column}`);

    if (sortColumn !== column) {
      return t('page.sort.aria.default', {
        column: columnLabel,
      });
    }

    if (sortDirection === 'asc') {
      return t('page.sort.aria.asc', {
        column: columnLabel,
      });
    }

    return t('page.sort.aria.desc', {
      column: columnLabel,
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table
        className="
          w-full
          min-w-[1000px]
          border-collapse
          overflow-hidden
          rounded-[14px]
          border
          border-[#EAEAEA]
          bg-white
          font-sans
          text-[13px]
          font-normal
          leading-[1.5]
          text-[#0F0F0F]
        "
      >
        <thead>
          <tr
            className="
              border-b
              border-[#EAEAEA]
              bg-white
              text-left
            "
          >
            {ORDER_TABLE_COLUMNS.map((column) => (
              <th
                key={column}
                aria-sort={getAriaSort(column)}
                className={`
                  whitespace-nowrap
                  px-4
                  py-3
                  font-sans
                  text-[10.5px]
                  font-medium
                  uppercase
                  leading-[1.35]
                  tracking-[0.08em]
                  text-[#8B8B8B]
                  ${column === 'total' ? 'text-right' : 'text-left'}
                `}
              >
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  onClick={() => onSortChange(column)}
                  aria-label={getSortAriaLabel(column)}
                  className={
                    column === 'total'
                      ? 'justify-end text-right'
                      : 'justify-start text-left'
                  }
                >
                  {t(`page.columns.${column}`)}
                  {sortColumn === column ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp
                        aria-hidden="true"
                        className="h-3 w-3 cursor-pointer"
                      />
                    ) : (
                      <ArrowDown
                        aria-hidden="true"
                        className="h-3 w-3 cursor-pointer"
                      />
                    )
                  ) : (
                    <ArrowUpDown
                      aria-hidden="true"
                      className="h-3 w-3 cursor-pointer"
                    />
                  )}
                </Button>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <OrderRow
              key={`${order.id}-${order.po}`}
              order={order}
              onSelect={() => onOrderSelect(order)}
            />
          ))}
        </tbody>
      </table>

      {orders.length === 0 ? (
        <div
          className="
            border-x
            border-b
            border-[#EAEAEA]
            bg-white
            px-4
            py-8
            text-center
            font-sans
            text-[13px]
            text-[#8B8B8B]
          "
        >
          {t('page.empty')}
        </div>
      ) : null}
    </div>
  );
}
