import {ORDERS} from '../app/features/orders/lib/orders';
import type {Order, OrderStatus} from '../app/features/orders/types/order';
import type {
  OrderDetail,
  OrderDetailStatus,
  OrderStep,
  OtherOrder,
  StepKey,
} from '../app/features/orders/types/order-detail';

const FINISHING = 'Pre-price ticket, fold and poly bag';
const SIZE_KEYS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
const sizes = (qtys: number[]) => qtys.map((qty, index) => ({size: SIZE_KEYS[index], qty}));

const TEMPLATE_MOCKS: Record<string, OrderDetail> = {
  'ORD-9125': {
    id: 'ORD-9125',
    erpId: 'NS-97126',
    status: 'production',
    channel: 'EDI',
    invoiced: false,
    account: "Dick's Sporting Goods",
    program: 'Fall 2026 store opening set',
    po: 'ICKS-2025-0420',
    contact: 'Jay Torres',
    placed: '2026-09-05',
    brands: 'Champion + Under Armour',
    rep: 'Marcus Powell',
    shipTo: {name: 'Main Office', city: 'Pittsburgh, XX 00000'},
    terms: 'Net 60',
    steps: [
      {key: 'placed', state: 'done', date: '2026-09-05'},
      {key: 'ready', state: 'done', date: '2026-09-12'},
      {key: 'production', state: 'current', date: '2026-09-13'},
      {key: 'shipped', state: 'next', date: '2026-10-05'},
      {key: 'delivered', state: 'later', date: '2026-10-11'},
    ],
    onTrackDate: '2026-10-05',
    criticalPath: [
      {key: 'inventory', state: 'done', date: '2026-09-10'},
      {key: 'art', state: 'done', owner: 'Brenda Mosher', date: '2026-09-11'},
      {key: 'license', state: 'done', owner: 'Trey Ham', date: '2026-09-12'},
      {key: 'production', state: 'active', owner: 'Marcus Bell', date: '2026-09-13'},
      {key: 'pack', state: 'waiting', date: '2026-10-05'},
    ],
    dates: {requestedInHands: '2026-10-11', confirmedShip: '2026-10-05', cancelBy: '2026-10-25'},
    lines: [
      {
        sku: 'CH-SJ-250', brand: 'Champion', name: 'Stadium Full-Zip Jacket', color: 'Black',
        image: 'https://cdn.repspark.net/2/p/aDrgyukcs7SkZIn4LyL_Kon08HB66Axr17z6S9BzVeg/aDrgyukcs7SkZIn4LyL_Kon08HB66Axr17z6S9BzVeg-s_2000x2000',
        art: 'AW-D9125-01', sketch: 'CA-0807-08', placement: 'Left chest · 3.5 in wide',
        decoration: 'embroidery', process: 'X4', colors: ['White', 'Athletic gold'],
        upc: '192942733952', customerSku: 'DIC-984174', finishing: FINISHING, carrier: 'FedEx Ground',
        sizes: sizes([27, 83, 139, 139, 100, 44, 24]),
        garmentUnit: 55, artUnit: 0, decorationUnit: 4.5,
      },
      {
        sku: 'UA-LK-110', brand: 'Under Armour', name: 'Locker 2.0 Tee', color: 'Royal',
        image: 'https://cdn.repspark.net/2/p/wwYyUXQztovoowSPo4GnNpy5xB8_V0iUGkydL6h1q28/wwYyUXQztovoowSPo4GnNpy5xB8_V0iUGkydL6h1q28-s_2000x2000',
        art: 'AW-D9125-02', sketch: 'JY-0807-02', placement: 'Left sleeve · 3 in wide',
        decoration: 'screen_print', process: 'P1', colors: ['Royal', 'Black', 'Silver grey'],
        upc: '198659070304', customerSku: 'DIC-438378', finishing: FINISHING, carrier: 'FedEx Ground',
        sizes: sizes([34, 104, 174, 174, 125, 55, 30]),
        garmentUnit: 22, artUnit: 0, decorationUnit: 4.5,
      },
      {
        sku: 'CH-DH-270', brand: 'Champion', name: 'Champion Dad Hat', color: 'Athletic Royal',
        image: 'https://cdn.repspark.net/2/p/ltAN53tee5G1ky4h53BZwakwHIAtdI8AGUNH358Risc/ltAN53tee5G1ky4h53BZwakwHIAtdI8AGUNH358Risc-s_2000x2000',
        art: 'AW-D9125-03', sketch: 'JY-0806-06', placement: 'Cap front · 2.25 in tall',
        decoration: 'embroidery', process: 'X4', colors: ['Athletic gold', 'Royal', 'Black'],
        upc: '191154045587', customerSku: 'DIC-225569', finishing: FINISHING, carrier: 'FedEx Ground',
        sizes: sizes([89, 268, 447, 447, 322, 143, 73]),
        garmentUnit: 18, artUnit: 0, decorationUnit: 4.5,
      },
    ],
    discount: 0,
    tax: 7581.5,
    internal: {marginRate: 0.38, commissionRate: 0.06, royaltyRate: 0.12, tier: 'A'},
    otherOrders: [
      {id: 'ORD-9123', placed: '2026-09-27', status: 'pending', total: 72480},
      {id: 'ORD-9124', placed: '2026-09-26', status: 'pending', total: 53280},
      {id: 'ORD-9122', placed: '2026-09-19', status: 'hold', holdReason: 'Pricing hold', total: 91200},
    ],
    otherOrdersCount: 3,
    activity: [
      {key: 'production', date: '2026-09-13'},
      {key: 'ready', date: '2026-09-12'},
      {key: 'placed', date: '2026-09-05'},
      {key: 'erpCreated', date: '2026-09-05'},
    ],
  },
};

