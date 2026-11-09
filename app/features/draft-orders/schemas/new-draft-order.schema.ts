import {z} from 'zod';
import {draftProductSchema} from './draft-product.schema';

/** Customer segments. Labels: `newDraftOrder.customer.segments.<code>`. */
export const SEGMENT_CODES = [
  'golf',
  'resort',
  'bookstore',
  'retail',
  'military',
  'corporate',
] as const;

/** Order type. Labels: `newDraftOrder.orderType.options.<code>`. */
export const ORDER_TYPES = ['new', 'reorder'] as const;

/** Decoration method code. The live list and labels come from the `production_lead_time` metaobject. */
export const leadTimeMethodCodeSchema = z.string().trim().min(1).max(64);

/** Art/account modifier code. The live list and labels come from the `art_and_account` metaobject. */
export const leadTimeFlagCodeSchema = z.string().trim().min(1).max(64);

/** Pre-selected on a new draft, as in the prototype. */
export const DEFAULT_LEAD_TIME_FLAGS = ['new_art'];

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export const SHIP_METHODS = ['ground', 'third_day', 'two_day', 'next_day', 'next_day_early', 'two_day_early', 'next_day_air'] as const;
export const SHIP_METHOD_OPTIONS = ['ground', 'third_day', 'two_day', 'next_day', 'next_day_early', 'two_day_early'] as const;
export const SHIP_INDICATORS = ['sip', 'n_before'] as const;
export const HOLD_STATUSES = ['on_hold', 'released'] as const;
export const HOLD_CONVERSION_REASONS = [
  'customerPo',
  'creditReview',
  'customerWait',
  'productionSlot',
  'other',
] as const;

const optionalDaySchema = z.union([
  z.literal(''),
  z.string().regex(ISO_DAY, {message: 'newDraftOrder.errors.dateInvalid'}),
]).optional();

export const deliveryCountryCodeSchema = z.enum(['US', 'CA', 'IN']);

export const deliveryLocationAddressSchema = z.object({
  name: z.string().trim().min(1, {message: 'newDraftOrder.errors.deliveryLocationNameRequired'}),
  address1: z.string().trim().min(1, {message: 'newDraftOrder.errors.deliveryAddressRequired'}),
  address2: z.string().trim().optional(),
  city: z.string().trim().min(1, {message: 'newDraftOrder.errors.deliveryCityRequired'}),
  countryCode: deliveryCountryCodeSchema.optional(),
  state: z.string().trim().min(1, {message: 'newDraftOrder.errors.deliveryStateRequired'}),
  zip: z.string().trim().min(1, {message: 'newDraftOrder.errors.deliveryZipRequired'}),
});

export const deliveryLocationEntrySchema = deliveryLocationAddressSchema.extend({
  countryCode: z.enum(deliveryCountryCodeSchema.options, {message: 'newDraftOrder.errors.deliveryCountryRequired'}),
  // Shopify `zoneCode` for US / CA / IN subdivisions; empty is left to the required check.
  state: z.string().trim()
    .min(1, {message: 'newDraftOrder.errors.deliveryStateRequired'})
    .regex(/^$|^[A-Za-z]{2}$/, {message: 'newDraftOrder.errors.deliveryStateInvalid'}),
});

export function validateDeliveryPostalCode(
  address: z.infer<typeof deliveryLocationEntrySchema>,
  context: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
) {
  const postalCode = address.zip.trim().toUpperCase();
  const valid = address.countryCode === 'US'
    ? /^\d{5}(?:-\d{4})?$/.test(postalCode)
    : address.countryCode === 'IN'
      ? /^\d{6}$/.test(postalCode)
      : /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/.test(postalCode);

  if (!valid) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [...pathPrefix, 'zip'],
      message: address.countryCode === 'US'
        ? 'newDraftOrder.errors.deliveryZipInvalid'
        : 'newDraftOrder.errors.deliveryPostalCodeInvalid',
    });
  }
}

export const validatedDeliveryLocationEntrySchema = deliveryLocationEntrySchema.superRefine(validateDeliveryPostalCode);

const deliveryLocationDraftAddressSchema = deliveryLocationAddressSchema.partial().extend({
  name: z.string().trim().optional(),
  address1: z.string().trim().optional(),
  address2: z.string().trim().optional(),
  city: z.string().trim().optional(),
  countryCode: deliveryCountryCodeSchema.optional(),
  state: z.string().trim().optional(),
  zip: z.string().trim().optional(),
});

const deliveryFieldsSchema = z.object({
  locationId: z.string(),
  method: z.enum(SHIP_METHODS),
  indicator: z.enum(SHIP_INDICATORS),
  customRouting: z.boolean(),
  notBefore: optionalDaySchema,
  deliveryFrom: optionalDaySchema,
  deliveryTo: optionalDaySchema,
  po: z.string().optional(),
  discountCode: z.string().optional(),
  shipCode: z.string().optional(),
  routing: z.object({
    carrier: z.string().optional(),
    serviceLevel: z.string().optional(),
    account: z.string().optional(),
  }).optional(),
  customAddress: deliveryLocationAddressSchema.optional(),
  allocations: z.record(z.string(), z.record(z.string(), z.number().int().nonnegative().max(99999))).optional(),
});

function requireNotBefore(value: {indicator: (typeof SHIP_INDICATORS)[number]; notBefore?: string}, context: z.RefinementCtx) {
  if (value.indicator === 'n_before' && !value.notBefore) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['notBefore'],
      message: 'newDraftOrder.errors.notBeforeRequired',
    });
  }
}

