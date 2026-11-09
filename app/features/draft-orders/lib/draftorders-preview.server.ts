import {NEW_DRAFT_ORDER_TIMING} from '../../../../mocks/newDraftOrder';
import {createLogger} from '~/lib/logger';
import {adminQuery} from '~/lib/shopify/admin.server';
import {DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS} from '~/shared/constants/metafields';
import {NEW_DRAFT_ORDER_COMPANY_QUERY} from '../queries/new-draft-order';
import {LOAD_DRAFT_QUERY} from '../queries/save-draft-order';
import {loadDraftResponseSchema} from '../schemas/draft-orders-admin.schema';
import {newDraftOrderCompanyResponseSchema} from '../schemas/new-draft-order-admin.schema';
import {ORDER_TYPES, deliverySchema} from '../schemas/new-draft-order.schema';
import type {NewDraftOrderCustomer} from '../types/new-draft-order';
import {mapDraftOrderLines} from './draft-order-lines';
import {draftProductsFromLines} from './draft-order-open';
import {getDraftTotals} from './draft-products';
import {getCustomAttribute, parseCsv, pickEnumValue} from './draftorders-new-parse.server';
import {mapCompanyToCustomer} from './draftorders-new-loader.server';
import {toReviewLines} from './review-lines';

const log = createLogger('routes.draftorders.preview');

function addDays(isoDay: string, days: number): string {
  const date = new Date(`${isoDay}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * The Print Preview model for one saved draft, read from Shopify by GID.
 *
 * Served via: native (lines, totals, tax, PO, customer) + `$app` metafields
 * (description, order name, brands, in-hands date, deliveries) + the Company's
 * `$app` metafields (segment, tier, terms, royalty).
 *
 * ❓ TO CONFIRM: a draft has no expiry or version, so `validUntil` is derived
 * from today and `version` is 1. Tax is Shopify's own figure, which is 0 until
 * the draft is taxed (Avalara runs behind NetSuite, not here).
 */
export async function loadDraftOrderPreview(env: Env, draftId: string) {
  const payload = await adminQuery({
    env,
    query: LOAD_DRAFT_QUERY,
    variables: {id: draftId},
  });
  const node = loadDraftResponseSchema.parse(payload).node;
  if (!node) return null;

  const companyId = getCustomAttribute(
    node.customAttributes,
    DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.customerId,
  );
  const company = companyId
    ? await adminQuery({env, query: NEW_DRAFT_ORDER_COMPANY_QUERY, variables: {id: companyId}})
        .then((result) => newDraftOrderCompanyResponseSchema.parse(result).node)
        .catch((error: unknown) => {
          log.warn('Failed loading the draft customer for the preview', {
            cause: error instanceof Error ? error.message : String(error),
          });
          return null;
        })
    : null;

  const customerName =
    company?.name ?? node.customer?.displayName?.trim() ?? '';
  const customer: NewDraftOrderCustomer = company
    ? mapCompanyToCustomer(company)
    : {
        id: companyId ?? '',
        name: customerName,
        segment: 'corporate',
        code: '',
        tier: '',
        terms: '',
        royaltyRate: 0,
        vip: false,
        shipTo: [],
      };

  const deliveries = (() => {
    try {
      const value = node.customDeliveries?.value ?? node.deliveries?.value;
      return value ? deliverySchema.array().parse(JSON.parse(value)) : [];
    } catch {
      return [];
    }
  })();
  const deliveryLocations = [...new Set(deliveries.map((delivery) => delivery.locationId))].flatMap(
    (locationId) => customer.locations?.find((location) => location.id === locationId) ?? [],
  );
  const shipTo = deliveryLocations.map((location) => ({
    name: location.name,
    address: [
      location.shipping?.address1,
      [location.shipping?.city, location.shipping?.zoneCode, location.shipping?.zip]
        .filter(Boolean)
        .join(' '),
    ]
      .filter(Boolean)
      .join(', '),
  }));

  const brands = parseCsv(node.utxBrands?.value);
  const products = draftProductsFromLines(
    mapDraftOrderLines(node.lineItems.nodes),
    brands[0] ?? '',
  );

  const subtotal = Number(node.subtotalPriceSet?.shopMoney?.amount ?? 0);
  const tax = Number(node.totalTaxSet?.shopMoney?.amount ?? 0);
  const taxRate = subtotal > 0 ? tax / subtotal : 0;

  const today = new Date().toISOString().slice(0, 10);
  const inHandsDate =
    node.inHandsDate?.value?.trim() ||
    addDays(today, NEW_DRAFT_ORDER_TIMING.soonestInHandsDays);
  const name = node.name ?? '';

  return {
    customer,
    orderName: node.orderName?.value?.trim() || name,
    description: node.description?.value?.trim() ?? '',
    brands,
    orderType: pickEnumValue(node.orderType?.value?.trim(), ORDER_TYPES, ''),
    today,
    inHandsDate,
    validUntil: addDays(today, NEW_DRAFT_ORDER_TIMING.validForDays),
    version: 1,
    taxRate,
    shipTo,
    rep: customer.rep,
    lines: toReviewLines(products, {shipTo: shipTo.map((location) => location.name).join(', ')}),
    totals: getDraftTotals(products, taxRate),
    draftOrderNumber: name,
    confirmation: {
      orderId: `ORD-${name.replace(/\D/g, '')}`,
      reference: name,
      promiseDate: inHandsDate,
      approvedOn: {},
    },
  };
}
