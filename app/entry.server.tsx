import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';
import {I18nextProvider} from 'react-i18next';
import {appSession} from '~/lib/auth/session.server';
import {createRequestI18n, resolveLocale} from '~/lib/i18n/i18n.server';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    styleSrc: [
      "'self'",
      'https://fonts.googleapis.com',
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com',
    ],
    imgSrc: ["'self'", 'https://cdn.repspark.net', 'https://cdn.shopify.com'],
    frameSrc: [
      "'self'",
      'https://cdn-staging.spectrumcustomizer.com',
    ],

  });

  // One i18next instance per request: Oxygen reuses isolates, so a
  // module-level singleton would leak the previous request's locale.
  const locale = resolveLocale({request, session: appSession(context)});
  const i18n = await createRequestI18n({locale});

  const body = await renderToReadableStream(
    <NonceProvider>
      <I18nextProvider i18n={i18n}>
        <ServerRouter
          context={reactRouterContext}
          url={request.url}
          nonce={nonce}
        />
      </I18nextProvider>
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
