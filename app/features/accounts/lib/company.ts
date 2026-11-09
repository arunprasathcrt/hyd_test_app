/**
 * Pure feature logic for the Accounts list: Admin `Company` → `Account`, and
 * the vs-Goal banding.
 *
 * Ported from DTX `app/lib/company.ts`, with the metric mapping added. No data
 * fetching here — that lives in the route loader.
 */
import {
  fromParsedMetafields,
  type AccountMetrics,
} from '~/lib/metaobjects/account-metrics';
import type {BrandMetaobject} from '../schemas/account.schema';
import {toOrderRows} from './company-orders';
import type {
  Account,
  AccountsSortDirection,
  AccountsSortKey,
  AdminCompany,
  BrandSummary,
  CompanyAddress,
  GoalBand,
} from '../types/account';

/**
 * "Austin, TX".
 *
 * `province` is the human label; `countryCode` is the fallback for locations
 * outside the US/CA, where `province` comes back null.
 */
function formatPlace(address: CompanyAddress): string {
  return [address?.city, address?.province || address?.countryCode]
    .filter(Boolean)
    .join(', ');
}

/**
 * Map an Admin API Company onto the Account shape the UI consumes. Shared by
 * the accounts list and the account overview, so the derivation rules below
 * exist in exactly one place.
 */
export function toAccount(company: AdminCompany): Account {
  const location = company.locations?.nodes?.[0];

  // B2B locations commonly fill in one address but not the other.
  const address = location?.billingAddress || location?.shippingAddress;
  const place = formatPlace(address);

  // Shopify defaults a location's name to the company name, so falling back to
  // it unconditionally would print the account name twice in the same cell.
  const locationName =
    location?.name && location.name !== company.name ? location.name : '';

  const metrics: AccountMetrics = fromParsedMetafields(company);

  return {
    // A route param cannot carry a GID's slashes, so expose the numeric id for
    // links and keep the GID for follow-up Admin API calls.
    id: String(company.id).split('/').pop() ?? company.id,
    gid: company.id,
    name: company.name,
    address: place || locationName,
    orderRows: company.orders?.nodes ? toOrderRows(company.orders.nodes) : [],
    ...metrics,
  };
}

/** Rebuild a company GID from the numeric id carried in the route path. */
export function companyGid(id: string): string {
  return `gid://shopify/Company/${id}`;
}

/**
 * Does this account match the toolbar's free-text search term? Checked
 * against `name` and `address` ("Austin, TX") — everything runs client-side
 * over the already-fetched page, so there's no Admin API field limitation to
 * work around here.
 */
export function matchesAccountSearch(account: Account, term: string): boolean {
  const needle = term.trim().toLocaleLowerCase();
  if (!needle) return true;

  return [account.name, account.address]
    .filter(Boolean)
    .some((value) => value!.toLocaleLowerCase().includes(needle));
}

/** One column's raw sort value, ascending. `goal` sorts by vs-Goal percent. */
function sortValue(account: Account, key: AccountsSortKey): string | number {
  switch (key) {
    case 'account':
      return account.name.toLocaleLowerCase();
    case 'segment':
      return account.segment ?? '';
    case 'ordersYtd':
      return account.ordersYtd ?? -Infinity;
    case 'shippedYtd':
      return account.shippedYtd ?? -Infinity;
    case 'openOrders':
      return account.openOrders ?? -Infinity;
    case 'goal':
      return goalPercent(account) ?? -Infinity;
    default:
      return '';
  }
}

/**
 * Sorts a page of accounts by one column, client-side. `sort === null` is the
 * unsorted case: the list renders in whatever order it arrived.
 */
export function sortAccounts(
  accounts: Account[],
  sort: AccountsSortKey | null,
  dir: AccountsSortDirection,
): Account[] {
  if (!sort) return accounts;

  const factor = dir === 'desc' ? -1 : 1;

  return [...accounts].sort((a, b) => {
    const left = sortValue(a, sort);
    const right = sortValue(b, sort);

    if (left < right) return -1 * factor;
    if (left > right) return 1 * factor;
    return 0;
  });
}

/**
 * Progress toward goal, as a whole percentage, or `null` when either side of
 * the ratio is missing. `shippedYtd` and `goal` arrive as separate metafields,
 * so one can be set without the other.
 *
 * A zero goal yields `null` rather than `Infinity`.
 */
export function goalPercent(account: Account): number | null {
  const {shippedYtd, goal} = account;

  if (shippedYtd === null || goal === null || goal <= 0) return null;

  return Math.round((shippedYtd / goal) * 100);
}

/**
 * The vs-Goal colour band. Thresholds are the prototype's:
 * `>= 80` success, `>= 50` info, below that warning.
 */
export function goalBand(percent: number): GoalBand {
  if (percent >= 80) return 'success';
  if (percent >= 50) return 'info';
  return 'warning';
}

/**
 * Derive avatar initials from a company name: the first letter of the first
 * two words, or just the first letter when the name is a single word.
 *
 * Ported from DTX `shared/utils/format.ts` `getInitials`.
 */
export function initialsFor(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Count, per brand metaobject, how many accounts reference it via
 * `account.brandIds` (the parsed `name.brands` metafield). Brands with zero
 * matching accounts are dropped — the chip row only shows brands actually in
 * use, not the full metaobject catalog.
 *
 * `accounts` should be the unfiltered book (same convention as `totalCount`
 * in the route loader), so the chip counts don't shrink when the toolbar's
 * search/segment filters are applied.
 */
export function summarizeBrandCounts(
  accounts: Account[],
  brandMetaobjects: BrandMetaobject[],
): BrandSummary[] {
  const counts = new Map<string, number>();

  for (const account of accounts) {
    for (const id of account.brandIds ?? []) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  return brandMetaobjects
    .filter((brand) => counts.has(brand.id))
    .map((brand) => ({
      id: brand.id,
      handle: brand.handle,
      name:
        brand.fields.find((field) => field.key === 'name')?.value ??
        brand.handle,
      count: counts.get(brand.id) ?? 0,
    }));
}
