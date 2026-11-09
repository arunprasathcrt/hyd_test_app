# DTX — Claude Code Project Instructions

## Project Context
This is the DTX frontend for Project Elevate:
a workflow-driven B2B CRM plus customer portal, built on **Shopify Hydrogen**.

Shopify is the commerce and orchestration layer. One URL, no subdomains — the
experience switches on the signed-in user's tags (rep / customer / admin).
Behind Shopify sit NetSuite (ERP truth), Iconik (DAM), Yunique/PowerGrid (PLM),
Celigo (NetSuite ⇄ Shopify transport), Avalara (tax, behind NetSuite) and
Microsoft Entra (identity).

Deployment: Oxygen. Source: Azure DevOps.

---

## Locked Frontend Stack (DO NOT deviate)

- **Shopify Hydrogen** on **React Router 7** (the Remix successor Hydrogen ships
  with) — file-based routes, loaders, actions, `defer`/`Await`
- **Vite** (Hydrogen's build tool — already configured, do not replace)
- **React 19 + TypeScript** (strict mode)
- **Shopify Storefront API** — customer-facing reads, called from loaders
- **Shopify Admin API** — privileged reads/writes, **server modules only**
- **GraphQL Codegen** — `@shopify/hydrogen-codegen` for Storefront, a second
  config for Admin. Never hand-write response types.
- **Zod** — schemas are the source of truth for every form and every
  metafield/metaobject payload
- **React Hook Form + zodResolver** — all forms
- **Zustand** — UI state ONLY, never server state
- **i18next + react-i18next** — ALL user-facing text. No string literals in
  components. Resources are bundled JSON, one namespace per feature.
- **shadcn/ui + Tailwind CSS** — UI primitives
- **ECharts** — charts only
- **OIDC against Microsoft Entra** — server-side authorization-code flow,
  session in Hydrogen's cookie session storage

## Locked Backend Position

There is no separate BFF. **The Hydrogen server IS the BFF.** Loaders and
actions are the only server surface; there is no Express app, no proxy tier,
no separate Node service.

Oxygen runs a Workers runtime, not Node. Therefore:
- No Node built-ins (`fs`, `path`, `crypto` as Node module, `Buffer`)
- No Express, no long-lived in-process state, no filesystem writes
- Use Web APIs: `fetch`, `Request`/`Response`, `crypto.subtle`, `URL`

---

## Migration Notes — what changed from the pre-Shopify plan

Keep this table in mind when reading older docs, tickets, or prototype code.

| Old approach | New approach | Why |
|---           |---           |---|
| TanStack Router | React Router 7 file routes | Hydrogen owns routing |
| TanStack Query | Loaders + actions + `revalidate` | Server state is the framework's job now; caching lives in Hydrogen's sub-request cache |
| Express BFF proxy | Hydrogen loaders/actions | Oxygen is the server; a second tier adds a hop and can't run on workerd |
| MSAL.js (browser) | Server-side OIDC + cookie session | Tokens must never reach the client; Entra group claims are translated to tags server-side |
| `axios` / bare `fetch` to a BFF | Typed Storefront/Admin clients | Codegen types, Hydrogen caching, one auth path |
| Client-side mock fixtures | Fixture modules imported by loaders | Same loader contract in dev and prod; swap the data source, not the component |

TanStack Query is **not** banned outright, but it is not the default. Reach for
it only for genuinely client-driven polling (e.g. an art-queue live counter),
never to fetch data a loader could return.

---

## DO NOT introduce

Next.js, Refine, React Admin, Redux, Formik, TanStack Router, TanStack Form,
styled-components, axios, `react-router-dom` (import from `react-router`),
Express, moment.js, dayjs, lodash, MSAL.js, any Node-only dependency.

Also banned for i18n specifically: `react-intl`, `next-intl`, `lingui`,
`i18next-http-backend` (no runtime fetch of translations on the edge),
`i18next-browser-languagedetector` (locale comes from the session/route, not
the browser), and any hand-rolled `t()` helper or constants file that stores
display strings.

---

## Locked Folder Structure

```
app/
├── root.tsx                    Root loader: session, persona, tags, theme
├── entry.server.tsx            Hydrogen/Oxygen entry (do not restructure)
├── routes/                     File-based routes
│   ├── _index.tsx              Tag-based landing redirect
│   ├── auth.login.tsx          Entra OIDC kickoff
│   ├── auth.callback.tsx       Code exchange, session write
│   ├── auth.logout.tsx
│   ├── rep.accounts.tsx        Team experience
│   ├── rep.pipeline.tsx
│   ├── rep.catalog.tsx
│   ├── rep.draft-orders.$id.tsx
│   ├── rep.orders.$id.tsx
│   ├── rep.art-design.tsx
│   ├── rep.art-production.tsx
│   ├── rep.licensing.tsx
│   ├── rep.presentations.$id.tsx
│   ├── customer.*.tsx          Customer portal
│   ├── admin.*.tsx             Exec / manager views
│   ├── p.$token.tsx            Tokenized presentation link (no login)
│   └── webhooks.$topic.tsx     Shopify webhook receivers
├── lib/
│   ├── shopify/
│   │   ├── storefront.server.ts
│   │   ├── admin.server.ts     Admin API client — server-only
│   │   ├── fragments/
│   │   └── generated/          Codegen output, never edited by hand
│   ├── auth/
│   │   ├── entra.server.ts     OIDC discovery, code exchange
│   │   ├── session.server.ts   Cookie session
│   │   ├── tags.server.ts      Entra groups → UTX tags
│   │   └── guards.server.ts    requireTag / requireScope
│   ├── metaobjects/            One module per $app:* definition
│   ├── celigo/                 Outbound mapping helpers (when unblocked)
│   ├── iconik/                 Asset-id → URL resolution
│   ├── i18n/
│   │   ├── config.ts           Namespaces, fallback chain, formatters
│   │   ├── i18n.server.ts      Per-request instance factory
│   │   ├── i18n.client.ts      Hydration-side init
│   │   └── resources.ts        Static imports of every locale JSON
│   └── logger.ts
├── locales/
│   ├── en/
│   │   ├── common.json         Buttons, nav, statuses, shared labels
│   │   ├── accounts.json       One namespace per feature module
│   │   ├── draft-orders.json
│   │   ├── art-production.json
│   │   ├── licensing.json
│   │   ├── presentations.json
│   │   ├── finance.json
│   │   ├── customer-portal.json
│   │   ├── errors.json         Validation + error-boundary copy
│   │   └── enums.json          Order stages, art stages, segments, tiers
│   └── <lng>/                  Mirrors en/ exactly — same keys, same files
├── features/                   Business modules (UI + schemas, no data fetching)
│   ├── accounts/
│   ├── pipeline/
│   ├── catalog/
│   ├── draft-orders/
│   ├── orders/
│   ├── art-design/
│   ├── art-production/
│   ├── licensing/
│   ├── presentations/
│   ├── finance/
│   └── customer-portal/
├── layouts/                    RepLayout, CustomerLayout, AdminLayout
├── shared/
│   ├── components/ui/          shadcn/ui primitives
│   ├── components/             Reusable non-shadcn components
│   ├── services/               Notifications, downloads, print
│   ├── types/                  Shared TypeScript models
│   ├── utils/                  Pure utilities
│   └── constants/              Routes, roles, workflow, metafield keys
├── store/                      Zustand stores (UI state only)
└── styles/                     Tailwind base, tokens, globals

mocks/                          Fixture data imported by loaders in dev
shopify.app.toml                $app metafield + metaobject definitions
```

### Feature Module Shape

```
features/<module>/
├── schemas/        Zod schemas (source of truth)
├── types/          z.infer types
├── queries/        GraphQL documents (co-located with the feature)
├── components/     Feature-specific components
├── forms/          React Hook Form components
└── lib/            Pure feature logic (pricing math, stage predicates)
```

Note: features no longer own an `api/` or `hooks/` folder. Data fetching lives
in the route's loader/action; the feature exports components and schemas that
the route composes.

Each feature owns exactly one locale namespace, named after the folder
(`features/draft-orders/` → `locales/<lng>/draft-orders.json`). Translation
files stay centralized under `app/locales/` rather than co-located, so a
translator can work from one tree.

---

## Data Access Rules (CRITICAL)

1. **Storefront API for reads the customer could see.** Products, variants,
   collections, cart. Call from loaders. Use Hydrogen's cache hints
   (`CacheShort` / `CacheLong`) — do not add a custom cache layer.

2. **Admin API for everything privileged.** Draft orders, Companies and
   Company Locations, B2B catalogs and price lists, all `$app` metafield and
   metaobject writes, order state. **Only importable from `*.server.ts`.**
   If an Admin API import appears in a component file, that is an immediate
   rewrite.

3. **Never expose an Admin token, Entra token, or Celigo credential to the
   client.** Loaders return shaped view models, not raw API responses.

4. **All metafield/metaobject IO goes through `lib/metaobjects/`.** Each
   module owns a Zod schema for the payload, a reader, and a writer using
   `metafieldsSet` / `metaobjectUpsert`. Do not inline `jsonValue` parsing in
   components.

5. **Definitions live in `shopify.app.toml`** under the `$app` namespace,
   version-controlled. Do not create metafield definitions through the admin UI.

6. **NetSuite is never called directly from this app.** Anything that needs
   NetSuite goes through Shopify (synced by Celigo). Invoices and AR are
   ERP-only and are **not served from Shopify** — if a route needs invoice
   data, flag it ❓ TO CONFIRM rather than inventing a Shopify source.

7. **Iconik assets are referenced by permanent asset ID, never copied.** Deep
   links expire at 60 days; resolve on demand via `lib/iconik/`.

---

## Auth & Permission Rules

1. Entra OIDC runs **server-side**: `auth.login` redirects, `auth.callback`
   exchanges the code, session cookie holds the persona and tag set.
2. The `groups` claim is translated once into UTX tags
   (`customer tag × role tag × user-type tag`) in `tags.server.ts` and cached
   in the session. Use the `mail` attribute, not UPN.
3. **Authorization is enforced in loaders and actions, never in components.**
   Every protected route calls `requireTag(...)` / `requireScope(...)` from
   `guards.server.ts` before touching data.
4. Component-level tag checks are for **hiding UI only** and are never the
   security boundary.
5. Most-restrictive model. Rep ownership is the top-level scope; a rep sees
   their book, a customer sees only their own organization.
6. Never gate on an action string that is not in the defined list. There is no
   permissive default — an unknown action must deny, not allow.
7. Customer login is out of the MVP. Customer actions arrive as **tokenized
   email links** handled by `p.$token.tsx` and equivalents, which must work
   logged out and must validate and expire the token server-side.

---

## Internationalization Rules (CRITICAL)

### The hard rule

**No user-facing string literal may appear in a component, route, schema,
constant, or store.** Every piece of text a human reads comes from a
translation resource via `useTranslation()`, `<Trans>`, or a server-side
`t` from the request's i18n instance.

This includes: labels, headings, button text, placeholders, empty states,
tooltips, `aria-label` and other accessibility text, toast messages, validation
messages, error-boundary copy, table column headers, chart axis labels and
legends, document titles, print/PDF copy, and email or tokenized-link copy.

The only strings allowed to sit inline in code are non-display values: route
paths, metafield keys, GraphQL field names, test ids, CSS class names, enum
codes, and log messages (logs are not user-facing and stay in English).

### Setup

1. **One i18next instance per request on the server.** Oxygen reuses isolates
   across requests, so a module-level singleton leaks the previous request's
   locale. `i18n.server.ts` exports a factory called from the root loader; the
   instance is passed down, never imported as a global.
2. **Resources are statically imported and bundled** in `lib/i18n/resources.ts`.
   No `i18next-http-backend`, no runtime fetch — a translation fetch at the edge
   is an extra round trip on every cold start.
3. **Locale resolution order:** route param → session preference → `Accept-Language`
   → `en`. Resolved once in the root loader and returned in the root loader data.
4. **The root loader returns `{ locale, namespaces }`**; `<html lang>` and `dir`
   are set from it. Child routes declare the namespaces they need via a route
   `handle` so only those resources hydrate.
5. **`react-i18next` `initReactI18next` runs in `entry.client`** with the same
   locale and resource set the server rendered, so hydration does not mismatch.
6. Set `returnNull: false` and enable a missing-key handler that **throws in dev
   and logs in production** — a missing key must never render as the raw key
   string in front of a rep.

### Key conventions

- Namespace = feature folder name. `common` for anything used in two or more
  features.
- Keys are `camelCase`, nested by UI region, and describe **purpose, not text**:
  `draftOrders.locks.inventory.button` — never `draftOrders.lockInventory` as a
  restatement of the English.
- Never build a key by concatenating at runtime (`t('status.' + s)`) unless the
  full set of possible suffixes is a typed union that is exhaustively checked —
  otherwise extraction tooling cannot see the key.
- Enums (order stages, art stages, segments, tiers, decoration methods) live in
  `enums.json` keyed by their **code**, so the code stays the data value and the
  label stays translatable: `enums.orderStage.in_production`.
- Pluralization uses i18next plural suffixes (`_one` / `_other`), never a
  ternary on a count in the component.
- Interpolation over concatenation: `t('queue.pastDue', { count })`, never
  `` `${count} ${t('pastDue')}` ``.
- Rich text uses `<Trans>` with indexed components, so translators keep control
  of word order around links and bold runs.

### Formatting

Dates, numbers, currency, and percentages go through **i18next formatters
backed by `Intl`** (registered in `config.ts`), not through ad-hoc helpers and
not through a date library — this is why `moment` and `dayjs` are banned.

```
t('order.shipBy', { date: shipBy, formatParams: { date: { dateStyle: 'medium' } } })
```

### Validation messages

Zod schemas are shared between client and server, so they must not embed
English. Schemas emit **message keys**, and the form layer translates them:

```ts
z.string().min(1, { message: 'errors.required' })
```

The form component resolves `t(error.message)`. A schema containing a
human-readable sentence is a rewrite.

### Relationship to the Visual Fidelity Rule

Extracting text to `en.json` does **not** license rewording it. The English
value in `locales/en/*.json` must be **byte-identical to the prototype label**,
including capitalization, punctuation, and the middot separators (`·`) the
prototype uses. The fidelity rule now reads: preserve the exact label, and move
it verbatim into the resource file.

When converting a screen, quote the prototype markup, then show the resulting
key/value pairs alongside the component — so the label can be verified in both
places.

### Scope note

Only English ships at MVP. The point of this rule is not translation delivery —
it is that every user-facing string is inventoriable, reviewable by the business
in one place, and swappable without touching components. Build the `en` tree
properly now; additional locales are a later release.

---

## Coding Rules

1. Functional components, named exports, PascalCase component file names
2. Every form: React Hook Form + `zodResolver`; submission goes to a route
   `action`, not a client-side fetch
3. Every server read: a loader. Every mutation: an action.
4. Zustand ONLY for UI state (open drawers, selection docks, canvas pins).
   Never mirror server data into a store.
5. Tailwind classes only — no CSS-in-JS
6. shadcn/ui imported from `@/shared/components/ui`
7. Types derived from Zod (`type X = z.infer<typeof xSchema>`) or from
   codegen — never hand-written API response types
8. No inline mock data — use `mocks/` fixtures imported by the loader
9. No hardcoded URLs or metafield keys — use `shared/constants/`
10. No `console.log` — use `lib/logger`
11. No `useEffect` for data fetching
12. Prefer URL state (search params) over component state for filters, sorts,
    and tabs — it keeps loaders authoritative and links shareable
13. No user-facing string literals anywhere — `useTranslation()` / `<Trans>` in
    components, the request `t` in loaders and actions
14. Zod schemas emit message keys, never English sentences
15. Every component that renders text declares its namespace explicitly:
    `useTranslation('draft-orders')` — no reliance on a default namespace

---

## Naming Conventions

- Components: PascalCase (`AccountCard.tsx`)
- Hooks: camelCase, `use-` prefix (`useSelectionDock.ts`)
- Stores: kebab-case (`selection.store.ts`)
- Schemas: kebab-case (`draft-order.schema.ts`)
- Server modules: `*.server.ts` (enforced — this is how the bundler excludes them)
- Routes: kebab-case, dot-separated segments (`rep.draft-orders.$id.tsx`)
- Types: PascalCase (`DraftOrderState`)
- Constants: UPPER_SNAKE (`BRAND_COLORS`)
- Metafields: `$app` namespace, snake_case keys (`lock_inventory`)
- Metaobjects: `$app:snake_case` (`$app:art_record`)
- Locale namespaces: kebab-case, matching the feature folder (`draft-orders.json`)
- Translation keys: camelCase, dot-nested by UI region
  (`presentations.share.copyLink.button`)
- Enum labels: `enums.<enumName>.<code>` (`enums.artStage.graphic_services`)

---

## Field ID Convention

Preserve exact IDs from the developer data map:
- `UCC.*` — Universal Customer Card
- `UPC.*` — Universal Product Card (note: UPC in field IDs means this card;
  "Universal Product Code" is always written out in full)
- `PG.*` — Program fields
- `MOD.*` — Module-level

Every field must also carry its **Served via** home in a comment or constant:
`native` · `$app metafield` · `$app metaobject` · computed in app · Iconik link ·
Entra direct · not served (ERP-only).

Flag missing info as ❓ TO CONFIRM.
Flag inferred IDs as 🔧 SUGGESTED.

---

## Output Rules

- Return COMPLETE files. No `...` placeholders.
- Preserve exact UI labels from the prototype.
- State assumptions at the end of the response.
- When a decision is still OPEN in the developer docs (Celigo field mapping,
  native B2B vs custom metafields, invoice read path, art + decoration item
  model, pricing exposure), **build against a typed placeholder and flag it** —
  do not invent a resolution.

---

## Visual Fidelity Rule (CRITICAL)

When converting the prototype to Hydrogen:

1. **Match the prototype EXACTLY.** Do not reinterpret, redesign, or
   "modernize" the layout, colors, spacing, or hierarchy.
2. **Before writing any layout code:** read the relevant prototype HTML + CSS
   and quote it in your response so it can be verified.
3. **Preserve exact DOM order.** Left/right/top/bottom positioning in the
   prototype must match the React output.
4. **Preserve exact labels, icons, and text** — extracted verbatim into
   `locales/en/*.json`. Moving a label into a resource file is required;
   rewording it while moving it is a violation.
5. **Extract prototype tokens.** The prototype ships a full design system
   (UTDS v1.0) as CSS custom properties — surfaces, borders, text ramps, the
   accent palette, segment colors, order-status colors, shadows, radii, motion
   easings and durations. Port these verbatim into `app/styles/tokens.css` and
   map them in `tailwind.config.ts` `theme.extend`. Do NOT swap for shadcn
   defaults.
6. **shadcn/ui is a COMPONENT LIBRARY, not a design system.** Use its
   primitives (Button, Sheet, Dialog) but style them to the prototype's tokens.
7. **When in doubt, quote the prototype.**
8. **Layout components get reviewed twice.** RepLayout, CustomerLayout,
   AdminLayout, Sidebar, Topbar — after generation, re-read the prototype and
   confirm each element matches.
9. **Primary CTAs are charcoal `#1A1A1A`.** No teal or gold primaries — this is
   a standing ruling from V44/V50.
10. **Queue anatomy is standing law.** Every department queue reads: title and
    subtitle → five cards (My queue · Returned to you · Unassigned pool ·
    Past due ACD · Expiring soon) → shared search and filters → the work.
    Do not restructure a queue.

### Violations that require immediate rewrite

- Logo moved to a different position
- Header items reordered
- Sidebar items renamed or reordered
- Logout button relocated
- Colors changed to shadcn defaults (slate/zinc/neutral) when the prototype
  uses different colors
- Border radius changed
- Font family swapped
- Spacing scale changed
- Admin API, Entra secrets, or Celigo credentials imported into a client module
- Authorization enforced only in a component
- A user-facing string literal in a component, route, schema, store, or
  constants file
- An English sentence inside a Zod schema message
- A prototype label reworded on its way into `locales/en/*.json`
- A module-level i18next singleton on the server
- A translation key built by runtime string concatenation

---

## Prototype Patterns That Must NOT Be Ported

The prototype is a single-file demo. These patterns are demo scaffolding and
must be replaced, not translated:

| Prototype pattern | Replacement |
|---|---|
| Global `STATE` object, `render_*()` dispatch | Route loaders + nested layouts |
| `localStorage` / IndexedDB persistence (`ag.approvals.v1`, `ag.collections.v1`, `ag.inv.v1`, `ag.pres.revisions.v1`) | `$app` metaobjects via the Admin API |
| `BroadcastChannel('ag.approvals')` cross-tab sync | Action + `revalidate`; webhooks for external changes |
| `window.agCan()` client-side gating | `guards.server.ts` in loaders/actions |
| In-memory `MF_DATA` catalog filtering | Storefront API filters / search index, driven by URL search params |
| `selectPersona()` demo login | Entra OIDC + session |
| Deterministic hash-seeded fake data | `mocks/` fixtures behind the same loader contract |
| `innerHTML` string templates | React components |
| Inline English in template strings and `NAV_TIPS` / label maps | `locales/en/*.json` namespaces |

---

## Definition of Done for a Route

- Loader typed from codegen or a Zod schema; no `any`
- Authorization guard called before any data access
- Action validates with Zod and returns typed errors to the form
- Error boundary and pending/optimistic UI present
- Tokens match the prototype; screenshot-compared against the V63 capture
- Server-only imports confined to `*.server.ts`
- Zero user-facing string literals; every key present in `locales/en/`
- Namespace declared on the route `handle` and hydrated
- Field IDs preserved, Served-via noted, open items flagged