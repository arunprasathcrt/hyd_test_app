import type {DraftOrderStatusFilterValue, DraftOrderBrandFilterValue, DraftOrderListItem, DraftOrderSortOption, DraftOrderKpi} from '../types/draft-order';
import {DRAFT_ORDER_KPIS} from './draft-order-options';

export function getStatusCounts(
  draftOrders: DraftOrderListItem[],
): Record<DraftOrderStatusFilterValue, number> {
  return {
    all: draftOrders.length,
    draft: draftOrders.filter(
      (draftOrder) => draftOrder.status === 'draft',
    ).length,
    sent: draftOrders.filter(
      (draftOrder) => draftOrder.status === 'sent',
    ).length,
    approved: draftOrders.filter(
      (draftOrder) => draftOrder.status === 'approved',
    ).length,
    workflows: draftOrders.filter(
      (draftOrder) => draftOrder.status === 'workflows',
    ).length,
    ready: draftOrders.filter(
      (draftOrder) => draftOrder.status === 'ready',
    ).length,
    converted: draftOrders.filter(
      (draftOrder) => draftOrder.status === 'converted',
    ).length,
    rejected: draftOrders.filter(
      (draftOrder) => draftOrder.status === 'rejected',
    ).length,
    lost: draftOrders.filter(
      (draftOrder) => draftOrder.status === 'lost',
    ).length,
  };
}

export function getBrandCounts(
  draftOrders: DraftOrderListItem[],
): Record<DraftOrderBrandFilterValue, number> {
  const withBrand = (brand: DraftOrderListItem['brands'][number]) =>
    draftOrders.filter((draftOrder) => draftOrder.brands.includes(brand)).length;

  return {
    all: draftOrders.length,
    ua: withBrand('ua'),
    champion: withBrand('champion'),
    lululemon: withBrand('lululemon'),
    other: withBrand('other'),
  };
}

const ORDER_ID_PATTERN = /^(.*?)(\d+)$/;
const DUPLICATE_WORKFLOW_STAGE_COUNT = 9;

/** Next `QT-#####` id after the highest number in the list. */
export function getNextDraftOrderId(draftOrders: DraftOrderListItem[]): string {
  const highest = draftOrders.reduce((max, draftOrder) => {
    const match = ORDER_ID_PATTERN.exec(draftOrder.id);
    return match ? Math.max(max, Number(match[2])) : max;
  }, 0);

  return `QT-${String(highest + 1).padStart(5, '0')}`;
}

/** A fresh draft that copies the source's customer, brands, ship-to and configs. */
export function createDuplicateDraftOrder(
  source: DraftOrderListItem,
  draftOrders: DraftOrderListItem[],
  updatedDate: string,
): DraftOrderListItem {
  const id = getNextDraftOrderId(draftOrders);

  return {
    ...source,
    id,
    version: 1,
    status: 'draft',
    updatedDate,
    workflow: Array.from({length: DUPLICATE_WORKFLOW_STAGE_COUNT}, () => ({
      status: 'queued' as const,
    })),
    lines: source.lines?.map((line, index) => ({
      ...line,
      id: `${id}-L${index + 1}`,
      sendState: 'notSent' as const,
      orderRef: undefined,
    })),
  };
}

export function getFilteredDraftOrders(
  draftOrders: DraftOrderListItem[],
  searchQuery: string,
  activeBrand: DraftOrderBrandFilterValue,
  activeStatus: DraftOrderStatusFilterValue,
) {
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  return draftOrders.filter((draftOrder) => {
    const matchesStatus =
      activeStatus === 'all' ||
      draftOrder.status === activeStatus;

    const matchesBrand =
      activeBrand === 'all' ||
      draftOrder.brands.includes(activeBrand);

    const matchesSearch =
      normalizedSearchQuery === '' ||
      draftOrder.id
        .toLowerCase()
        .includes(normalizedSearchQuery) ||
      draftOrder.customer
        .toLowerCase()
        .includes(normalizedSearchQuery) ||
      draftOrder.description
        ?.toLowerCase()
        .includes(normalizedSearchQuery) ||
      draftOrder.shipTo
        .toLowerCase()
        .includes(normalizedSearchQuery);

    return (
      matchesStatus &&
      matchesBrand &&
      matchesSearch
    );
  });
}

