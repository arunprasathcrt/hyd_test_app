/**
 * Per-request i18next instance factory.
 *
 * Oxygen reuses isolates across requests, so a module-level singleton would
 * leak the previous request's locale into the next one. Nothing here is
 * memoised: `createRequestI18n` builds a fresh instance every call, and the
 * instance is passed down, never imported as a global.
 */
import {createInstance, type i18n, type TFunction} from 'i18next';
import {initReactI18next} from 'react-i18next';
import type {AppSession} from '~/lib/auth/session.server';
import {
  baseI18nOptions,
  FALLBACK_LOCALE,
  isSupportedLocale,
  NAMESPACES,
  registerFormatters,
  type AppNamespace,
  type SupportedLocale,
} from './config';
import {resources} from './resources';

export interface LocaleResolutionInput {
  request: Request;
  session?: AppSession;
}

/**
 * Locale resolution order: route param → session preference →
 * `Accept-Language` → `en`.
 *
 * The route param is the first path segment, which is how a future
 * `/<locale>/…` prefix would arrive. The browser's own language detector is
 * banned — locale comes from the session or the route, not from the client.
 */
export function resolveLocale({
  request,
  session,
}: LocaleResolutionInput): SupportedLocale {
  const [firstSegment] = new URL(request.url).pathname.split('/').filter(Boolean);
  if (firstSegment && isSupportedLocale(firstSegment)) return firstSegment;

  const preference = session?.getLocalePreference();
  if (preference && isSupportedLocale(preference)) return preference;

  const accepted = request.headers.get('Accept-Language') ?? '';
  for (const entry of accepted.split(',')) {
    const tag = entry.split(';')[0]?.trim().toLowerCase();
    if (!tag) continue;
    const base = tag.split('-')[0];
    if (isSupportedLocale(tag)) return tag;
    if (isSupportedLocale(base)) return base;
  }

  return FALLBACK_LOCALE;
}

export interface RequestI18nInput {
  locale: SupportedLocale;
  namespaces?: readonly AppNamespace[];
}

/**
 * Build an i18next instance for this request.
 */
export async function createRequestI18n({
  locale,
  namespaces = NAMESPACES,
}: RequestI18nInput): Promise<i18n> {
  const instance = createInstance();

  await instance.use(initReactI18next).init({
    ...baseI18nOptions,
    lng: locale,
    ns: [...namespaces],
    resources,
  });

  registerFormatters(instance);

  return instance;
}

/**
 * The request `t`, for use in loaders and actions (CLAUDE.md coding rule 13).
 *
 *   const t = await getRequestT({request, session: context.session}, ['auth']);
 *   return {title: t('auth:meta.title')};
 */
export async function getRequestT(
  input: LocaleResolutionInput,
  namespaces?: readonly AppNamespace[],
): Promise<TFunction> {
  const locale = resolveLocale(input);
  const instance = await createRequestI18n({locale, namespaces});
  return instance.t;
}
