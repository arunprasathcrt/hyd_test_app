import {z} from 'zod';

export const draftVariantSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  sku: z.string(),
  price: z.number().finite().nonnegative(),
  size: z.string(),
  color: z.string(),
  quantity: z.number().int().min(0).max(99999),
});

/** A mark as the store's catalog returns it: what Quick pick picks. */
export const catalogArtSchema = z.object({
  id: z.string().min(1),
  sku: z.string(),
  name: z.string(),
  brand: z.string(),
  image: z.string(),
  licensed: z.boolean(),
});

export type CatalogArt = z.infer<typeof catalogArtSchema>;

export const DRAFT_ART_ARTIST_CHOICES = [
  'colour-coordinate',
  'team-colours',
  'artist-decides',
] as const;

/**
 * A mark on a line, with its brief. ❓ TO CONFIRM — how an art is priced, rendered and
 * written to the Shopify order is not decided yet (the art and decoration item model is open).
 */
export const draftArtSchema = catalogArtSchema.extend({
  /** A placement label from the garment's catalog; '' is "Match source garment art placement". */
  placement: z.string(),
  artSize: z.string().max(120),
  /** A decoration method label from the garment's catalog; '' is not set. */
  process: z.string(),
  /** Process code (P1…X4); '' is not set. */
  processCode: z.string(),
  referType: z.enum(['', 'art', 'file']),
  referTo: z.string().max(200),
  inkMode: z.enum(['sequence', 'artist']),
  inks: z.array(z.string().min(1).max(60)).max(20),
  artistChoice: z.enum(DRAFT_ART_ARTIST_CHOICES),
  swaps: z.array(z.object({omit: z.string().max(120), add: z.string().max(120)})).max(20),
  message: z.string().max(2000),
});

export type DraftArt = z.infer<typeof draftArtSchema>;

/** A mark's brief as Quick pick first adds it: the garment's first decoration method is the default. */
export function createDraftArt(art: CatalogArt, defaultProcess: string): DraftArt {
  return {
    ...art,
    placement: '',
    artSize: '',
    process: defaultProcess,
    processCode: '',
    referType: '',
    referTo: '',
    inkMode: 'sequence',
    inks: [],
    artistChoice: 'colour-coordinate',
    swaps: [],
    message: '',
  };
}

export const draftProductSchema = z.object({
  id: z.string().min(1),
  sourceProductId: z.string().optional(),
  cardId: z.string().optional(),
  lineNumber: z.number().int().positive().optional(),
  blank: z.boolean().optional(),
  /** ❓ TO CONFIRM — no licensed-art source yet; unset means not licensed (License is "Not needed"). */
  licensed: z.boolean().optional(),
  name: z.string(),
  brand: z.string(),
  image: z.string(),
  productType: z.string(),
  customerSku: z.string().max(120).optional(),
  minimumQuantity: z.number().int().nonnegative(),
  variants: z.array(draftVariantSchema),
  /** The garment's placement labels and decoration methods, from the store. */
  placements: z.array(z.string()),
  decorationMethods: z.array(z.string()),
  /** Marks picked in Quick pick: each goes on this garment. */
  arts: z.array(draftArtSchema),
  /** Product comments, one per document the card prints on (prototype `DOCS`). */
  notes: z.object({
    art: z.string().max(2000),
    mfg: z.string().max(2000),
    invoice: z.string().max(2000),
    ack: z.string().max(2000),
    packing: z.string().max(2000),
  }),
  /** Per-unit prices the rep sets on the card (prototype "Set the prices"). */
  artPrice: z.number().finite().nonnegative(),
  decorationPrice: z.number().finite().nonnegative(),
  adderPrice: z.number().finite().nonnegative(),
  retailPrice: z.number().finite().nonnegative(),
  shipExact: z.boolean(),
  /** Order line details. Empty means the header's value applies. */
  shipDate: z.string(),
  po: z.string().max(120),
  shipIndicator: z.enum(['SIP', 'NB']),
  notBefore: z.string(),
  shipVia: z.string(),
  inHandsDate: z.string(),
  eventName: z.string().max(120),
  discountCode: z.string().max(60),
  shipCode: z.string().max(60),
});

