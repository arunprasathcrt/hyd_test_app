import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteLoaderData,
} from 'react-router';
import {useTranslation} from 'react-i18next';
import type {Route} from './+types/root';
import type {CustomerDetailsQuery} from 'customer-accountapi.generated';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {appSession} from '~/lib/auth/session.server';
import {FALLBACK_LOCALE, localeDirection, NAMESPACES} from '~/lib/i18n/config';
import {resolveLocale} from '~/lib/i18n/i18n.server';
import {ROUTES} from '~/shared/constants/routes';
import {isCompletedDraftSave} from '~/features/draft-orders/lib/draftorders-new-revalidation';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';
import {Toaster} from '~/shared/components/ui/Toast';
import {TooltipProvider} from '~/shared/components/ui/Tooltip';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
  // Saving this draft does not change the cart, customer, or navigation data.
  if (isCompletedDraftSave(args)) return false;
  const {formMethod, currentUrl, nextUrl} = args;
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Query-only filter and view changes still need a result for the root route
  // in Hydrogen's single-fetch navigation response.
  if (
    currentUrl.pathname === nextUrl.pathname &&
    currentUrl.search !== nextUrl.search
  ) {
    return args.defaultShouldRevalidate;
  }

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;
  const session = appSession(args.context);

  // Resolved once, here, and returned in the root loader data: `<html lang>`
  // and `dir` come from it, and it is the locale the client hydrates with.
  const locale = resolveLocale({request: args.request, session});

  return {
    ...deferredData,
    ...criticalData,
    locale,
    namespaces: [...NAMESPACES],
    // The signed-in persona used to be resolved here from the Entra session.
    // With that flow removed, `loadDeferredData` already exposes `isLoggedIn`
    // from the customer-account client and the chrome needs nothing more.
    //
    // ❓ TO CONFIRM — the prototype's header shows a persona name and role
    // chip. Both need a Customer Account API read on every route, and there is
    // no role source right now; deferred until the header is built.
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  const customer = customerAccount
    .query(CUSTOMER_DETAILS_QUERY, {
      variables: {language: customerAccount.i18n.language},
    })
    .then(({data}) => data?.customer ?? null)
    .catch(() => null);

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    customer,
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');

  // Falls back to the default locale when the root loader has not run — the
  // error-boundary render path.
  const locale = data?.locale ?? FALLBACK_LOCALE;

  return (
    <html lang={locale} dir={localeDirection(locale)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

/**
 * Routes that render their own full-page shell instead of the app chrome: the
 * login screen and the customer-account OIDC hand-off routes.
 *
 * The hand-off routes are loader-only redirects, so they never paint — but a
 * slow authorize round trip would otherwise flash the header and footer.
 */
function isAuthRoute(pathname: string): boolean {
  return (
    pathname === ROUTES.login ||
    pathname.startsWith(`${ROUTES.login}/`) ||
    pathname === ROUTES.accountLogin ||
    pathname === ROUTES.accountAuthorize ||
    pathname === ROUTES.accountLogout
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');
  const location = useLocation();

  if (!data) {
    return <Outlet />;
  }

  // The login screen is a two-panel layout of its own — no header, no cart
  // aside, no footer.
  if (isAuthRoute(location.pathname)) {
    return <Outlet />;
  }

  return (
    <TooltipProvider delay={300}>
      <Analytics.Provider
        cart={data.cart}
        shop={data.shop}
        consent={data.consent}
      >
        <PageLayout {...data}>
          <Outlet />
        </PageLayout>
        {/* Mounted once for the whole app so any screen can show a toast via `toast.add(...)`
            (e.g. the order detail "Copied" confirmation). */}
        <Toaster />
      </Analytics.Provider>
    </TooltipProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const {t} = useTranslation('errors');

  let errorMessage = t('boundary.unknown');
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    const payload: unknown = error.data;

    if (typeof payload === 'string') {
      errorMessage = payload;
    } else if (payload && typeof payload === 'object') {
      // The auth guards throw `{messageKey}` rather than an English sentence,
      // so the copy is resolved here from `locales/<lng>/errors.json`.
      const {messageKey, message} = payload as {
        messageKey?: unknown;
        message?: unknown;
      };

      if (typeof messageKey === 'string') {
        errorMessage = t(messageKey);
      } else if (typeof message === 'string') {
        errorMessage = message;
      }
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>{t('boundary.title')}</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}
