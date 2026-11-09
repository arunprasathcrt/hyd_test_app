import type {BadgeDotTone} from '~/shared/components/ui/Badge';
import type {OrderDetail, OrderDetailStatus, OrderInvoice, OrderLine} from '../types/order-detail';

/** Order status code → status pill dot color (prototype `.od113-status.is-*`). */
export const STATUS_DOTS: Record<OrderDetailStatus, BadgeDotTone> = {
  pending: 'muted',
  production: 'ink',
  hold: 'warning',
  shipped: 'success',
  delivered: 'success',
};

export function lineQty(line: OrderLine) {
  return line.sizes.reduce((sum, size) => sum + size.qty, 0);
}

export function lineUnit(line: OrderLine) {
  return line.garmentUnit + line.artUnit + line.decorationUnit;
}

export function orderTotals(order: OrderDetail) {
  const sum = (pick: (line: OrderLine) => number) =>
    order.lines.reduce((total, line) => total + pick(line) * lineQty(line), 0);

  const subtotal = sum(lineUnit);
  const margin = subtotal * order.internal.marginRate;

  return {
    units: order.lines.reduce((total, line) => total + lineQty(line), 0),
    subtotal,
    total: subtotal - order.discount + order.tax,
    garments: sum((line) => line.garmentUnit),
    art: sum((line) => line.artUnit),
    decoration: sum((line) => line.decorationUnit),
    margin,
    cogs: subtotal - margin,
    commission: subtotal * order.internal.commissionRate,
  };
}

export type OrderTotals = ReturnType<typeof orderTotals>;

/**
 * Builds the placeholder invoice from the order. ❓ TO CONFIRM: replace with
 * the ERP invoice once its read path is decided; the viewer only needs
 * `OrderInvoice`, so the source can change without touching the UI.
 */
export function buildInvoice(order: OrderDetail): OrderInvoice {
  const totals = orderTotals(order);
  const issued = order.invoiced ? order.invoice : undefined;

  return {
    kind: issued ? 'issued' : 'proForma',
    issued,
    orderId: order.id,
    erpId: order.erpId,
    po: order.po,
    rep: order.rep,
    terms: order.terms,
    billTo: {account: order.account, contact: order.contact},
    shipTo: order.shipTo,
    lines: order.lines.map((line) => {
      const qty = lineQty(line);
      const unit = lineUnit(line);
      return {
        sku: line.sku,
        name: line.name,
        color: line.color,
        decoration: line.decoration,
        placement: line.placement,
        sizes: line.sizes.filter((size) => size.qty > 0),
        upc: line.upc,
        qty,
        unit,
        amount: unit * qty,
      };
    }),
    subtotal: totals.subtotal,
    discount: order.discount,
    tax: order.tax,
    total: totals.total,
  };
}
