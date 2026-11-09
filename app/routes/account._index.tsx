import {redirect} from 'react-router';
import {POST_LOGIN_LANDING} from '~/shared/constants/routes';

/**
 * `/account` is Hydrogen's customer-account section root. It forwarded to
 * `/account/orders`, which is the storefront scaffold rather than this app's
 * work — so it forwards to the same landing as a completed login.
 */
export async function loader() {
  return redirect(POST_LOGIN_LANDING);
}
