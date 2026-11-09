import type {WorkflowStageCode} from './new-draft-order';
import type { DRAFT_ORDER_SORT_OPTIONS, DRAFT_ORDER_TABLE_COLUMNS } from "../lib/draft-order-options";

export interface DraftOrder {
  id: string;
  version?: number;
  description?: string;
  sentDate?: string;
  expiryDate: string;
  amount: number;
}

export type DraftOrderListStatus =
  | 'draft'
  | 'sent'
  | 'approved'
  | 'workflows'
  | 'ready'
  | 'converted'
  | 'rejected'
  | 'lost';

export type DraftOrderListBrand =
  | 'ua'
  | 'champion'
  | 'lululemon'
  | 'other';

export type DraftOrderWorkflowStatus =
  | 'passed'
  | 'queued'
  | 'active'
  | 'blocked'
  | 'na';

export interface DraftOrderWorkflowStage {
  code: WorkflowStageCode;
  status: DraftOrderWorkflowStatus;
}

/** 🔧 SUGGESTED codes for the expanded row's "Next" line; labels live in `expanded.nextActions`. */
export type DraftOrderNextAction =
  | 'chooseBuyer'
  | 'addDescription'
  | 'addProducts'
  | 'addSizes'
  | 'lockArtAndQuantity';

export type DraftOrderLineSendState = 'notSent' | 'sent' | 'approved';

/** One product config on a draft order, shown in the expanded row. */
export interface DraftOrderListLine {
  id: string;
  name: string;
  color: string;
  units: number;
  sendState: DraftOrderLineSendState;
  amount: number;
  /** Art thumbnail; initials show when absent. */
  image?: string;
  /** Order the config became, shown as "Ordered · {ref}". */
  orderRef?: string;
  /** ISO day the customer approved the config. */
  approvedOn?: string;
  /** Style number, for example `PC-440`. */
  sku?: string;
  /** Per-size quantities; when absent the config counts as one size. */
  sizes?: Array<{size: string; quantity: number}>;
}

export interface DraftOrderListItem {
  id: string;
  /** Shopify draft order GID; `id` is the display name. Absent on fixtures. */
  gid?: string;
  version?: number;
  description?: string;
  status: DraftOrderListStatus;
  customer: string;
  brands: DraftOrderListBrand[];
  shipTo: string;
  updatedDate: string;
  workflow: DraftOrderWorkflowStage[];
  amount: number;
  lines?: DraftOrderListLine[];
  nextAction?: DraftOrderNextAction;
}

export type DraftOrderBrandFilterValue =
  | 'all'
  | DraftOrderListBrand;

export type DraftOrderStatusFilterValue =
  | 'all'
  | DraftOrderListStatus;

export interface DraftOrderBrandFilter {
  value: DraftOrderBrandFilterValue;
  count: number;
}

export interface DraftOrderStatusFilter {
  value: DraftOrderStatusFilterValue;
  count: number;
}

export type DraftOrderSortOption =
  (typeof DRAFT_ORDER_SORT_OPTIONS)[number]['value'];

export type DraftOrderTableColumn =
  (typeof DRAFT_ORDER_TABLE_COLUMNS)[number]['value'];

export type DraftOrderKpiId =
  | 'openDraftOrderValue'
  | 'projectedRevenue'
  | 'accountsInPlay'
  | 'conversionRate';

export interface DraftOrderKpi {
  id: DraftOrderKpiId;
  value: number | string;
  metadata?: {
    count?: number;
    rate?: number;
    converted?: number;
    total?: number;
  };
}
