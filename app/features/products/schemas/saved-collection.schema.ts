import {z} from 'zod';

export const savedCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  productCount: z.number().int().nonnegative(),
});

export type SavedCollection = z.infer<typeof savedCollectionSchema>;

export const savedCollectionNameSchema = z
  .string()
  .trim()
  .min(1, {message: 'errors.collectionNameRequired'})
  .max(100, {message: 'errors.collectionNameTooLong'});

export const savedCollectionNameFormSchema = z.object({
  name: savedCollectionNameSchema,
});

/** The "New collection" dialog: a name and an optional customer (a Shopify Company id). */
export const savedCollectionFormSchema = z.object({
  name: savedCollectionNameSchema,
  customer: z.string(),
});

export type SavedCollectionForm = z.infer<typeof savedCollectionFormSchema>;

export const savedCollectionActionSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('add'),
    collectionId: z.string().min(1, {message: 'errors.collectionRequired'}),
    productIds: z
      .array(z.string().min(1, {message: 'errors.productRequired'}))
      .min(1, {message: 'errors.productRequired'})
      .max(100, {message: 'errors.selection'}),
  }),
  z.object({
    operation: z.literal('create'),
    name: savedCollectionNameSchema,
    customerId: z
      .string()
      .regex(/^(gid:\/\/shopify\/Company\/\d+)?$/, {message: 'errors.customerInvalid'}),
    productIds: z
      .array(z.string().min(1, {message: 'errors.productRequired'}))
      .min(1, {message: 'errors.productRequired'})
      .max(100, {message: 'errors.selection'}),
  }),
]);

export type SavedCollectionAction = z.infer<typeof savedCollectionActionSchema>;

export const savedCollectionsResponseSchema = z.object({
  collections: z.object({
    edges: z.array(
      z.object({
        node: z.object({
          id: z.string().min(1),
          title: z.string(),
          tags: z.object({value: z.string()}).nullable(),
          createdBy: z.object({value: z.string()}).nullable(),
          productsCount: z.object({count: z.number().int().nonnegative()}),
          sources: z.array(
            z.object({
              __typename: z.string(),
              id: z.string().min(1),
              title: z.string(),
            }),
          ),
        }),
      }),
    ),
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      endCursor: z.string().nullable(),
    }),
  }),
});

export const savedCollectionOwnerResponseSchema = z.object({
  collection: z
    .object({
      id: z.string().min(1),
      createdBy: z.object({value: z.string()}).nullable(),
      tags: z.object({value: z.string()}).nullable(),
      sources: z.array(
        z.object({
          __typename: z.string(),
          id: z.string().min(1),
          title: z.string(),
        }),
      ),
    })
    .nullable(),
});

export const savedCollectionCreateResponseSchema = z.object({
  collectionCreate: z.object({
    collection: z
      .object({id: z.string().min(1), title: z.string()})
      .nullable(),
    userErrors: z.array(
      z.object({field: z.array(z.string()).nullable(), message: z.string()}),
    ),
  }),
});

export const savedCollectionUpdateResponseSchema = z.object({
  collectionUpdate: z.object({
    collection: z.object({id: z.string().min(1)}).nullable(),
    userErrors: z.array(
      z.object({field: z.array(z.string()).nullable(), message: z.string()}),
    ),
  }),
});

export const companyNameResponseSchema = z.object({
  company: z.object({name: z.string()}).nullable(),
});
