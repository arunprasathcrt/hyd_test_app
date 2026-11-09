/**
 * Hydration-side i18next init.
 *
 * Runs in `entry.client.tsx` with the same locale and resource set the server
 * rendered, so hydration does not mismatch. The locale is read off
 * `<html lang>` — which the root layout sets from the root loader — rather
 * than re-detected in the browser.
 */
import {createInstance, type i18n} from 'i18next';
import {initReactI18next} from 'react-i18next';
import {
  baseI18nOptions,
  FALLBACK_LOCALE,
  isSupportedLocale,
  NAMESPACES,
  registerFormatters,
  type SupportedLocale,
} from './config';
import {resources} from './resources';

/**
 * The locale the server rendered with.
 */
export function getRenderedLocale(): SupportedLocale {
  const lang = document.documentElement.lang;
  return isSupportedLocale(lang) ? lang : FALLBACK_LOCALE;
}

export async function initClientI18n(
  locale: SupportedLocale = getRenderedLocale(),
): Promise<i18n> {
  const instance = createInstance();

  await instance.use(initReactI18next).init({
    ...baseI18nOptions,
    lng: locale,
    ns: [...NAMESPACES],
    resources,
  });

  registerFormatters(instance);

  return instance;
}
