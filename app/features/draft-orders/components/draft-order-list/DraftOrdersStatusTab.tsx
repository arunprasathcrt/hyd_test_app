import { useTranslation } from 'react-i18next';
import { DRAFT_ORDER_STATUS_FILTERS } from '../../lib/draft-order-options';
import type { DraftOrderStatusFilterValue } from '../../types/draft-order';
import { Button } from '~/shared/components/ui/Button';

type StatusFilter = DraftOrderStatusFilterValue;

interface DraftOrdersStatusTabsProps {
  activeStatus: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  statusCounts: Record<StatusFilter, number>;
}

export function DraftOrdersStatusTabs({
  activeStatus,
  onStatusChange,
  statusCounts,
}: DraftOrdersStatusTabsProps) {
  const { t } = useTranslation('draftOrders');

  return (
    <div
      className="-m-1 flex flex-nowrap gap-1 overflow-x-auto border-b border-[#ECECEE] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label={t('draftOrders.page.list.statuses.ariaLabel')}
    >
      {DRAFT_ORDER_STATUS_FILTERS.map((status) => {
        const isActive = activeStatus === status.value;

        return (
          <Button
            key={status.value}
            type="button"
            variant="ghost"
            size="default"
            shape="square"
            aria-pressed={isActive}
            onClick={() => onStatusChange(status.value)}
            className={`cursor-pointer mb-[-1px] min-h-9 shrink-0 gap-2 whitespace-nowrap border-0 border-b-2 bg-transparent px-[10px] py-0 text-[13px] font-medium shadow-none hover:bg-transparent focus-visible:-outline-offset-2 focus-visible:outline-[#0E6E6E] ${isActive
                ? 'border-[#111113] text-[#111113] hover:text-[#111113]'
                : 'border-transparent text-[#5C5C61] hover:text-[#111113]'
              }`}
          >
            <span>{t(`draftOrders.page.list.statuses.${status.value}`)}</span>

            <span
              className={`inline-flex min-h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums ${isActive
                  ? 'bg-[#111113] text-white'
                  : 'bg-[#F2F2F3] text-[#5C5C61]'
                }`}
            >
              {statusCounts[status.value]}
            </span>
          </Button>
        );
      })}
    </div>
  );
}