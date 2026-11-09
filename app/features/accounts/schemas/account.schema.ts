/**
 * Zod schemas for the Accounts feature. These are the source of truth.
 *
 * Hydrogen's codegen only holds the Storefront and Customer Account schemas,
 * so there are no generated types for the Admin API's `Company`. CLAUDE.md
 * coding rule 7 allows exactly two type sources — codegen or Zod — so the
 * Admin payload is *parsed*, not cast, and every downstream type is a
 * `z.infer` of the schemas below.
 *
 * Messages are keys, never English sentences (coding rule 14). The Accounts
 * list has no forms yet; the keys exist so that when filters become a
 * validated form the copy is already inventoried in `locales/en/errors.json`.
 */
import {z} from 'zod';
import {
  accountInvoiceSchema,
  accountOrderSchema,
} from '../../customerProfileDrawer/schemas/profile.schema';
import {
  accountOrderRowSchema,
  companyOrderSchema,
} from './company-orders.schema';

/**
 * Market segment codes.
 *
 * The code is the data value; the label lives in `locales/<lng>/enums.json`
 * under `enums.segment.<code>` so it stays translatable (CLAUDE.md key
 * conventions).
 *
 * ❓ TO CONFIRM — the prototype is inconsistent about this list. Its segment
 * filter chips read `golf · resort · bookstore · retail · military ·
 * corporate`, but its segment-badge icon map keys on `university` where the
 * chips say `bookstore`, and the badge stylesheet ships a `university` colour
 * with no `bookstore` rule. Both codes are carried here until the business
 * confirms whether they are one segment renamed or two distinct ones.
 */
export const SEGMENT_CODES = [
  'golf',
  'resort',
  'bookstore',
  'university',
  'retail',
  'military',
  'corporate',
] as const;

export const segmentCodeSchema = z.enum(SEGMENT_CODES);

export type SegmentCode = z.infer<typeof segmentCodeSchema>;

/** Account tier — drives the tier badge colour band in the profile drawer. */
export const ACCOUNT_TIERS = ['A', 'B', 'C'] as const;

export const accountTierSchema = z.enum(ACCOUNT_TIERS);

export type AccountTier = z.infer<typeof accountTierSchema>;

/** Brand attribution, for the profile drawer's brand pill. */
export const ACCOUNT_BRANDS = ['ua', 'champion', 'other'] as const;

export const accountBrandSchema = z.enum(ACCOUNT_BRANDS);

export type AccountBrand = z.infer<typeof accountBrandSchema>;

/** Credit hold state, shown as a terra badge in the drawer hero band. */
export const accountCreditHoldSchema = z.object({
  onHold: z.boolean(),
  reason: z.string().nullable().optional(),
});

export type AccountCreditHold = z.infer<typeof accountCreditHoldSchema>;

/**
 * The segment filter's value set — the codes plus the `all` pseudo-option the
 * prototype's first chip represents. `all` is not a segment, so it is not in
 * `enums.json`; its label is `accounts:filters.segment.all`.
 */
export const SEGMENT_FILTER_VALUES = ['all', ...SEGMENT_CODES] as const;

export const segmentFilterSchema = z.enum(SEGMENT_FILTER_VALUES);

export type SegmentFilter = z.infer<typeof segmentFilterSchema>;

/**
 * The table's sortable columns. All of them now sort client-side over
 * whatever page the loader fetched — the Admin API only has a server-side
 * sort key for `account` (`CompanySortKeys.NAME`); the `custom.*` metafields
 * behind every other column have no entry in that enum. Rather than split
 * sorting between server and client, every column sorts the same way, over
 * the same fetched page.
 */
export const ACCOUNTS_SORT_KEYS = [
  'account',
  'segment',
  'ordersYtd',
  'shippedYtd',
  'openOrders',
  'goal',
] as const;

export const accountsSortKeySchema = z.enum(ACCOUNTS_SORT_KEYS);

export type AccountsSortKey = z.infer<typeof accountsSortKeySchema>;

