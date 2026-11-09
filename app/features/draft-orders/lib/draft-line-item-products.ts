import type {
  DraftOrderLineItemProducts,
  DraftProduct,
} from '../schemas/draft-product.schema';

const money = (value: number) => (Number.isFinite(value) ? value : 0);

/**
 * Step-3 cards as the single `custom.draft_order_line_item_products` value: one
 * object per card (`lineId` is unique, `selectedProductId` is the catalog
 * product), one key per section. Built in the browser from the zustand store and
 * sent with the save, so the network payload already has this shape.
 *
 * The shape holds one brief per card, so only the first mark's brief is carried.
 * ❓ TO CONFIRM — Celigo's mapping is open; keys mirror the UI sections.
 */
export function buildDraftOrderLineItemProducts(
  products: DraftProduct[],
): DraftOrderLineItemProducts {
  return {
    draftOrderLineItems: products.map((product, index) => {
      const art = product.arts[0];

      return {
        lineId: product.id,
        cardId: product.cardId ?? product.id,
        selectedProductId: product.sourceProductId ?? product.id,
        selectedArtId: art?.id ?? '',
        lineNumber: product.lineNumber ?? index + 1,
        brief: {
          art_placement: art?.placement ?? '',
          art_size: art?.artSize ?? '',
          art_process_method: art?.process ?? '',
          art_process_code: art?.processCode ?? '',
          art_refer_type: art?.referType ?? '',
          art_refer_to: art?.referTo ?? '',
          art_comment: art?.message ?? '',
        },
        art_ink_mode: art?.inkMode ?? 'sequence',
        artInk: {
          art_inks: art?.inks ?? [],
          art_artist_choice: art?.artistChoice ?? 'colour-coordinate',
          art_swaps: art?.swaps ?? [],
        },
        setprices: {
          price_art: money(product.artPrice),
          price_decoration: money(product.decorationPrice),
          price_adder: money(product.adderPrice),
          price_retail: money(product.retailPrice),
        },
        productComment: {
          art_notes: product.notes.art,
          manufacturing_instructions: product.notes.mfg,
          ack_print_comments: product.notes.ack,
          invoice_print_comments: product.notes.invoice,
          shipping_instructions: product.notes.packing,
        },
        lineDetails: {
          ship_date: product.shipDate,
          ship_indicator: product.shipIndicator,
          ship_via: product.shipVia,
          not_before: product.notBefore,
          in_hands_date: product.inHandsDate,
          event_name: product.eventName,
          discount_code: product.discountCode,
          ship_code: product.shipCode,
          po_no: product.po,
          ship_exact: product.shipExact,
        },
      };
    }),
  };
}