export function getSortedDraftOrders(
  draftOrders: DraftOrderListItem[],
  activeSort: DraftOrderSortOption,
) {
  return [...draftOrders].sort((a, b) => {
    if (activeSort === 'value') {
      return b.amount - a.amount;
    }

    if (activeSort === 'customer') {
      return a.customer.localeCompare(
        b.customer,
      );
    }

    return 0;
  });
}

const IN_FLIGHT_STATUSES = [
  'draft',
  'sent',
  'approved',
  'workflows',
  'ready',
] as const;

export function getInFlightAmount(
  draftOrders: DraftOrderListItem[],
) {
  return draftOrders
    .filter((draftOrder) =>
      IN_FLIGHT_STATUSES.includes(
        draftOrder.status as (typeof IN_FLIGHT_STATUSES)[number],
      ),
    )
    .reduce(
      (total, draftOrder) => total + draftOrder.amount,
      0,
    );
}

export function getDraftOrderKpis(
  draftOrders: DraftOrderListItem[],
): DraftOrderKpi[] {
  const openDraftOrderValue = draftOrders.reduce(
    (total, draftOrder) => total + draftOrder.amount,
    0,
  );

  const projectedRevenue = Math.round(openDraftOrderValue * 0.86);

  const accountsInPlay = new Set(
    draftOrders.map((draftOrder) => draftOrder.customer),
  ).size;

  const decidedDraftOrders = draftOrders.filter(
    (draftOrder) =>
      draftOrder.status === 'converted' ||
      draftOrder.status === 'rejected' ||
      draftOrder.status === 'lost',
  );

  const convertedDraftOrders = decidedDraftOrders.filter(
    (draftOrder) => draftOrder.status === 'converted',
  );

  const conversionRate =
    decidedDraftOrders.length === 0
      ? 0
      : Math.round(
        (convertedDraftOrders.length / decidedDraftOrders.length) * 100,
      );

  return DRAFT_ORDER_KPIS.map((kpi) => {
    switch (kpi.id) {
      case 'openDraftOrderValue':
        return {
          id: kpi.id,
          value: Math.round(openDraftOrderValue),
          metadata: {
            count: draftOrders.length,
          },
        };

      case 'projectedRevenue':
        return {
          id: kpi.id,
          value: projectedRevenue,
          metadata: {
            rate: 86,
          },
        };
      case 'accountsInPlay':
        return { id: kpi.id, value: accountsInPlay, metadata: { count: draftOrders.filter((draftOrder) => draftOrder.status === 'draft' || draftOrder.status === 'sent',).length, }, };
      case 'conversionRate':
        return { id: kpi.id, value: conversionRate, metadata: { converted: convertedDraftOrders.length, total: decidedDraftOrders.length, }, };

      default:
        return {
          id: kpi.id,
          value: 0,
        };
    }
  });
}

export function formatDraftOrderKpiValue(
  kpi: DraftOrderKpi,
): string | number {
  if (kpi.id === 'conversionRate') {
    return `${kpi.value}%`;
  }

  if (
    kpi.id === 'openDraftOrderValue' ||
    kpi.id === 'projectedRevenue'
  ) {
    return Number(kpi.value).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  }

  return kpi.value;
}

export function getBrandDisplayName(
  code: DraftOrderBrandFilterValue,
): string {
  const nameMap: Record<string, string> = {
    ua: 'Under Armour',
    champion: 'Champion',
    lululemon: 'Lululemon',
    other: 'Gear',
  };

  return nameMap[code] || code;
}

export function getBrandFilterValue(
  brand: string,
): DraftOrderBrandFilterValue {
  switch (brand) {
    case 'Under Armour':
      return 'ua';
    case 'Champion':
      return 'champion';
    case 'Lululemon':
      return 'lululemon';
    case 'Gear':
      return 'other';
    default:
      return 'all';
  }
}

