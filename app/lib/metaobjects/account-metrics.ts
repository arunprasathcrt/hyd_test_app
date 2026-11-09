/**
 * Company account metrics — the metafield reader for the Accounts list.
 *
 * All metafield IO goes through `lib/metaobjects/` (CLAUDE.md data access
 * rule 4): this module owns the Zod schema for the payload and the reader.
 * `jsonValue`/`value` parsing must never be inlined in a component.
 *
 * There is no writer yet. Whether these values are hand-entered or arrive
 * from NetSuite via Celigo is unconfirmed — see the ❗ DEVIATION note on
 * `COMPANY_METAFIELD_NAMESPACE` in `shared/constants/metafields.ts`, since
 * today's definitions were created by hand in the admin UI rather than
 * through `shopify.app.toml`.
 *
 *   ❓ TO CONFIRM — the sync/ownership story for each metric is an OPEN
 *   decision in the developer docs. This module parses whatever is present
 *   and yields `null` for whatever is not, so the table renders "—" rather
 *   than a fabricated number.
 *
 * Served via: `custom` metafield on `Company` (not `$app` — flagged above).
 */
import {
  companyMetafieldsSchema,
  segmentCodeSchema,
  type CompanyMetafields,
  type SegmentCode,
} from '~/features/accounts/schemas/account.schema';
import {createLogger} from '~/lib/logger';

const log = createLogger('metaobjects.account-metrics');

/**
 * The metric block of an Accounts row, after parsing. Every field is nullable:
 * a metafield that has no definition yet, or a company that has no value set,
 * both surface as `null`.
 */
export interface AccountMetrics {
  segment: SegmentCode | null;
  ordersYtd: number | null;
  shippedYtd: number | null;
  openOrders: number | null;
  goal: number | null;
  forecastFy: number | null;
  yoyGrowth: number | null;
  pastDue: number | null;
  casesOpen: number | null;
  /** Raw `name.brands` metaobject GIDs — see `COMPANY_BRANDS_METAFIELD_KEY`. */
  brandIds: string[] | null;
}

/** Every metric absent — the shape the table renders as all "—". */
export const EMPTY_ACCOUNT_METRICS: AccountMetrics = {
  segment: null,
  ordersYtd: null,
  shippedYtd: null,
  openOrders: null,
  goal: null,
  forecastFy: null,
  yoyGrowth: null,
  pastDue: null,
  casesOpen: null,
  brandIds: null,
};

/**
 * Metafield values are always strings on the wire, whatever the definition's
 * type. A blank, a non-numeric string, or a NaN becomes `null` rather than
 * rendering as `NaN` in front of a rep.
 *
 * Values are hand-entered in the admin UI and come back currency-formatted
 * (`"$12,620"`, `"$80,000"`) rather than as bare numbers, so `$`, `,`, and
 * whitespace are stripped before parsing.
 */
function toNumber(field: {value: string | null} | null | undefined): number | null {
  const raw = field?.value;
  if (raw === null || raw === undefined || raw.trim() === '') return null;

  const cleaned = raw.replace(/[^0-9.-]/g, '');
  if (cleaned === '') return null;

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) {
    log.warn('Non-numeric metric metafield value', {value: raw});
    return null;
  }

  return parsed;
}

/**
 * `common:format.percent` expects a fraction (`0.16` → "16%"), but this is a
 * hand-entered field like the others, so it can arrive as `"16%"`, `"16"`, or
 * already a fraction (`"0.16"`). A `%` sign or a magnitude over 1 is treated
 * as whole percentage points and divided by 100; anything else is assumed to
 * already be a fraction.
 */
function toPercent(field: {value: string | null} | null | undefined): number | null {
  const raw = field?.value;
  if (raw === null || raw === undefined || raw.trim() === '') return null;

  const isWholePercent = raw.includes('%');
  const cleaned = raw.replace(/[^0-9.-]/g, '');
  if (cleaned === '') return null;

  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) {
    log.warn('Non-numeric metric metafield value', {value: raw});
    return null;
  }

  return isWholePercent || Math.abs(parsed) > 1 ? parsed / 100 : parsed;
}

/**
 * The segment metafield is a free-text label entered in the admin UI (e.g.
 * "Golf", "Bookstore (university)", "High School"), not the normalized code
 * `SEGMENT_CODES` expects. The parenthetical is stripped and the remainder is
 * lowercased before matching, which resolves "Bookstore (university)" to the
 * `bookstore` code.
 *
 * ❓ TO CONFIRM — "High School" has no corresponding code in `SEGMENT_CODES`
 * at all. It is dropped like any other unrecognised value rather than
 * inventing a new code; the business needs to confirm whether it is a new
 * segment or should be re-tagged under an existing one.
 */
function toSegment(
  field: {value: string | null} | null | undefined,
): SegmentCode | null {
  const raw = field?.value?.trim().replace(/\s*\([^)]*\)\s*$/, '').toLowerCase();
  if (!raw) return null;

  const parsed = segmentCodeSchema.safeParse(raw);
  if (!parsed.success) {
    log.warn('Unknown company segment code', {code: field?.value});
    return null;
  }

  return parsed.data;
}

/**
 * `name.brands` stores a JSON array of metaobject GIDs (e.g.
 * `["gid://shopify/Metaobject/609008386240"]`). A missing field, invalid
 * JSON, a non-array, or an empty array all collapse to `null`.
 */
function toBrandIds(
  field: {value: string | null} | null | undefined,
): string[] | null {
  const raw = field?.value;
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const ids = parsed.filter((id): id is string => typeof id === 'string');
    return ids.length > 0 ? ids : null;
  } catch {
    log.warn('Non-JSON brands metafield value', {value: raw});
    return null;
  }
}

/**
 * Parse the `$app` metafields selected on a company into typed metrics.
 *
 * Takes `unknown` because the Admin API response is unvalidated — there is no
 * codegen for it. A payload that does not match the schema yields empty
 * metrics rather than throwing, so one malformed company cannot blank the
 * whole list.
 */
export function readAccountMetrics(payload: unknown): AccountMetrics {
  const parsed = companyMetafieldsSchema.safeParse(payload);

  if (!parsed.success) {
    log.warn('Company metafield payload did not parse', {
      issues: parsed.error.issues.map((issue) => issue.path.join('.')),
    });
    return EMPTY_ACCOUNT_METRICS;
  }

  return fromParsedMetafields(parsed.data);
}

/**
 * The same mapping, for a payload that has already been parsed as part of a
 * larger document — avoids validating the same object twice.
 */
export function fromParsedMetafields(
  metafields: CompanyMetafields,
): AccountMetrics {
  return {
    segment: toSegment(metafields.segment),
    ordersYtd: toNumber(metafields.ordersYtd),
    shippedYtd: toNumber(metafields.shippedYtd),
    openOrders: toNumber(metafields.openOrders),
    goal: toNumber(metafields.goal),
    forecastFy: toNumber(metafields.forecastFy),
    yoyGrowth: toPercent(metafields.yoyGrowth),
    pastDue: toNumber(metafields.pastDue),
    casesOpen: toNumber(metafields.casesOpen),
    brandIds: toBrandIds(metafields.brands),
  };
}
