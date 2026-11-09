/**
 * `/rep/accounts` — the team experience's book of accounts.
 *
 * Converted from DTX `app/routes/accounts.tsx`. The Admin API is the only
 * source for B2B Companies (they are Plus-only and exist on neither the
 * Storefront nor the Customer Account API), so the read goes through
 * `lib/shopify/admin.server.ts` and the response is parsed by a Zod schema
 * rather than cast — Hydrogen's codegen has no Admin schema.
 */
import {useTranslation} from 'react-i18next';
import {isRouteErrorResponse, useRouteError} from 'react-router';
import type {Route} from './+types/accounts';
import {AccountsPage} from '~/features/accounts/components/AccountsPage';
import {COMPANIES_QUERY} from '~/features/accounts/queries/companies';
import {BRAND_METAOBJECTS_QUERY} from '~/features/accounts/queries/brand-metaobjects';
import {summarizeBrandCounts, toAccount} from '~/features/accounts/lib/company';
import {
  adminCompaniesResponseSchema,
  brandMetaobjectsResponseSchema,
  parseAccountsSearch,
} from '~/features/accounts/schemas/account.schema';
import type {
  Account,
  AccountsSearch,
  BrandSummary,
} from '~/features/accounts/types/account';
import {appSession} from '~/lib/auth/session.server';
import {getRequestT} from '~/lib/i18n/i18n.server';
import {adminQuery} from '~/lib/shopify/admin.server';
import {createLogger} from '~/lib/logger';
import {BRAND_METAOBJECT_TYPE} from '~/shared/constants/metafields';
import accountsStyles from '~/styles/accounts.css?url';

const log = createLogger('routes.rep.accounts');

/** Namespaces this route needs hydrated (CLAUDE.md i18n setup rule 4). */
export const handle = {i18n: ['accounts', 'enums', 'common', 'errors', 'finance']};

/** First page size. Pagination is not wired up yet — `pageInfo` is returned. */
const COMPANIES_PAGE_SIZE = 50;

export async function loader({request, context}: Route.LoaderArgs) {

  const session = appSession(context);

  // Authentication BEFORE any data access (CLAUDE.md auth rule 3). Throws a
  // redirect to `/login?returnTo=/rep/accounts` when the Shopify
  // customer-account session is missing or expired — see the
  // `customAuthStatusHandler` in `lib/context.ts`.
  //
  // 🔧 TEMPORARY — authentication only, no role check.
  //
  // This route lists EVERY company, so the missing role check is not cosmetic:
  // CLAUDE.md auth rule 5 requires that a customer see only their own
  // organization, and any authenticated customer-account holder currently
  // reaches this list. The tag model is still described in
  // `shared/constants/auth.ts`; the guard that consumed it (`requireTag`,
  // `ACCOUNTS_VIEW_TAGS`) was removed with the Entra flow and must be rebuilt
  // before this route carries live data.
  await context.customerAccount.handleAuthStatus();

  const t = await getRequestT({request, session}, [
    'accounts',
    'errors',
    'common',
  ]);

  // Filters come from the URL, so the loader stays authoritative and a
  // filtered list is a shareable link (coding rule 12).
  const search = parseAccountsSearch(new URL(request.url).searchParams);

  const base = {
    title: t('accounts:meta.title'),
    activeSegment: search.segment,
    activeBrand: search.brand,
  };

  /**
   * ❓ TO CONFIRM — REP SCOPING IS NOT APPLIED.
   *
   * CLAUDE.md auth rule 5 makes rep ownership the top-level scope: "a rep sees
   * their book". There is no rep↔company ownership field to scope on — the
   * Admin `Company` has no owning-sales-rep association, and whether that
   * lands as an `$app` company metafield, a company contact role, or a
   * NetSuite field mapped by Celigo is an OPEN decision. So this loader
   * currently returns EVERY company to every internal user.
   *
   * That is a deliberate, flagged gap, not an oversight: it must be closed
   * before this route is exposed to reps who should not see each other's
   * books. The fix belongs here, in the loader, as an added filter on the
   * Admin query — not in the component.
   */

  // A missing or under-scoped Admin token must not 500 the page — it is
  // surfaced as a message so the screen renders with an explanation instead of
  // dropping the rep into an error boundary.
  try {
    // Always the same unfiltered, unsorted page — search and sort are both
    // client-side now (see `AccountsPage`).
    const payload = await adminQuery({
      env: context.env,
      query: COMPANIES_QUERY,
      variables: {
        first: COMPANIES_PAGE_SIZE,
      },
    });

    // Parsed, not cast: there are no codegen types for the Admin API, so Zod
    // is what makes this response typed (coding rule 7).
    const data = adminCompaniesResponseSchema.parse(payload);
    const accounts = data.companies.nodes.map(toAccount);

    // Counted against the unfiltered page, same convention as `totalCount` —
    // the chip counts should not shrink when the toolbar's own filters apply.
    // Reuses this same fetch rather than issuing `COMPANIES_QUERY` again.
    const brandSummaries = await getBrandSummaries(context, accounts);

    return {
      ...base,
      ...shapeList(accounts, search, brandSummaries),
      brandSummaries,
      accountsError: null,
      pageInfo: data.companies.pageInfo,
    };
  } catch (error) {
    // The real cause goes to the log; the rep gets translated copy. The raw
    // Admin error text names the shop domain and the missing scope, which is
    // not something to render in a browser.
    log.error('Company lookup failed', {
      cause: error instanceof Error ? error.message : String(error),
    });

    return {
      ...base,
      accounts: [],
      totalCount: 0,
      brandSummaries: [],
      accountsError: t('accounts:error.message'),
      pageInfo: {hasNextPage: false, endCursor: null},
    };
  }
}

