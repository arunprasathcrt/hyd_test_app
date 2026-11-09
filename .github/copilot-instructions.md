# UTX — Copilot Instructions

## Project

UTX (Unrivaled Teamwear Experience) is the frontend for Project Elevate: a
workflow-driven B2B CRM plus customer portal built on **Shopify Hydrogen**.

Shopify is the commerce and orchestration layer. One URL, no subdomains — the
experience switches on the signed-in user's tags (rep / customer / admin).
Behind Shopify sit NetSuite (ERP truth), Iconik (DAM), Yunique/PowerGrid (PLM),
Celigo (NetSuite ⇄ Shopify transport), Avalara (tax, behind NetSuite) and
Microsoft Entra (identity).

Deploys to Oxygen. Source in Azure DevOps.

## Stack — do not deviate

- Shopify Hydrogen on React Router 7 (file-based routes, loaders, actions)
- Vite (already configured — do not replace)
- React 19 + TypeScript strict
- Shopify Storefront API (customer-facing reads) and Admin API (privileged, server-only)
- GraphQL Codegen for both APIs
- Zod for all schemas; React Hook Form + zodResolver for all forms
- Zustand for UI state only
- i18next + react-i18next for all user-facing text
- shadcn/ui + Tailwind CSS
- ECharts for charts only
- Server-side OIDC against Microsoft Entra; session in a Hydrogen cookie

## Runtime constraints

Oxygen runs a Workers runtime, not Node.

- No Node built-ins (`fs`, `path`, `Buffer`, node `crypto`)
- No Express, no separate BFF — the Hydrogen server is the BFF
- No filesystem writes, no long-lived in-process state
- Use Web APIs: `fetch`, `Request`/`Response`, `crypto.subtle`, `URL`

## Never introduce

Next.js, Refine, React Admin, Redux, Formik, TanStack Router, TanStack Query
(as the default data layer), TanStack Form, styled-components, axios,
`react-router-dom` (import from `react-router`), Express, moment.js, dayjs,
lodash, MSAL.js, react-intl, next-intl, lingui, i18next-http-backend,
i18next-browser-languagedetector, or any Node-only dependency.

## Non-negotiable rules

1. Data reads happen in loaders. Mutations happen in actions. Never `useEffect`
   for fetching.
2. Admin API, Entra secrets, and Celigo credentials are importable only from
   `*.server.ts`. Never from a component.
3. Authorization is enforced in loaders and actions via `guards.server.ts`.
   Component-level tag checks hide UI only and are never the security boundary.
4. No user-facing string literals anywhere. All text comes from i18next.
5. Zod schemas emit message **keys**, never English sentences.
6. Zustand holds UI state only — never a copy of server data.
7. Tailwind classes only. No CSS-in-JS.
8. Types come from Zod (`z.infer`) or codegen. Never hand-write API response types.
9. No hardcoded URLs or metafield keys — use `app/shared/constants/`.
10. No `console.log` — use `app/lib/logger`.
11. NetSuite is never called directly. Everything reaches this app through
    Shopify (synced by Celigo).
12. Prefer URL search params over component state for filters, sorts, and tabs.

## Folder structure

```
app/
├── root.tsx                 Root loader: session, persona, tags, locale
├── entry.server.tsx         Hydrogen/Oxygen entry — do not restructure
├── routes/                  File-based routes (rep.* / customer.* / admin.*)
├── lib/
│   ├── shopify/             storefront.server.ts, admin.server.ts, generated/
│   ├── auth/                entra.server.ts, session.server.ts, tags.server.ts, guards.server.ts
│   ├── metaobjects/         One module per $app:* definition
│   ├── celigo/              Outbound mapping helpers (blocked — see Open items)
│   ├── iconik/              Asset-id → URL resolution
│   ├── i18n/                config.ts, i18n.server.ts, i18n.client.ts, resources.ts
│   └── logger.ts
├── locales/<lng>/           One JSON namespace per feature + common, errors, enums
├── features/<module>/       schemas/ types/ queries/ components/ forms/ lib/
├── layouts/                 RepLayout, CustomerLayout, AdminLayout
├── shared/                  components/ui (shadcn), components, services, types, utils, constants
├── store/                   Zustand stores (UI state only)
└── styles/                  Tailwind base, tokens, globals

mocks/                       Fixture data imported by loaders in dev
shopify.app.toml             $app metafield + metaobject definitions
```

