/**
 * i18next configuration: namespaces, fallback chain, formatters.
 *
 * Only English ships at MVP. The point of the i18n rules is that every
 * user-facing string is inventoriable in one place, not translation delivery.
 */
import type {InitOptions, i18n} from 'i18next';
import {createLogger} from '~/lib/logger';

const log = createLogger('i18n');

export const FALLBACK_LOCALE = 'en';

export const SUPPORTED_LOCALES = ['en'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Right-to-left locales, for `<html dir>`. None at MVP; listed so the root
 * layout has a single place to consult.
 */
const RTL_LOCALES: readonly string[] = [];

export const DEFAULT_NAMESPACE = 'common';

/**
 * Every namespace in the bundle. Namespace = feature folder name; `common` is
 * anything used by two or more features.
 */
export const NAMESPACES = [
  'common',
  'auth',
  'accounts',
  'errors',
  'enums',
  'finance',
  'orders',
  'productCardDrawer',
  'products',
  'newDraftOrder',
] as const;

export type AppNamespace = (typeof NAMESPACES)[number];

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function localeDirection(locale: string): 'ltr' | 'rtl' {
  return RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
}

/**
 * A missing key must never render as the raw key string in front of a rep:
 * throw in dev so it is caught during development, log in production so a
 * missing label cannot take a page down.
 */
function handleMissingKey(
  locales: readonly string[],
  namespace: string,
  key: string,
) {
  const message = `Missing translation: ${locales.join(',')}/${namespace}:${key}`;

  if (import.meta.env.DEV) {
    throw new Error(message);
  }

  log.error(message);
}

/**
 * Options shared by the server factory and the client init, so hydration sees
 * the same configuration the server rendered with.
 */
export const baseI18nOptions: InitOptions = {
  fallbackLng: FALLBACK_LOCALE,
  supportedLngs: [...SUPPORTED_LOCALES],
  defaultNS: DEFAULT_NAMESPACE,
  fallbackNS: DEFAULT_NAMESPACE,
  ns: [...NAMESPACES],
  // A key that resolves to null would render as empty text — fail loudly.
  returnNull: false,
  saveMissing: true,
  missingKeyHandler: (locales, namespace, key) =>
    handleMissingKey(locales, namespace, key),
  interpolation: {
    // React escapes for us; double-escaping mangles apostrophes in labels.
    escapeValue: false,
  },
  react: {
    // Resources are bundled, so nothing suspends on a fetch.
    useSuspense: false,
  },
};

/**
 * Register Intl-backed formatters.
 *
 * Dates, numbers, currency and percentages go through these — not through
 * ad-hoc helpers and not through a date library. This is why `moment` and
 * `dayjs` are banned.
 *
 *   t('order.shipBy', {date: shipBy, formatParams: {date: {dateStyle: 'medium'}}})
 */
export function registerFormatters(instance: i18n): void {
  const formatter = instance.services.formatter;
  if (!formatter) return;

  formatter.add('date', (value, locale, options) =>
    new Intl.DateTimeFormat(locale, options).format(
      value instanceof Date ? value : new Date(value),
    ),
  );

  formatter.add('number', (value, locale, options) =>
    new Intl.NumberFormat(locale, options).format(Number(value)),
  );

  formatter.add('currency', (value, locale, options) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      ...options,
    }).format(Number(value)),
  );

  formatter.add('percent', (value, locale, options) =>
    new Intl.NumberFormat(locale, {style: 'percent', ...options}).format(
      Number(value),
    ),
  );
}
