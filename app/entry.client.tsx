import {HydratedRouter} from 'react-router/dom';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {NonceProvider} from '@shopify/hydrogen';
import {I18nextProvider} from 'react-i18next';
import {initClientI18n} from '~/lib/i18n/i18n.client';

if (!window.location.origin.includes('webcache.googleusercontent.com')) {
  // i18next is initialised before hydration, with the locale and resource set
  // the server rendered, so `useTranslation` resolves on the first paint and
  // hydration does not mismatch.
  void initClientI18n().then((i18n) => {
    startTransition(() => {
      // Extract nonce from existing script tags
      const existingNonce =
        document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce;

      hydrateRoot(
        document,
        <StrictMode>
          <NonceProvider value={existingNonce}>
            <I18nextProvider i18n={i18n}>
              <HydratedRouter />
            </I18nextProvider>
          </NonceProvider>
        </StrictMode>,
      );
    });
  });
}
