import type {Order, OrderBrand, OrderStatus} from '../types/order';

export const ORDERS: Order[] = [
  {id: 'ORD-9841', brand: 'underArmour', po: 'PB-2025-0428', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Main Pro Shop', city: 'Pebble Beach, CA', placed: 'Apr 28', shipBy: 'May 6', status: 'inProduction', total: 14200, locked: true},
  {id: 'ORD-9802', brand: 'champion', po: 'UM-2025-0427', account: 'U of M Athletics', initials: 'UM', shipTo: 'M Den · Main', city: 'Ann Arbor, MI', placed: 'Apr 27', shipBy: 'May 4', status: 'shipped', total: 11750, locked: true},
  {id: 'ORD-9788', brand: 'underArmour', po: 'VM-2025-0425', account: 'Vail Mountain Resort', initials: 'VM', shipTo: 'Lionshead Village', city: 'Vail, CO', placed: 'Apr 25', shipBy: 'May 12', status: 'pendingProof', total: 2100},
  {id: 'ORD-9620', brand: 'underArmour', po: 'PB-2025-0415', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Main Pro Shop', city: 'Pebble Beach, CA', placed: 'Apr 15', shipBy: 'Apr 30', status: 'shipped', total: 1890, locked: true},
  {id: 'ORD-9540', brand: 'underArmour', po: 'UM-2025-0320', account: 'U of M Athletics', initials: 'UM', shipTo: 'M Den · Stadium', city: 'Ann Arbor, MI', placed: 'Mar 20', shipBy: 'Apr 5', status: 'shipped', total: 14200, locked: true},
  {id: 'ORD-9860', brand: 'underArmour', po: 'SC-2025-0502', account: 'Scheels All Sports', initials: 'SC', shipTo: 'Chandler Store', city: 'Chandler, AZ', placed: 'May 2', shipBy: 'May 30', status: 'inProduction', total: 31200, locked: true},
  {id: 'ORD-9855', brand: 'underArmour', po: 'DS-2025-0504', account: "Dick's Sporting Goods", initials: 'DS', shipTo: 'Event Storage', city: 'Pittsburgh, XX', placed: 'May 4', shipBy: 'May 18', status: 'shipped', total: 58400, locked: true},
  {id: 'ORD-9848', brand: 'underArmour', po: 'FN-2025-0430', account: 'Fanatics', initials: 'FN', shipTo: 'Main Office', city: 'Jacksonville, XX', placed: 'Apr 30', shipBy: 'May 28', status: 'pendingProof', total: 28800},
  {id: 'ORD-9835', brand: 'underArmour', po: 'FB-2025-0501', account: 'Fort Bragg Exchange', initials: 'FB', shipTo: 'Main Exchange', city: 'Fort Bragg, NC', placed: 'May 1', shipBy: 'May 22', status: 'inProduction', total: 14400, locked: true},
  {id: 'ORD-9810', brand: 'champion', po: 'CP-2025-0422', account: 'Camp Pendleton Exchange', initials: 'CP', shipTo: 'Main Office', city: 'Oceanside, XX', placed: 'Apr 22', shipBy: 'May 10', status: 'shipped', total: 9600, locked: true},
  {id: 'ORD-9870', brand: 'underArmour', po: 'OL-2025-0503', account: 'On the Lam', initials: 'OL', shipTo: 'OTL HQ', city: 'Burleson, TX', placed: 'May 3', shipBy: 'May 24', status: 'inProduction', total: 52400, locked: true},
  {id: 'ORD-9865', brand: 'underArmour', po: 'OC-2025-0429', account: 'On the Lam — Creator Partners', initials: 'OC', shipTo: 'Main Office', city: 'Burleson, XX', placed: 'Apr 29', shipBy: 'May 25', status: 'pendingProof', total: 36100},
  {id: 'ORD-9000', brand: 'underArmour', po: 'BBLE-2025-0540', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Main Pro Shop', city: 'Pebble Beach, CA', placed: 'Mar 25', shipBy: 'May 16', status: 'delivered', total: 8370, locked: true},
];

export const ORDER_BRAND_COUNTS: ReadonlyArray<{brand: OrderBrand | 'all'; count: number}> = [
  {brand: 'all', count: 183},
  {brand: 'underArmour', count: 137},
  {brand: 'champion', count: 46},
  {brand: 'other', count: 0},
];

export const ORDER_STATUS_FILTERS: ReadonlyArray<OrderStatus | 'all'> = [
  'all',
  'pendingProof',
  'inProduction',
  'shipped',
];