Features own UI and schemas only — no `api/` or `hooks/` folder. Data fetching
belongs to the route.

## Naming

- Components: PascalCase (`AccountCard.tsx`)
- Hooks: `use-` prefix camelCase (`useSelectionDock.ts`)
- Stores: `selection.store.ts`
- Schemas: `draft-order.schema.ts`
- Server modules: `*.server.ts` — this suffix is how the bundler excludes them
- Routes: kebab-case, dot-segmented (`rep.draft-orders.$id.tsx`)
- Types: PascalCase · Constants: UPPER_SNAKE
- Metafields: `$app` namespace, snake_case (`lock_inventory`)
- Metaobjects: `$app:snake_case` (`$app:art_record`)
- Locale namespaces: kebab-case matching the feature folder
- Translation keys: camelCase, dot-nested (`presentations.share.copyLink.button`)

## Field ID convention

Preserve exact IDs from the developer data map:

- `UCC.*` Universal Customer Card
- `UPC.*` Universal Product Card (in field IDs, `UPC` means this card;
  "Universal Product Code" is always written out in full)
- `PG.*` Program fields
- `MOD.*` Module-level

Record each field's **Served via** home: `native` · `$app metafield` ·
`$app metaobject` · computed in app · Iconik link · Entra direct ·
not served (ERP-only).

Flag missing info as ❓ TO CONFIRM. Flag inferred IDs as 🔧 SUGGESTED.

## Visual fidelity

The V63 prototype is the source of truth for UI. Match it exactly — do not
reinterpret, redesign, or modernize layout, colors, spacing, or hierarchy.
Before writing layout code, read the relevant prototype HTML/CSS and quote it.
Preserve DOM order, labels, icons, and text verbatim.

Port the prototype's design tokens (UTDS v1.0 CSS custom properties) into
`app/styles/tokens.css` and `tailwind.config.ts`. shadcn/ui is a component
library, not a design system — style its primitives to prototype tokens, never
to shadcn defaults.

Standing rulings: primary CTAs are charcoal `#1A1A1A` (no teal or gold
primaries). Every department queue reads title/subtitle → five cards (My queue ·
Returned to you · Unassigned pool · Past due ACD · Expiring soon) → shared
search and filters → the work.

## Prototype patterns that must not be ported

The prototype is a single-file demo. Replace, do not translate:

| Prototype | Replacement |
|---|---|
| Global `STATE`, `render_*()` dispatch | Route loaders + nested layouts |
| `localStorage` / IndexedDB stores (`ag.*.v1`) | `$app` metaobjects via Admin API |
| `BroadcastChannel('ag.approvals')` | Action + revalidate; webhooks for external change |
| `window.agCan()` client gating | `guards.server.ts` in loaders/actions |
| In-memory `MF_DATA` filtering | Storefront API filters driven by URL params |
| `selectPersona()` demo login | Entra OIDC + session |
| Hash-seeded fake data | `mocks/` fixtures behind the loader contract |
| `innerHTML` templates, `NAV_TIPS` label maps | React components + locale namespaces |

## Open items — flag, do not resolve

These are unresolved in the developer docs. Build against a typed placeholder
and mark ❓ TO CONFIRM rather than inventing an answer:

- Celigo field-level mapping and the Shopify-persisted field list
- Native Shopify B2B objects vs custom metafields for company/customer
- Invoice read path (invoices are ERP-only and not served from Shopify)
- Art + decoration as one item vs two
- Pricing exposure — NetSuite cannot expose the calculation UTX needs
- Iconik permanent URLs vs 60-day deep links

## Output expectations

- Return complete files. No `...` placeholders.
- Quote the prototype snippet alongside converted output.
- State assumptions at the end.

## Path-specific instructions

More detailed rules live in `.github/instructions/` and load automatically for
matching files: `routes`, `server-modules`, `components`, `i18n`,
`shopify-data`, `forms-schemas`, `styling`.
