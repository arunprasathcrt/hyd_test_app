import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import type { DraftOrderBrandFilterValue, DraftOrderListItem, DraftOrderSortOption, DraftOrderStatusFilterValue } from '../../types/draft-order';
import { getBrandCounts, getFilteredDraftOrders, getInFlightAmount, getSortedDraftOrders, getStatusCounts } from '../../lib/draft-orders';
import { useDraftOrdersListStore } from '../../store/draft-orders-list.store';
import { Button } from "~/shared/components/ui/Button";
import { DraftOrdersFilters } from './DraftOrdersFilters';
import { DraftOrdersListToolbar } from './DraftOrdersListToolbar';
import { DraftOrdersStatusTabs } from './DraftOrdersStatusTab';
import { DraftOrdersListTable } from './DraftOrdersListTable';
import { DraftOrdersMobileList } from './DraftOrdersMobileList';

interface DraftOrdersListProps {
  draftOrders: DraftOrderListItem[];
  availableBrands: string[];
}

const INITIAL_VISIBLE_COUNT = 25;
const LOAD_MORE_COUNT = 25;

const BRAND_FILTER_VALUES: readonly DraftOrderBrandFilterValue[] = ['all', 'ua', 'champion', 'lululemon', 'other'];
const STATUS_FILTER_VALUES: readonly DraftOrderStatusFilterValue[] = ['all', 'draft', 'sent', 'approved', 'workflows', 'ready', 'converted', 'rejected', 'lost'];
const SORT_OPTION_VALUES: readonly DraftOrderSortOption[] = ['default', 'ship', 'expires', 'recent', 'value', 'customer'];

/** Reads a URL param, falling back when it is missing or not a known value. */
function readListParam<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.find((candidate) => candidate === value) ?? fallback;
}

