import type {DraftProduct} from '../schemas/draft-product.schema';
import type {
  DraftOrderListBrand,
  DraftOrderListItem,
  DraftOrderListLine,
} from '../types/draft-order';
import type {NewDraftOrderValues, NewDraftOrderView} from '../types/new-draft-order';

/** Vendor names the builder's brand picker uses, by list brand code. */
const BRAND_VENDORS: Record<DraftOrderListBrand, string | null> = {
  ua: 'Under Armour',
  champion: 'Champion',
  lululemon: 'Lululemon',
  other: null,
};

/**
 * ❓ TO CONFIRM: a list row only has each config's name, color, units and
 * amount, so sizes are unknown. Each config becomes one product with a single
 * "One size" variant, priced so units × price matches the row's amount.
 */
export function draftProductsFromListItem(item: DraftOrderListItem): DraftProduct[] {
  return draftProductsFromLines(item.lines ?? [], BRAND_VENDORS[item.brands[0]] ?? '');
}

/** One builder product per list config; `brand` is the vendor name the picker uses. */
export function draftProductsFromLines(
  lines: DraftOrderListLine[],
  brand: string,
): DraftProduct[] {
  return lines.map((line, index) => {
    const price = line.units ? Math.round((line.amount / line.units) * 100) / 100 : 0;
    const sizes = line.sizes?.length
      ? line.sizes
      : [{size: 'One size', quantity: line.units}];

    return {
    id: line.id,
    lineNumber: index + 1,
    name: line.name,
    brand,
    image: line.image ?? '',
    productType: 'garment',
    minimumQuantity: 0,
    variants: sizes.map(({size, quantity}) => ({
      id: `${line.id}|${size}`,
      title: `${line.color} / ${size}`,
      sku: line.sku ?? '',
      price,
      size,
      color: line.color,
      quantity,
    })),
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
  });
}

/**
 * Builder values that can be recovered from a list row: the customer (matched
 * by name), brands and description. The rest keeps the form's defaults.
 */
export function draftValuesFromListItem(
  item: DraftOrderListItem,
  view: NewDraftOrderView,
): Partial<NewDraftOrderValues> {
  const customer = view.customers.find(
    (candidate) => candidate.name.toLowerCase() === item.customer.toLowerCase(),
  );

  const brands = item.brands.flatMap((code) => {
    const vendor = BRAND_VENDORS[code]?.toLowerCase();
    const match = view.availableBrands.find(
      (available) => available.toLowerCase() === vendor,
    );
    return match ? [match] : [];
  });

  return {
    ...(customer ? {customerId: customer.id} : {}),
    ...(brands.length ? {brands} : {}),
    orderName: item.description ?? '',
    description: item.description ?? '',
  };
}