/**
 * Apply the segment and brand filters and shape the list for the view.
 *
 * Free-text search and column sorting are NOT applied here — both run
 * entirely client-side, over whatever this function returns (see
 * `AccountsPage`). This only ever removes rows, never reorders them, so the
 * Admin fetch's order passes through untouched.
 *
 * ❓ TO CONFIRM — segment filtering happens here, over the fetched page, not in
 * the Admin query. Shopify can only filter on a metafield that has a
 * definition marked filterable, and the `$app` segment metafield does not
 * exist yet. Once it does, this moves into the `query` argument; until then
 * the filter is page-scoped, which is why `totalCount` is the unfiltered count
 * the header subtitle needs.
 *
 * `brand` filters by metaobject id, resolved from `search.brand`'s handle via
 * `brandSummaries` (already computed over this same unfiltered page). A
 * handle not present there — stale or hand-edited — can't match any account,
 * so it correctly empties the list rather than needing a separate lookup.
 */
function shapeList(
  accounts: Account[],
  search: AccountsSearch,
  brandSummaries: BrandSummary[],
): {accounts: Account[]; totalCount: number} {
  const bySegment =
    search.segment === 'all'
      ? accounts
      : accounts.filter((account) => account.segment === search.segment);

  const selectedBrand = brandSummaries.find(
    (brand) => brand.handle === search.brand,
  );
  const filtered =
    search.brand === 'all'
      ? bySegment
      : bySegment.filter((account) =>
          selectedBrand ? account.brandIds?.includes(selectedBrand.id) : false,
        );

  return {accounts: filtered, totalCount: accounts.length};
}

/**
 * Real brand names and live per-brand counts for the Brand filter chip row.
 *
 * `accounts` is required, not fetched here: the loader already ran
 * `COMPANIES_QUERY` and hands that same list in, so calling this function
 * never triggers a second Admin API request.
 *
 * A separate Storefront call is still unavoidable for the brand *names*:
 * the Admin token's scopes do not include `read_metaobjects` (confirmed
 * live), so `company.metafield.references` resolves every "brands"
 * reference to `null` there — `COMPANIES_QUERY` only ever gets the raw GID
 * list (`brands.value`). The Storefront API resolves those GIDs to names
 * without that scope — see `queries/brand-metaobjects.ts`.
 *
 * Non-fatal on failure: a glitch here should not take down the whole
 * Accounts page, so it is swallowed with an empty chip row rather than
 * thrown into the route's error boundary.
 */
async function getBrandSummaries(
  context: Route.LoaderArgs['context'],
  accounts: Account[],
): Promise<BrandSummary[]> {
  try {
    const payload = await context.storefront.query(BRAND_METAOBJECTS_QUERY, {
      variables: {type: BRAND_METAOBJECT_TYPE, first: 50},
    });
    const data = brandMetaobjectsResponseSchema.parse(payload);

    return summarizeBrandCounts(accounts, data.metaobjects.nodes);
  } catch (error) {
    log.warn('Brand metaobject lookup failed', {
      cause: error instanceof Error ? error.message : String(error),
    });

    return [];
  }
}

export const meta: Route.MetaFunction = ({data}) => [
  {title: data?.title ?? ''},
];

export function links() {
  return [{rel: 'stylesheet', href: accountsStyles}];
}

export default function RepAccountsRoute({loaderData}: Route.ComponentProps) {
  return (
    <AccountsPage
      accounts={loaderData.accounts}
      totalCount={loaderData.totalCount}
      activeSegment={loaderData.activeSegment}
      activeBrand={loaderData.activeBrand}
      brandSummaries={loaderData.brandSummaries}
      accountsError={loaderData.accountsError}
    />
  );
}

/**
 * Route-level error boundary.
 *
 * The loader already swallows Admin API failures into `accountsError`, so this
 * catches what it cannot — anything unexpected, plus whatever a restored
 * authorization guard throws. A guard throws `{messageKey}` rather than an
 * English sentence, so the copy is resolved here.
 *
 * `handleAuthStatus()` does not land here: it throws a redirect, which React
 * Router follows rather than routing to an error boundary.
 */
export function ErrorBoundary() {
  const error = useRouteError();
  const {t} = useTranslation('errors');
  const {t: tAccounts} = useTranslation('accounts');

  let message = t('boundary.unknown');

  if (isRouteErrorResponse(error)) {
    const payload: unknown = error.data;

    if (payload && typeof payload === 'object' && 'messageKey' in payload) {
      const {messageKey} = payload as {messageKey?: unknown};
      if (typeof messageKey === 'string') message = t(messageKey);
    }
  }

  return (
    <main className="accounts-main" id="main">
      <div className="accounts-empty">
        <div className="accounts-empty-title">{tAccounts('error.title')}</div>
        <div className="accounts-empty-sub">{message}</div>
      </div>
    </main>
  );
}
