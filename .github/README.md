# UTX Copilot instruction files

## Layout

```
.github/
├── copilot-instructions.md              Repo-wide. Loaded on every request.
├── instructions/
│   ├── routes.instructions.md           app/routes/**, app/root.tsx
│   ├── server-modules.instructions.md   **/*.server.ts, app/lib/auth/**
│   ├── components.instructions.md       app/features/**, shared/components/**, layouts/**
│   ├── i18n.instructions.md             locales/**, lib/i18n/**, all rendering paths
│   ├── shopify-data.instructions.md     lib/shopify/**, lib/metaobjects/**, queries/**
│   ├── forms-schemas.instructions.md    **/*.schema.ts, features/**/forms/**
│   ├── styling.instructions.md          styles/**, tailwind.config.ts, components/ui/**
│   └── migration.instructions.md        **/*.js, **/*.jsx — delete when migration ends
└── prompts/
    ├── plan-ts-migration.prompt.md      /plan-ts-migration — run once, plan only
    ├── migrate-module.prompt.md         /migrate-module — run per batch
    └── convert-prototype-screen.prompt.md   /convert-prototype-screen
```

## Migration sequencing

The repo is mid-migration. Passes are deliberately separate — each is one
reviewable concern, and combining them makes a diff impossible to verify.

1. **TypeScript + folder structure** — `/plan-ts-migration`, then
   `/migrate-module` per batch. No behavior change.
2. **Banned-dependency removal** — axios → fetch, moment/dayjs → Intl,
   lodash → native, prop-types deleted.
3. **Data layer** — client-side fetching → loaders and actions.
4. **i18n extraction** — string literals → locale namespaces.
5. **Figma UI replacement** — new screens from the Figma MCP server, preserving
   the functionality binding already built.

While passes 1–4 are in flight, `migration.instructions.md` tells Copilot that
un-migrated files are expected to violate the repo-wide rules, so it reports
non-conformance instead of opportunistically fixing it.


## How loading works

- `copilot-instructions.md` is injected into every Copilot request in this
  repository. Keep it short enough to stay useful — detail belongs in the
  path-specific files.
- `*.instructions.md` files load only when the file Copilot is working on
  matches their `applyTo` glob. A file without `applyTo` is ignored by code
  review.
- Multiple matching files combine. `i18n.instructions.md` deliberately overlaps
  the component and route globs, because the no-string-literals rule has to be
  in context wherever text could be written.
- Prompt files are invoked by name in Copilot Chat (`/convert-prototype-screen`).

## Glob syntax

`applyTo` takes a comma-separated string of globs:

```yaml
applyTo: "app/routes/**,app/root.tsx"
```

Some surfaces also accept a YAML list. If your team standardizes on one form,
make it the string form — it is supported everywhere these files are read
(VS Code, Visual Studio, the coding agent, Copilot CLI, and code review).

## Verifying instructions are loading

- **VS Code**: check the References list on a Chat response; loaded instruction
  files are listed and clickable.
- **Output channel**: View → Output → GitHub Copilot Chat shows the full request
  payload including injected instructions. If a file is missing, check the
  `.instructions.md` suffix, the `applyTo` glob, and that the file is saved.
- **Code review**: path-scoped files only apply when the PR touches a matching path.

## Maintenance

- One file per domain. Do not mix concerns — a rule that applies everywhere
  belongs in `copilot-instructions.md`, not duplicated across four files.
- Keep rules declarative and scannable. Bullets outperform prose.
- When a decision in the developer docs moves from OPEN to decided, update the
  "Open items" list in `copilot-instructions.md` and the matching section in
  `shopify-data.instructions.md` in the same commit.

## Relationship to other agent files

If the repo also carries `CLAUDE.md` or `AGENTS.md`, treat
`copilot-instructions.md` as the same content in Copilot's format — not a
divergent ruleset. When a rule changes, change it in both, or make one a
pointer to the other. Copilot CLI supports `@path` includes inside
`copilot-instructions.md`, `AGENTS.md`, and `CLAUDE.md`, which is one way to
keep a single source.
