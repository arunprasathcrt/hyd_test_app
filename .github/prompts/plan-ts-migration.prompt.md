---
mode: agent
description: "Phase 0 — inventory the existing JS/JSX codebase and produce a migration plan. Plan only, no code changes."
---

# Plan the TypeScript + folder-structure migration

You are planning, not migrating. **Do not modify, move, rename, or create any
source file in this run.** The only file you may write is
`docs/MIGRATION-PLAN.md`.

## Scope of the overall migration

In scope:
- `.js` → `.ts`, `.jsx` → `.tsx`, with real types (not `any`)
- Folder structure moved to the layout in `.github/copilot-instructions.md`
- File and symbol naming brought to the convention
- Banned dependencies identified for removal

Explicitly **out of scope** for this migration — each gets its own later pass,
and mixing them in makes review impossible:
- Moving data fetching from the current data layer to loaders/actions
- Extracting user-facing strings to i18next
- Replacing UI from Figma
- Any behavior change, refactor, or "while I'm here" cleanup

Existing screens (accounts table, overview, orders, invoice list) already have
working functionality binding. **That binding is the asset being preserved.**
Their UI will be replaced later from Figma, so do not invest in restyling or
restructuring their markup now — only type it and move it.

## Step 1 · Inventory

Walk the repo and produce counts and a full file list for each:

- `.js` files containing JSX (must become `.tsx`)
- `.js` / `.jsx` files with no JSX (become `.ts`)
- Files already `.ts` / `.tsx`
- Files using `PropTypes`
- Files using `defaultProps`
- Files using `React.createClass`, class components, or legacy lifecycle methods
- Default exports (the convention is named exports)
- Barrel `index.js` files
- Dynamic `require()` or CommonJS `module.exports`
- Files importing a banned dependency: `axios`, `moment`, `dayjs`, `lodash`,
  `prop-types`, `styled-components`, `react-router-dom`, `msal`, `redux`,
  `formik`, `react-intl`
- Files with user-facing string literals (count only — do not extract)

## Step 2 · Dependency graph and ordering

Determine migration order **leaf-up**: modules with no internal imports first,
then their consumers. A module whose dependencies are still untyped will end up
with `any` at the boundary, which defeats the pass.

Produce a numbered batch list. Each batch is one PR-sized unit, roughly one
feature module or one shared concern. Name each batch and list its files.

Suggested shape, adjust to what you actually find:

1. `shared/utils` and `shared/constants` — pure functions, no React
2. `shared/types` and any existing schemas
3. `lib/` — api client, logger, config
4. `shared/components/ui` — presentational primitives
5. `layouts/`
6. One batch per feature module, leaf features first
7. `store/`
8. App bootstrap and routing entry

## Step 3 · Structure mapping

Produce a table mapping **every** current path to its target path under the
locked structure. Do not invent new top-level folders. Flag as ❓ TO CONFIRM
any file whose home is genuinely ambiguous rather than guessing.

| Current path | Target path | Batch | Notes |
|---|---|---|---|

Call out specifically:
- Files that must split (a module doing both fetching and rendering)
- Files that must merge
- Files with no home in the target structure
- Anything currently under a `features/<module>/api/` or `hooks/` folder, since
  those folders do not exist in the target

## Step 4 · Typing risk register

List the places where honest typing will be hard, with a proposed approach:

- API response shapes with no schema and no codegen yet
- Deeply dynamic objects (config maps, reducer payloads, table column defs)
- Third-party modules with missing or wrong `@types`
- Anything currently relying on implicit coercion

For each, state the plan: derive from a Zod schema, write an interface in the
feature's `types/`, or mark `🔧 SUGGESTED` with a TODO and a follow-up item.
**"Use `any`" is not an approach.**

## Step 5 · Toolchain checklist

List what the repo needs before batch 1 can start:

- `tsconfig.json` with `strict: true`, `allowJs: true` (temporarily, so the app
  builds mid-migration), `noEmit`, path alias `@/*` → `app/*`
- Matching alias in the Vite config
- ESLint with `@typescript-eslint`, `no-explicit-any` as an error,
  `ban-ts-comment` allowing `@ts-expect-error` with a description only
- A `typecheck` script and a CI gate that runs it
- `@types/*` packages needed for current dependencies

## Step 6 · Output

Write `docs/MIGRATION-PLAN.md` containing: the inventory counts, the batch
list with files, the full path-mapping table, the typing risk register, the
toolchain checklist, and a short "rules for every batch" section restating the
no-behavior-change rule.

Then summarize in chat: total file count, number of batches, the three riskiest
items, and anything you marked ❓ TO CONFIRM.

Do not begin migrating. The next step is `/migrate-module` run per batch.
