import type {
  BrandCode,
  DraftOrderDelivery,
} from '~/features/draft-orders/types/new-draft-order';
import enNewDraftOrder from '~/locales/en/newDraftOrder.json';
import {HOLD_CONVERSION_REASONS} from '~/features/draft-orders/schemas/new-draft-order.schema';
import {
  APP_NAMESPACE,
  DRAFT_ORDER_METAFIELD_KEYS,
  DRAFT_ORDER_METAFIELD_NAMESPACE,
} from '~/shared/constants/metafields';

const HOLD_REASON_LABELS = enNewDraftOrder.newDraftOrder.review.holdDialog.reasons;
type HoldReason = (typeof HOLD_CONVERSION_REASONS)[number];

export function holdReasonLabel(reason: string): string {
  return HOLD_CONVERSION_REASONS.includes(reason as HoldReason)
    ? HOLD_REASON_LABELS[reason as HoldReason]
    : reason;
}

export function holdReasonCode(value: string): string {
  if (HOLD_CONVERSION_REASONS.some((reason) => reason === value)) return value;
  return HOLD_CONVERSION_REASONS.find((reason) => HOLD_REASON_LABELS[reason] === value) ?? value;
}
const DRAFT_METAFIELD_NAMESPACES = [APP_NAMESPACE, DRAFT_ORDER_METAFIELD_NAMESPACE] as const;

// Normalize at the serialization boundary, including aggregated line notes
// and overrides, rather than only normalizing the header comment fallback.
const singleLineText = (value: string) =>
  value.replace(/\s*[\r\n\u2028\u2029]+\s*/g, ' ').trim();

type DraftOrderMetafieldInput = {
  namespace: string;
  key: string;
  type:
    | 'single_line_text_field'
    | 'date'
    | 'json'
    | 'list.single_line_text_field'
    | 'list.metaobject_reference';
  value: string;
};

export function buildDraftOrderMetafields(
  values: BrandCode[] | string[],
  data: {
    description: string;
    orderName: string;
    poNumber: string;
    leadTimeFlags: string[];
    leadTimeMethods: string[];
    interfaceMode: string;
    orderClass: string;
    orderType: string;
    programCode2: string;
    programCode: string;
    inHandsDate: string;
    deliveries: DraftOrderDelivery[];
    defaultShipToLocationId: string;
    shipCode: string;
    billToLocationId: string;
    eventName: string;
    eventDate?: string;
    cancelDate?: string;
    companyName: string;
    /** Step 5 order comments and Ship exact. */
    artComment?: string;
    manufacturingComment?: string;
    invoiceComment?: string;
    acknowledgementComment?: string;
    shipExact?: boolean;
  },
): DraftOrderMetafieldInput[] {
  const metafields: DraftOrderMetafieldInput[] = [];

  const pushText = (key: string, value: string) => {
    const trimmed = singleLineText(value);
    if (!trimmed) return;
    for (const namespace of DRAFT_METAFIELD_NAMESPACES) {
      metafields.push({
        namespace,
        key,
        type: 'single_line_text_field',
        value: trimmed,
      });
    }
  };

  const pushDate = (key: string, value: string | undefined) => {
    const trimmed = value?.trim();
    if (!trimmed) return;
    for (const namespace of DRAFT_METAFIELD_NAMESPACES) {
      metafields.push({namespace, key, type: 'date', value: trimmed});
    }
  };

  pushText(DRAFT_ORDER_METAFIELD_KEYS.description, data.description);
  pushText(DRAFT_ORDER_METAFIELD_KEYS.orderName, data.orderName);
  pushText(DRAFT_ORDER_METAFIELD_KEYS.poNumber, data.poNumber);
  pushText(
    DRAFT_ORDER_METAFIELD_KEYS.leadTimeFlags,
    data.leadTimeFlags.join(',').trim(),
  );
  pushText(
    DRAFT_ORDER_METAFIELD_KEYS.leadTimeMethods,
    data.leadTimeMethods.join(',').trim(),
  );
  pushText(DRAFT_ORDER_METAFIELD_KEYS.orderType, data.orderType);

  pushDate(DRAFT_ORDER_METAFIELD_KEYS.inHandsDate, data.inHandsDate);
  pushDate(DRAFT_ORDER_METAFIELD_KEYS.eventDate, data.eventDate);
  pushDate(DRAFT_ORDER_METAFIELD_KEYS.cancelDate, data.cancelDate);

  for (const namespace of DRAFT_METAFIELD_NAMESPACES) {
    metafields.push({
      namespace,
      key: DRAFT_ORDER_METAFIELD_KEYS.deliveries,
      type: 'json',
      value: JSON.stringify(data.deliveries),
    });
  }

  const defaultShipToLocationId = singleLineText(data.defaultShipToLocationId);
  if (defaultShipToLocationId.startsWith('gid://shopify/CompanyLocation/')) {
    metafields.push({
      namespace: DRAFT_ORDER_METAFIELD_NAMESPACE,
      key: DRAFT_ORDER_METAFIELD_KEYS.defaultShipToLocationId,
      type: 'single_line_text_field',
      value: defaultShipToLocationId,
    });
  }

  pushText(DRAFT_ORDER_METAFIELD_KEYS.shipCode, data.shipCode);
  pushText(DRAFT_ORDER_METAFIELD_KEYS.billToLocationId, data.billToLocationId);
  pushText(DRAFT_ORDER_METAFIELD_KEYS.eventName, data.eventName);

  if (data.shipExact !== undefined) {
    pushText(DRAFT_ORDER_METAFIELD_KEYS.shipExact, data.shipExact ? 'true' : 'false');
  }

  pushText(DRAFT_ORDER_METAFIELD_KEYS.utxCustomerName, data.companyName);
  pushText(
    DRAFT_ORDER_METAFIELD_KEYS.utxBrands,
    values.map((value) => value.trim()).filter(Boolean).join(','),
  );
  pushText(DRAFT_ORDER_METAFIELD_KEYS.utxOrderType, data.orderType);

  // Step 5 header comments already have definitions in Shopify Admin; the
  // textareas allow line breaks, which single-line text rejects. Per-card
  // product comments live in the line-items JSON, not here.
  pushText(DRAFT_ORDER_METAFIELD_KEYS.artNotes, data.artComment ?? '');
  pushText(
    DRAFT_ORDER_METAFIELD_KEYS.manufacturingInstructions,
    data.manufacturingComment ?? '',
  );
  pushText(
    DRAFT_ORDER_METAFIELD_KEYS.ackPrintComments,
    data.acknowledgementComment ?? '',
  );
  pushText(
    DRAFT_ORDER_METAFIELD_KEYS.invoicePrintComments,
    data.invoiceComment ?? '',
  );

  return metafields;
}