export const ACCOUNTS_SORT_DIRECTIONS = ['asc', 'desc'] as const;

export const accountsSortDirectionSchema = z.enum(ACCOUNTS_SORT_DIRECTIONS);

export type AccountsSortDirection = z.infer<typeof accountsSortDirectionSchema>;

/**
 * The URL search params that drive the list.
 *
 * Only `segment` and `brand` live here — both narrow which companies the
 * loader fetches, so they stay authoritative in the URL (coding rule 12) and
 * a filtered link is shareable. Free-text search and column sorting do not
 * filter/reorder the Admin fetch at all; they run entirely client-side over
 * the fetched page (component state in `AccountsPage`), so they are not part
 * of this schema.
 */
export const accountsSearchSchema = z.object({
  segment: segmentFilterSchema.default('all'),
  /**
   * A "brands" metaobject handle, or `all`. Open-ended rather than an enum
   * — unlike segments, the brand set is live Shopify data (see
   * `BrandSummary`), not a fixed list known at schema-definition time.
   */
  brand: z.string().trim().default('all'),
});

export type AccountsSearch = z.infer<typeof accountsSearchSchema>;

/**
 * Parse `URLSearchParams` into the list's filter state, falling back to
 * defaults rather than throwing — a hand-edited query string must not 500 the
 * page.
 */
export function parseAccountsSearch(params: URLSearchParams): AccountsSearch {
  const result = accountsSearchSchema.safeParse({
    segment: params.get('segment') ?? undefined,
    brand: params.get('brand') ?? undefined,
  });

  return result.success ? result.data : {segment: 'all', brand: 'all'};
}

/**
 * A row in the Accounts list.
 *
 * Only `id`, `gid` and `name` are guaranteed. `address` is empty when the
 * company location has no billing or shipping address set, and every metric is
 * nullable because those arrive as company metafields that do not exist yet —
 * the table renders "—" until they do.
 */
export const accountSchema = z.object({
  /** Numeric portion of the company GID — safe to put in a URL path. */
  id: z.string().min(1),
  /** Full Admin API GID, for follow-up company queries. */
  gid: z.string().min(1),
  name: z.string(),
  /** "Austin, TX", or the location name, or empty. */
  address: z.string(),
  /** Overrides the initials the Avatar would otherwise derive from `name`. */
  initials: z.string().optional(),
  segment: segmentCodeSchema.nullable(),
  /** Count of orders year to date. */
  ordersYtd: z.number().nullable(),
  /** Value shipped year to date, in store currency. */
  shippedYtd: z.number().nullable(),
  /** Value of open orders, in store currency. */
  openOrders: z.number().nullable(),
  /** Annual revenue goal, in store currency. */
  goal: z.number().nullable(),
  /** Forecasted full-year revenue, in store currency — the drawer's Forecast FY KPI. */
  forecastFy: z.number().nullable(),
  /** Year-over-year shipped growth, as a fraction (e.g. `0.16` for 16%). */
  yoyGrowth: z.number().nullable(),
  /** Past-due AR balance, in store currency. */
  pastDue: z.number().nullable(),
  /** Count of open support cases. */
  casesOpen: z.number().nullable(),
  /** Most recent orders, for the profile drawer's Orders tab. */
  recentOrders: z.array(accountOrderSchema).nullable().optional(),
  /** Line-item order history rows, for the Orders tab's table — see `toOrderRows`. */
  orderRows: z.array(accountOrderRowSchema).nullable().optional(),
  /** Open and recent invoices, for the profile drawer's Invoices tab. */
  invoices: z.array(accountInvoiceSchema).nullable().optional(),
  tier: accountTierSchema.nullable().optional(),
  /** "Austin, TX" — city/state as shown in the drawer hero band. */
  city: z.string().nullable().optional(),
  primaryContact: z.string().nullable().optional(),
  /** Year the relationship started, for the "since <year>" hero line. */
  sinceYear: z.number().nullable().optional(),
  brand: accountBrandSchema.nullable().optional(),
  /**
   * Raw `name.brands` metaobject GIDs (`COMPANY_BRANDS_METAFIELD_KEY`), for
   * the Brand filter chip counts — see `summarizeBrandCounts` in `lib/company`.
   * Resolving a GID to a brand name requires a separate Storefront lookup
   * (`queries/brand-metaobjects.ts`), so this field stays as bare ids.
   */
  brandIds: z.array(z.string()).nullable().optional(),
  /** True when the account carries a royalty/licensing agreement. */
  licensed: z.boolean().nullable().optional(),
  platinum: z.boolean().nullable().optional(),
  creditHold: accountCreditHoldSchema.nullable().optional(),
});

