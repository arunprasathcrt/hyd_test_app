import {z} from 'zod';

const metafieldValueSchema = z.object({value: z.string()}).nullable();

/** A `list.metaobject_reference` metafield \u2014 resolve each reference's label field, not the raw GID list. */
const referenceListMetafieldSchema = z
  .object({
    references: z.object({
      nodes: z.array(
        z.object({field: z.object({value: z.string()}).nullable()}),
      ),
    }),
  })
  .nullable();

/** A single (non-list) `metaobject_reference` metafield. */
const referenceMetafieldSchema = z
  .object({
    reference: z
      .object({field: z.object({value: z.string()}).nullable()})
      .nullable(),
  })
  .nullable();

const tierMetafieldSchema = referenceListMetafieldSchema;

export const liveProductNodeSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  vendor: z.string(),
  /** Shopify admin's native "Type" field (e.g. "Men's", "Shoe") — drives size-chip grouping. */
  productType: z.string(),
  featuredImage: z.object({url: z.string()}).nullable(),
  priceRange: z.object({
    minVariantPrice: z.object({amount: z.string()}),
  }),
  variants: z.object({
    nodes: z.array(
      z.object({
        sku: z.string().nullable(),
        selectedOptions: z.array(z.object({name: z.string(), value: z.string()})),
      }),
    ),
  }),
  /** Native color option + swatch — drives the `cf` facet UI, not a metafield. */
  options: z.array(
    z.object({
      name: z.string(),
      optionValues: z.array(
        z.object({
          name: z.string(),
          swatch: z.object({color: z.string().nullable()}).nullable(),
        }),
      ),
    }),
  ),
  leadTime: metafieldValueSchema,
  color: metafieldValueSchema,
  styleCode: metafieldValueSchema,
  tier: tierMetafieldSchema,
  moq: metafieldValueSchema,
  artPlacement: z
    .object({
      references: z.object({
        nodes: z.array(
          z.object({
            id: z.string(),
            field: z.object({value: z.string()}).nullable(),
            group: z.object({value: z.string()}).nullable().optional(),
          }),
        ),
      }),
    })
    .nullable(),
  productGender: metafieldValueSchema,
  genderFilter: metafieldValueSchema,
  salesChannel: referenceListMetafieldSchema,
  season: referenceListMetafieldSchema,
  regionState: referenceListMetafieldSchema,
  sportUse: referenceListMetafieldSchema,
  feature: referenceListMetafieldSchema,
  fabric: referenceListMetafieldSchema,
  newness: metafieldValueSchema,
  license: referenceListMetafieldSchema,
  licensed: metafieldValueSchema,
  customizable: metafieldValueSchema,
  colorCount: metafieldValueSchema,
  brandCatalog: metafieldValueSchema,
  sizeRun: metafieldValueSchema,
  atpSizeGroup: metafieldValueSchema,
  atpSixWeekOutlook: metafieldValueSchema,
  atpTotalToday: metafieldValueSchema,
  atpIncomingQty: metafieldValueSchema,
  atpIncomingPo: metafieldValueSchema,
  atpIncomingDate: metafieldValueSchema,
  atpFutureIncomingQty: metafieldValueSchema,
  atpFuturePo: metafieldValueSchema,
  atpFutureIncomingDate: metafieldValueSchema,
  agvSourceHash: metafieldValueSchema,
  agvVersion: metafieldValueSchema,
  agvStatus: metafieldValueSchema,
  agvProductionTypes: metafieldValueSchema,
  agvProcessMethods: metafieldValueSchema,
  agvLocations: metafieldValueSchema,
  agvPayload: metafieldValueSchema,
  licenseExpiration: metafieldValueSchema,
  artProcessMethod: metafieldValueSchema,
  bundlePrice: metafieldValueSchema,
  bundleWorkflowStatus: metafieldValueSchema,
  disclosure: metafieldValueSchema,
  netsuiteItemId: metafieldValueSchema,
  catalogBrand: referenceMetafieldSchema,
  institution: metafieldValueSchema,
  lifecycle: metafieldValueSchema,
  blankSupplier: metafieldValueSchema,
  colorOptions: metafieldValueSchema,
  decorationZoneMap: metafieldValueSchema,
  decorationMethod: referenceListMetafieldSchema,
  available: referenceListMetafieldSchema,
  category: referenceListMetafieldSchema,
});

export const liveProductsResponseSchema = z.object({
  products: z.object({
    nodes: z.array(liveProductNodeSchema),
    pageInfo: z.object({hasNextPage: z.boolean(), endCursor: z.string().nullable()}),
  }),
});

/**
 * One result of `nodes(ids: $ids)` scoped `... on Collection`. Shopify
 * returns `null` for any id that doesn't resolve (wrong id, insufficient
 * scope, etc.) — kept nullable so a bad id degrades to "skip that view"
 * instead of failing the whole response.
 */
export const collectionByIdSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    // `Collection.productsCount` doesn't exist in the Storefront API (Admin-only) —
    // the chip badge count is the page length instead, capped by `$first`.
    products: z.object({nodes: z.array(liveProductNodeSchema)}),
  })
  .nullable();

/** One page of `COLLECTION_PRODUCTS_PAGE_QUERY`: a collection and its products from `after`. */
export const collectionProductsPageResponseSchema = z.object({
  collection: z
    .object({
      id: z.string(),
      title: z.string(),
      products: z.object({
        pageInfo: z.object({hasNextPage: z.boolean(), endCursor: z.string().nullable()}),
        nodes: z.array(liveProductNodeSchema),
      }),
    })
    .nullable(),
});

/** One page of `COLLECTIONS_LIST_QUERY` — id + title only, used to discover view-collection ids dynamically. */
export const collectionListResponseSchema = z.object({
  collections: z.object({
    nodes: z.array(z.object({id: z.string(), title: z.string()})),
    pageInfo: z.object({hasNextPage: z.boolean(), endCursor: z.string().nullable()}),
  }),
});

export type LiveProductNode = z.infer<typeof liveProductNodeSchema>;
export type LiveViewCollection = NonNullable<z.infer<typeof collectionByIdSchema>>;
export type CollectionListNode = z.infer<typeof collectionListResponseSchema>['collections']['nodes'][number];
