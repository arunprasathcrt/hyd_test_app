import {createHydrogenContext} from '@shopify/hydrogen';
import {redirect} from 'react-router';
import {AppSession} from '~/lib/auth/session.server';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';
import {
  ROUTES,
  SEARCH_PARAMS,
  stripDataSuffix,
  stripSingleFetchSearch,
} from '~/shared/constants/routes';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

// Define the additional context object
const additionalContext = {
  // Additional context for custom properties, CMS clients, 3P SDKs, etc.
  // These will be available as both context.propertyName and context.get(propertyContext)
  // Example of complex objects that could be added:
  // cms: await createCMSClient(env),
  // reviews: await createReviewsClient(env),
} as const;

// Automatically augment HydrogenAdditionalContext with the additional context type
type AdditionalContextType = typeof additionalContext;

declare global {
  interface HydrogenAdditionalContext extends AdditionalContextType {}

  // Augment HydrogenCustomCartFragment with the codegen'd cart fragment type so
  // that context.cart.get() and all cart mutations return the extended cart type.
  interface HydrogenCustomCartFragment extends CartApiQueryFragment {}
}

/**
 * Creates Hydrogen context for React Router 7.9.x
 * Returns HydrogenRouterContextProvider with hybrid access patterns
 * */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  /**
   * Open a cache instance in the worker and a custom session instance.
   */
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      // Or detect from URL path based on locale subpath, cookies, or any other strategy
      i18n: {language: 'EN', country: 'US'},
      customerAccount: {
        /**
         * Where an unauthenticated request lands.
         *
         * Hydrogen's default throws a redirect to `/account/login?return_to=…`,
         * which skips straight to Shopify's authorize URL. The branded `/login`
         * chooser is the intended entry point, so `handleAuthStatus()` is
         * pointed there instead and `/login` performs the hand-off.
         */
        customAuthStatusHandler: () => {
          const {pathname, search} = new URL(request.url);

          /**
           * React Router 7's single-fetch client requests data with a
           * `.data` suffix on the path (e.g. `/accounts.data`), not on the
           * page URL the user is looking at. An unauthenticated single-fetch
           * request landed here just as often as a full navigation, so
           * without stripping the suffix the captured `returnTo` was the
           * `.data` URL — and after login the user was dropped on the raw
           * JSON response instead of the rendered page.
           */
          const cleanPathname = stripDataSuffix(pathname);
          const returnTo = cleanPathname + stripSingleFetchSearch(search);

          return redirect(
            `${ROUTES.login}?${SEARCH_PARAMS.returnTo}=${encodeURIComponent(returnTo)}`,
          );
        },
      },
      cart: {
        queryFragment: CART_QUERY_FRAGMENT,
      },
    },
    additionalContext,
  );

  return hydrogenContext;
}
