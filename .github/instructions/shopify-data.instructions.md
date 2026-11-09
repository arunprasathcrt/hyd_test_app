---
applyTo: "app/lib/shopify/**,app/lib/metaobjects/**,app/lib/iconik/**,app/features/**/queries/**,shopify.app.toml"
description: "Storefront vs Admin API split, metafields, metaobjects, and DAM links"
---

# Shopify data layer guidelines

## The API split

**Storefront API** — reads a customer could legitimately see: products,
variants, collections, cart. Called from loaders. Use Hydrogen cache hints
(`CacheShort` / `CacheLong`). Never add a custom cache layer.

**Admin API** — everything privileged: draft orders, Companies and Company
Locations, B2B catalogs and price lists, order state, and every `$app` metafield
and metaobject write. **Importable only from `*.server.ts`.** An Admin API
import reachable from a component is an immediate rewrite.

Types come from GraphQL Codegen — `@shopify/hydrogen-codegen` for Storefront, a
second config for Admin. `app/lib/shopify/generated/` is never hand-edited.

## Entity map

| UTX concept | Shopify primitive |
|---|---|
| Customer organization | Company + Company Locations (B2B) |
| Buyers, reps, staff | Customers (identity via Entra) |
| Garment · art · decoration | Products, typed by `product_type` |
| Catalog assortment + pricing | B2B Catalogs + Price Lists + Publications |
| Draft order | Draft Order + `$app` metafields for UTX state |
| Converted order | Order, with the NetSuite SO id linked back |

Model `product_type` as a discriminated union in TypeScript. Watch the variant
cap on large styles — split by color and join on the style key.

## Metafields and metaobjects

- Definitions live in `shopify.app.toml` under the app-reserved `$app`
  namespace, version-controlled. **Never create a definition through the admin UI.**
- All metafield/metaobject IO goes through a module in `app/lib/metaobjects/`.
  Each module owns a Zod schema for the payload, a reader, and a writer using
  `metafieldsSet` / `metaobjectUpsert`.
- Never inline `jsonValue` parsing in a component or a loader.

UTX-owned metaobjects (names are proposed, confirm against the data map):
`$app:art_record`, `$app:license_entry`, `$app:presentation`, `$app:brand_kb`,
`$app:lead_card`, `$app:flow_event`.

## Boundaries that do not move

- **NetSuite is never called directly from this app.** Master data arrives via
  the Celigo connector. Invoices and AR are ERP-only and **not served from
  Shopify** — if a route needs invoice data, flag ❓ TO CONFIRM rather than
  inventing a Shopify source.
- **Iconik assets are referenced by permanent asset ID, never copied into
  Shopify.** Deep links expire at 60 days. Resolve on demand through
  `app/lib/iconik/`. Shopify CDN resizing does not apply to external URLs — use
  Iconik URL parameters.
- **Nothing becomes a sellable Shopify product until licensing approves.** The
  blank is the placeholder line on the draft order until then; blank inventory
  is tracked in Shopify.

## Draft order semantics

- `lock_art` and `lock_inventory` are separate actions and separate metafields.
- The draft first reaches NetSuite at inventory lock (soft allocation).
- Conversion to an order happens only after all checks pass; after that the rep
  cannot edit without a manager.
- Low inventory produces a warning and a manager-approval flag — **not a hard
  block**.
- A synced order must carry the actual placing rep, never a service account.

## Open items — flag, do not resolve

- Celigo field-level mapping and the Shopify-persisted field list
- Native B2B objects vs custom metafields for company/customer
- Art + decoration as one item vs two
- How a licensing-approved product propagates to NetSuite and Yunique
- Pricing exposure — NetSuite cannot expose the calculation UTX needs
- Iconik permanent service-account URLs vs 60-day links
