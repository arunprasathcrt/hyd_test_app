import { useTranslation } from 'react-i18next';
import { PinIcon, LockIcon } from 'app/shared/components/OrdersIcons';
import type { Order } from 'app/features/orders/types/order';

export interface OrderRowShipToCellProps {
  shipTo: string;
  city?: string;
  locked?: boolean;
}

export function OrderRowShipToCell({
  shipTo,
  city,
  locked,
}: OrderRowShipToCellProps) {
  const { t } = useTranslation('orders');

  return (
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          className="
            group
            relative
            inline-flex
            max-w-[16ch]
            min-w-0
            items-center
            gap-[6px]
            rounded-full
            border
            border-[#DDDDDD]
            bg-[#FAFAFA]
            px-2.5
            py-[5px]
            font-sans
            text-[12px]
            font-medium
            leading-[1.35]
            text-[#525252]
            transition-colors
            duration-150
            hover:border-[#8B8B8B]
            hover:bg-white
          "
        >
          <PinIcon />

          <span className="flex min-w-0 flex-col">
            <span
              className="
                truncate
                font-sans
                text-[13px]
                font-medium
                leading-[1.3]
                text-[#525252]
              "
            >
              {shipTo}
            </span>
          </span>

          {/* Prototype-style tooltip */}
          <span
            role="tooltip"
            className="
              pointer-events-none
              absolute
              bottom-full
              left-0
              z-[100]
              mb-2
              hidden
              min-w-[180px]
              max-w-[300px]
              rounded-lg
              bg-[#111113]
              px-3
              py-2
              text-left
              text-[11px]
              font-normal
              leading-[1.5]
              text-white
              shadow-[0_8px_24px_rgba(15,15,15,0.18)]
              group-hover:block
            "
          >
            <span className="block font-semibold text-white">
              {shipTo}
            </span>

            {city ? (
              <span className="mt-1 block text-[#D7D7DA]">
                {city}
              </span>
            ) : null}
          </span>

          {locked ? (
            <span title={t('page.shipping.locked')}>
              <LockIcon />
            </span>
          ) : null}
        </span>
      </div>
    </td>
  );
}
