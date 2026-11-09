---
applyTo: "**/*.js,**/*.jsx,docs/MIGRATION-PLAN.md"
description: "Rules for files not yet migrated to TypeScript — delete this file when the migration completes"
---

# Un-migrated file guidelines

## Purpose

These files are mid-migration. They predate the locked structure and still use
the pre-Shopify data layer. Applies until the last `.js`/`.jsx` file is gone,
then this file should be deleted.

## Do not

- Add new `.js` or `.jsx` files. Every new file is `.ts` or `.tsx` in its
  target folder from the start.
- Extend an un-migrated file with new features. If it needs work, migrate it
  first via `/migrate-module`.
- "Improve" an un-migrated file while reading it — no refactors, no renames,
  no string extraction, no dependency swaps. Those passes are sequenced
  deliberately and an opportunistic edit destroys the review signal.
- Convert a file ad hoc, outside its planned batch. Leaf-up ordering exists so
  modules are not typed against untyped dependencies.

## Do

- Consult `docs/MIGRATION-PLAN.md` for the file's batch and target path.
- Use `git mv` for any relocation.
- Treat existing behavior as the specification. The accounts table, overview,
  orders, and invoice list screens have working functionality binding that is
  the thing being preserved.

## Known non-conformance — expected, do not "fix" in place

Un-migrated files will violate the repo-wide instructions in predictable ways.
This is expected and each has its own scheduled pass:

| Violation | Scheduled pass |
|---|---|
| Client-side data fetching, not loaders | Data-layer migration |
| User-facing string literals | i18n extraction |
| `axios`, `moment`, `dayjs`, `lodash`, `prop-types` | Banned-dependency removal |
| Prototype-derived or ad hoc styling | Figma UI replacement |
| Default exports, wrong file casing | TS migration (this pass) |

Reporting one of these is useful. Fixing one outside its pass is not.
