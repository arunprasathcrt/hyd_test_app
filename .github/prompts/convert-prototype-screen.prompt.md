---
mode: agent
description: "Convert one V63 prototype screen into a Hydrogen route, feature components, and locale keys"
---

# Convert a prototype screen

Convert the prototype screen named `${input:screen:Which prototype screen?}`
into the Hydrogen implementation.

Work in this order and do not skip a step.

## 1 · Read and quote the prototype

Find the screen in the prototype HTML. Quote the markup and CSS you are
converting — the container, the header, the controls, and one representative
row or card. Do not proceed until the quoted markup is in the response.

Identify: exact labels, exact DOM order, tokens used (colors, radii, spacing),
and any standing anatomy (the five queue cards, the selection dock, the
charcoal CTA).

## 2 · Map the data

For every field on the screen, state:

- its data-map ID (`UCC.*`, `UPC.*`, `PG.*`, `MOD.*`)
- its Served-via home (native · `$app` metafield · `$app` metaobject ·
  computed in app · Iconik link · Entra direct · not served)
- which API supplies it (Storefront or Admin)

Flag anything missing as ❓ TO CONFIRM and anything inferred as 🔧 SUGGESTED.
If the screen depends on an open item (invoice read path, Celigo field mapping,
B2B object model), build against a typed placeholder and say so.

## 3 · Write the route module

`app/routes/<persona>.<screen>.tsx` with:

- an authorization guard called before any data access
- a typed loader returning a shaped view model
- an action per mutation, Zod-validated, returning typed field errors
- `handle.i18n` declaring the namespaces
- an error boundary using the `errors` namespace
- filters/sorts/tabs read from search params

## 4 · Write the feature components

Under `app/features/<module>/components/` and `forms/`. No data fetching, no
server imports, no string literals.

## 5 · Write the locale keys

Add the namespace file under `app/locales/en/`. English values must be
byte-identical to the prototype labels, middots and punctuation included.
Show the key/value pairs in the response next to the component that uses them.

## 6 · Self-check before finishing

Confirm and state each one:

- [ ] Prototype markup quoted and DOM order preserved
- [ ] No Admin API or `*.server.ts` import reachable from a component
- [ ] Authorization enforced in the loader/action, not the component
- [ ] Zero user-facing string literals
- [ ] Zod messages are keys, not sentences
- [ ] Tokens from `tokens.css`, no shadcn defaults, CTA is `#1A1A1A`
- [ ] Types from codegen or `z.infer`, no `any`
- [ ] Field IDs preserved with Served-via noted
- [ ] Open items flagged, not invented

Return complete files. No `...` placeholders. List your assumptions at the end.