export type Account = z.infer<typeof accountSchema>;

/* ------------------------------------------------------------------
   Admin API response shapes
------------------------------------------------------------------ */

/**
 * A metafield selection. Absent metafields come back as `null`, and a
 * definition that does not exist yet also comes back as `null` rather than
 * erroring — which is why every metric is optional all the way down.
 */
const metafieldSchema = z
  .object({value: z.string().nullable()})
  .nullable()
  .optional();

/**
 * The `$app` metafields selected on a company. Named to match
 * `COMPANY_METAFIELD_KEYS` so the GraphQL aliases and the parser cannot drift.
 */
export const companyMetafieldsSchema = z.object({
  segment: metafieldSchema,
  ordersYtd: metafieldSchema,
  shippedYtd: metafieldSchema,
  openOrders: metafieldSchema,
  goal: metafieldSchema,
  forecastFy: metafieldSchema,
  yoyGrowth: metafieldSchema,
  pastDue: metafieldSchema,
  casesOpen: metafieldSchema,
  brands: metafieldSchema,
});

export type CompanyMetafields = z.infer<typeof companyMetafieldsSchema>;

const addressSchema = z
  .object({
    city: z.string().nullable().optional(),
    province: z.string().nullable().optional(),
    zip: z.string().nullable().optional(),
    countryCode: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

export type CompanyAddress = z.infer<typeof addressSchema>;

const companyLocationSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
});

/**
 * One company as selected by `COMPANIES_QUERY` / `COMPANY_QUERY`. Both
 * documents select the same fields so `toAccount` can map either response.
 */
export const adminCompanySchema = companyMetafieldsSchema.extend({
  id: z.string(),
  name: z.string(),
  locations: z
    .object({nodes: z.array(companyLocationSchema)})
    .nullable()
    .optional(),
  orders: z
    .object({nodes: z.array(companyOrderSchema)})
    .nullable()
    .optional(),
});

export type AdminCompany = z.infer<typeof adminCompanySchema>;

const pageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
});

export const adminCompaniesResponseSchema = z.object({
  companies: z.object({
    nodes: z.array(adminCompanySchema),
    pageInfo: pageInfoSchema,
  }),
});

export type AdminCompaniesResponse = z.infer<
  typeof adminCompaniesResponseSchema
>;

export const adminCompanyResponseSchema = z.object({
  company: adminCompanySchema.nullable(),
});

/* ------------------------------------------------------------------
   Storefront API response shape — brand metaobjects
------------------------------------------------------------------ */

/**
 * A "brands" metaobject, as selected by `BRAND_METAOBJECTS_QUERY`. Read
 * through the Storefront client rather than `adminQuery` — see the
 * `read_metaobjects` scope note on `COMPANY_BRANDS_METAFIELD_NAMESPACE`.
 */
export const brandMetaobjectSchema = z.object({
  id: z.string(),
  handle: z.string(),
  fields: z.array(z.object({key: z.string(), value: z.string().nullable()})),
});

export type BrandMetaobject = z.infer<typeof brandMetaobjectSchema>;

export const brandMetaobjectsResponseSchema = z.object({
  metaobjects: z.object({nodes: z.array(brandMetaobjectSchema)}),
});

export type BrandMetaobjectsResponse = z.infer<
  typeof brandMetaobjectsResponseSchema
>;