export const SHIP_VIA_OPTIONS = [
  'Ground',
  '3rd day',
  '2nd day',
  'Next day',
  'Next day early',
  '2nd day early',
] as const;

export type DraftProduct = z.infer<typeof draftProductSchema>;

/**
 * The `custom.draft_order_line_item_products` JSON: one entry per Step-3 card,
 * identified by `lineId` (unique per card) and `selectedProductId`, with one
 * object per section.
 */
export const draftOrderLineItemProductsSchema = z.object({
  draftOrderLineItems: z.array(
    z.object({
      lineId: z.string().min(1),
      /** Cards grouped under one garment bundle share this id; older saves lack it. */
      cardId: z.string().default(''),
      selectedProductId: z.string().min(1),
      /** The mark the brief belongs to; '' when the card has no art. */
      selectedArtId: z.string().default(''),
      lineNumber: z.number().int().positive(),
      brief: z.object({
        art_placement: z.string(),
        art_size: z.string(),
        art_process_method: z.string(),
        art_process_code: z.string(),
        art_refer_type: z.enum(['', 'art', 'file']),
        art_refer_to: z.string(),
        art_comment: z.string(),
      }),
      art_ink_mode: z.enum(['sequence', 'artist']),
      artInk: z.object({
        art_inks: z.array(z.string()),
        art_artist_choice: z.enum(DRAFT_ART_ARTIST_CHOICES),
        art_swaps: z.array(z.object({omit: z.string(), add: z.string()})),
      }),
      setprices: z.object({
        price_art: z.number().nonnegative(),
        price_decoration: z.number().nonnegative(),
        price_adder: z.number().nonnegative(),
        price_retail: z.number().nonnegative(),
      }),
      productComment: z.object({
        art_notes: z.string(),
        manufacturing_instructions: z.string(),
        ack_print_comments: z.string(),
        invoice_print_comments: z.string(),
        shipping_instructions: z.string(),
      }),
      lineDetails: z.object({
        ship_date: z.string(),
        ship_indicator: z.enum(['SIP', 'NB']),
        ship_via: z.string(),
        not_before: z.string(),
        in_hands_date: z.string(),
        event_name: z.string(),
        discount_code: z.string(),
        ship_code: z.string(),
        po_no: z.string(),
        ship_exact: z.boolean(),
      }),
    }),
  ).max(100),
});

export type DraftOrderLineItemProducts = z.infer<
  typeof draftOrderLineItemProductsSchema
>;

/**
 * Defaults for every `DraftProduct` field beyond the catalog identity
 * (notes/pricing/"Order line details") — shared by the client session
 * hydration in `lib/draft-products.ts` and the server catalog loader in
 * `lib/product/draft-products.server.ts` so the two never drift apart.
 * Returns a fresh object each call so `notes` is never shared by reference
 * across products.
 */
/**
 * Fills the fields added after a line was saved: the line's defaults, and each mark's brief.
 * Session drafts and the persisted products both pass through here, so older rows still load.
 */
export function normalizeDraftProduct(product: object): DraftProduct {
  const saved = product as Partial<DraftProduct>;
  return {
    ...createDraftProductLineDefaults(),
    ...saved,
    arts: (saved.arts ?? []).map((art) => ({
      ...createDraftArt(art, ''),
      ...art,
    })),
  } as DraftProduct;
}

export function createDraftProductLineDefaults(): Omit<
  DraftProduct,
  'id' | 'sourceProductId' | 'cardId' | 'lineNumber' | 'blank' | 'name' | 'brand' | 'image' | 'productType' | 'minimumQuantity' | 'variants'
> {
  return {
    placements: [],
    decorationMethods: [],
    arts: [],
    notes: {art: '', mfg: '', invoice: '', ack: '', packing: ''},
    artPrice: 0,
    decorationPrice: 0,
    adderPrice: 0,
    retailPrice: 0,
    shipExact: false,
    shipDate: '',
    po: '',
    shipIndicator: 'SIP',
    notBefore: '',
    shipVia: '',
    inHandsDate: '',
    eventName: '',
    discountCode: '',
    shipCode: '',
  };
}
