/**
 * Accounts feature types.
 *
 * Every type here is derived — `z.infer` off the schemas, never hand-written
 * (CLAUDE.md coding rule 7). This module exists so components import types
 * from `~/features/accounts/types` rather than reaching into `schemas/`.
 */
export type {
  Account,
  AccountBrand,
  AccountCreditHold,
  AccountsSearch,
  AccountsSortDirection,
  AccountsSortKey,
  AccountTier,
  AdminCompaniesResponse,
  AdminCompany,
  BrandMetaobject,
  CompanyAddress,
  CompanyMetafields,
  SegmentCode,
  SegmentFilter,
} from '../schemas/account.schema';

export type {AccountOrderRow} from '../schemas/company-orders.schema';

export type {
  AccountInvoice,
  AccountInvoiceStatus,
  AccountOrder,
  AccountOrderPaymentStatus,
  AccountOrderStatus,
} from '../../customerProfileDrawer/types/profile';

export type {AccountMetrics} from '~/lib/metaobjects/account-metrics';

/** The band a vs-Goal percentage falls into. Drives the bar and label colour. */
export type GoalBand = 'success' | 'info' | 'warning';

/**
 * A brand filter chip: a real "brands" metaobject (name + handle) plus how
 * many accounts in the current book reference it. See
 * `summarizeBrandCounts` in `lib/company`.
 */
export interface BrandSummary {
  id: string;
  handle: string;
  name: string;
  count: number;
}
