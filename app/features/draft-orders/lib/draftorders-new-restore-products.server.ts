import type {z} from 'zod';
import {
  createDraftArt,
  draftOrderLineItemProductsSchema,
  normalizeDraftProduct,
  type CatalogArt,
  type DraftProduct,
} from '~/features/draft-orders/schemas/draft-product.schema';
import type {loadDraftResponseSchema} from '~/features/draft-orders/schemas/draft-orders-admin.schema';
import {createLogger} from '~/lib/logger';
import {getSelectedDraftArts} from '~/lib/product/draft-arts.server';
import {getSelectedDraftProducts} from '~/lib/product/draft-products.server';
import type {ProductsLoaderContext} from '~/lib/product/product.server';
import {getCustomAttribute} from './draftorders-new-parse.server';

const log = createLogger('routes.draftorders.new.restore');

type LoadedDraft = NonNullable<z.infer<typeof loadDraftResponseSchema>['node']>;

/**
 * Rebuilds the Step-3 cards of a saved draft: the card-wise JSON supplies every
 * section, the catalog supplies the garment and art, and the draft's own lines
 * supply the quantities. The catalog is the source for names, images, prices and
 * size runs, so those are never read from the saved JSON.
 *
 * Returns [] when nothing can be restored, which is the same as a draft saved
 * before this metafield existed. Only the first mark per card is saved, so a
 * restored card carries at most one art.
 */
export async function restoreDraftProducts(
  draft: Pick<LoadedDraft, 'lineItemProducts' | 'lineItems'>,
  context: ProductsLoaderContext,
): Promise<DraftProduct[]> {
  const raw = draft.lineItemProducts?.value;
  if (!raw) return [];

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    log.warn('Saved line-item products are not valid JSON');
    return [];
  }
  const saved = draftOrderLineItemProductsSchema.safeParse(json);
  if (!saved.success) {
    log.warn('Saved line-item products did not match the schema', {
      issues: saved.error.issues.map((issue) => issue.path.join('.')),
    });
    return [];
  }
  const entries = saved.data.draftOrderLineItems;
  if (!entries.length) return [];

  if (draft.lineItems?.pageInfo.hasNextPage) {
    log.warn('Draft has more lines than were loaded; later quantities are lost');
  }

  const garmentIds = entries.map((entry) => entry.selectedProductId);
  const artIds = entries.map((entry) => entry.selectedArtId).filter(Boolean);

  let garments: DraftProduct[] = [];
  try {
    garments = await getSelectedDraftProducts(garmentIds, context);
  } catch (error) {
    log.warn('Saved garments are no longer in the catalog; nothing restored', {
      cause: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
  let arts: CatalogArt[] = [];
  try {
    arts = await getSelectedDraftArts(artIds, context);
  } catch (error) {
    log.warn('Saved arts are no longer in the catalog; restoring without them', {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
  const garmentById = new Map(garments.map((garment) => [garment.id, garment]));
  const artById = new Map(arts.map((art) => [art.id, art]));

  // Each saved line names its card in `utx_line_id`, so two cards built from the
  // same product keep their own quantities.
  const lineIds = new Set(entries.map((entry) => entry.lineId));
  const quantities = new Map<string, number>();
  for (const line of draft.lineItems?.nodes ?? []) {
    const lineId = getCustomAttribute(line.customAttributes, 'utx_line_id');
    const size = getCustomAttribute(line.customAttributes, 'utx_size');
    if (!lineId || !size || !lineIds.has(lineId)) continue;
    const key = `${lineId}|${size}`;
    quantities.set(key, (quantities.get(key) ?? 0) + line.quantity);
  }

  const cardSizes = new Map<string, number>();
  for (const entry of entries) {
    const cardId = entry.cardId || entry.lineId;
    cardSizes.set(cardId, (cardSizes.get(cardId) ?? 0) + 1);
  }

  return entries.flatMap((entry): DraftProduct[] => {
    const garment = garmentById.get(entry.selectedProductId);
    if (!garment) return [];

    const cardId = entry.cardId || entry.lineId;
    const art = artById.get(entry.selectedArtId);

    return [
      normalizeDraftProduct({
        ...garment,
        id: entry.lineId,
        sourceProductId: entry.selectedProductId,
        cardId,
        lineNumber: entry.lineNumber,
        blank: (cardSizes.get(cardId) ?? 0) > 1,
        variants: garment.variants.map((variant) => ({
          ...variant,
          quantity: quantities.get(`${entry.lineId}|${variant.size}`) ?? 0,
        })),
        arts: art
          ? [
              {
                ...createDraftArt(art, garment.decorationMethods[0] ?? ''),
                placement: entry.brief.art_placement,
                artSize: entry.brief.art_size,
                process: entry.brief.art_process_method,
                processCode: entry.brief.art_process_code,
                referType: entry.brief.art_refer_type,
                referTo: entry.brief.art_refer_to,
                message: entry.brief.art_comment,
                inkMode: entry.art_ink_mode,
                inks: entry.artInk.art_inks,
                artistChoice: entry.artInk.art_artist_choice,
                swaps: entry.artInk.art_swaps,
              },
            ]
          : [],
        notes: {
          art: entry.productComment.art_notes,
          mfg: entry.productComment.manufacturing_instructions,
          invoice: entry.productComment.invoice_print_comments,
          ack: entry.productComment.ack_print_comments,
          packing: entry.productComment.shipping_instructions,
        },
        artPrice: entry.setprices.price_art,
        decorationPrice: entry.setprices.price_decoration,
        adderPrice: entry.setprices.price_adder,
        retailPrice: entry.setprices.price_retail,
        shipExact: entry.lineDetails.ship_exact,
        shipDate: entry.lineDetails.ship_date,
        po: entry.lineDetails.po_no,
        shipIndicator: entry.lineDetails.ship_indicator,
        notBefore: entry.lineDetails.not_before,
        shipVia: entry.lineDetails.ship_via,
        inHandsDate: entry.lineDetails.in_hands_date,
        eventName: entry.lineDetails.event_name,
        discountCode: entry.lineDetails.discount_code,
        shipCode: entry.lineDetails.ship_code,
      }),
    ];
  });
}
