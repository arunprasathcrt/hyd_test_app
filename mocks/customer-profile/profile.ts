import type {
  AccountInvoice,
  AccountOrder,
} from '~/features/customerProfileDrawer/types/profile';

export const CUSTOMER_PROFILE_OVERVIEW_MOCK = {
  shippedYtd: 62_300,
  openOrders: 14_200,
  ordersYtd: 16,
  casesOpen: 5,
};

export const CUSTOMER_PROFILE_ORDERS_MOCK: AccountOrder[] = [
  {
    id: 'demo-order-1',
    number: '#UA-10482',
    date: '2026-08-04',
    status: 'fulfilled',
    total: 8420,
    poNumber: 'PO-58821',
    shipByDate: '2026-08-18',
    paymentStatus: 'paid',
  },
  {
    id: 'demo-order-2',
    number: '#UA-10467',
    date: '2026-07-19',
    status: 'processing',
    total: 5120,
    poNumber: 'PO-58790',
    shipByDate: '2026-08-02',
    paymentStatus: 'due',
  },
  {
    id: 'demo-order-3',
    number: '#UA-10391',
    date: '2026-06-02',
    status: 'fulfilled',
    total: 12_600,
    poNumber: null,
    shipByDate: '2026-06-16',
    paymentStatus: 'paid',
  },
];

export const CUSTOMER_PROFILE_INVOICES_MOCK: AccountInvoice[] = [
  {
    id: 'demo-invoice-1',
    number: 'INV-30021',
    date: '2026-08-05',
    dueDate: '2026-09-04',
    status: 'due',
    total: 8420,
    balance: 8420,
    terms: 'Net 30',
  },
  {
    id: 'demo-invoice-2',
    number: 'INV-29988',
    date: '2026-07-20',
    dueDate: '2026-08-19',
    status: 'paid',
    total: 5120,
    balance: 0,
    terms: 'Net 30',
  },
  {
    id: 'demo-invoice-3',
    number: 'INV-29840',
    date: '2026-06-03',
    dueDate: '2026-07-03',
    status: 'overdue',
    total: 12_600,
    balance: 4200,
    terms: 'Net 45',
  },
];

export const CUSTOMER_PROFILE_HERO_MOCK = {
  tier: 'B',
  city: 'Austin, TX',
  primaryContact: 'Morgan Ellis',
  sinceYear: 2021,
  brand: 'ua',
  licensed: false,
  platinum: false,
  creditHold: {onHold: false},
} as const;

export const CUSTOMER_PROFILE_FORECAST_MOCK = 96_000;
export const CUSTOMER_PROFILE_ACTIVE_DRAFT_ORDERS_MOCK = 2;
export const CUSTOMER_PROFILE_OPEN_OPPORTUNITIES_MOCK = 1;
export const CUSTOMER_PROFILE_NET_TERM_DAYS_MOCK = 30;
