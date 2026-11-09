import { Fragment, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { DRAFT_ORDER_TABLE_COLUMNS } from '../../lib/draft-order-options';
import type {
  DraftOrderListBrand,
  DraftOrderListItem,
  DraftOrderListStatus,
} from '../../types/draft-order';
import { Button } from '~/shared/components/ui/Button';
import { DraftOrdersAccordionRow } from './DraftOrdersAccordionRow';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/shared/components/ui/Table';

interface DraftOrdersListTableProps {
  draftOrders: DraftOrderListItem[];
  expandedOrderIds: string[];
  onToggleExpanded: (orderId: string) => void;
  /** The archived list: expanded rows offer Restore instead of Archive. */
  isArchived?: boolean;
}

const tableColumnClasses = {
  orderId: 'w-[12.5%]',
  status: 'w-[11%]',
  customer: 'w-[18.5%]',
  brands: 'w-[92px] max-[1199.98px]:hidden',
  shipTo: 'w-[11%] max-[1599.98px]:hidden',
  updated: 'w-[84px] max-[1199.98px]:hidden',
  workflow: 'w-[108px]',
  amount: 'w-[10.5%] text-right',
  details: 'w-11',
};

const statusClasses: Record<DraftOrderListStatus, string> = {
  draft: 'bg-[#F7F7F8] text-[#5C5C61]',
  sent: 'bg-[#FFF6E5] text-[#6B4A0B]',
  approved: 'bg-[#EEF6F1] text-[#1F7A4D]',
  workflows: 'bg-[#F7F7F8] text-[#5C5C61]',
  ready: 'bg-[#EEF6F1] text-[#1F7A4D]',
  converted: 'bg-[#EEF6F1] text-[#1F7A4D]',
  rejected: 'bg-[#FDECEC] text-[#A02020]',
  lost: 'bg-[#F7F7F8] text-[#5C5C61]',
};

// Literal keys, so extraction tooling can see every brand key.
const BRAND_KEYS = {
  ua: {name: 'draftOrders.page.list.brands.ua', badge: 'draftOrders.page.list.brands.badges.ua'},
  champion: {name: 'draftOrders.page.list.brands.champion', badge: 'draftOrders.page.list.brands.badges.champion'},
  lululemon: {name: 'draftOrders.page.list.brands.lululemon', badge: 'draftOrders.page.list.brands.badges.lululemon'},
  other: {name: 'draftOrders.page.list.brands.other', badge: 'draftOrders.page.list.brands.badges.other'},
} as const satisfies Record<DraftOrderListBrand, {name: string; badge: string}>;

const WIDE_QUERY = '(min-width: 1200px)';
const EXTRA_WIDE_QUERY = '(min-width: 1600px)';

function subscribeToColumnBreakpoints(onChange: () => void) {
  const queries = [WIDE_QUERY, EXTRA_WIDE_QUERY].map((query) =>
    window.matchMedia(query),
  );
  queries.forEach((query) => query.addEventListener('change', onChange));
  return () =>
    queries.forEach((query) => query.removeEventListener('change', onChange));
}

/**
 * Columns that are visible at the current width. Brands and Updated hide
 * below 1200px and Ship-to below 1600px (`tableColumnClasses`); a panel that
 * spans more columns than exist adds a phantom column and shifts the table.
 */
function getVisibleColumnCount() {
  const wide = window.matchMedia(WIDE_QUERY).matches;
  const extraWide = window.matchMedia(EXTRA_WIDE_QUERY).matches;
  return DRAFT_ORDER_TABLE_COLUMNS.length - (wide ? 0 : 2) - (extraWide ? 0 : 1);
}

function useVisibleColumnCount() {
  return useSyncExternalStore(
    subscribeToColumnBreakpoints,
    getVisibleColumnCount,
    () => DRAFT_ORDER_TABLE_COLUMNS.length,
  );
}

export function DraftOrdersListTable({
  draftOrders,
  expandedOrderIds,
  onToggleExpanded,
  isArchived = false,
}: DraftOrdersListTableProps) {
  const { t, i18n } = useTranslation('draftOrders');
  const visibleColumnCount = useVisibleColumnCount();

  return (
    <>
      <div className="relative min-w-0">
        <Table
          aria-label={t('draftOrders.page.list.table.ariaLabel')}
          className="w-full table-fixed"
          wrapperClassName="overflow-x-visible"
        >
          <TableHeader className="max-[759.98px]:hidden">
            <TableRow className="h-10 border-b border-[#D7D7DA]">
              {DRAFT_ORDER_TABLE_COLUMNS.map((column) => (
                <TableHead
                  key={column.value}
                  className={`cursor-pointer bg-white px-2 py-0 text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70] ${tableColumnClasses[column.value]
                    }`}
                >
                  {column.value === 'details' ? (
                    <span className="sr-only">
                      {t('draftOrders.page.list.table.columns.details')}
                    </span>
                  ) : (
                    t(`draftOrders.page.list.table.columns.${column.value}`)
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {draftOrders.map((draftOrder) => {
              const isExpanded = expandedOrderIds.includes(draftOrder.id);
              return (
                <Fragment key={draftOrder.id}>
                  <TableRow
                    className={`min-h-[52px] cursor-pointer border-b border-[#ECECEE] text-[13px] text-[#111113] ${isExpanded
                      ? 'bg-[#F7F7F8]'
                      : 'bg-white hover:bg-[#F3F3F4]'
                      }`}
                  >
                    <TableCell className="min-w-0 px-2 py-1.5">
                      <span className="block overflow-hidden text-ellipsis whitespace-nowrap tabular-nums">
                        <b className="font-semibold">{draftOrder.id}</b>

                        {draftOrder.version !== undefined && (
                          <>
                            {' '}
                            <span className="text-xs text-[#6B6B70]">
                              {t('draftOrders.page.list.version', {
                                version: draftOrder.version,
                              })}
                            </span>
                          </>
                        )}
                      </span>
                    </TableCell>

                    <TableCell className="min-w-0 px-2 py-1.5">
                      <span
                        className={`inline-flex h-[22px] max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full px-2 align-middle text-xs font-medium leading-none ${statusClasses[draftOrder.status]
                          }`}
                      >
                        {t(`draftOrders.page.list.statuses.${draftOrder.status}`)}
                      </span>
                    </TableCell>

                    <TableCell className="min-w-0 px-2 py-1.5">
                      <span className="flex min-w-0 flex-col items-start">
                        <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {draftOrder.customer}
                        </span>

                        {draftOrder.description && (
                          <span className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-[1.5] text-[#6B6B70]">
                            {draftOrder.description}
                          </span>
                        )}
                      </span>
                    </TableCell>

                    <TableCell className="min-w-0 px-2 py-1.5 max-[1199.98px]:hidden">
                      <span
                        className="inline-flex items-center"
                        role="img"
                        aria-label={new Intl.ListFormat(i18n.language, {style: 'long', type: 'conjunction'}).format(
                          draftOrder.brands.map((brand) => t(BRAND_KEYS[brand].name)),
                        )}
                      >
                        {draftOrder.brands.map((brand, index) => (
                          <span
                            key={brand}
                            className={`inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-white text-xs font-semibold ${index === 0 ? 'ml-0' : '-ml-0'
                              } ${brand === 'ua'
                                ? 'bg-[#111113] text-white'
                                : 'bg-[#F2F2F3] text-[#111113]'
                              }`}
                          >
                            {t(BRAND_KEYS[brand].badge)}
                          </span>
                        ))}
                      </span>
                    </TableCell>

                    <TableCell className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1.5 text-[#5C5C61] max-[1599.98px]:hidden">
                      {draftOrder.shipTo}
                    </TableCell>

                    <TableCell className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1.5 text-[#5C5C61] max-[1199.98px]:hidden">
                      {draftOrder.updatedDate}
                    </TableCell>

                    <TableCell className="w-[108px] px-2 py-1.5">
                      <span className="inline-flex items-center gap-[3px]">
                        {draftOrder.workflow.map((stage) => (
                          <span
                            key={stage.code}
                            className={`h-2 w-2 rounded-full border box-border ${stage.status === 'passed'
                              ? 'border-[#111113] bg-[#111113]'
                              : stage.status === 'active'
                                ? 'border-2 border-[#111113] bg-white'
                                : stage.status === 'blocked'
                                  ? 'border-[#A02020] bg-[#A02020]'
                                  : stage.status === 'na'
                                    ? 'border-dashed border-[#D7D7DA] bg-white'
                                    : 'border-[#D7D7DA] bg-white'
                              }`}
                          />
                        ))}
                      </span>
                    </TableCell>

                    <TableCell className="w-[10.5%] px-2 py-1.5 text-right">
                      <span className="whitespace-nowrap text-[13.5px] font-semibold text-[#111113] tabular-nums">
                        {t('draftOrders.page.list.money', {value: draftOrder.amount})}
                      </span>
                    </TableCell>

                    <TableCell className="px-2 py-1.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        shape="pill"
                        // disabled
                        aria-expanded={isExpanded}
                        aria-controls={`draft-order-details-${draftOrder.id}`}
                        aria-label={t('draftOrders.page.list.table.showDetails', {
                          id: draftOrder.id,
                        })}

                        onClick={() => onToggleExpanded(draftOrder.id)}
                        className="h-9 w-9 shrink-0 data-disabled:pointer-events-auto data-disabled:cursor-not-allowed min-h-9 rounded-full bg-transparent text-[#6B6B70] hover:bg-[#F7F7F8] hover:text-[#111113]"
                      >
                        <ChevronDown
                          aria-hidden="true"
                          className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''
                            }`}
                          strokeWidth={1.8}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                  <DraftOrdersAccordionRow
                    draftOrder={draftOrder}
                    isExpanded={isExpanded}
                    isArchived={isArchived}
                    panelId={`draft-order-details-${draftOrder.id}`}
                    colSpan={visibleColumnCount}
                  />
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}