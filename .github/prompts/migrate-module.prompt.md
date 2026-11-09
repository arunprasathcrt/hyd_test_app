---
mode: agent
description: "Migrate one batch from docs/MIGRATION-PLAN.md — JS/JSX to TS/TSX, move to the target folder structure, no behavior change."
---

# Migrate one batch to TypeScript

Migrate batch `${input:batch:Which batch number or name from docs/MIGRATION-PLAN.md?}`.

Read `docs/MIGRATION-PLAN.md` first. Migrate **only** the files listed in that
batch. If a file outside the batch needs to change, stop and report it rather
than widening the scope.

## The prime rule

**No behavior change.** This pass converts syntax and location, nothing else.

Not in this pass — even if the code is obviously improvable:
- Refactoring logic, extracting functions, collapsing conditionals
- Renaming variables, props, or exported symbols (except file-name casing)
- Changing rendered markup, class names, or styling
- Changing data fetching — the current data layer stays as it is
- Extracting strings to i18next
- Removing a banned dependency (inventory it; removal is its own PR)
- Adding tests, comments, or JSDoc that were not there

If you believe something is a bug, note it in the report. Do not fix it.

The existing accounts table, overview, orders, and invoice list screens carry
working functionality binding. **Preserve it exactly.** Their UI is being
replaced from Figma later, so changing their markup now is wasted work that
also destroys the review signal.

## Step 1 · Move before you convert

Use `git mv` for every relocation so blame and history survive. Move first,
commit, then convert — a move plus a rewrite in one commit is unreviewable.

Targets come from the mapping table in the plan. Do not improvise a path.

## Step 2 · Rename by content, not by extension

- Contains JSX → `.tsx`
- No JSX → `.ts`
- A `.js` file that only re-exports → `.ts`

Apply the naming convention while renaming:

- Components: PascalCase (`AccountCard.tsx`)
- Hooks: `use-` prefix camelCase (`useSelectionDock.ts`)
- Stores: `selection.store.ts`
- Schemas: `draft-order.schema.ts`
- Utilities and constants: kebab-case
- Server-only modules: `*.server.ts`

Update every import that referenced the old path or casing. Case-only renames
need two `git mv` steps on case-insensitive filesystems.

## Step 3 · Type honestly

Order of preference for any type:

1. Derive from an existing Zod schema: `type X = z.infer<typeof xSchema>`
2. Derive from GraphQL codegen output, if the shape comes from Shopify
3. Write an explicit interface in the feature's `types/` folder
4. Mark `🔧 SUGGESTED` with a TODO referencing the plan's risk register

`any` is banned. `@ts-ignore` is banned. `@ts-expect-error` is allowed only
with a description and a matching entry in the report — and it must be rare.

Mechanical conversions to apply:

- `PropTypes` → a props interface; delete the `propTypes` block
- `defaultProps` → default parameter values in the destructure
- Children → `React.ReactNode`
- Event handlers → `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, and so on — not `any`
- Refs → `useRef<HTMLDivElement>(null)`
- Default exports → named exports, updating call sites
- `module.exports` / `require()` → ESM

For a discriminated shape (a product by `product_type`, a queue row by status),
write a union with a literal discriminant rather than a wide interface with
optional fields. This is where the type system actually earns its keep.

## Step 4 · Preserve field IDs

Data-map IDs (`UCC.*`, `UPC.*`, `PG.*`, `MOD.*`) must survive the conversion
unchanged, including on renamed interfaces. If a field's ID or Served-via home
is unclear, mark it ❓ TO CONFIRM rather than dropping it.

## Step 5 · Verify

Run and report the result of each:

- `tsc --noEmit` — zero errors in the batch's files
- Lint — zero errors, including `no-explicit-any`
- Build
- Existing tests, if any
- A manual smoke of each screen the batch touches, described in one line each

If the batch cannot go green without touching files outside it, stop and report.

## Step 6 · Report

End with:

- Files moved, with old → new paths
- Files converted, by extension
- Every type you marked `🔧 SUGGESTED` and why
- Every `@ts-expect-error`, with its reason
- Banned-dependency imports found (inventory only, not removed)
- String literals encountered (count only, not extracted)
- Suspected bugs found and deliberately left alone
- Anything marked ❓ TO CONFIRM

Return complete files. No `...` placeholders.
