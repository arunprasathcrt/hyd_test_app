/**
 * Option lists for the Draft Orders list: status tabs, sort menu, table columns
 * and KPI cards. These are code-level configuration, not fixtures, so they live
 * in the feature rather than in `mocks/`.
 *
 * Counts are not stored here. The list derives them from the loader data.
 */
import type {
  DraftOrderKpiId,
  DraftOrderStatusFilterValue,
} from '../types/draft-order';

export const DRAFT_ORDER_STATUS_FILTERS = [
  { value: 'all' },
  { value: 'draft' },
  { value: 'sent' },
  { value: 'approved' },
  { value: 'workflows' },
  { value: 'ready' },
  { value: 'converted' },
  { value: 'rejected' },
  { value: 'lost' },
] as const satisfies readonly { value: DraftOrderStatusFilterValue }[];

export const DRAFT_ORDER_SORT_OPTIONS = [
  { value: 'default' },
  { value: 'ship' },
  { value: 'expires' },
  { value: 'recent' },
  { value: 'value' },
  { value: 'customer' },
] as const;

export const DRAFT_ORDER_TABLE_COLUMNS = [
  { value: 'orderId' },
  { value: 'status' },
  { value: 'customer' },
  { value: 'brands' },
  { value: 'shipTo' },
  { value: 'updated' },
  { value: 'workflow' },
  { value: 'amount' },
  { value: 'details' },
] as const;

export const DRAFT_ORDER_KPIS = [
  { id: 'openDraftOrderValue' },
  { id: 'projectedRevenue' },
  { id: 'accountsInPlay' },
  { id: 'conversionRate' },
] as const satisfies readonly { id: DraftOrderKpiId }[];
