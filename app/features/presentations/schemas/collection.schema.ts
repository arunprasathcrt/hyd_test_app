/**
 * Zod schemas for the Presentations Collection list read. These are the source
 * of truth for the Admin payload.
 *
 * Hydrogen's codegen has no Admin schema, so the response is parsed, not cast.
 * Every downstream type is a `z.infer` of the schemas below.
 */
import {z} from 'zod';

const presentationCollectionProductSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  handle: z.string().min(1),
  featuredImage: z
    .object({url: z.string(), altText: z.string().nullable()})
    .nullable(),
  brand: z.object({ value: z.string() }).nullable(),
  moq: z.object({ value: z.string() }).nullable(),
  priceRangeV2: z.object({
    minVariantPrice: z.object({
      amount: z.string(),
      currencyCode: z.string(),
    }),
  }),
});

const presentationCollectionNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  handle: z.string().min(1),
  updatedAt: z.string(),
  tags: z.object({value: z.string().nullable()}).nullable(),
  neededBy: z
  .object({
    value: z.string(),
  })
  .nullable(),
  customer: z
  .object({
    value: z.string(),
  }).nullable(),
  status: z.object({ value: z.string() }).nullable(),
  customerCode: z.object({ value: z.string() }).nullable(),
  repName: z.object({ value: z.string() }).nullable(),
  products: z.object({
    nodes: z.array(presentationCollectionProductSchema),
  }),
});

export type AdminPresentationCollectionNode = z.infer<
  typeof presentationCollectionNodeSchema
>;

export const adminPresentationCollectionsResponseSchema = z.object({
  collections: z.object({
    edges: z.array(z.object({node: presentationCollectionNodeSchema})),
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      endCursor: z.string().nullable(),
    }),
  }),
});

export type AdminPresentationCollectionsResponse = z.infer<
  typeof adminPresentationCollectionsResponseSchema
>;

const detailMetafieldSchema = z.object({value: z.string().nullable()}).nullable();

const presentationCollectionDetailSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  handle: z.string().min(1),
  updatedAt: z.string(),
  tags: detailMetafieldSchema,
  customer: detailMetafieldSchema,
  neededBy: detailMetafieldSchema,
  status: z.object({ value: z.string() }).nullable(),
  customerCode: z.object({ value: z.string() }).nullable(),
  repName: z.object({ value: z.string() }).nullable(),
  createdBy: detailMetafieldSchema,
  products: z.object({
    nodes: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string(),
        handle: z.string().min(1),
        vendor: z.string(),
        featuredImage: z
          .object({url: z.string(), altText: z.string().nullable()})
          .nullable(),
        moq: z.object({value: z.string()}).nullable(),
        catalogBrand: z
          .object({
            reference: z
              .object({
                field: z.object({value: z.string()}).nullable(),
              })
              .nullable(),
          })
          .nullable(),
        variants: z.object({
          nodes: z.array(
            z.object({
              sku: z.string().nullable(),
              selectedOptions: z.array(
                z.object({
                  name: z.string(),
                  value: z.string(),
                }),
              ),
            }),
          ),
        }),
        priceRangeV2: z.object({
          minVariantPrice: z.object({
            amount: z.string(),
            currencyCode: z.string(),
          }),
        }),
      }),
    ),
  }),
});

export type AdminPresentationCollectionDetail = z.infer<
  typeof presentationCollectionDetailSchema
>;

export const adminPresentationCollectionDetailResponseSchema = z.object({
  collection: presentationCollectionDetailSchema.nullable(),
});

export const adminPresentationCollectionNameResponseSchema = z.object({
  collection: z.object({id: z.string().min(1), title: z.string()}).nullable(),
});

export const adminCustomerNameResponseSchema = z.object({
  customer: z
    .object({id: z.string().min(1), displayName: z.string()})
    .nullable(),
});

/** The Products route action's form values for adding products to a presentation. */
export const addProductsToPresentationSchema = z.object({
  collectionId: z.string().min(1),
  productIds: z.array(z.string().min(1)).min(1),
});

export type AddProductsToPresentationInput = z.infer<
  typeof addProductsToPresentationSchema
>;

export const reorderProductsInPresentationCollectionSchema = z.object({
  collectionId: z.string().min(1),
  productId: z.string().min(1),
  newPosition: z.coerce.number().int().min(0),
});

export const updatePresentationCollectionSchema = z.object({
  collectionId: z.string().min(1),
  customer: z.string().optional(),
  neededBy: z.string().optional(),
});

export const adminPresentationCollectionSourcesResponseSchema = z.object({
  collection: z.object({
    id: z.string().min(1),
    sources: z.array(
      z.object({
        __typename: z.string(),
        id: z.string().min(1),
        title: z.string(),
      }),
    ),
  }).nullable(),
});

export const adminCollectionAddProductsResponseSchema = z.object({
  collectionUpdate: z.object({
    collection: z.object({id: z.string().min(1)}).nullable(),
    userErrors: z.array(
      z.object({field: z.array(z.string()).nullable(), message: z.string()}),
    ),
  }),
});

export const adminCollectionRemoveProductsResponseSchema = z.object({
  collectionRemoveProducts: z.object({
    job: z
      .object({
        id: z.string().min(1),
      })
      .nullable(),
    userErrors: z.array(
      z.object({
        field: z.array(z.string()).nullable(),
        message: z.string(),
      }),
    ),
  }),
});

export const adminCollectionReorderProductsResponseSchema = z.object({
  collectionReorderProducts: z.object({
    job: z
      .object({
        id: z.string(),
      })
      .nullable(),
    userErrors: z.array(
      z.object({
        field: z.array(z.string()).nullable(),
        message: z.string(),
      }),
    ),
  }),
});

export type AddProductsResult =
  | {ok: true; addedCount: number}
  | {ok: false};

/** The form values the New Presentation modal sends to the route action. */
export const createPresentationCollectionSchema = z.object({
  name: z.string().trim().min(1),
  customer: z.string().min(1),
  neededBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CreatePresentationCollectionInput = z.infer<
  typeof createPresentationCollectionSchema
>;

const collectionCreateUserErrorSchema = z.object({
  field: z.array(z.string()).nullable(),
  message: z.string(),
});

export const adminCollectionCreateResponseSchema = z.object({
  collectionCreate: z.object({
    collection: z
      .object({
        id: z.string().min(1),
        title: z.string(),
        handle: z.string().min(1),
        updatedAt: z.string(),
      })
      .nullable(),
    userErrors: z.array(collectionCreateUserErrorSchema),
  }),
});

export type AdminCollectionCreateResponse = z.infer<
  typeof adminCollectionCreateResponseSchema
>;
