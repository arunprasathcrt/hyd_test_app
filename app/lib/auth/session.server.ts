/**
 * Cookie session.
 *
 * This is the Hydrogen session (moved here from `app/lib/session.ts` to the
 * path the locked folder structure specifies) plus the locale preference.
 *
 * Authentication state is NOT stored here. The Shopify Customer Account client
 * owns it: `createCustomerAccountClient` keeps its own key in this same cookie,
 * and `context.customerAccount` is the only thing that reads or writes it. The
 * Entra OIDC flow that used to add a user, a token set and a PKCE record to
 * this class has been removed — see `app/routes/account_.login.tsx`.
 */
import type {HydrogenSession} from '@shopify/hydrogen';
import {
  createCookieSessionStorage,
  type Session,
  type SessionStorage,
} from 'react-router';
import {SESSION_KEYS} from '~/shared/constants/auth';

export class AppSession implements HydrogenSession {
  public isPending = false;

  #sessionStorage;
  #session;

  constructor(sessionStorage: SessionStorage, session: Session) {
    this.#sessionStorage = sessionStorage;
    this.#session = session;
  }

  static async init(request: Request, secrets: string[]) {
    const storage = createCookieSessionStorage({
      cookie: {
        name: 'session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secrets,
      },
    });

    const session = await storage
      .getSession(request.headers.get('Cookie'))
      .catch(() => storage.getSession());

    return new this(storage, session);
  }

  get has() {
    return this.#session.has;
  }

  get get() {
    return this.#session.get;
  }

  get flash() {
    return this.#session.flash;
  }

  get unset() {
    this.isPending = true;
    return this.#session.unset;
  }

  get set() {
    this.isPending = true;
    return this.#session.set;
  }

  destroy() {
    return this.#sessionStorage.destroySession(this.#session);
  }

  commit() {
    this.isPending = false;
    return this.#sessionStorage.commitSession(this.#session);
  }

  // ---------------------------------------------------------------------------
  // Locale preference (step 2 of the i18n resolution order)
  // ---------------------------------------------------------------------------

  getLocalePreference(): string | null {
    const value = this.#session.get(SESSION_KEYS.locale);
    return typeof value === 'string' ? value : null;
  }

  setLocalePreference(locale: string) {
    this.isPending = true;
    this.#session.set(SESSION_KEYS.locale, locale);
  }
}

/**
 * Narrow `context.session` to `AppSession`.
 *
 * Hydrogen's React Router augmentation types `context.session` as the base
 * `HydrogenSession` interface, which has no augmentation point for a custom
 * session class. `createHydrogenRouterContext` always constructs an
 * `AppSession`, so this is the one place that asserts it — rather than a cast
 * scattered through every loader.
 */
export function appSession(context: {session: HydrogenSession}): AppSession {
  return context.session as AppSession;
}