export function DraftOrdersList({ draftOrders: loaderDraftOrders, availableBrands }: DraftOrdersListProps) {
  const { t } = useTranslation('draftOrders');
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';
  const activeBrand = readListParam(searchParams.get('brand'), BRAND_FILTER_VALUES, 'all');
  const activeStatus = readListParam(searchParams.get('status'), STATUS_FILTER_VALUES, 'all');
  const activeSort = readListParam(searchParams.get('sort'), SORT_OPTION_VALUES, 'default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);
  const toggleExpandedOrder = (orderId: string) =>
    setExpandedOrderIds((ids) =>
      ids.includes(orderId) ? ids.filter((id) => id !== orderId) : [...ids, orderId],
    );
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [isArchivedView, setIsArchivedView] = useState(false);
  const storeDraftOrders = useDraftOrdersListStore((state) => state.draftOrders);
  const sourceDraftOrders = useDraftOrdersListStore((state) => state.sourceDraftOrders);
  const archivedDraftOrders = useDraftOrdersListStore((state) => state.archivedDraftOrders);
  const setStoreDraftOrders = useDraftOrdersListStore((state) => state.setDraftOrders);

  // Sync the store's working copy with the loader; until it has caught up
  // (first render, SSR, revalidation) the loader data is shown directly.
  useEffect(() => {
    setStoreDraftOrders(loaderDraftOrders);
  }, [loaderDraftOrders, setStoreDraftOrders]);

  const activeDraftOrders =
    sourceDraftOrders === loaderDraftOrders ? storeDraftOrders : loaderDraftOrders;
  const draftOrders = isArchivedView ? archivedDraftOrders : activeDraftOrders;
  // Filters live in the URL so they survive a reload and back-navigation.
  // Replace, not push, so each keystroke does not add a history entry.
  const updateListParams = (updates: Record<string, string | null>) => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        Object.entries(updates).forEach(([key, value]) => {
          if (value) next.set(key, value);
          else next.delete(key);
        });
        return next;
      },
      { replace: true },
    );
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };
  const setSearchQuery = (value: string) => updateListParams({ q: value });
  const setActiveBrand = (brand: DraftOrderBrandFilterValue) =>
    updateListParams({ brand: brand === 'all' ? null : brand });
  const setActiveStatus = (status: DraftOrderStatusFilterValue) =>
    updateListParams({ status: status === 'all' ? null : status });
  const setActiveSort = (sort: DraftOrderSortOption) =>
    updateListParams({ sort: sort === 'default' ? null : sort });
  const toggleArchivedView = () => {
    const showArchived = !isArchivedView;
    setIsArchivedView(showArchived);
    // Archived drafts open expanded, so what was archived is visible at once.
    setExpandedOrderIds(
      showArchived ? archivedDraftOrders.map((draftOrder) => draftOrder.id) : [],
    );
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };
  const brandCounts = getBrandCounts(draftOrders);
  const filteredDraftOrders = getFilteredDraftOrders(
    draftOrders,
    searchQuery,
    activeBrand,
    activeStatus,
  );
  const filteredInFlightAmount = getInFlightAmount(filteredDraftOrders);
  const sortedDraftOrders = getSortedDraftOrders(
    filteredDraftOrders,
    activeSort,
  );
  const brandFilteredOrders =
    activeBrand === 'all'
      ? draftOrders
      : draftOrders.filter((draftOrder) =>
        draftOrder.brands.includes(activeBrand),
      );
  const statusCounts = getStatusCounts(
    brandFilteredOrders,
  );
  const remainingCount = Math.max(
    sortedDraftOrders.length - visibleCount,
    0,
  );
  const nextVisibleCount = Math.min(LOAD_MORE_COUNT, remainingCount);

  return (
    <section
      className="flex min-w-0 flex-col gap-3 rounded-[14px] border border-[#ECECEE] bg-white p-4"
      aria-label={t('draftOrders.page.list.ariaLabel')}
    >
      <DraftOrdersFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        activeBrand={activeBrand}
        onBrandChange={setActiveBrand}
        brandCounts={brandCounts}
        availableBrands={availableBrands}
      />
      <DraftOrdersStatusTabs
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        statusCounts={statusCounts}
      />
      <DraftOrdersListToolbar
        resultCount={filteredDraftOrders.length}
        inFlightAmount={filteredInFlightAmount}
        activeSort={activeSort}
        isSortOpen={isSortOpen}
        searchQuery={searchQuery}
        onSortOpenChange={setIsSortOpen}
        onSortChange={setActiveSort}
        archivedCount={archivedDraftOrders.length}
        isArchivedView={isArchivedView}
        onToggleArchived={toggleArchivedView}
      />
      <>
        <div className="max-[759.98px]:hidden">
          <DraftOrdersListTable
            draftOrders={sortedDraftOrders.slice(0, visibleCount)}
            expandedOrderIds={expandedOrderIds}
            onToggleExpanded={toggleExpandedOrder}
            isArchived={isArchivedView}
          />
        </div>

        <DraftOrdersMobileList
          draftOrders={sortedDraftOrders.slice(0, visibleCount)}
          expandedOrderIds={expandedOrderIds}
          onToggleExpanded={toggleExpandedOrder}
        />
      </>

      {sortedDraftOrders.length === 0 && (
        <div className="rounded-[14px] bg-[#F7F7F8] px-5 py-[22px]">
          <div className="text-[16px] font-semibold text-[#111113]">
            {t('draftOrders.page.list.emptyList.filteredTitle')}
          </div>

          <p className="mt-2 text-[13px] text-[#5C5C61]">
            {t('draftOrders.page.list.emptyList.filteredDescription')}
          </p>

          <Button
            type="button"
            variant="outline"
            size="small"
            shape="md"
            className="mt-4 cursor-pointer"
            onClick={() => updateListParams({ q: null, brand: null, status: null })}
          >
            {t('draftOrders.page.list.emptyList.clearFilters')}
          </Button>
        </div>
      )}
      {sortedDraftOrders.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <span className="text-xs leading-[1.5] text-[#6B6B70]">
            {t('draftOrders.page.list.pagination.showing', {
              visible: Math.min(visibleCount, sortedDraftOrders.length),
              total: sortedDraftOrders.length,
            })}
          </span>

          {visibleCount < sortedDraftOrders.length && (
            <Button
              type="button"
              variant="outline"
              size="control"
              shape="md"
              onClick={() =>
                setVisibleCount((count) =>
                  Math.min(count + LOAD_MORE_COUNT, sortedDraftOrders.length),
                )
              }
            >
              {t('draftOrders.page.list.pagination.showMore', {
                count: nextVisibleCount,
              })}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}