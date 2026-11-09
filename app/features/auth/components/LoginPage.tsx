/**
 * Login page composition.
 *
 * Ported from DTX `app/components/Auth/LoginPage.jsx`. The DTX version tracked
 * its own `externalLoading` boolean around an async callback; the pending state
 * now comes from React Router's navigation, so there is no local mirror of
 * router state to fall out of sync.
 *
 * DTX `LoginHeader.jsx` is not ported — it returned `null`.
 */
import {useNavigate, useNavigation} from 'react-router';
import {ROUTES, SEARCH_PARAMS} from '~/shared/constants/routes';
import {LoginLayout} from './LoginLayout';

export interface LoginPageProps {
  errorMessage?: string | null;
  /**
   * Where to land after sign-in. Already sanitised by the loader; forwarded to
   * the kickoff route so a guard-triggered login returns the user to the page
   * they asked for.
   */
  returnTo?: string | null;
}

export function LoginPage({errorMessage, returnTo}: LoginPageProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();

  // `/account/login` is a loader-only route that redirects to Shopify's
  // customer-account authorize URL, so the navigation stays pending until the
  // browser leaves the app.
  const isExternalLoading =
    navigation.state !== 'idle' &&
    navigation.location?.pathname === ROUTES.accountLogin;

  // Hydrogen's `login()` reads `return_to`, not this app's `returnTo`.
  const kickoffTarget = returnTo
    ? `${ROUTES.accountLogin}?${SEARCH_PARAMS.hydrogenReturnTo}=${encodeURIComponent(returnTo)}`
    : ROUTES.accountLogin;

  return (
    <LoginLayout
      errorMessage={errorMessage}
      isExternalLoading={isExternalLoading}
      onExternalLogin={() => void navigate(kickoffTarget)}
    />
  );
}
