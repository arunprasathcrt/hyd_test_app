/**
 * Shopify Admin API (GraphQL) client.
 *
 * SERVER ONLY. The `.server.ts` suffix is how the bundler excludes this from
 * client code. The Admin token grants full store access, so it must never
 * reach the browser (CLAUDE.md data access rule 3). Importing this from a
 * component file is an immediate rewrite (data access rule 2).
 *
 * This is a third API alongside the two Hydrogen wires up for us — Storefront
 * (public catalog) and Customer Account (the signed-in customer). B2B
 * Companies are Plus-only Admin objects and exist on neither, which is why
 * the Accounts list cannot go through `context.storefront`.
 *
 * Ported from DTX `app/lib/admin.server.js`. Two changes: `console.error` is
 * replaced by `lib/logger` (coding rule 10), and the module-level token cache
 * is documented below as safe-but-bounded on workerd.
 */
import {createLogger} from '~/lib/logger';

const log = createLogger('shopify.admin');

/**
 * Overridable via `ADMIN_API_VERSION` so an API bump does not need a code
 * change.
 */
const DEFAULT_API_VERSION = '2026-07';
const ADMIN_FETCH_TIMEOUT_MS = 15_000;

/**
 * Refresh this far before the token actually expires, so a request never races
 * the expiry boundary.
 */
const EXPIRY_MARGIN_MS = 60_000;

/**
 * Cached `client_credentials` token.
 *
 * This is module-level state, which CLAUDE.md warns about for the i18next
 * instance — but the concern there is *per-request* data leaking across
 * isolates. A store-wide Admin token is not per-request: it is the same value
 * for every visitor, it is never returned to the client, and it is bounded by
 * its own expiry. Caching it avoids an extra token round trip on every page
 * load.
 */
let cached: {token: string; expiresAt: number} | null = null;

interface TokenResponse {
  access_token?: string;
  expires_in?: number | string;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = ADMIN_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {...init, signal: controller.signal});
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`[admin] request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Exchange the app's client credentials for a short-lived Admin API token.
 */
async function fetchAccessToken(
  shop: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const response = await fetchWithTimeout(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    },
  );

  if (!response.ok) {
    // The body carries the real cause (bad secret, app not installed) and does
    // not echo the secret back, so it is safe to surface.
    throw new Error(
      `[admin] token exchange failed: ${response.status} ${await response.text()}`,
    );
  }

  const {access_token: token, expires_in: expiresIn} =
    (await response.json()) as TokenResponse;

  if (!token) {
    throw new Error('[admin] token exchange returned no access_token.');
  }

  // Shopify normally sends expires_in; fall back to a short TTL rather than
  // caching a token forever if it ever omits it.
  const ttlMs = (Number(expiresIn) || 3600) * 1000;
  cached = {token, expiresAt: Date.now() + ttlMs - EXPIRY_MARGIN_MS};

  return token;
}

/**
 * Resolve an Admin API token: the static one if the store issued a custom-app
 * `shpat_…`, otherwise a cached or freshly minted client-credentials token.
 */
async function getAccessToken(env: Env, shop: string): Promise<string> {
  if (env.ADMIN_API_ACCESS_TOKEN) return env.ADMIN_API_ACCESS_TOKEN;

  if (cached && cached.expiresAt > Date.now()) return cached.token;

  const clientId = env.ADMIN_API_CLIENT_ID;
  const clientSecret = env.ADMIN_API_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      '[admin] Set ADMIN_API_CLIENT_ID and ADMIN_API_CLIENT_SECRET (or a ' +
        'static ADMIN_API_ACCESS_TOKEN) in .env.',
    );
  }

  // Not coalesced: a Promise shared across Worker requests can be canceled with its request.
  return fetchAccessToken(shop, clientId, clientSecret);
}

export interface AdminQueryInput<TVariables> {
  env: Env;
  query: string;
  variables?: TVariables;
}

/**
 * Execute a GraphQL document against the Admin API and return its `data`
 * payload.
 *
 * The return type is `unknown` on purpose. Hydrogen's codegen only holds the
 * Storefront and Customer Account schemas, so there are no generated Admin
 * types to hand back — the caller parses the payload with a Zod schema
 * instead, which is the other half of CLAUDE.md coding rule 7. Never cast this
 * to a hand-written response interface.
 *
 * @throws On missing config, transport failure, or GraphQL errors.
 */
export async function adminQuery<TVariables extends object = object>({
  env,
  query,
  variables,
}: AdminQueryInput<TVariables>): Promise<unknown> {
  const shop = env.PUBLIC_STORE_DOMAIN;
  const version = env.ADMIN_API_VERSION || DEFAULT_API_VERSION;

  if (!shop) {
    throw new Error('[admin] PUBLIC_STORE_DOMAIN is not set.');
  }

  const token = await getAccessToken(env, shop);

  const response = await fetchWithTimeout(
    `https://${shop}/admin/api/${version}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({query, variables: variables ?? {}}),
    },
  );

  // A cached token was rejected mid-life: drop it so the next call re-mints.
  if (response.status === 401) {
    log.warn('Admin token rejected; clearing cache');
    cached = null;
  }

  if (!response.ok) {
    // Shopify puts the actual cause (missing scope, unknown API version,
    // throttling) in the body rather than the status.
    throw new Error(
      `[admin] ${response.status} ${response.statusText}: ${await response.text()}`,
    );
  }

  const {data, errors} = (await response.json()) as {
    data?: unknown;
    errors?: unknown[];
  };

  if (errors?.length) {
    throw new Error(`[admin] GraphQL errors: ${JSON.stringify(errors)}`);
  }

  return data;
}
