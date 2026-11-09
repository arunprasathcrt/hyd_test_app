export const ORDER_BRANDS = ['underArmour', 'champion', 'other'] as const;
export type OrderBrand = (typeof ORDER_BRANDS)[number];

export const ORDER_STATUSES = [
  'pendingProof',
  'inProduction',
  'shipped',
  'delivered',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  brand: Exclude<OrderBrand, 'other'>;
  po: string;
  account: string;
  initials: string;
  shipTo: string;
  city: string;
  placed: string;
  shipBy: string;
  status: OrderStatus;
  total: number;
  locked?: boolean;
}

export type BrandFilter = 'all' | OrderBrand;
export type StatusFilter = 'all' | OrderStatus;
