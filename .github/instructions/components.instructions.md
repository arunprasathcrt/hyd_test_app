---
applyTo: "app/features/**,app/shared/components/**,app/layouts/**"
description: "React component rules — no data fetching, no text, no server imports"
---

# Component guidelines

## Purpose

Components render. They do not fetch, do not authorize, and do not contain
text. These rules cover feature components, shared components, and layouts.

## Hard rules

- Functional components, named exports, PascalCase file names
- No data fetching: no `useEffect` + `fetch`, no query library. Data arrives as
  props from the route, or via `useLoaderData()` in the route module itself.
- No imports from `*.server.ts` or `app/lib/shopify/admin.server`
- No user-facing string literals — see the i18n instructions
- No `console.log` — use `app/lib/logger`
- Tailwind classes only; no CSS-in-JS, no inline `style` except for
  genuinely dynamic values (computed positions, pin coordinates)

## State

- Local UI state: `useState` / `useReducer`
- Cross-component UI state (open drawers, selection dock, canvas pins):
  Zustand store in `app/store/`
- **Never mirror server data into a store.** If it came from a loader, read it
  from the loader. A store holding accounts, orders, or art records is a rewrite.
- Filters, sorts, and tabs go in URL search params, not state — use
  `useSearchParams`

## Feature module shape

```
features/<module>/
├── schemas/        Zod schemas (source of truth)
├── types/          z.infer types
├── queries/        GraphQL documents co-located with the feature
├── components/     Feature-specific components
├── forms/          React Hook Form components
└── lib/            Pure feature logic (pricing math, stage predicates)
```

No `api/` or `hooks/` folder — data access belongs to the route.

## Layouts

`RepLayout`, `CustomerLayout`, `AdminLayout`, plus Sidebar and Topbar, are the
highest-risk files for fidelity drift. After generating or editing one, re-read
the prototype and confirm every element matches position, order, and label.

These are immediate rewrites:

- Logo moved
- Header items reordered
- Sidebar items renamed or reordered
- Logout button relocated

## Accessibility

- `aria-label`, `aria-describedby`, and live-region text all come from i18next
- Dialogs, sheets, and the selection dock use shadcn/Radix primitives so focus
  trapping and `aria-modal` are handled — do not hand-roll an overlay
- Keyboard operability on facet rows, cards, and queue rows is a standing
  requirement from the V50 audit