function requireValidDeliveryWindow(value: {deliveryFrom?: string; deliveryTo?: string}, context: z.RefinementCtx) {
  if (value.deliveryFrom && value.deliveryTo && value.deliveryTo < value.deliveryFrom) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['deliveryTo'],
      message: 'newDraftOrder.errors.deliveryWindowInvalid',
    });
  }
}

function requireDeliveryAddress(value: {locationId: string; customAddress?: {address1?: string}}, context: z.RefinementCtx) {
  if (!value.locationId.trim() && !value.customAddress?.address1?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['locationId'],
      message: 'newDraftOrder.errors.deliveryDestinationRequired',
    });
  }
}

// Saved, session and submitted data stay lenient; strict rules apply in the delivery drawer only.
export const deliverySchema = deliveryFieldsSchema;

/** The delivery drawer: one pass validates the window, the not-before date and the chosen or new address. */
export const deliveryDrawerSchema = deliveryFieldsSchema.extend({
  addressMode: z.enum(['choose', 'add']).optional(),
  customAddress: deliveryLocationDraftAddressSchema.optional(),
})
  .superRefine(requireNotBefore)
  .superRefine(requireValidDeliveryWindow)
  .superRefine((value, context) => {
    if (value.addressMode !== 'add') {
      requireDeliveryAddress({locationId: value.locationId}, context);
      return;
    }
    const address = deliveryLocationEntrySchema.safeParse(value.customAddress ?? {});
    address.error?.issues.forEach((issue) => context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['customAddress', ...issue.path],
      message: issue.message,
    }));
    if (address.success) {
      validateDeliveryPostalCode(address.data, context, ['customAddress']);
    }
  });


/**
 * Steps 1 (Brands & customer) and 2 (Order type) of a new draft order.
 *
 * Order name, description, order type, classification and interface may be
 * empty on a draft: the step lists them as "needs attention" and sending
 * waits for them, but saving and moving on do not.
 */
export const programCodeSchema = z.string().trim().max(255, {message: 'newDraftOrder.errors.tooLong'});

/**
 * Field shapes only. Restoring a draft (session, saved draft) parses with this
 * so an incomplete cross-field state never discards the whole draft.
 */
export const newDraftOrderValuesSchema = z.object({
  products: z.array(draftProductSchema).max(100),
  customerId: z.string().min(1, {message: 'newDraftOrder.errors.customerRequired'}),
  inHandsDate: z.string().regex(ISO_DAY, {message: 'newDraftOrder.errors.inHandsRequired'}),
  inHandsDateManual: z.boolean().optional(),
  orderName: z
    .string()
    .trim()
    .min(1, {message: 'newDraftOrder.errors.orderNameRequired'})
    .max(120, {message: 'newDraftOrder.errors.tooLong'}),
  description: z
    .string()
    .trim()
    .min(1, {message: 'newDraftOrder.errors.descriptionRequired'})
    .max(240, {message: 'newDraftOrder.errors.tooLong'}),
  programCode: programCodeSchema,
  programCode2: programCodeSchema,
  brands: z.array(z.string().trim().min(1)).min(1, {message: 'newDraftOrder.errors.brandsRequired'}),
  orderType: z.union([z.enum(ORDER_TYPES), z.literal('')]),
  leadTimeMethods: z.array(leadTimeMethodCodeSchema),
  leadTimeFlags: z.array(leadTimeFlagCodeSchema),
  orderClass: z.string().trim().max(255, {message: 'newDraftOrder.errors.tooLong'}),
  interfaceMode: z
    .string()
    .trim()
    .max(255, {message: 'newDraftOrder.errors.tooLong'})
    .superRefine((value, context) => {
      if (!value) {
        context.addIssue({
          code: 'custom',
          message: 'newDraftOrder.errors.interfaceRequired',
        });
      }
    }),
  // Step 5 order comments; optional so drafts saved before Review still parse.
  artComment: z.string().trim().max(255, {message: 'newDraftOrder.errors.tooLong'}).optional(),
  manufacturingComment: z.string().trim().max(255, {message: 'newDraftOrder.errors.tooLong'}).optional(),
  invoiceComment: z.string().trim().max(255, {message: 'newDraftOrder.errors.tooLong'}).optional(),
  acknowledgementComment: z.string().trim().max(255, {message: 'newDraftOrder.errors.tooLong'}).optional(),
  shipExact: z.boolean().optional(),
  // Step 5 locks; optional so drafts saved before they existed still parse.
  finalArtLocked: z.boolean().optional(),
  quantitiesLocked: z.boolean().optional(),
  lockedBy: z.string().optional(),
  lockedDate: optionalDaySchema,
  artApprover: z.string().optional(),
  proofReader: z.string().optional(),
  artApproverMessage: z.string().max(2000, {message: 'newDraftOrder.errors.tooLong'}).optional(),
  holdReason: z.union([z.enum(HOLD_CONVERSION_REASONS), z.literal('')]).optional(),
  holdUntil: optionalDaySchema,
  holdStatus: z.union([z.enum(HOLD_STATUSES), z.literal('')]).optional(),
  holdNote: z.string().max(2000, {message: 'newDraftOrder.errors.tooLong'}).optional(),
  heldBy: z.string().optional(),
  cancelDate: optionalDaySchema,
  eventDate: optionalDaySchema,
  eventName: z.string().optional(),
  billToLocationId: z.string().optional(),
  poNumber: z.string().optional(),
  shipCode: z.string().optional(),
  deliveries: z.array(deliverySchema).optional(),
});

/** Form and save validation: field shapes plus cross-field rules. */
export const newDraftOrderSchema = newDraftOrderValuesSchema.superRefine((values, context) => {
  if (values.eventDate && !values.eventName?.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['eventName'],
      message: 'newDraftOrder.errors.eventNameRequired',
    });
  }

});