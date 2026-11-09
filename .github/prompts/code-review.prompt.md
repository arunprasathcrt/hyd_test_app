---
mode: agent
description: "Review the current Git diff for correctness, security, regressions, missing tests, and compliance with the UTX Hydrogen project rules."
argument-hint: "Optional scope, branch, commit, or files to review"
---

# UTX Code Review

Perform a focused code review of the current changes in this repository.

Review scope: `${input:scope:What should be reviewed? Leave blank for the current diff.}`

## Review setup

1. Read `.github/copilot-instructions.md`, `CLAUDE.md`, and any matching files in `.github/instructions/` before judging the implementation.
2. Inspect the current Git state and diff. Include staged, unstaged, and relevant untracked files when they are part of the requested scope.
3. Read the surrounding implementation, route, loader/action, schema, locale resource, and neighboring tests needed to understand behavior. Do not review the diff in isolation.
4. Treat existing user changes as intentional. Do not reset, checkout, or rewrite unrelated work.
5. Check the repository's available scripts and run the narrowest relevant validation when practical. Do not change code while reviewing.

## Highest-priority review rules

### Correctness and regressions

- Identify behavior that is wrong, incomplete, or likely to regress existing workflows.
- Check loading, error, empty, pending, redirect, and unauthorized states where applicable.
- Check route params, URL search params, form submissions, revalidation, caching, and concurrent requests.
- Check nullability, stale data, race conditions, pagination, sorting, filtering, and destructive actions.
- Confirm that types come from Zod schemas or GraphQL codegen where the data is represented by either source. Flag `any`, unsafe casts, and suppressed errors that hide defects.

### Hydrogen and React Router architecture

- Reads belong in route loaders; mutations belong in route actions. Do not approve client-side data fetching with `useEffect`.
- Authorization must run in loaders and actions before protected data access. Component checks may hide UI but are not a security boundary.
- Follow file-based React Router 7 routes and import from `react-router`, not `react-router-dom`.
- Check pending UI, error boundaries, redirects, response headers, cache behavior, and session commit behavior.
- Keep server-only code in `*.server.ts`. Admin API clients, Entra secrets, and Celigo credentials must never reach client modules.

### Shopify and Oxygen constraints

- Use Storefront API for customer-visible reads and Admin API only for privileged operations.
- Never call NetSuite directly. Invoice and other ERP-only data must not be invented as Shopify data; flag unresolved sources as `TO CONFIRM`.
- Metafield and metaobject reads/writes belong in the appropriate `app/lib/metaobjects/` module and use Zod validation.
- No hardcoded URLs or metafield keys when shared constants exist.
- Oxygen is a Workers runtime: no Node built-ins, filesystem writes, long-lived in-process state, or Node-only dependencies.
- Never expose Admin, Entra, or Celigo credentials or tokens to the browser.

### Security and authorization

- Verify authentication and authorization on every protected loader and action.
- Unknown actions or scopes must deny, never fall through to an allow-all default.
- Check ownership and tenant boundaries: reps see only permitted accounts, and customers see only their own organization.
- Validate tokenized links server-side, including expiry, intended action, and ownership where applicable.
- Check CSRF-relevant mutation behavior, open redirects, injection risks, sensitive logging, secret leakage, and unsafe error responses.

### Forms, schemas, and state

- Forms use React Hook Form with `zodResolver`; submissions go to route actions.
- Zod validation messages are translation keys, not English sentences.
- Zustand is for UI state only and must not mirror server data.
- Prefer URL search params for filters, sorting, and tabs so loader state remains authoritative and shareable.

### Internationalization and UI

- No user-facing string literals may appear in components, routes, schemas, stores, or constants. Use i18next resources and an explicit namespace.
- Check labels, placeholders, tooltips, aria text, errors, empty states, document titles, chart labels, and toast messages.
- Translation keys must be statically discoverable; do not concatenate keys at runtime.
- Preserve prototype labels, DOM order, design tokens, spacing, colors, typography, radii, and hierarchy when the change touches prototype-derived UI.
- Use Tailwind classes and existing shadcn primitives consistently. Do not introduce CSS-in-JS or unrelated redesigns.
- Check responsive layouts for overflow, overlap, unstable dimensions, and inaccessible controls.

### Maintainability and scope

- Prefer the smallest change that fixes the root cause and matches existing patterns.
- Flag duplicated business logic, unnecessary abstractions, dead code, unrelated refactors, and comments that merely narrate obvious code.
- Check naming, module boundaries, imports, public APIs, and whether documentation or locale resources are missing.
- Review tests for meaningful behavior and edge cases, not only coverage or snapshots.

## Findings standard

Report findings first, ordered by severity:

- **P0 — Blocker:** security vulnerability, data loss, broken deployment, or a change that cannot safely ship.
- **P1 — High:** likely production failure, authorization defect, serious regression, or missing required validation.
- **P2 — Medium:** concrete bug, edge-case failure, maintainability risk, or meaningful test gap.
- **P3 — Low:** minor correctness, consistency, or quality issue with a clear benefit.

Only report actionable findings grounded in the changed code. Do not report stylistic preferences unless they violate repository rules or create a real maintenance risk. Each finding must include:

- Severity and concise title
- Clickable workspace-relative file link with the smallest relevant line reference
- What is wrong and why it matters
- A specific fix or next action

Do not report a finding without a concrete failure mode. Do not include line ranges unless necessary; point to the smallest location that demonstrates the issue.

## Validation

Run the narrowest relevant checks available, such as the affected test, typecheck, lint, or build. Report commands that could not run and why. Distinguish pre-existing failures from failures introduced by the change when possible.

## Final response format

### Findings

List findings in severity order. If none are found, say exactly: `No findings.` Then mention remaining test gaps or residual risk.

### Open questions

List only assumptions or unresolved project decisions that affect confidence, including items marked `TO CONFIRM` in the project instructions.

### Validation

Summarize the checks run and their results.

### Change summary

Briefly summarize what the change does. Keep this section after findings and validation; it is context, not a substitute for review findings.

Do not modify files, commit changes, create branches, or close review threads unless the user explicitly asks for implementation work.
