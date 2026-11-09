import { useTranslation } from 'react-i18next';
import { ORDER_STATUS_FILTERS } from 'app/features/orders/lib/orders';
import { SearchIcon } from 'app/shared/components/OrdersIcons';
import type { StatusFilter } from 'app/features/orders/types/order';

const STATUS_KEYS: Record<string, string> = {
  all: 'statuses.all',
  pendingProof: 'statuses.pendingProof',
  inProduction: 'statuses.inProduction',
  shipped: 'statuses.shipped',
  delivered: 'statuses.delivered',
};

export interface OrdersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

export function OrdersToolbar({
  search,
  onSearchChange,
  activeStatus,
  onStatusChange,
}: OrdersToolbarProps) {
  const { t } = useTranslation('orders');

  return (
    <div
      className="
        my-6
        rounded-[24px]
        border
        border-[#ECECEE]
        bg-[#FAFAFA]
        p-4
        min-[760px]:px-5
      "
    >
      <div
        className="
          flex
          flex-col
          items-start
          gap-2.5
          min-[760px]:flex-row
          min-[760px]:items-center
        "
      >
        {/* Search */}
        <label
          className="
            relative
            w-full
            min-w-0
            min-[760px]:w-[360px]
            min-[760px]:shrink
          "
        >
          <span className="sr-only">
            {t('page.searchAriaLabel')}
          </span>

          <SearchIcon />

          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('page.searchPlaceholder')}
            className="
              h-9
              w-full
              rounded-md
              border
              border-[#EAEAEA]
              bg-white
              px-3
              pl-[34px]
              font-sans
              text-[13px]
              font-normal
              leading-[1.4]
              text-[#0F0F0F]
              outline-none
              placeholder:text-[#8B8B8B]
              focus:border-[#8B8B8B]
              focus-visible:ring-2
              focus-visible:ring-[#0F0F0F]/10
            "
          />
        </label>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-2">
          {ORDER_STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              className={`
                rounded-full
                border
                px-3
                py-[5px]
                font-sans
                text-[12px]
                font-normal
                leading-[1.35]
                transition-colors
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[#0F0F0F]
                ${activeStatus === status
                  ? 'border-[#0F0F0F] bg-[#0F0F0F] text-white'
                  : 'border-[#DDDDDD] bg-white text-[#525252] hover:border-[#8B8B8B] hover:text-[#0F0F0F]'
                }
              `}
            >
              {t(STATUS_KEYS[status])}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
