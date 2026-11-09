/**
 * Route paths. No hardcoded URLs anywhere else in the app
 * (CLAUDE.md coding rule 9).
 */
export const ROUTES = {
  /** Landing redirect — sends the visitor to login or to their work. */
  home: '/',

  /** Branded login screen (the SSO chooser). */
  login: '/login',

  /**
   * Shopify Customer Account OIDC kickoff. Hydrogen's `customerAccount.login()`
   * builds the authorize URL and redirects; the branded `/login` screen is the
   * chooser in front of it.
   *
   * The Entra routes that used to sit at `/auth/login`, `/auth/callback` and
   * `/auth/logout` have been removed — the Customer Account client is the only
   * authentication path now.
   */
  accountLogin: '/account/login',

  /** OIDC redirect target — `customerAccount.authorize()` exchanges the code. */
  accountAuthorize: '/account/authorize',

  /** Clears the customer-account session. POST only. */
  accountLogout: '/account/logout',

  /** Team experience — the rep's book of accounts. */
  repAccounts: '/accounts',

  /** Order list. */
  orders: '/orders',

  /** Draft order list. */
  draftOrders: '/draftorders',

  /** Presentation list. */
  presentations: '/presentations',

  /** The new draft order builder. */
  draftOrdersNew: '/draftorders/new',
  productList: '/productList',
  /** Resource route: live per-size inventory for the Products quick view. */
  productAtp: '/productAtp',

  /** Resource route: the Print Preview model for one saved draft (`?draftId=`). */
  draftOrdersPreview: '/draftorders/preview',
  /** Resource route: POST to copy a saved draft. */
  draftOrdersDuplicate: '/draftorders/duplicate',
  /** Resource route: Step 2 config for a New order. */
  draftOrdersNewOrderType: '/draftorders/new/order-type',
  /** Resource route: active Shopify staff for draft-order approver selectors. */
  draftOrdersNewStaff: '/draftorders/new/staff',
  /** Resource route: the draft lines for products picked in the garment drawer. */
  draftOrdersNewProducts: '/draftorders/new/products',
  /** Resource route: the art picked in Quick pick, one entry per mark. */
  draftOrdersNewArts: '/draftorders/new/arts',
  /** Art Design. */
  artDesign: '/artDesign',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Where a signed-in user lands when the login flow carries no explicit
 * `returnTo` — i.e. someone who went to `/login` directly rather than being
 * bounced there by the logged-out handler.
 *
 * Deliberately not `ROUTES.home`, even though `/` now forwards here: a
 * `returnTo` is resolved to a concrete destination so the browser makes one
 * hop, not two.
 *
 * ❓ TO CONFIRM — this is a single destination for every internal role.
 * CLAUDE.md's locked structure has `_index.tsx` as a "tag-based landing
 * redirect", which is the real answer: rep → accounts, admin → the exec view,
 * customer → the portal. It stays one constant until those routes exist,
 * because pointing an admin at a route that is not built yet is a 404 rather
 * than an improvement.
 */
export const POST_LOGIN_LANDING: AppRoute = ROUTES.repAccounts;

/**
 * One account's overview, keyed by the numeric portion of the company GID.
 *
 * ❓ TO CONFIRM — this route does not exist yet. DTX linked its Accounts rows
 * to `/customer-overview/:id`, which is not in the locked folder structure;
 * the structure has `rep.*` and `customer.*` trees but no account-overview
 * entry. The path below keeps the Accounts rows deep-linkable and gives the
 * overview screen one place to be renamed from when it is built.
 */
export function accountOverviewPath(id: string): string {
  return `${ROUTES.repAccounts}/${id}`;
}

/** One order's detail page. */
export function orderDetailPath(id: string): string {
  return `${ROUTES.orders}/${id}`;
}

/**
 * Search-param names shared between routes.
 *
 * `returnTo` is this app's own name, used on `/login`. Hydrogen's customer
 * account client reads `return_to` instead, which is why `/login` translates
 * between the two rather than passing its param straight through.
 */
export const SEARCH_PARAMS = {
  returnTo: 'returnTo',
  /** Hydrogen's post-authorize destination param, read by `login()`. */
  hydrogenReturnTo: 'return_to',
  error: 'error',
  /** The active step of the draft order builder. */
  step: 'step',
  /** Set on the product list when the rep arrived from the draft order builder. */
  fromDraft: 'fromDraft',
  /** Set when the builder should restore the draft kept in session storage. */
  resume: 'resume',
  /** A product picked on the list, repeated once per product. */
  productId: 'productId',
  /** The product list's view switch. */
  view: 'view',
  /** The product list's Brand facet, repeated once per brand. */
  brand: 'brand',
  /** Existing draft id in the new-draft builder edit mode. */
  draftId: 'draftId',
  /** Set by the garment/art picker drawer: the list loads only the catalog, not the Products page's extras. */
  picker: 'picker',
} as const;

/** The value of a search-param flag that is switched on. */
export const FLAG_ON = '1';

/** The builder's Products step and the product list's garment view. */
export const DRAFT_STEP_PRODUCTS = 'products';
export const PRODUCT_VIEW_GARMENT = 'garment';
/** The product list's art view: the art library Quick pick uses. */
export const PRODUCT_VIEW_ART = 'art';

/** Remove React Router's single-fetch suffix from a route pathname. */
export function stripDataSuffix(pathname: string): string {
  return pathname.replace(/\.data\/?$/, '') || '/';
}

/** A `.data` request carries `_routes=root,routes/...`; on a page URL it makes the root route's result missing ("No result found for routeId root"). */
export function stripSingleFetchSearch(search: string): string {
  const params = new URLSearchParams(search);
  params.delete('_routes');
  const rest = params.toString();
  return rest ? `?${rest}` : '';
}

/**
 * Open-redirect guard: only same-origin, absolute-from-root paths may be used
 * as a post-login destination. Anything else — including an absent value —
 * falls back to `POST_LOGIN_LANDING`.
 *
 * Rejects protocol-relative (`//evil.example`) and absolute URLs, both of
 * which a browser would happily follow off-origin.
 */
export function safeReturnTo(
  candidate: string | null | undefined,
  fallback: string = POST_LOGIN_LANDING,
): string {
  if (!candidate) return fallback;
  if (!candidate.startsWith('/')) return fallback;
  if (candidate.startsWith('//')) return fallback;
  if (candidate.includes('\\')) return fallback;

  const queryIndex = candidate.indexOf('?');
  const pathname =
    queryIndex === -1 ? candidate : candidate.slice(0, queryIndex);
  const cleanPath = stripDataSuffix(pathname);

  return queryIndex === -1
    ? cleanPath
    : `${cleanPath}${stripSingleFetchSearch(candidate.slice(queryIndex))}`;
}
