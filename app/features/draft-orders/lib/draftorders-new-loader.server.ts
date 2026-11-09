import type {I18nBase, Storefront} from '@shopify/hydrogen';
import {
  NEW_DRAFT_ORDER_STEP1_QUERY,
  DRAFT_ORDER_OPTIONS_QUERY,
  PROGRAM_CODE_LISTS_QUERY,
} from '~/features/draft-orders/queries/new-draft-order';
import {BACK_SCHEDULE_QUERY} from '~/features/draft-orders/queries/back-schedule';
import {LOAD_DRAFT_QUERY} from '~/features/draft-orders/queries/save-draft-order';
import {loadDraftResponseSchema} from '~/features/draft-orders/schemas/draft-orders-admin.schema';
import {
  newDraftOrderStep1ResponseSchema,
  type NewDraftOrderStep1Response,
} from '~/features/draft-orders/schemas/new-draft-order-admin.schema';
import {
  ORDER_TYPES,
  HOLD_CONVERSION_REASONS,
  HOLD_STATUSES,
  SEGMENT_CODES,
  deliverySchema,
  newDraftOrderValuesSchema,
} from '~/features/draft-orders/schemas/new-draft-order.schema';
import type {
  BrandCode,
  NewDraftOrderAddress,
  NewDraftOrderCustomer,
  NewDraftOrderLocation,
  NewDraftOrderValues,
  NewDraftOrderView,
  SegmentCode,
} from '~/features/draft-orders/types/new-draft-order';
import {draftProductsFromLines} from './draft-order-open';
import {mapDraftOrderLines} from './draft-order-lines';
import {holdReasonCode} from './draftorders-new-metafields.server';
import {createLogger} from '~/lib/logger';
import type {createHydrogenRouterContext} from '~/lib/context';
import {adminQuery} from '~/lib/shopify/admin.server';
import {readBackSchedule} from '~/lib/metaobjects/back-schedule';
import {readProgramCodeLists} from '../../../lib/metaobjects/program-codes';
import {readDraftOrderOptions} from '../../../lib/metaobjects/draft-order-options';
import {
  DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS,
  DRAFT_ORDER_METAFIELD_KEYS,
  METAOBJECT_TYPES,
} from '~/shared/constants/metafields';
import {
  getCustomAttribute,
  parseCsv,
  pickEnumValue,
} from './draftorders-new-parse.server';
import {restoreDraftProducts} from './draftorders-new-restore-products.server';
import {
  NEW_DRAFT_ORDER_TAX_RATE,
  NEW_DRAFT_ORDER_TIMING,
  NEW_DRAFT_ORDER_WORKFLOW,
  NEW_DRAFT_ORDER_SENT_EMAILS,
} from '../../../../mocks/newDraftOrder';

const log = createLogger('routes.draftorders.new.loader');

export const COMPANY_PAGE_SIZE = 50;
const VENDOR_PAGE_SIZE = 50;
const PROGRAM_CODE_PAGE_SIZE = 100;
const ORDER_OPTION_PAGE_SIZE = 100;
// Missing live schedule data must not introduce prototype timing values.
const EMPTY_SHIP_TIMING = {
  productionDays: 0,
  shippingDays: 0,
  receivingDays: 0,
} as const;

type LoaderContext = Pick<
  Awaited<ReturnType<typeof createHydrogenRouterContext>>,
  'env'
> & {storefront: Storefront<I18nBase>};

function buildEmptyLeadTimeConfig(): NewDraftOrderView['leadTimeDefaults'] {
  return {
    methods: [],
    flags: [],
    defaultDays: 0,
    inHandsPaddingDays: 0,
  };
}

function dateToIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(isoDay: string, days: number): string {
  const date = new Date(`${isoDay}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateToIsoDay(date);
}

function parseSegmentCode(value: string | null | undefined): SegmentCode {
  if (!value) return 'corporate';

  if ((SEGMENT_CODES as readonly string[]).includes(value)) {
    return value as SegmentCode;
  }

  return 'corporate';
}

function parseBoolean(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function parseNumber(value: string | null | undefined): number {
  if (!value) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function pickProgramCodeReference(
  referenceValue: string | null | undefined,
  options: Array<{id: string; code: string}>,
): string {
  const reference = referenceValue?.trim();
  if (reference) {
    try {
      const parsed: unknown = JSON.parse(reference);
      if (Array.isArray(parsed)) {
        const id = parsed.find(
          (value): value is string =>
            typeof value === 'string' && options.some((option) => option.id === value),
        );
        if (id) return id;
      }
    } catch {
      if (options.some((option) => option.id === reference)) return reference;
    }
  }

  return '';
}

function pickMetaobjectReference(
  referenceValue: string | null | undefined,
  options: Array<{id: string}>,
): string {
  const reference = referenceValue?.trim();
  if (!reference) return '';

  try {
    const parsed: unknown = JSON.parse(reference);
    if (Array.isArray(parsed)) {
      return parsed.find(
        (value): value is string =>
          typeof value === 'string' && options.some((option) => option.id === value),
      ) ?? '';
    }
  } catch {
    return options.some((option) => option.id === reference) ? reference : '';
  }

  return '';
}

function parseDeliveries(value: string | null | undefined, fallback: NewDraftOrderValues['deliveries']) {
  if (!value) return fallback;

  try {
    const parsed: unknown = JSON.parse(value);
    const result = deliverySchema.array().safeParse(parsed);
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

export type AdminCompany =NewDraftOrderStep1Response['companies']['nodes'][number];
type AdminLocation = NonNullable<AdminCompany['locations']>['nodes'][number];
type AdminAddress = NonNullable<AdminLocation['shippingAddress']>;

function mapAddress(address: AdminAddress | null | undefined): NewDraftOrderAddress | null {
  if (!address) return null;
  return {
    recipient: address.recipient?.trim() ?? '',
    company: address.companyName?.trim() ?? '',
    address1: address.address1?.trim() ?? '',
    address2: address.address2?.trim() ?? '',
    city: address.city?.trim() ?? '',
    countryCode: address.countryCode?.trim() ?? '',
    zoneCode: address.zoneCode?.trim() ?? '',
    zip: address.zip?.trim() ?? '',
    phone: address.phone?.trim() ?? '',
  };
}

export function mapCompanyToCustomer(company: AdminCompany): NewDraftOrderCustomer {
  const mappedLocations: NewDraftOrderLocation[] = company.locations?.nodes.map((location) => ({
    id: location.id,
    name: location.name?.trim() || company.name,
    code: location.externalId?.trim() ?? '',
    licensed: false,
    shipping: mapAddress(location.shippingAddress),
    billing: mapAddress(location.billingAddress),
  })) ?? [];
  // The builder treats the first location as the primary ship-to.
  const defaultShipToId = company.defaultShipTo?.value?.trim();
  const defaultLocation = mappedLocations.find((location) => location.id === defaultShipToId);
  const locations = defaultLocation
    ? [defaultLocation, ...mappedLocations.filter((location) => location !== defaultLocation)]
    : mappedLocations;
  // No placeholder location: a delivery needs a real CompanyLocation or a custom address.
  const shipTo = locations.map((location) => location.name);

  const fallbackCode = company.id.split('/').pop() ?? company.id;

  return {
    id: company.id,
    name: company.name,
    segment: parseSegmentCode(company.segment?.value),
    code: company.externalId?.trim() || fallbackCode,
    tier: company.tier?.value?.trim() || null,
    terms: company.terms?.value?.trim() || null,
    royaltyRate: parseNumber(company.royaltyRate?.value),
    vip: parseBoolean(company.vip?.value),
    rep: company.repName?.value?.trim() || undefined,
    shipTo,
    locations,
  };
}

function mapVendorsToBrands(vendors: string[]): BrandCode[] {
  const uniqueVendors = new Map<string, string>();
  for (const vendor of vendors) {
    const name = vendor.trim();
    const normalized = name.toLowerCase();
    if (normalized === 'dtx - destination threads') continue;
    if (normalized && !uniqueVendors.has(normalized)) uniqueVendors.set(normalized, name);
  }
  return [...uniqueVendors.values()];
}

async function fetchStep1Data(context: LoaderContext) {
  const [payload, programCodePayload, orderOptionsPayload] = await Promise.all([
    adminQuery({
      env: context.env,
      query: NEW_DRAFT_ORDER_STEP1_QUERY,
      variables: {
        companyFirst: COMPANY_PAGE_SIZE,
        vendorFirst: VENDOR_PAGE_SIZE,
      },
    }),
    context.storefront
      .query(PROGRAM_CODE_LISTS_QUERY, {
        variables: {first: PROGRAM_CODE_PAGE_SIZE},
        cache: context.storefront.CacheShort(),
      })
      .catch((error: unknown) => {
        log.warn('Failed loading program-code metaobjects', {
          cause: error instanceof Error ? error.message : String(error),
          types: [METAOBJECT_TYPES.programCode, METAOBJECT_TYPES.programCodeList2],
        });
        return undefined;
      }),
    context.storefront
      .query(DRAFT_ORDER_OPTIONS_QUERY, {
        variables: {first: ORDER_OPTION_PAGE_SIZE},
        cache: context.storefront.CacheShort(),
      })
      .catch((error: unknown) => {
        log.warn('Failed loading order classification and interface metaobjects', {
          cause: error instanceof Error ? error.message : String(error),
          types: [METAOBJECT_TYPES.orderClassification, METAOBJECT_TYPES.draftOrderInterface],
        });
        return undefined;
      }),
  ]);

  const parsed = newDraftOrderStep1ResponseSchema.parse(payload);
  const {programCodes, programCodes2} = readProgramCodeLists(programCodePayload);
  const {orderClassifications, interfaceModes} = readDraftOrderOptions(orderOptionsPayload);

  return {
    customers: parsed.companies.nodes.map(mapCompanyToCustomer),
    availableBrands: mapVendorsToBrands(parsed.productVendors?.nodes ?? []),
    programCodes,
    programCodes2,
    orderClassifications,
    interfaceModes,
  };
}

function buildView(data: {
  customers: NewDraftOrderCustomer[];
  availableBrands: BrandCode[];
  programCodes: NewDraftOrderView['programCodes'];
  programCodes2: NewDraftOrderView['programCodes2'];
  orderClassifications: NewDraftOrderView['orderClassifications'];
  interfaceModes: NewDraftOrderView['interfaceModes'];
}, shipTiming: NewDraftOrderView['shipTiming']): NewDraftOrderView {
  const today = dateToIsoDay(new Date());
  const configuredDays =
    shipTiming.productionDays + shipTiming.shippingDays + shipTiming.receivingDays;
  const soonestInHands = addDays(today, configuredDays);
  const validUntil = addDays(today, NEW_DRAFT_ORDER_TIMING.validForDays);
  const customers = data.customers;
  const defaultCustomerId = customers[0]?.id ?? '';

  return {
    today,
    soonestInHands,
    validUntil,
    version: 1,
    taxRate: NEW_DRAFT_ORDER_TAX_RATE,
    customers,
    availableBrands: data.availableBrands,
    programCodes: data.programCodes,
    programCodes2: data.programCodes2,
    orderTypes: [...ORDER_TYPES],
    orderClassifications: data.orderClassifications,
    interfaceModes: data.interfaceModes,
    defaultCustomerId,
    workflow: NEW_DRAFT_ORDER_WORKFLOW,
    sentEmails: NEW_DRAFT_ORDER_SENT_EMAILS,
    leadTimeDefaults: buildEmptyLeadTimeConfig(),
    shipTiming,
  };
}

async function fetchDraftInitialValues(
  context: LoaderContext,
  draftId: string,
  view: NewDraftOrderView,
): Promise<{values: NewDraftOrderValues; displayId?: string} | undefined> {
  const payload = await adminQuery({
    env: context.env,
    query: LOAD_DRAFT_QUERY,
    variables: {id: draftId},
  });

  const parsed = loadDraftResponseSchema.parse(payload);
  const node = parsed.node;
  if (!node) return undefined;
  const displayId = node.name?.trim() || undefined;

  const customerId =
    getCustomAttribute(node.customAttributes, DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.customerId) ??
    view.defaultCustomerId;

  const brandsFromMetafield = parseCsv(node.utxBrands?.value);
  const fallbackBrand = view.availableBrands[0];

  const candidateValues: NewDraftOrderValues = {
    products: await restoreDraftProducts(node, context),
    customerId,
    inHandsDate: node.inHandsDate?.value?.trim() || view.soonestInHands,
    orderName: node.orderName?.value?.trim() || node.name?.trim() || '',
    description: node.description?.value?.trim() || '',
    programCode: pickProgramCodeReference(
      getCustomAttribute(node.customAttributes, DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.programCode) ??
        node.programCodeList?.value,
      view.programCodes,
    ),
    programCode2: pickProgramCodeReference(
      getCustomAttribute(node.customAttributes, DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.programCode2) ??
        node.programCodeList2?.value,
      view.programCodes2,
    ),
    brands: brandsFromMetafield.length ? brandsFromMetafield : fallbackBrand ? [fallbackBrand] : [],
    orderType: pickEnumValue(node.orderType?.value?.trim(), ORDER_TYPES, ''),
    leadTimeMethods: parseCsv(node.leadTimeMethods?.value),
    leadTimeFlags: parseCsv(node.leadTimeFlags?.value),
    // Custom attributes preserve the selected IDs if Shopify rejects an optional metafield write.
    orderClass: pickMetaobjectReference(
      getCustomAttribute(
        node.customAttributes,
        DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.orderClassification,
      ) ?? node.orderClassificationList?.value,
      view.orderClassifications,
    ),
    interfaceMode: pickMetaobjectReference(
      getCustomAttribute(
        node.customAttributes,
        DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.interfaceMode,
      ) ?? node.interfaceModeList?.value,
      view.interfaceModes,
    ),
    artComment: node.customArtNotes?.value?.trim() || node.artNotes?.value?.trim() || '',
    manufacturingComment:
      node.customManufacturingInstructions?.value?.trim() ||
      node.manufacturingInstructions?.value?.trim() ||
      '',
    invoiceComment:
      node.customInvoicePrintComments?.value?.trim() ||
      node.invoicePrintComments?.value?.trim() ||
      '',
    acknowledgementComment:
      node.customAckPrintComments?.value?.trim() ||
      node.ackPrintComments?.value?.trim() ||
      '',
    shipExact: parseBoolean(node.shipExact?.value ?? node.customShipExact?.value),
    finalArtLocked: parseBoolean(node.customFinalArtLocked?.value ?? node.finalArtLocked?.value),
    quantitiesLocked: parseBoolean(
      node.customQuantitiesLocked?.value ?? node.quantitiesLocked?.value,
    ),
    lockedBy: node.customLockedBy?.value?.trim() || node.lockedBy?.value?.trim() || '',
    lockedDate: node.customLockedDate?.value?.trim() || node.lockedDate?.value?.trim() || '',
    artApprover: node.customArtApprover?.value?.trim() ?? '',
    proofReader: node.customProofReader?.value?.trim() ?? '',
    artApproverMessage: node.customArtApproverMessage?.value ?? '',
    cancelDate: node.customCancelDate?.value?.trim() || node.cancelDate?.value?.trim() || '',
    eventDate: node.customEventDate?.value?.trim() || node.eventDate?.value?.trim() || '',
    holdReason: pickEnumValue(
      holdReasonCode(
        node.customHoldReason?.value?.trim() || node.appHoldReason?.value?.trim() || '',
      ),
      HOLD_CONVERSION_REASONS,
      '',
    ),
    holdUntil: node.customHoldUntil?.value?.trim() || node.appHoldUntil?.value?.trim() || '',
    holdStatus: pickEnumValue(
      node.customHoldStatus?.value?.trim() || node.appHoldStatus?.value?.trim(),
      HOLD_STATUSES,
      '',
    ),
    holdNote: node.customHoldNote?.value?.trim() || node.appHoldNote?.value?.trim() || '',
    heldBy: node.customHeldBy?.value?.trim() || node.appHeldBy?.value?.trim() || '',
    eventName: node.customEventName?.value?.trim() || node.eventName?.value?.trim() || '',
    billToLocationId: node.customBillToLocationId?.value?.trim() || node.billToLocationId?.value?.trim() || '',
    poNumber:
      node.poNumber?.trim() ||
      node.appPoNumber?.value?.trim() ||
      node.customPoNumber?.value?.trim() ||
      '',
    shipCode: node.customShipCode?.value?.trim() || node.shipCode?.value?.trim() || '',
    deliveries: parseDeliveries(node.customDeliveries?.value ?? node.deliveries?.value, [{
      locationId: view.customers.find((customer) => customer.id === customerId)?.locations?.[0]?.id ?? '',
      method: 'ground',
      indicator: 'sip',
      customRouting: false,
    }]),
  };

  const safeValues = newDraftOrderValuesSchema.safeParse(candidateValues);
  if (!safeValues.success) {
    log.warn('Loaded draft data did not match schema, proceeding with raw candidate values', {
      draftId,
      issues: safeValues.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    });
    return {values: candidateValues, displayId};
  }

  return {values: safeValues.data, displayId};
}

export async function loadDraftOrdersNewView(
  context: LoaderContext,
  draftId?: string,
): Promise<{view: NewDraftOrderView}> {
  const [step1Data, shipTiming] = await Promise.all([
    fetchStep1Data(context),
    context.storefront
      .query(BACK_SCHEDULE_QUERY, {
        variables: {first: 50},
        cache: context.storefront.CacheShort(),
      })
      .then((payload: unknown) =>
        readBackSchedule(payload, EMPTY_SHIP_TIMING),
      )
      .catch((error: unknown) => {
        log.warn('Failed loading back-schedule metaobject; using zero timing', {
          cause: error instanceof Error ? error.message : String(error),
        });
        return EMPTY_SHIP_TIMING;
      }),
  ]);
  const view = buildView(step1Data, shipTiming);

  if (!draftId) {
    return {view};
  }

  try {
    const draft = await fetchDraftInitialValues(context, draftId, view);
    return {
      view: {
        ...view,
        draftId,
        initialValues: draft?.values,
        draftDisplayId: draft?.displayId,
      },
    };
  } catch (error) {
    log.warn('Failed loading existing draft values, using fresh defaults', {
      draftId,
      cause: error instanceof Error ? error.message : String(error),
    });

    return {
      view: {
        ...view,
        draftId,
      },
    };
  }
}