/*
 * The Orders list reads `ORDERS` (list rows), so every row it links to needs a
 * detail fixture. Rows without a hand-written entry above are derived from the
 * row itself, with line items and critical path borrowed from ORD-9125.
 */
const TEMPLATE = TEMPLATE_MOCKS['ORD-9125'];

/*
 * Earlier orders that are not on the Orders list but belong to the same
 * accounts, so "Other orders for this account" has enough rows to page
 * through with "Load more". Accounts are mixed on purpose: some have more
 * than three other orders, some three or fewer, some none (card hidden).
 */
const ACCOUNT_HISTORY: Order[] = [
  {id: 'ORD-8960', brand: 'underArmour', po: 'PB-2025-0310', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Main Pro Shop', city: 'Pebble Beach, CA', placed: 'Mar 10', shipBy: 'Mar 28', status: 'delivered', total: 6420, locked: true},
  {id: 'ORD-8915', brand: 'champion', po: 'PB-2025-0302', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Spyglass Hill Shop', city: 'Pebble Beach, CA', placed: 'Mar 2', shipBy: 'Mar 20', status: 'delivered', total: 3980, locked: true},
  {id: 'ORD-8870', brand: 'underArmour', po: 'PB-2025-0218', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Main Pro Shop', city: 'Pebble Beach, CA', placed: 'Feb 18', shipBy: 'Mar 6', status: 'delivered', total: 12650, locked: true},
  {id: 'ORD-8822', brand: 'underArmour', po: 'PB-2025-0205', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'The Links Shop', city: 'Pebble Beach, CA', placed: 'Feb 5', shipBy: 'Feb 24', status: 'delivered', total: 2240, locked: true},
  {id: 'ORD-8790', brand: 'champion', po: 'PB-2025-0122', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Main Pro Shop', city: 'Pebble Beach, CA', placed: 'Jan 22', shipBy: 'Feb 10', status: 'delivered', total: 9150, locked: true},
  {id: 'ORD-8992', brand: 'underArmour', po: 'PB-2025-0408', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Spyglass Hill Shop', city: 'Pebble Beach, CA', placed: 'Apr 8', shipBy: 'Apr 29', status: 'inProduction', total: 7380, locked: true},
  {id: 'ORD-8985', brand: 'champion', po: 'PB-2025-0402', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'The Links Shop', city: 'Pebble Beach, CA', placed: 'Apr 2', shipBy: 'Apr 22', status: 'shipped', total: 4510, locked: true},
  {id: 'ORD-8948', brand: 'underArmour', po: 'PB-2025-0317', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Main Pro Shop', city: 'Pebble Beach, CA', placed: 'Mar 17', shipBy: 'Apr 4', status: 'delivered', total: 11240, locked: true},
  {id: 'ORD-8760', brand: 'underArmour', po: 'PB-2025-0112', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Spyglass Hill Shop', city: 'Pebble Beach, CA', placed: 'Jan 12', shipBy: 'Jan 30', status: 'delivered', total: 5860, locked: true},
  {id: 'ORD-8735', brand: 'champion', po: 'PB-2025-0106', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'Main Pro Shop', city: 'Pebble Beach, CA', placed: 'Jan 6', shipBy: 'Jan 24', status: 'delivered', total: 3120, locked: true},
  {id: 'ORD-8712', brand: 'underArmour', po: 'PB-2025-0102', account: 'Pebble Beach Resorts', initials: 'PB', shipTo: 'The Links Shop', city: 'Pebble Beach, CA', placed: 'Jan 2', shipBy: 'Jan 20', status: 'delivered', total: 16480, locked: true},
  {id: 'ORD-8955', brand: 'champion', po: 'UM-2025-0308', account: 'U of M Athletics', initials: 'UM', shipTo: 'M Den · Main', city: 'Ann Arbor, MI', placed: 'Mar 8', shipBy: 'Mar 26', status: 'delivered', total: 8800, locked: true},
  {id: 'ORD-8901', brand: 'underArmour', po: 'UM-2025-0224', account: 'U of M Athletics', initials: 'UM', shipTo: 'M Den · Stadium', city: 'Ann Arbor, MI', placed: 'Feb 24', shipBy: 'Mar 14', status: 'delivered', total: 15320, locked: true},
  {id: 'ORD-8854', brand: 'champion', po: 'UM-2025-0211', account: 'U of M Athletics', initials: 'UM', shipTo: 'M Den · Main', city: 'Ann Arbor, MI', placed: 'Feb 11', shipBy: 'Mar 1', status: 'delivered', total: 4760, locked: true},
  {id: 'ORD-8805', brand: 'underArmour', po: 'UM-2025-0128', account: 'U of M Athletics', initials: 'UM', shipTo: 'M Den · Stadium', city: 'Ann Arbor, MI', placed: 'Jan 28', shipBy: 'Feb 16', status: 'delivered', total: 21900, locked: true},
  {id: 'ORD-8980', brand: 'underArmour', po: 'DS-2025-0414', account: "Dick's Sporting Goods", initials: 'DS', shipTo: 'Event Storage', city: 'Pittsburgh, XX', placed: 'Apr 14', shipBy: 'May 2', status: 'inProduction', total: 44200, locked: true},
  {id: 'ORD-8972', brand: 'champion', po: 'DS-2025-0403', account: "Dick's Sporting Goods", initials: 'DS', shipTo: 'Main Office', city: 'Pittsburgh, XX', placed: 'Apr 3', shipBy: 'Apr 24', status: 'shipped', total: 18750, locked: true},
  {id: 'ORD-8940', brand: 'underArmour', po: 'DS-2025-0319', account: "Dick's Sporting Goods", initials: 'DS', shipTo: 'Event Storage', city: 'Pittsburgh, XX', placed: 'Mar 19', shipBy: 'Apr 8', status: 'delivered', total: 62100, locked: true},
  {id: 'ORD-8905', brand: 'underArmour', po: 'DS-2025-0306', account: "Dick's Sporting Goods", initials: 'DS', shipTo: 'Main Office', city: 'Pittsburgh, XX', placed: 'Mar 6', shipBy: 'Mar 25', status: 'delivered', total: 27400, locked: true},
  {id: 'ORD-8866', brand: 'champion', po: 'DS-2025-0220', account: "Dick's Sporting Goods", initials: 'DS', shipTo: 'Event Storage', city: 'Pittsburgh, XX', placed: 'Feb 20', shipBy: 'Mar 10', status: 'delivered', total: 13980, locked: true},
  {id: 'ORD-8830', brand: 'underArmour', po: 'DS-2025-0207', account: "Dick's Sporting Goods", initials: 'DS', shipTo: 'Main Office', city: 'Pittsburgh, XX', placed: 'Feb 7', shipBy: 'Feb 26', status: 'delivered', total: 35650, locked: true},
  {id: 'ORD-8798', brand: 'underArmour', po: 'DS-2025-0124', account: "Dick's Sporting Goods", initials: 'DS', shipTo: 'Event Storage', city: 'Pittsburgh, XX', placed: 'Jan 24', shipBy: 'Feb 12', status: 'delivered', total: 49800, locked: true},
  {id: 'ORD-8925', brand: 'underArmour', po: 'SC-2025-0312', account: 'Scheels All Sports', initials: 'SC', shipTo: 'Chandler Store', city: 'Chandler, AZ', placed: 'Mar 12', shipBy: 'Apr 1', status: 'delivered', total: 18600, locked: true},
  {id: 'ORD-8840', brand: 'underArmour', po: 'SC-2025-0209', account: 'Scheels All Sports', initials: 'SC', shipTo: 'Chandler Store', city: 'Chandler, AZ', placed: 'Feb 9', shipBy: 'Feb 28', status: 'delivered', total: 9420, locked: true},
  {id: 'ORD-8935', brand: 'underArmour', po: 'FN-2025-0316', account: 'Fanatics', initials: 'FN', shipTo: 'Main Office', city: 'Jacksonville, XX', placed: 'Mar 16', shipBy: 'Apr 4', status: 'delivered', total: 22300, locked: true},
  {id: 'ORD-8880', brand: 'underArmour', po: 'FN-2025-0221', account: 'Fanatics', initials: 'FN', shipTo: 'Main Office', city: 'Jacksonville, XX', placed: 'Feb 21', shipBy: 'Mar 12', status: 'delivered', total: 16900, locked: true},
  {id: 'ORD-8812', brand: 'champion', po: 'FN-2025-0130', account: 'Fanatics', initials: 'FN', shipTo: 'Main Office', city: 'Jacksonville, XX', placed: 'Jan 30', shipBy: 'Feb 18', status: 'delivered', total: 7650, locked: true},
];

const ALL_ROWS: Order[] = [...ORDERS, ...ACCOUNT_HISTORY];
const MOCK_YEAR = 2026;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STEP_KEYS: StepKey[] = ['placed', 'ready', 'production', 'shipped', 'delivered'];

const STATUS_MAP: Record<OrderStatus, OrderDetailStatus> = {
  pendingProof: 'pending',
  inProduction: 'production',
  shipped: 'shipped',
  delivered: 'delivered',
};

/** Index of the current step; `delivered` marks every step done. */
const CURRENT_STEP: Record<OrderDetailStatus, number> = {
  pending: 1,
  hold: 1,
  production: 2,
  shipped: 3,
  delivered: STEP_KEYS.length,
};

/** List rows carry display dates like "Apr 28"; the detail view expects ISO. */
function toIsoDate(display: string): string {
  const [month, day] = display.split(' ');
  const monthNumber = MONTHS.indexOf(month) + 1;
  return `${MOCK_YEAR}-${String(monthNumber).padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function buildSteps(status: OrderDetailStatus, placed: string, shipBy: string): OrderStep[] {
  const current = CURRENT_STEP[status];
  return STEP_KEYS.map((key, index) => ({
    key,
    state: index < current ? 'done' : index === current ? 'current' : index === current + 1 ? 'next' : 'later',
    date: key === 'placed' ? placed : key === 'shipped' ? shipBy : TEMPLATE.steps[index].date,
  }));
}

/** Every other order for the account, newest first. */
function otherOrdersFor(account: string, excludeId: string): OtherOrder[] {
  return ALL_ROWS.filter((other) => other.account === account && other.id !== excludeId)
    .map((other) => ({
      id: other.id,
      placed: toIsoDate(other.placed),
      status: STATUS_MAP[other.status],
      total: other.total,
    }))
    .sort((a, b) => b.placed.localeCompare(a.placed));
}

function fromListRow(row: Order): OrderDetail {
  const status = STATUS_MAP[row.status];
  const placed = toIsoDate(row.placed);
  const shipBy = toIsoDate(row.shipBy);
  const otherOrders = otherOrdersFor(row.account, row.id);

  return {
    ...TEMPLATE,
    id: row.id,
    erpId: `NS-${row.id.replace('ORD-', '')}`,
    status,
    account: row.account,
    po: row.po,
    placed,
    shipTo: {name: row.shipTo, city: row.city},
    steps: buildSteps(status, placed, shipBy),
    onTrackDate: shipBy,
    dates: {...TEMPLATE.dates, confirmedShip: shipBy},
    otherOrders,
    otherOrdersCount: otherOrders.length,
  };
}

/*
 * ORD-9125 keeps its hand-written rows (including the pricing-hold example)
 * and gains the rest of the account's history.
 */
const TEMPLATE_OTHER_ORDERS: OtherOrder[] = [
  ...TEMPLATE.otherOrders,
  ...otherOrdersFor(TEMPLATE.account, TEMPLATE.id),
];

export const ORDER_DETAIL_MOCKS: Record<string, OrderDetail> = {
  ...Object.fromEntries(ALL_ROWS.map((row) => [row.id, fromListRow(row)])),
  ...TEMPLATE_MOCKS,
  [TEMPLATE.id]: {
    ...TEMPLATE,
    otherOrders: TEMPLATE_OTHER_ORDERS,
    otherOrdersCount: TEMPLATE_OTHER_ORDERS.length,
  },
};
