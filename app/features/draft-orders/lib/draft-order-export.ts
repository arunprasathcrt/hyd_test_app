import {toCsv, type CsvCell} from '~/shared/utils/csv';
import type {DraftOrderListItem} from '../types/draft-order';
import {buildDraftOrderPreview} from './draft-order-preview';

type Translate = (key: string, options?: Record<string, unknown>) => string;

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * CSV for one draft order: a row per line, then Subtotal, Sales tax and Total.
 * The first columns follow the agreed export; Customer to Updated are extra.
 */
export function buildDraftOrderCsv(item: DraftOrderListItem, t: Translate): string {
  const {lines, totals, taxRate} = buildDraftOrderPreview(item);
  const column = (key: string) => t(`draftOrders.page.list.expanded.export.columns.${key}`);
  const approvalByLine = new Map((item.lines ?? []).map((line) => [line.id, line.sendState]));
  const status = t(`draftOrders.page.list.statuses.${item.status}`);

  const extras = (): CsvCell[] => [
    item.customer,
    item.shipTo,
    status,
    item.version ?? '',
    item.updatedDate,
  ];
  const blank = (count: number): CsvCell[] => Array.from({length: count}, () => '');

  const header: CsvCell[] = [
    'draftOrder',
    'line',
    'style',
    'product',
    'colour',
    'art',
    'sizes',
    'units',
    'unitPrice',
    'lineTotal',
    'approval',
    'customer',
    'shipTo',
    'status',
    'version',
    'updated',
  ].map((key) => column(key));

  const lineRows = lines.map((line): CsvCell[] => [
    item.id,
    line.lineNumber,
    line.sku,
    line.name,
    line.color,
    line.artworkCode ?? t('draftOrders.page.list.expanded.export.artwork'),
    line.sizes.map((size) => `${size.quantity} ${size.size}`).join(' · '),
    line.quantity,
    round(line.garmentUnitPrice + line.artUnitPrice + line.decorationUnitPrice),
    round(line.lineTotal),
    approvalByLine.get(line.id) ?? '',
    ...extras(),
  ]);

  const summaryRow = (label: string, units: CsvCell, value: number): CsvCell[] => [
    item.id,
    label,
    ...blank(5),
    units,
    '',
    round(value),
    '',
    ...extras(),
  ];

  return toCsv([
    header,
    ...lineRows,
    summaryRow(column('subtotal'), '', totals.subtotal),
    summaryRow(t('draftOrders.page.list.expanded.export.tax', {rate: taxRate}), '', totals.tax),
    summaryRow(column('total'), totals.units, totals.total),
  ]);
}
