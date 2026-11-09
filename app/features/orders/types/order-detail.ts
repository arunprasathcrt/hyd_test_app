export type OrderDetailStatus = 'pending' | 'production' | 'hold' | 'shipped' | 'delivered';
export type StepKey = 'placed' | 'ready' | 'production' | 'shipped' | 'delivered';
export type StepState = 'done' | 'current' | 'next' | 'later';
export type CriticalPathKey = 'inventory' | 'art' | 'license' | 'production' | 'pack';
export type CriticalPathState = 'done' | 'active' | 'waiting';
export type DecorationMethod = 'embroidery' | 'screen_print';
export type ActivityKey = 'production' | 'ready' | 'placed' | 'erpCreated';

export interface OrderStep {
  key: StepKey;
  state: StepState;
  date: string;
}

export interface CriticalPathStage {
  key: CriticalPathKey;
  state: CriticalPathState;
  owner?: string;
  date: string;
}

export interface OrderLine {
  sku: string;
  brand: string;
  name: string;
  color: string;
  image: string;
  art: string;
  sketch: string;
  placement: string;
  decoration: DecorationMethod;
  process: string;
  colors: string[];
  upc: string;
  customerSku: string;
  finishing: string;
  carrier: string;
  sizes: {size: string; qty: number}[];
  garmentUnit: number;
  artUnit: number;
  decorationUnit: number;
}

export interface OtherOrder {
  id: string;
  placed: string;
  status: OrderDetailStatus;
  holdReason?: string;
  total: number;
}

/**
 * An issued invoice. ❓ TO CONFIRM: invoices are ERP-only and not served from
 * Shopify — the read path is still open. Served via: not served (ERP-only).
 */
export interface IssuedInvoice {
  number: string;
  issued: string;
  due: string;
}

export interface InvoiceLine {
  sku: string;
  name: string;
  color: string;
  decoration: DecorationMethod;
  placement: string;
  sizes: {size: string; qty: number}[];
  upc: string;
  qty: number;
  unit: number;
  amount: number;
}

/**
 * The invoice document the customer gets. Placeholder: the business supplies
 * the final format, and it will come from the ERP as-is. Until then it is
 * computed in app from the order.
 */
export interface OrderInvoice {
  /** `proForma` until the ERP issues the invoice at shipping. */
  kind: 'proForma' | 'issued';
  issued?: IssuedInvoice;
  orderId: string;
  erpId: string;
  po: string;
  rep: string;
  terms: string;
  billTo: {account: string; contact: string};
  shipTo: {name: string; city: string};
  lines: InvoiceLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

/** View model for one order. `criticalPath`, `internal` and `activity` are rep-only. */
export interface OrderDetail {
  id: string;
  erpId: string;
  status: OrderDetailStatus;
  channel: string;
  invoiced: boolean;
  /** Present once the ERP has issued the invoice. ❓ TO CONFIRM: ERP read path. */
  invoice?: IssuedInvoice;
  account: string;
  program: string;
  po: string;
  contact: string;
  placed: string;
  brands: string;
  rep: string;
  shipTo: {name: string; city: string};
  terms: string;
  steps: OrderStep[];
  onTrackDate: string;
  criticalPath: CriticalPathStage[];
  dates: {requestedInHands: string; confirmedShip: string; cancelBy: string};
  lines: OrderLine[];
  discount: number;
  tax: number;
  internal: {marginRate: number; commissionRate: number; royaltyRate: number; tier: string};
  otherOrders: OtherOrder[];
  otherOrdersCount: number;
  activity: {key: ActivityKey; date: string}[];
}
