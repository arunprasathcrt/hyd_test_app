import {NEW_DRAFT_ORDER_TAX_RATE, NEW_DRAFT_ORDER_TIMING} from 'mocks/newDraftOrder';
import type {DraftOrderListItem} from '../types/draft-order';
import type {NewDraftOrderCustomer} from '../types/new-draft-order';
import {draftProductsFromListItem} from './draft-order-open';
import {getDraftTotals} from './draft-products';
import {toReviewLines} from './review-lines';

function addDays(isoDay: string, days: number): string {
  const date = new Date(`${isoDay}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * ❓ TO CONFIRM: a list row has no customer record, dates or rep. The customer
 * is built from the row's name and ship-to with the builder's own fallbacks for
 * terms, and the dates are derived from today. Replace once the list is served
 * with real draft data.
 */
export function buildDraftOrderPreview(item: DraftOrderListItem) {
  const taxRate = NEW_DRAFT_ORDER_TAX_RATE;
  const today = new Date().toISOString().slice(0, 10);
  const inHandsDate = addDays(today, NEW_DRAFT_ORDER_TIMING.soonestInHandsDays);
  const products = draftProductsFromListItem(item);
  const lines = toReviewLines(products, {shipTo: item.shipTo});
  const customer: NewDraftOrderCustomer = {
    id: item.customer,
    name: item.customer,
    segment: 'corporate',
    code: '',
    tier: null,
    terms: null,
    royaltyRate: 0,
    vip: false,
    shipTo: [item.shipTo],
  };
  const approvedOn = Object.fromEntries(
    (item.lines ?? []).flatMap((line) =>
      line.approvedOn ? [[line.id, line.approvedOn] as const] : [],
    ),
  );

  return {
    customer,
    orderName: item.description ?? '',
    description: item.description ?? '',
    brands: [],
    orderType: 'new' as const,
    today,
    inHandsDate,
    validUntil: addDays(today, NEW_DRAFT_ORDER_TIMING.validForDays),
    version: item.version ?? 1,
    taxRate,
    lines,
    totals: getDraftTotals(products, taxRate),
    draftOrderNumber: item.id,
    shipTo: item.shipTo ? [{name: item.shipTo}] : [],
    confirmation: {
      orderId:
        item.lines?.find((line) => line.orderRef)?.orderRef ??
        `ORD-${item.id.replace(/\D/g, '')}`,
      reference: item.id,
      promiseDate: inHandsDate,
      approvedOn,
    },
  };
}
