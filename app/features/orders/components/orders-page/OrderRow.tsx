import { useTranslation } from 'react-i18next';
import { BrandPill } from 'app/shared/components/BrandPill';
import { StatusPill } from 'app/shared/components/StatusPill';
import { OrderRowShipToCell } from './OrderRowShipToCell';
import type { Order, OrderBrand, OrderStatus } from 'app/features/orders/types/order';

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

export interface OrderRowProps {
  order: Order;
  onSelect: () => void;
}

export function OrderRow({ order, onSelect }: OrderRowProps) {
  const { t } = useTranslation('orders');
  const { t: tCommon } = useTranslation('common');

  return (
    <tr
      onClick={onSelect}
      className="
        border-b
        border-[#F0F0F0]
        cursor-pointer
        font-sans
        text-[13px]
        font-normal
        leading-[1.5]
        transition-colors
        last:border-b-0
        hover:bg-[#F8F8F8]
      "
    >
      {/* ORDER */}
      <td className="px-4 py-3">
        <strong
          className="
            font-sans
            text-[13px]
            font-medium
            leading-[1.45]
            text-[#0F0F0F]
          "
        >
          {order.id}
        </strong>
      </td>

      {/* BRAND */}
      <td className="px-4 py-3">
        <BrandPill
          brand={order.brand}
          label={t(BRAND_KEYS[order.brand])}
        />
      </td>

      {/* PO */}
      <td
        className="
          whitespace-nowrap
          px-4
          py-3
          font-sans
          text-[13px]
          font-normal
          leading-[1.55]
          text-[#525252]
        "
      >
        {order.po}
      </td>

      {/* ACCOUNT */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`
              flex
              h-[30px]
              w-[30px]
              shrink-0
              items-center
              justify-center
              rounded-full
              font-sans
              text-[11px]
              font-semibold
              text-white
              bg-[#444444]
            `}
          >
            {order.initials}
          </span>

          <span
            className="
              max-w-[180px]
              truncate
              font-sans
              text-[13px]
              font-normal
              leading-[1.5]
              text-[#0F0F0F]
            "
          >
            {order.account}
          </span>
        </div>
      </td>

      {/* SHIP TO */}
      <OrderRowShipToCell
        shipTo={order.shipTo}
        city={order.city}
        locked={order.locked}
      />

      {/* PLACED */}
      <td
        className="
          whitespace-nowrap
          px-4
          py-3
          font-sans
          text-[13px]
          font-normal
          leading-[1.55]
          text-[#525252]
        "
      >
        {order.placed}
      </td>

      {/* SHIP BY */}
      <td
        className="
          whitespace-nowrap
          px-4
          py-3
          font-sans
          text-[13px]
          font-normal
          leading-[1.55]
          text-[#525252]
        "
      >
        {order.shipBy}
      </td>

      {/* STATUS */}
      <td className="px-4 py-3">
        <StatusPill
          status={order.status}
          label={t(STATUS_KEYS[order.status])}
        />
      </td>

      {/* TOTAL */}
      <td
        className="
          whitespace-nowrap
          px-4
          py-3
          text-right
          font-sans
          text-[13px]
          font-medium
          tabular-nums
          leading-[1.5]
          text-[#0F0F0F]
        "
      >
        {tCommon('format.money', {
          value: order.total,
        })}
      </td>
    </tr>
  );
}
