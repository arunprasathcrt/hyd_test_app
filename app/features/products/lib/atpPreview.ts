import type {Product} from '../schemas/product.schema';

export interface AtpSizeRow {
  size: string;
  onHand: number;
  committed: number;
  atp: number;
  bar: number;
}

export interface AtpIncomingOrder {
  date: string;
  po: string;
  units: number;
}

export interface AtpDrawerItem {
  name: string;
  sku: string;
  brand: string;
  color?: string;
  imageUrl: string;
  availability: string;
  segment?: string;
  totalAtp: number;
  moq: number;
  sizes: AtpSizeRow[];
  incoming: AtpIncomingOrder[];
  weeks: number[];
}

const SAMPLE_SIZE_STOCK: AtpSizeRow[] = [
  {size: 'XXS', onHand: 227, committed: 55, atp: 172, bar: 76},
  {size: 'XS', onHand: 120, committed: 35, atp: 85, bar: 71},
  {size: 'S', onHand: 326, committed: 100, atp: 226, bar: 69},
  {size: 'M', onHand: 92, committed: 24, atp: 68, bar: 74},
  {size: 'L', onHand: 155, committed: 44, atp: 111, bar: 72},
  {size: 'XL', onHand: 166, committed: 85, atp: 81, bar: 49},
  {size: '2XL', onHand: 222, committed: 104, atp: 118, bar: 53},
];

const SAMPLE_INCOMING: AtpIncomingOrder[] = [
  {date: 'Oct 5', po: 'PO-4278', units: 286},
  {date: 'Oct 26', po: 'PO-6054', units: 207},
];

export function createAtpPreviewItem(product: Product): AtpDrawerItem {
  return {
    name: product.name,
    sku: product.sku,
    brand: product.brand,
    color: product.colorName || undefined,
    imageUrl: product.image,
    availability: product.availability,
    segment: product.gender || undefined,
    totalAtp: 861,
    moq: product.moq ?? 48,
    sizes: SAMPLE_SIZE_STOCK,
    incoming: SAMPLE_INCOMING,
    weeks: [29, 29, 39, 39, 39, 46],
  };
}
