import {z} from 'zod';

export const productSchema = z.object({
  type: z.enum(['garment', 'art', 'bundles']),
  id: z.string().min(1, 'errors.required'),
  sku: z.string(),
  /** `agv.style_code` product metafield — shown bold after the name on the card. */
  styleCode: z.string().default(''),
  name: z.string(),
  subtitle: z.string().default(''),
  brand: z.string(),
  /** Shopify admin's native "Type" field (e.g. "Men's", "Women's", "Shoe", "Hat / One Size") — drives size-chip grouping. */
  productType: z.string().default(''),
  gender: z.string().default(''),
  category: z.string().default(''),
  garmentType: z.string().default(''),
  family: z.string().default(''),
  fabric: z.string().default(''),
  colorName: z.string().default(''),
  colorHex: z.string().default(''),
  colorFamily: z.string().default(''),
  season: z.string().default(''),
  recencyScore: z.number().default(0),
  catalogName: z.string().default(''),
  channel: z.string().default(''),
  sport: z.string().default(''),
  tier: z.string().default(''),
  price: z.number().nonnegative('errors.price').nullable().default(null),
  availability: z.string().default(''),
  moq: z.number().int().nonnegative('errors.quantity').nullable().default(null),
  sizeRun: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  placementCodes: z.array(z.string()).default([]),
  placementLabels: z.array(z.string()).default([]),
  /** Placement label -> its group from the store; labels without one are ungrouped. */
  placementGroupByLabel: z.record(z.string()).default({}),
  decorationMethods: z.array(z.string()).default([]),
  licenses: z.array(z.string()).default([]),
  region: z.array(z.string()).default([]),
  isLicensed: z.boolean().default(false),
  image: z.string(),
  popularity: z.number().default(0),
  artCategory: z.string().default(''),
  silhouette: z.string().optional(),
  reorder: z
    .object({
      artId: z.string(),
      artName: z.string(),
      artSku: z.string(),
      artImage: z.string(),
      garmentId: z.string(),
      garmentName: z.string(),
      method: z.string(),
      placement: z.string(),
    })
    .optional(),
  // --- Fetched 2026-10-08, not all wired into a facet yet (see live-catalog.ts) ---
  genderTags: z.array(z.string()).default([]),
  newnessTags: z.array(z.string()).default([]),
  customizable: z.boolean().default(false),
  colorCount: z.number().int().nonnegative().nullable().default(null),
  colorOptions: z.array(z.string()).default([]),
  /** Swatch hex per `colorOptions` entry, from the variant's native `Color` option. */
  colorOptionSwatches: z.record(z.string(), z.string()).default({}),
  licenseExpiration: z.string().default(''),
  artProcessMethod: z.string().default(''),
  bundlePrice: z.number().nullable().default(null),
  bundleWorkflowStatus: z.string().default(''),
  shopifyDisclosure: z.string().default(''),
  netsuiteItemId: z.string().default(''),
  catalogBrandName: z.string().default(''),
  institution: z.string().default(''),
  lifecycleStage: z.string().default(''),
  blankSupplier: z.string().default(''),
  decorationZoneMap: z.string().default(''),
  agvSourceHash: z.string().default(''),
  agvVersion: z.string().default(''),
  agvStatus: z.string().default(''),
  agvProductionTypes: z.array(z.string()).default([]),
  agvProcessMethods: z.array(z.string()).default([]),
  agvLocations: z.array(z.string()).default([]),
  agvPayload: z.string().default(''),
  atpSizeGroup: z.string().default(''),
  atpSixWeekOutlook: z.string().default(''),
  atpTotalToday: z.number().int().nullable().default(null),
  atpIncomingQty: z.string().default(''),
  atpIncomingPo: z.string().default(''),
  atpIncomingDate: z.string().default(''),
  atpFutureIncomingQty: z.string().default(''),
  atpFuturePo: z.string().default(''),
  atpFutureIncomingDate: z.string().default(''),
});

export const catalogQuerySchema = z.object({
  q: z.string().trim().max(160, 'errors.search').catch(''),
  view: z.enum(['garment', 'art', 'all', 'bundles']).catch('all'),
  sort: z
    .enum(['featured', 'price-low', 'price-high', 'alphabetical', 'newest', 'min-order-qty', 'availability', 'popularity'])
    .catch('featured'),
  density: z.enum(['compact', 'comfortable']).catch('compact'),
  page: z.coerce.number().int().min(1).catch(1),
  min: z.coerce.number().min(0).catch(0),
  max: z.coerce.number().min(0).catch(1000),
});

export const catalogMutationSchema = z.object({
  intent: z.enum(['draft', 'presentation', 'collection'], {
    errorMap: () => ({message: 'errors.intent'}),
  }),
  ids: z
    .array(z.string().min(1, 'errors.required'))
    .min(1, 'errors.selection')
    .max(100, 'errors.selection'),
  name: z.string().trim().max(100, 'errors.name').default(''),
});

export type Product = z.infer<typeof productSchema>;
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
export type CatalogMutation = z.infer<typeof catalogMutationSchema>;

export const catalogBookSchema = z.object({
  id: z.string(),
  title: z.string(),
  cover: z.string().url(),
  pdf: z.string().url(),
  pageCount: z.number().int(),
  styleCount: z.number().int(),
});
export type CatalogBook = z.infer<typeof catalogBookSchema>;

export const catalogFixtureSchema = z.object({
  records: productSchema.array(),
  books: catalogBookSchema
    .extend({pdf: z.union([catalogBookSchema.shape.pdf, z.literal('')])})
    .array()
    .transform((books) => books.filter((book) => book.pdf !== '')),
});

export const priceFilterSchema = z
  .object({
    min: z.coerce.number().min(0, 'errors.price'),
    max: z.coerce.number().max(1000, 'errors.price'),
  })
  .refine(({min, max}) => min <= max, {path: ['max'], message: 'errors.price'});
