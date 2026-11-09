/**
 * Shopify Customer Account OIDC kickoff.
 *
 * This is the only authentication entry point — the Entra routes that used to
 * sit at `/auth/login` and `/auth/callback` have been removed. The branded
 * `/login` screen is the chooser in front of this route.
 */
import {redirect} from 'react-router';
import type {Route} from './+types/account_.login';
import {
  POST_LOGIN_LANDING,
  safeReturnTo,
  SEARCH_PARAMS,
} from '~/shared/constants/routes';

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);

  /**
   * Hydrogen resolves the post-authorize path as
   * `return_to`/`redirect` search param → `Referer` header → the client's
   * `defaultRedirectPath` (`/account`). `createHydrogenContext` does not expose
   * `defaultRedirectPath`, and the `Referer` fallback would otherwise send the
   * user back to whatever page linked here — so the destination is pinned by
   * setting `return_to` explicitly, which is the highest-precedence input and
   * the one Hydrogen validates as a local path.
   *
   * `returnTo` is also accepted, so a link built with this app's own param name
   * behaves the same way.
   */
  const requested =
    url.searchParams.get(SEARCH_PARAMS.hydrogenReturnTo) ??
    url.searchParams.get('redirect') ??
    url.searchParams.get(SEARCH_PARAMS.returnTo);

  const destination = safeReturnTo(requested, POST_LOGIN_LANDING);

  if (url.searchParams.get(SEARCH_PARAMS.hydrogenReturnTo) !== destination) {
    url.searchParams.set(SEARCH_PARAMS.hydrogenReturnTo, destination);
    url.searchParams.delete(SEARCH_PARAMS.returnTo);
    return redirect(url.pathname + url.search);
  }

  const acrValues = url.searchParams.get('acr_values') || undefined;
  const loginHint = url.searchParams.get('login_hint') || undefined;
  const loginHintMode = url.searchParams.get('login_hint_mode') || undefined;
  const locale = url.searchParams.get('locale') || undefined;

  return context.customerAccount.login({
    countryCode: context.storefront.i18n.country,
    acrValues,
    loginHint,
    loginHintMode,
    locale,
  });
}
