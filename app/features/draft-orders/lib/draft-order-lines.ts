import {
  DRAFT_ORDER_LINE_ATTRIBUTE_KEYS,
  DRAFT_ORDER_LINE_TITLE_SEPARATOR,
} from '~/shared/constants/metafields';
import type {DraftOrderListLine} from '../types/draft-order';

/** The slice of a Shopify draft order line item the expanded row needs. */
export interface DraftOrderLineNode {
  id: string;
  title?: string | null;
  variantTitle?: string | null;
  sku?: string | null;
  quantity: number;
  variant?: {
    id: string;
    selectedOptions: Array<{name: string; value: string}>;
    product: {id: string};
  } | null;
  image?: {url: string} | null;
  originalUnitPriceSet?: {shopMoney: {amount: string} | null} | null;
  customAttributes: Array<{key: string; value?: string | null}>;
}

const optionValue = (node: DraftOrderLineNode, name: string) =>
  node.variant?.selectedOptions
    .find((option) => option.name.toLowerCase() === name)
    ?.value.trim() ?? '';

const attributeValue =(node: DraftOrderLineNode, key: string) =>
  node.customAttributes.find((attribute) => attribute.key === key)?.value?.trim() ?? '';

/**
 * The builder saves one Shopify line per size, so the expanded row folds them
 * back into one config per product + colour: units and amount are summed and
 * each size's quantity is kept for the CSV export.
 *
 * Served via: native (title, quantity, price, image) + line custom attributes
 * (`utx_*`). The placeholder line the builder adds to hold the customer is skipped.
 *
 * ❓ TO CONFIRM: `sendState` is always `notSent` and `orderRef` / `approvedOn`
 * are never set — no confirmed source yet (workflow metaobject / convert metafield).
 */
export function mapDraftOrderLines(nodes: DraftOrderLineNode[]): DraftOrderListLine[] {
  const configs = new Map<string, DraftOrderListLine>();

  for (const node of nodes) {
    if (attributeValue(node, DRAFT_ORDER_LINE_ATTRIBUTE_KEYS.placeholder) === 'true') continue;

    const title = node.title ?? '';
    // Builder custom lines carry `utx_*` attributes; lines added in Shopify
    // admin are real variants, so fall back to the variant's options.
    const color =
      attributeValue(node, DRAFT_ORDER_LINE_ATTRIBUTE_KEYS.color) || optionValue(node, 'color');
    const size =
      attributeValue(node, DRAFT_ORDER_LINE_ATTRIBUTE_KEYS.size) || optionValue(node, 'size');
    const productId =
      attributeValue(node, DRAFT_ORDER_LINE_ATTRIBUTE_KEYS.productId) ||
      (node.variant?.product.id ?? '');
    const sku = attributeValue(node, DRAFT_ORDER_LINE_ATTRIBUTE_KEYS.sku) || (node.sku ?? '');
    const name = title.split(DRAFT_ORDER_LINE_TITLE_SEPARATOR)[0] || title;
    const amount =
      node.quantity * Number(node.originalUnitPriceSet?.shopMoney?.amount ?? 0);

    // A custom line without builder attributes stands alone.
    const key = productId ? `${productId}|${color}` : node.id;
    const existing = configs.get(key);

    if (existing) {
      existing.units += node.quantity;
      existing.amount += amount;
      if (size) existing.sizes = [...(existing.sizes ?? []), {size, quantity: node.quantity}];
      existing.image ??= node.image?.url;
      continue;
    }

    configs.set(key, {
      id: node.id,
      name,
      color,
      units: node.quantity,
      amount,
      sendState: 'notSent',
      image: node.image?.url,
      sku: sku || undefined,
      sizes: size ? [{size, quantity: node.quantity}] : undefined,
    });
  }

  return [...configs.values()];
}
