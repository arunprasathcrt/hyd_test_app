/**
 * Landing redirect.
 *
 * `/` is the app entry point, not a storefront homepage: signed out goes to the
 * branded login screen, signed in goes to the user's work. Hydrogen's demo
 * homepage (featured collection + recommended products) previously lived here
 * and was removed with the Entra auth flow — it is in git history if the
 * commerce scaffold is ever wanted back at a different path.
 *
 * ❓ TO CONFIRM — CLAUDE.md's locked structure calls this the "tag-based
 * landing redirect": rep → accounts, admin → the exec view, customer → the
 * portal. There is no role check here because there is no role source right now
 * (see `shared/constants/auth.ts`), so every signed-in user gets
 * `POST_LOGIN_LANDING`. The branch belongs here when roles return.
 */
import {redirect} from 'react-router';
import type {Route} from './+types/_index';
import {POST_LOGIN_LANDING, ROUTES} from '~/shared/constants/routes';

export async function loader({context}: Route.LoaderArgs) {
  if (await context.customerAccount.isLoggedIn()) {
    return redirect(POST_LOGIN_LANDING);
  }

  return redirect(ROUTES.login);
}
