import {z} from 'zod';

const nullableStringSchema = z.string().nullable().optional();

const metafieldValueSchema = z
  .object({
    value: nullableStringSchema,
  })
  .nullable()
  .optional();

const adminCompanyLocationSchema = z.object({
  id: z.string().min(1),
  name: nullableStringSchema,
  externalId: nullableStringSchema,
  shippingAddress: z.object({
    recipient: nullableStringSchema,
    companyName: nullableStringSchema,
    address1: nullableStringSchema,
    address2: nullableStringSchema,
    city: nullableStringSchema,
    countryCode: nullableStringSchema,
    zoneCode: nullableStringSchema,
    zip: nullableStringSchema,
    phone: nullableStringSchema,
  }).nullable().optional(),
  billingAddress: z.object({
    recipient: nullableStringSchema,
    companyName: nullableStringSchema,
    address1: nullableStringSchema,
    address2: nullableStringSchema,
    city: nullableStringSchema,
    countryCode: nullableStringSchema,
    zoneCode: nullableStringSchema,
    zip: nullableStringSchema,
    phone: nullableStringSchema,
  }).nullable().optional(),
});

export const adminCompanySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  externalId: nullableStringSchema,
  locations: z
    .object({
      nodes: z.array(adminCompanyLocationSchema),
    })
    .nullable()
    .optional(),
  segment: metafieldValueSchema,
  tier: metafieldValueSchema,
  terms: metafieldValueSchema,
  royaltyRate: metafieldValueSchema,
  vip: metafieldValueSchema,
  repName: metafieldValueSchema,
  defaultShipTo: metafieldValueSchema,
});

export const newDraftOrderCompanyResponseSchema = z.object({
  node: adminCompanySchema.nullable(),
  defaultShipTo: metafieldValueSchema,
});

export const newDraftOrderStep1ResponseSchema = z.object({
  companies: z.object({
    nodes: z.array(adminCompanySchema),
  }),
  productVendors: z
    .object({
      nodes: z.array(z.string()),
    })
    .nullable()
    .optional(),
});

export const shopifyStaffMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  firstName: nullableStringSchema,
  lastName: nullableStringSchema,
  email: nullableStringSchema,
  active: z.boolean(),
  isShopOwner: z.boolean().optional(),
  accountType: nullableStringSchema,
  isCurrent: z.boolean().optional(),
});

export const shopifyStaffMembersResponseSchema = z.object({
  staffMembers: z.object({
    nodes: z.array(shopifyStaffMemberSchema),
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      endCursor: nullableStringSchema,
    }),
  }),
});

export const currentShopifyStaffMemberResponseSchema = z.object({
  currentStaffMember: z.object({
    id: z.string().min(1),
    name: z.string(),
    email: nullableStringSchema,
    active: z.boolean(),
    accountType: nullableStringSchema,
  }).nullable(),
});

export type NewDraftOrderStep1Response = z.infer<
  typeof newDraftOrderStep1ResponseSchema
>;
export type ShopifyStaffMember = z.infer<typeof shopifyStaffMemberSchema>;
