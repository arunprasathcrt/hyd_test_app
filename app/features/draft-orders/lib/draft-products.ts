import type {DraftProduct} from '../schemas/draft-product.schema';
import {normalizeDraftProduct} from '../schemas/draft-product.schema';
import {newDraftOrderValuesSchema} from '../schemas/new-draft-order.schema';
import type {NewDraftOrderValues} from '../types/new-draft-order';

const DRAFT_SESSION_KEY = 'dtx:new-draft-order:v1';
const DRAFT_ID_SESSION_KEY = 'dtx:new-draft-order:draftId';

/** Survives the round trip to Products even if the return URL drops `?draftId=`. */
export function readDraftIdSession(): string | null {
  try {
    return sessionStorage.getItem(DRAFT_ID_SESSION_KEY);
  } catch {
    return null;
  }
}

export function writeDraftIdSession(draftId: string | null): void {
  try {
    if (draftId) sessionStorage.setItem(DRAFT_ID_SESSION_KEY, draftId);
    else sessionStorage.removeItem(DRAFT_ID_SESSION_KEY);
  } catch {
    // Session storage is unavailable; the URL param remains the fallback.
  }
}

/** Drafts saved before the per-document notes and line details existed get empty values. */
function withLineDefaults(draft: unknown): unknown {
  if (!draft || typeof draft !== 'object') return draft;
  const record = draft as {products?: unknown};
  if (!Array.isArray(record.products)) return draft;
  return {
    ...record,
    products: (record.products as Record<string, unknown>[]).map(normalizeDraftProduct),
  };
}

