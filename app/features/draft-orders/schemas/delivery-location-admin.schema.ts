import {z} from 'zod';
import {deliveryLocationEntrySchema, validateDeliveryPostalCode} from './new-draft-order.schema';

const nullableStringSchema = z.string().nullable().optional();

const companyAddressSchema = z.object({
  recipient: nullableStringSchema,
  companyName: nullableStringSchema,
  address1: nullableStringSchema,
  address2: nullableStringSchema,
  city: nullableStringSchema,
  countryCode: nullableStringSchema,
  zoneCode: nullableStringSchema,
  zip: nullableStringSchema,
  phone: nullableStringSchema,
}).nullable().optional();

const companyLocationSchema = z.object({
  id: z.string().min(1),
  name: nullableStringSchema,
  externalId: nullableStringSchema,
  shippingAddress: companyAddressSchema,
  billingAddress: companyAddressSchema,
});

const businessUserErrorSchema = z.object({
  field: z.array(z.string()).nullable().optional(),
  message: z.string(),
  code: z.string().nullable().optional(),
});

export const currentAppAccessScopesResponseSchema = z.object({
  currentAppInstallation: z.object({
    accessScopes: z.array(z.object({handle: z.string()})),
  }).nullable(),
});

export const draftOrderCompanyScopeResponseSchema = z.object({
  companies: z.object({
    nodes: z.array(z.object({id: z.string()})),
  }),
});

export const createCompanyLocationResponseSchema = z.object({
  companyLocationCreate: z.object({
    companyLocation: companyLocationSchema.nullable(),
    userErrors: z.array(businessUserErrorSchema),
  }),
});

const newDraftOrderLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  licensed: z.boolean(),
  shipping: z.object({
    recipient: z.string(),
    company: z.string(),
    address1: z.string(),
    address2: z.string(),
    city: z.string(),
    countryCode: z.string(),
    zoneCode: z.string(),
    zip: z.string(),
    phone: z.string(),
  }).nullable(),
  billing: z.object({
    recipient: z.string(),
    company: z.string(),
    address1: z.string(),
    address2: z.string(),
    city: z.string(),
    countryCode: z.string(),
    zoneCode: z.string(),
    zip: z.string(),
    phone: z.string(),
  }).nullable(),
});

export const createDeliveryLocationActionResultSchema = z.discriminatedUnion('ok', [
  z.object({
    intent: z.literal('createDeliveryLocation'),
    ok: z.literal(true),
    location: newDraftOrderLocationSchema,
    warningKey: z.literal('newDraftOrder.errors.companyLocationDefaultFailed').optional(),
  }),
  z.object({
    intent: z.literal('createDeliveryLocation'),
    ok: z.literal(false),
    errorKey: z.enum([
      'newDraftOrder.errors.companyLocationAccessRequired',
      'newDraftOrder.errors.companyLocationCreateFailed',
      'newDraftOrder.errors.companyLocationNotAllowed',
      'newDraftOrder.errors.deliveryPostalCodeInvalid',
      'newDraftOrder.errors.deliveryStateInvalid',
    ]),
  }),
]);

export const createDeliveryLocationInputSchema = deliveryLocationEntrySchema.extend({
  companyId: z.string().regex(/^gid:\/\/shopify\/Company\//),
}).superRefine(validateDeliveryPostalCode);

export const deleteDeliveryLocationInputSchema = z.object({
  companyId: z.string().regex(/^gid:\/\/shopify\/Company\//),
  locationId: z.string().regex(/^gid:\/\/shopify\/CompanyLocation\//),
});

export const deleteCompanyLocationContextResponseSchema = z.object({
  company: z.object({
    id: z.string().min(1),
    locations: z.object({nodes: z.array(z.object({id: z.string().min(1)}))}),
    defaultShipTo: z.object({value: nullableStringSchema}).nullable().optional(),
  }).nullable(),
});

export const deleteCompanyLocationResponseSchema = z.object({
  companyLocationDelete: z.object({
    deletedCompanyLocationId: z.string().nullable().optional(),
    userErrors: z.array(businessUserErrorSchema),
  }),
});

export const deleteDeliveryLocationActionResultSchema = z.discriminatedUnion('ok', [
  z.object({
    intent: z.literal('deleteDeliveryLocation'),
    ok: z.literal(true),
    deletedLocationId: z.string(),
  }),
  z.object({
    intent: z.literal('deleteDeliveryLocation'),
    ok: z.literal(false),
    errorKey: z.enum([
      'newDraftOrder.errors.companyLocationAccessRequired',
      'newDraftOrder.errors.companyLocationDeleteFailed',
      'newDraftOrder.errors.companyLocationDeleteNotAllowed',
      'newDraftOrder.errors.companyLocationDefaultCannotDelete',
      'newDraftOrder.errors.companyLocationDeleteInUse',
    ]),
  }),
]);

export type CreateDeliveryLocationActionResult = z.infer<typeof createDeliveryLocationActionResultSchema>;
export type DeleteDeliveryLocationActionResult = z.infer<typeof deleteDeliveryLocationActionResultSchema>;
export type CreatedCompanyLocation = Extract<CreateDeliveryLocationActionResult, {ok: true}>['location'];
export type CompanyLocationErrorKey = Extract<CreateDeliveryLocationActionResult, {ok: false}>['errorKey'];
