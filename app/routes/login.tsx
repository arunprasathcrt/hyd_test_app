/**
 * Branded login screen — the SSO chooser.
 *
 * Converted from DTX `app/routes/login._index.jsx`. The button used to start
 * the Entra OIDC flow at `/auth/login`; those routes are removed, so it now
 * hands off to Hydrogen's Customer Account client at `/account/login`.
 *
 * This route is also where the logged-out handler lands
 * (`customAuthStatusHandler` in `lib/context.ts`), carrying the page the user
 * was refused as `returnTo`.
 */
import {redirect} from 'react-router';
import type {Route} from './+types/login';
import {LoginPage} from '~/features/auth/components/LoginPage';
import {appSession} from '~/lib/auth/session.server';
import {getRequestT} from '~/lib/i18n/i18n.server';
import {createLogger} from '~/lib/logger';
import {
  POST_LOGIN_LANDING,
  safeReturnTo,
  SEARCH_PARAMS,
} from '~/shared/constants/routes';
import loginStyles from '~/styles/login.css?url';

const log = createLogger('routes.login');

export const handle = {i18n: ['auth', 'errors', 'common']};

export async function loader({request, context}: Route.LoaderArgs) {
  const session = appSession(context);
  const url = new URL(request.url);
  const returnTo = safeReturnTo(url.searchParams.get(SEARCH_PARAMS.returnTo));

  // Already signed in — nothing to choose.
  if (await context.customerAccount.isLoggedIn()) {
    return redirect(returnTo);
  }

  const t = await getRequestT({request, session}, ['auth', 'errors']);

  // The Customer Account flow reports failures by redirecting here with an
  // `error` param. The specific provider code goes to the log; the user gets
  // one translated sentence, because the raw code is not copy.
  const rawError = url.searchParams.get(SEARCH_PARAMS.error);
  let errorMessage: string | null = null;

  if (rawError) {
    log.warn('Login screen reached with an error code', {code: rawError});
    errorMessage = t('errors:auth.providerError');
  }

  return {
    title: t('auth:meta.title'),
    errorMessage,
    // Null when it is already the default: the kickoff URL then carries no
    // destination, and `/account/login` applies the same fallback itself.
    returnTo: returnTo === POST_LOGIN_LANDING ? null : returnTo,
  };
}

export const meta: Route.MetaFunction = ({data}) => [
  {title: data?.title ?? ''},
  {name: 'viewport', content: 'width=device-width,initial-scale=1'},
];

export function links() {
  return [{rel: 'stylesheet', href: loginStyles}];
}

export default function LoginRoute({loaderData}: Route.ComponentProps) {
  return (
    <LoginPage
      errorMessage={loaderData.errorMessage}
      returnTo={loaderData.returnTo}
    />
  );
}
