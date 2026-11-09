---
applyTo: "app/routes/**,app/root.tsx"
description: "Loader, action, and route-module rules for Hydrogen / React Router 7"
---

# Route module guidelines

## Purpose

Every route file in `app/routes/` is the only place data is fetched or mutated.
Components never fetch. These rules apply to loaders, actions, route handles,
error boundaries, and the root route.

## Loaders

- Type the return from codegen or a Zod schema. No `any`, no untyped spread of
  an API response.
- Return a shaped view model, not a raw Storefront/Admin response. Loaders are
  the boundary that strips tokens, internal ids, and fields the client must not see.
- Call the authorization guard **before** any data access:
  `await requireTag(request, 'sales.act')`.
- Use Hydrogen cache hints on Storefront reads (`CacheShort`, `CacheLong`).
  Do not add a custom caching layer.
- Use `defer` + `<Await>` for slow secondary panels (art history, order
  timeline) so the shell renders immediately.
- Read filters, sorts, pagination, and tab state from `request.url` search
  params — not from component state.

## Actions

- Parse the `FormData` with a Zod schema from the feature's `schemas/` folder.
- Re-run the authorization guard. Never trust that the loader already checked.
- Return typed field errors the form can render; do not throw for validation.
- Mutations go through `admin.server.ts` or a `lib/metaobjects/` module —
  never a bare `fetch` to a Shopify endpoint.
- After a successful mutation, let revalidation refresh the loader. Do not
  manually patch client state.

## Route handles

- Declare the i18n namespaces the route needs:
  `export const handle = { i18n: ['common', 'draft-orders'] }`
- Declare breadcrumb and page-title keys as translation keys, not strings.

## Naming and nesting

- Kebab-case, dot-segmented: `rep.draft-orders.$id.tsx`
- Persona prefix is the top segment: `rep.*`, `customer.*`, `admin.*`
- Shared chrome lives in `layouts/`, mounted as a pathless layout route
- Tokenized customer links (`p.$token.tsx`) must work logged out, and must
  validate and expire the token server-side

## Required per route

- Error boundary with translated copy from the `errors` namespace
- Pending UI (`useNavigation`) or optimistic UI for every action
- No secrets, tokens, or Admin API imports reachable from the component export
