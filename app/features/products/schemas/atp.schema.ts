import {z} from 'zod';

/** Admin API: on-hand inventory by variant. */
export const productAtpResponseSchema = z.object({
  product: z
    .object({
      id: z.string().min(1),
      productType: z.string(),
      variants: z.object({
        pageInfo: z.object({
          hasNextPage: z.boolean(),
          endCursor: z.string().nullable(),
        }),
        nodes: z.array(
          z.object({
            id: z.string().min(1),
            inventoryQuantity: z.number().int().nullable(),
            selectedOptions: z.array(
              z.object({name: z.string(), value: z.string()}),
            ),
          }),
        ),
      }),
    })
    .nullable(),
});

/** Storefront API: each variant's `atp_size_info` records as raw key/value fields. */
export const atpRecordsResponseSchema = z.object({
  product: z
    .object({
      variants: z.object({
        pageInfo: z.object({
          hasNextPage: z.boolean(),
          endCursor: z.string().nullable(),
        }),
        nodes: z.array(
          z.object({
            id: z.string().min(1),
            atpRecords: z
              .object({
                references: z.object({
                  nodes: z.array(
                    z.object({
                      fields: z
                        .array(z.object({key: z.string(), value: z.string().nullable()}))
                        .optional(),
                    }),
                  ),
                }),
              })
              .nullable(),
          }),
        ),
      }),
    })
    .nullable(),
});

/**
 * What the quick view needs: one row per size, and one column per incoming
 * purchase order. `incoming` holds that size's units on each PO, keyed by the
 * PO column's `key`; a size absent from a PO has no entry.
 */
export const atpTableSchema = z.object({
  rows: z.array(
    z.object({
      size: z.string(),
      available: z.number().int().nonnegative(),
      incoming: z.record(z.string(), z.number().int().nonnegative()),
    }),
  ),
  purchaseOrders: z.array(
    z.object({
      key: z.string(),
      po: z.string(),
      date: z.string().nullable(),
    }),
  ),
});

export type AtpTable = z.infer<typeof atpTableSchema>;

export const productAtpParamsSchema = z.object({
  id: z.string().regex(/^gid:\/\/shopify\/Product\/\d+$/),
  color: z.string().max(100).default(''),
});
