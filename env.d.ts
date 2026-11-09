/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  /**
   * Oxygen environment. Merged into the `Env` interface Hydrogen declares.
   *
   * Only `PUBLIC_*` variables may ever reach the client. Everything else is
   * server-only and is read exclusively from `*.server.ts` modules.
   */
  interface Env {
    SESSION_SECRET: string;

    /**
     * Shopify Admin API. Read only from `lib/shopify/admin.server.ts` — the
     * token grants full store access and must never reach the client.
     *
     * Either a permanent custom-app token, or a client-id/secret pair that
     * `admin.server.ts` exchanges for a short-lived one. The static token wins
     * when both are set.
     */
    ADMIN_API_ACCESS_TOKEN?: string;
    ADMIN_API_CLIENT_ID?: string;
    ADMIN_API_CLIENT_SECRET?: string;
    /** Overrides the client's default, so an API bump needs no code change. */
    ADMIN_API_VERSION?: string;
  }
}

declare module '*.png' {
  const src: string;
  export default src;
}
