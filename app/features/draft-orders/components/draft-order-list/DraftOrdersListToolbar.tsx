import { useTranslation } from 'react-i18next';
import { Archive, ArrowLeft, Download } from 'lucide-react';
import { DRAFT_ORDER_SORT_OPTIONS } from '../../lib/draft-order-options';
import type { DraftOrderSortOption } from '../../types/draft-order';
import { Button } from '~/shared/components/ui/Button';

interface DraftOrdersListToolbarProps {
  resultCount: number;
  inFlightAmount: number;
  activeSort: DraftOrderSortOption;
  isSortOpen: boolean;
  searchQuery: string;
  onSortOpenChange: (isOpen: boolean) => void;
  onSortChange: (sort: DraftOrderSortOption) => void;
  archivedCount: number;
  isArchivedView: boolean;
  onToggleArchived: () => void;
}

export function DraftOrdersListToolbar({
  resultCount,
  inFlightAmount,
  activeSort,
  isSortOpen,
  searchQuery,
  onSortOpenChange,
  onSortChange,
  archivedCount,
  isArchivedView,
  onToggleArchived,
}: DraftOrdersListToolbarProps) {
  const { t } = useTranslation('draftOrders');
  const hasSearch = searchQuery.trim() !== '';

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div
        className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-medium tabular-nums text-[#111113]"
        aria-live="polite"
      >
        <>
          {hasSearch ? (
            <>
              <span className="font-medium text-[#111113]">
                {t('draftOrders.page.list.results.matchCount', {
                  count: resultCount,
                })}
              </span>

              <span className="font-normal text-[#5C5C61]">
                {' '}
                {t('draftOrders.page.list.results.forSearch', {
                  query: searchQuery,
                })}
              </span>
            </>
          ) : (
            t('draftOrders.page.list.results.count', {
              count: resultCount,
            })
          )}
        </>

        <span className="font-normal text-[#5C5C61]">
          {t('draftOrders.page.list.results.inFlight', {
            amount: inFlightAmount,
          })}
        </span>
      </div>

      <div className="flex-1" />

      {archivedCount > 0 || isArchivedView ? (
      <Button
        type="button"
        variant="outline"
        size="small"
        shape="md"
        aria-pressed={isArchivedView}
        onClick={onToggleArchived}
        className="min-h-8 cursor-pointer gap-2 px-3 py-0 text-[12.5px] font-medium aria-pressed:border-[#111113] aria-pressed:bg-[#F7F7F8]"
      >
        {isArchivedView ? (
          <>
            <span>{t('draftOrders.page.list.actions.backToDraftOrders')}</span>
          </>
        ) : (
          <>
            <Archive aria-hidden="true" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
            <span>{t('draftOrders.page.list.actions.archived', { count: archivedCount })}</span>
          </>
        )}
      </Button>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="small"
        shape="md"
        disabled
        className="min-h-8 gap-2 px-3 py-0 text-[12.5px] font-medium data-disabled:pointer-events-auto data-disabled:cursor-not-allowed"
      >
        <Download
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0"
          strokeWidth={1.8}
        />
        <span>{t('draftOrders.page.list.actions.exportCsv')}</span>
      </Button>

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="small"
          shape="pill"
          aria-haspopup="menu"
          aria-expanded={isSortOpen}
          disabled
          onClick={() => onSortOpenChange(!isSortOpen)}
          className={`min-h-9 gap-2 px-3.5 py-0 text-[13px] font-medium ${isSortOpen
            ? 'border-[#111113] bg-[#F7F7F8]'
            : 'border-[#ECECEE] bg-white hover:border-[#D7D7DA]'
            } data-disabled:pointer-events-auto data-disabled:cursor-not-allowed`}
        >
          <span className="text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
            {t('draftOrders.page.list.sort.label')}
          </span>

          <span>
            {t(`draftOrders.page.list.sort.options.${activeSort}`)}
          </span>
        </Button>

        {isSortOpen && (
          <div
            role="menu"
            aria-label={t('draftOrders.page.list.sort.ariaLabel')}
            className="absolute right-0 top-[calc(100%+8px)] z-40 flex min-w-[232px] flex-col gap-0.5 rounded-2xl border border-[#ECECEE] bg-white p-1.5 shadow-[0_28px_70px_-22px_rgba(15,15,15,0.28),0_2px_8px_rgba(15,15,15,0.06)]"
          >
            {DRAFT_ORDER_SORT_OPTIONS.map((sortOption) => {
              const isSelected = activeSort === sortOption.value;

              return (
                <Button
                  key={sortOption.value}
                  type="button"
                  variant="ghost"
                  shape="md"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => {
                    onSortChange(sortOption.value);
                    onSortOpenChange(false);
                  }}
                  className={`min-h-10 w-full justify-start px-3 py-0 text-left text-[13px] font-normal text-[#111113] ${isSelected
                    ? 'bg-[#F7F7F8] font-semibold'
                    : 'bg-transparent hover:bg-[#F7F7F8]'
                    }`}
                >
                  {t(
                    `draftOrders.page.list.sort.options.${sortOption.value}`,
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
