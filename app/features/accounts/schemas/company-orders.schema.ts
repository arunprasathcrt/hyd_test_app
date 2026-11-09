/**
 * Zod schemas for the order history nested under `Company.orders`
 * (`queries/companies.ts`, `COMPANY_ORDERS`).
 *
 * Hydrogen's codegen only holds the Storefront and Customer Account schemas,
 * so this Admin API payload is parsed here rather than cast (CLAUDE.md coding
 * rule 7) — see `account.schema.ts` for the same pattern on `Company`.
 */
import {z} from 'zod';

const moneyBagSchema = z.object({
  shopMoney: z.object({
    amount: z.string(),
    currencyCode: z.string(),
  }),
});

export const companyOrderLineItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  variantTitle: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  quantity: z.number(),
  // The variant is null when it's been deleted since the order was placed.
  variant: z
    .object({
      selectedOptions: z.array(z.object({name: z.string(), value: z.string()})),
    })
    .nullable()
    .optional(),
  originalUnitPriceSet: moneyBagSchema,
  originalTotalSet: moneyBagSchema,
});

export type CompanyOrderLineItem = z.infer<typeof companyOrderLineItemSchema>;

export const companyOrderSchema = z.object({
  id: z.string(),
  name: z.string(),
  poNumber: z.string().nullable().optional(),
  createdAt: z.string(),
  displayFinancialStatus: z.string().nullable().optional(),
  displayFulfillmentStatus: z.string().nullable().optional(),
  totalPriceSet: moneyBagSchema,
  lineItems: z.object({nodes: z.array(companyOrderLineItemSchema)}),
});

export type CompanyOrder = z.infer<typeof companyOrderSchema>;

export const companyOrdersConnectionSchema = z.object({
  nodes: z.array(companyOrderSchema),
});

export type CompanyOrdersConnection = z.infer<
  typeof companyOrdersConnectionSchema
>;

/**
 * A flattened row for the Orders tab table — one per `Order`, line items
 * rolled up to a single qty/blended-unit/amount, plus a size breakdown (see
 * `toOrderRows`).
 */
export const accountOrderRowSchema = z.object({
  id: z.string(),
  /** `poNumber` when the order carries one, else the order name (`#1001`). */
  po: z.string(),
  /** ISO 8601 — formatted at render time via the `common:format.date` key. */
  createdAt: z.string(),
  financialStatus: z.string().nullable(),
  fulfillmentStatus: z.string().nullable(),
  qty: z.number(),
  /** Blended unit price (`amount / qty`) — orders mix multiple SKUs/prices. */
  unit: z.number(),
  amount: z.number(),
  currencyCode: z.string(),
  /**
   * Quantity per garment size, keyed by the normalized size code (see
   * `SIZE_COLUMNS`/`normalizeSizeCode` in `lib/company-orders.ts`). A line
   * item whose variant has no recognizable "Size" option is left out of
   * every bucket, so this can undercount `qty` — it is a breakdown, not a
   * second source of truth.
   */
  sizes: z.record(z.string(), z.number()),
});

export type AccountOrderRow = z.infer<typeof accountOrderRowSchema>;

