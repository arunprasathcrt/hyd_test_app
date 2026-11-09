import type {DraftProduct} from '~/features/draft-orders/schemas/draft-product.schema';
import {getProductUnitPrice} from './draft-products';

export interface DraftOrderLineItemInput {
  title: string;
  quantity: number;
  originalUnitPrice: string;
  taxable: boolean;
  customAttributes: {key: string; value: string}[];
}

/**
 * Builds one Shopify draft order line item per size with a quantity > 0.
 *
 * ❓ TO CONFIRM — these are sent as Shopify "custom" line items (title +
 * price), never `variantId`. The catalog model (`features/products/schemas/
 * product.schema.ts`) only carries a size *run* of string labels and the
 * first variant's SKU — it never resolves or keeps a per-size `ProductVariant`
 * GID — so there is no real variant to attach these lines to today. Shopify
 * will not reserve or decrement live inventory for a custom line item;
 * wiring real `variantId`s requires the catalog loader to resolve and carry
 * one GID per size, which is a separate, larger change.
 */
export function buildDraftOrderLineItems(
  products: DraftProduct[],
): DraftOrderLineItemInput[] {
  const lines: DraftOrderLineItemInput[] = [];

  for (const product of products) {
    const unitPrice = getProductUnitPrice(product);
    for (const variant of product.variants) {
      if (variant.quantity <= 0) continue;

      const attribute = (key: string, value: string) => ({key, value});
      const customAttributes = [
        attribute('utx_sku', variant.sku),
        attribute('utx_size', variant.size),
        attribute('utx_color', variant.color),
        attribute('utx_brand', product.brand),
        attribute('utx_product_type', product.productType),
        attribute('utx_product_id', product.sourceProductId ?? product.id),
        attribute('utx_line_id', product.id),
      ].filter((entry) => entry.value.trim().length > 0);

      lines.push({
        title: [product.name, variant.color, variant.size]
          .filter(Boolean)
          .join(' · '),
        quantity: variant.quantity,
        originalUnitPrice: unitPrice.toFixed(2),
        taxable: true,
        customAttributes,
      });
    }
  }

  return lines;
}
