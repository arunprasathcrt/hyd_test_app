export const CUSTOMER_PROFILE_TABS = [
  'overview',
  'finance',
  'orders',
  'invoices',
  'products',
  'artwork',
  'draftOrders',
  'cases',
  'team',
  'comments',
  'activity',
  'forecast',
  'revenue',
] as const;

export type CustomerProfileTab = (typeof CUSTOMER_PROFILE_TABS)[number];
