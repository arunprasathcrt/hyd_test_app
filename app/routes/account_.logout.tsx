import {redirect} from 'react-router';
import type {Route} from './+types/account_.logout';
import {ROUTES} from '~/shared/constants/routes';

// if we don't implement this, /account/logout will get caught by account.$.tsx to do login
export async function loader() {
  return redirect(ROUTES.login);
}

export async function action({context}: Route.ActionArgs) {
  // No `postLogoutRedirectUri`: Shopify only accepts one that is registered as
  // a logout URI in the Customer Account API app setup, and the default (the
  // app origin) needs no such configuration. `/` forwards a signed-out visitor
  // to `ROUTES.login` anyway — see `_index.tsx`.
  return context.customerAccount.logout();
}
