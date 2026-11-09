import {createLogger} from './logger';

const log = createLogger('lib.same-origin');

/**
 * CSRF guard for form/fetcher POSTs. Compares against the forwarded host
 * (not `request.url`), since tunnels such as `h2 customer-account-push`
 * forward the public host via `X-Forwarded-Host`/`Host` while rewriting the
 * request's own URL to the local dev origin.
 */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get('Origin');
  if (!origin) return;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Response(null, {status: 403});
  }

  const candidateHosts = [
    ...(request.headers.get('X-Forwarded-Host')?.split(',') ?? []),
    request.headers.get('Host'),
  ]
    .map((host) => host?.trim())
    .filter((host): host is string => Boolean(host));

  if (!candidateHosts.includes(originHost)) {
    log.warn('Rejected cross-origin request', {
      origin,
      originHost,
      host: request.headers.get('Host'),
      forwardedHost: request.headers.get('X-Forwarded-Host'),
    });
    throw new Response(null, {status: 403});
  }
}