export function readDraftSession(): NewDraftOrderValues | null {
  try {
    const saved = sessionStorage.getItem(DRAFT_SESSION_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved) as Record<string, unknown>;
    const migrated = {
      ...parsed,
      inHandsDateManual:
        typeof parsed.inHandsDateManual === 'boolean'
          ? parsed.inHandsDateManual
          : true,
    };
    const result = newDraftOrderValuesSchema.safeParse(
      withLineDefaults(migrated),
    );
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function writeDraftSession(values: NewDraftOrderValues): boolean {
  try {
    sessionStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(values));
    return true;
  } catch {
    return false;
  }
}

export function getProductQuantity(product: DraftProduct): number {
  return product.variants.reduce(
    (total, variant) => total + variant.quantity,
    0,
  );
}

/** The garment half of a line: each size at its own list price. */
export function getProductGarments(product: DraftProduct): number {
  return (
    product.variants.reduce(
      (total, variant) =>
        total + Math.round(variant.price * 100) * variant.quantity,
      0,
    ) / 100
  );
}

/** The per-unit garment price: the line's average, or the first size's list price with no units yet. */
export function getProductGarmentUnit(product: DraftProduct): number {
  const quantity = getProductQuantity(product);
  return quantity > 0
    ? Math.round((getProductGarments(product) / quantity) * 100) / 100
    : (product.variants[0]?.price ?? 0);
}

/** Unit total: garment, art, decoration and adder, per unit. */
export function getProductUnitPrice(product: DraftProduct): number {
  return (
    Math.round(
      (getProductGarmentUnit(product) +
        product.artPrice +
        product.decorationPrice +
        product.adderPrice) *
        100,
    ) / 100
  );
}

export function getProductSubtotal(product: DraftProduct): number {
  const quantity = getProductQuantity(product);
  const extras =
    Math.round(
      (product.artPrice + product.decorationPrice + product.adderPrice) * 100,
    ) * quantity;
  return (Math.round(getProductGarments(product) * 100) + extras) / 100;
}

export function getDraftTotals(products: DraftProduct[], taxRate: number) {
  const cents = (value: number) => Math.round(value * 100);
  const units = products.reduce(
    (total, product) => total + getProductQuantity(product),
    0,
  );
  const garments =
    products.reduce(
      (total, product) => total + cents(getProductGarments(product)),
      0,
    ) / 100;
  const art =
    products.reduce(
      (total, product) =>
        total + cents(product.artPrice) * getProductQuantity(product),
      0,
    ) / 100;
  const decoration =
    products.reduce(
      (total, product) =>
        total +
        (cents(product.decorationPrice) + cents(product.adderPrice)) *
          getProductQuantity(product),
      0,
    ) / 100;
  const subtotal =
    products.reduce(
      (total, product) => total + cents(getProductSubtotal(product)),
      0,
    ) / 100;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  return {
    units,
    garments,
    decoration,
    art,
    subtotal,
    tax,
    total: Math.round((subtotal + tax) * 100) / 100,
  };
}

export function getDraftCards(products: DraftProduct[]) {
  const cards = new Map<string, DraftProduct[]>();
  for (const product of products) {
    const id = product.cardId ?? product.id;
    const garments = cards.get(id) ?? [];
    garments.push(product);
    cards.set(id, garments);
  }
  return [...cards].map(([id, garments]) => ({id, products: garments}));
}

export function productsAreComplete(products: DraftProduct[]): boolean {
  return (
    products.length > 0 &&
    products.every((product) => getProductQuantity(product) > 0) &&
    getDraftCards(products).every(
      (card) =>
        card.products.reduce(
          (sum, product) => sum + getProductQuantity(product),
          0,
        ) >=
        Math.max(...card.products.map((product) => product.minimumQuantity)),
    )
  );
}

/** Re-selecting a product retains quantities and comments already entered. */
export function mergeDraftProducts(
  existing: DraftProduct[],
  selected: DraftProduct[],
): DraftProduct[] {
  const existingIds = new Set(existing.map((product) => product.id));
  return [
    ...existing,
    ...selected.filter((product) => !existingIds.has(product.id)),
  ];
}

export interface SpreadRow {
  variantId: string;
  size: string;
  now: number;
  add: number;
  next: number;
}

/**
 * Prototype `spread`: spread `units` over a garment's sizes in proportion to
 * its size run. The largest remainders take the odd units; a garment with no
 * sizes entered yet takes an even split across all its sizes.
 */
export function spreadUnits(product: DraftProduct, units: number): SpreadRow[] {
  const n = Math.max(0, Math.round(units));
  let keyed = product.variants.filter((variant) => variant.quantity > 0);
  if (!keyed.length) keyed = product.variants;
  const weight = (variant: DraftProduct['variants'][number]) =>
    variant.quantity > 0 ? variant.quantity : 1;
  const total = keyed.reduce((sum, variant) => sum + weight(variant), 0);
  const added = new Map<string, number>();
  let left = n;
  const remainders = keyed.map((variant, order) => {
    const exact = total ? (n * weight(variant)) / total : 0;
    const whole = Math.floor(exact + 1e-9);
    added.set(variant.id, whole);
    left -= whole;
    return {
      id: variant.id,
      rest: exact - whole,
      weight: weight(variant),
      order,
    };
  });
  remainders.sort(
    (a, b) => b.rest - a.rest || b.weight - a.weight || a.order - b.order,
  );
  for (
    let turn = 0;
    left > 0 && remainders.length;
    turn = (turn + 1) % remainders.length
  ) {
    const id = remainders[turn].id;
    added.set(id, (added.get(id) ?? 0) + 1);
    left -= 1;
  }
  return product.variants
    .filter((variant) => added.has(variant.id) || variant.quantity > 0)
    .map((variant) => {
      const add = added.get(variant.id) ?? 0;
      return {
        variantId: variant.id,
        size: variant.size,
        now: variant.quantity,
        add,
        next: variant.quantity + add,
      };
    });
}

/** Apply a `spreadUnits` result to the product. */
export function applyTopUp(
  product: DraftProduct,
  rows: SpreadRow[],
): DraftProduct {
  const next = new Map(rows.map((row) => [row.variantId, row.next]));
  return {
    ...product,
    variants: product.variants.map((variant) =>
      next.has(variant.id)
        ? {...variant, quantity: Math.min(99999, next.get(variant.id)!)}
        : variant,
    ),
  };
}
