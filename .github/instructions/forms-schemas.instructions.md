---
applyTo: "**/*.schema.ts,app/features/**/forms/**,app/features/**/schemas/**,app/features/**/types/**"
description: "Zod schemas and React Hook Form rules"
---

# Forms and schema guidelines

## Schemas are the source of truth

- One Zod schema per payload, in `features/<module>/schemas/`, kebab-case
  (`draft-order.schema.ts`).
- Types are derived, never hand-written: `type DraftOrder = z.infer<typeof draftOrderSchema>`.
- The same schema validates in the browser and in the route action. Write it
  once; import it in both places.

## Messages are keys, not sentences

Because schemas run on both sides and must stay locale-free:

```ts
export const draftOrderLineSchema = z.object({
  quantity: z.number().int().min(1, { message: 'errors.quantity.min' }),
  neededBy: z.coerce.date({ message: 'errors.date.invalid' }),
});
```

The form component resolves `t(error.message)`. A schema containing a
human-readable sentence is a rewrite.

## Forms

- Every form uses React Hook Form + `zodResolver`.
- Submission targets a route `action` (`useFetcher` or `<Form method="post">`) —
  never a client-side `fetch` to an API.
- Server-side field errors returned from the action render on the matching
  field; do not swallow them into a generic banner.
- Labels, placeholders, helper text, and error text all come from i18next.
- Use shadcn/ui form primitives from `@/shared/components/ui`, styled to
  prototype tokens.

## Metafield payloads

Metaobject and metafield payloads get a Zod schema too, in
`app/lib/metaobjects/`. Validate on write and on read — Shopify returns
`jsonValue` as unknown shape, and an unvalidated read is how a bad sync becomes
a runtime crash in a rep's queue.

## Field IDs

Preserve exact data-map IDs on the schema field or in a colocated constant:
`UCC.*`, `UPC.*`, `PG.*`, `MOD.*`. Record the Served-via home for each field.
Flag missing info ❓ TO CONFIRM and inferred IDs 🔧 SUGGESTED.
