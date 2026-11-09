import {z} from 'zod';

const nullableStringSchema = z.string().nullable().optional();

const draftOrderCustomerSchema = z
  .object({
    id: z.string(),
    displayName: nullableStringSchema,
  })
  .nullable()
  .optional();

const draftOrderCustomAttributeSchema = z.object({
  key: z.string(),
  value: nullableStringSchema,
});

const draftOrderMetafieldSchema = z
  .object({
    value: nullableStringSchema,
  })
  .nullable()
  .optional();

const draftOrderMoneyBagSchema = z
  .object({shopMoney: z.object({amount: z.string()}).nullable()})
  .nullable()
  .optional();

/** Mirrors `DRAFT_ORDER_LINE_ITEMS_SELECTION`. */
const draftOrderLineItemsSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      title: nullableStringSchema,
      variantTitle: nullableStringSchema,
      sku: nullableStringSchema,
      quantity: z.number(),
      variant: z
        .object({
          id: z.string(),
          selectedOptions: z.array(z.object({name: z.string(), value: z.string()})),
          product: z.object({id: z.string()}),
        })
        .nullable()
        .optional(),
      image: z.object({url: z.string()}).nullable().optional(),
      customAttributes: z.array(draftOrderCustomAttributeSchema),
      originalUnitPriceSet: z
        .object({
          shopMoney: z.object({amount: z.string()}).nullable(),
        })
        .nullable(),
    }),
  ),
});

export const draftOrdersStatsSchema = z.object({
  draftOrders: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        name: nullableStringSchema,
        status: nullableStringSchema,
        updatedAt: nullableStringSchema,
        tags: z.array(z.string()),
        customer: z
          .object({
            displayName: nullableStringSchema,
          })
          .nullable()
          .optional(),
        customAttributes: z.array(draftOrderCustomAttributeSchema),
        draftBrands: draftOrderMetafieldSchema,
        totalPriceSet: z
          .object({
            shopMoney: z
              .object({
                amount: z.string(),
              })
              .nullable(),
          })
          .nullable(),
      }),
    ),
  }),
});

export const saveDraftCompanyResponseSchema = z.object({
  node: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
});

const draftMetafieldValueSchema = z
  .object({
    value: nullableStringSchema,
  })
  .nullable()
  .optional();

export const loadDraftResponseSchema = z.object({
  node: z
    .object({
      id: z.string(),
      name: nullableStringSchema,
      poNumber: nullableStringSchema,
      createdAt: nullableStringSchema,
      subtotalPriceSet: draftOrderMoneyBagSchema,
      totalTaxSet: draftOrderMoneyBagSchema,
      customer: z
        .object({displayName: nullableStringSchema})
        .nullable()
        .optional(),
      lineItems: draftOrderLineItemsSchema,
      appPoNumber: draftMetafieldValueSchema,
      customPoNumber: draftMetafieldValueSchema,
      customAttributes: z.array(draftOrderCustomAttributeSchema),
      description: draftMetafieldValueSchema,
      orderName: draftMetafieldValueSchema,
      leadTimeFlags: draftMetafieldValueSchema,
      leadTimeMethods: draftMetafieldValueSchema,
      interfaceModeList: draftMetafieldValueSchema,
      orderClassificationList: draftMetafieldValueSchema,
      orderType: draftMetafieldValueSchema,
      programCodeList: draftMetafieldValueSchema,
      programCodeList2: draftMetafieldValueSchema,
      inHandsDate: draftMetafieldValueSchema,
      deliveries: draftMetafieldValueSchema,
      customDeliveries: draftMetafieldValueSchema,
      shipCode: draftMetafieldValueSchema,
      customShipCode: draftMetafieldValueSchema,
      billToLocationId: draftMetafieldValueSchema,
      customBillToLocationId: draftMetafieldValueSchema,
      eventName: draftMetafieldValueSchema,
      customEventName: draftMetafieldValueSchema,
      eventDate: draftMetafieldValueSchema,
      customEventDate: draftMetafieldValueSchema,
      cancelDate: draftMetafieldValueSchema,
      customCancelDate: draftMetafieldValueSchema,
      customHoldReason: draftMetafieldValueSchema,
      appHoldReason: draftMetafieldValueSchema,
      customHoldUntil: draftMetafieldValueSchema,
      appHoldUntil: draftMetafieldValueSchema,
      customHoldStatus: draftMetafieldValueSchema,
      appHoldStatus: draftMetafieldValueSchema,
      customHoldNote: draftMetafieldValueSchema,
      appHoldNote: draftMetafieldValueSchema,
      customHeldBy: draftMetafieldValueSchema,
      appHeldBy: draftMetafieldValueSchema,
      utxBrands: draftMetafieldValueSchema,
      artNotes: draftMetafieldValueSchema,
      customArtNotes: draftMetafieldValueSchema,
      manufacturingInstructions: draftMetafieldValueSchema,
      customManufacturingInstructions: draftMetafieldValueSchema,
      invoicePrintComments: draftMetafieldValueSchema,
      customInvoicePrintComments: draftMetafieldValueSchema,
      ackPrintComments: draftMetafieldValueSchema,
      customAckPrintComments: draftMetafieldValueSchema,
      shipExact: draftMetafieldValueSchema,
      finalArtLocked: draftMetafieldValueSchema,
      customFinalArtLocked: draftMetafieldValueSchema,
      quantitiesLocked: draftMetafieldValueSchema,
      customQuantitiesLocked: draftMetafieldValueSchema,
      lockedBy: draftMetafieldValueSchema,
      customLockedBy: draftMetafieldValueSchema,
      lockedDate: draftMetafieldValueSchema,
      customLockedDate: draftMetafieldValueSchema,
      customArtApprover: draftMetafieldValueSchema,
      customProofReader: draftMetafieldValueSchema,
      customArtApproverMessage: draftMetafieldValueSchema,
      customShipExact: draftMetafieldValueSchema,
      lineItemProducts: draftMetafieldValueSchema,
      lineItems: z
        .object({
          pageInfo: z.object({hasNextPage: z.boolean()}),
          nodes: z.array(
            z.object({
              quantity: z.number().int(),
              customAttributes: z.array(draftOrderCustomAttributeSchema),
            }),
          ),
        })
        .optional(),
    })
    .nullable(),
});

export const draftOrderTagsResponseSchema = z.object({
  draftOrder: z
    .object({
      id: z.string(),
      tags: z.array(z.string()),
    })
    .nullable(),
});

export const saveDraftMutationResponseSchema = z.object({
  draftOrderCreate: z.object({
    draftOrder: z
      .object({
        id: z.string(),
        name: z.string().nullable().optional(),
        status: z.string(),
        customer: draftOrderCustomerSchema,
        customAttributes: z.array(draftOrderCustomAttributeSchema),
      })
      .nullable(),
    userErrors: z.array(
      z.object({
        field: z.array(z.string()).optional().nullable(),
        message: z.string(),
      }),
    ),
  }),
});

export const updateDraftMutationResponseSchema = z.object({
  draftOrderUpdate: z.object({
    draftOrder: z
      .object({
        id: z.string(),
        name: z.string().nullable().optional(),
        status: z.string(),
        customer: draftOrderCustomerSchema,
        customAttributes: z.array(draftOrderCustomAttributeSchema),
      })
      .nullable(),
    userErrors: z.array(
      z.object({
        field: z.array(z.string()).optional().nullable(),
        message: z.string(),
      }),
    ),
  }),
});

const draftOrderListMetafieldSchema = z
  .object({
    value: nullableStringSchema,
  })
  .nullable()
  .optional();

export const draftOrdersListResponseSchema = z.object({
  draftOrders: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        name: nullableStringSchema,
        status: nullableStringSchema,
        invoiceUrl: nullableStringSchema,
        createdAt: nullableStringSchema,
        updatedAt: nullableStringSchema,

        totalPriceSet: z
          .object({
            shopMoney: z
              .object({
                amount: z.string(),
                currencyCode: z.string(),
              })
              .nullable(),
          })
          .nullable(),

        customer: z
          .object({
            id: z.string(),
            displayName: nullableStringSchema,
            email: nullableStringSchema,
          })
          .nullable()
          .optional(),

        lineItems: draftOrderLineItemsSchema,

        description: draftOrderListMetafieldSchema,
        utxBrands: draftOrderListMetafieldSchema,
        utxCustomerName: draftOrderListMetafieldSchema,
        deliveries: draftOrderListMetafieldSchema,
      }),
    ),
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      endCursor: z.string().nullable(),
    }),
  }),
  productVendors: z.object({
    nodes: z.array(z.string()),
  }),
  companies: z.object({
    nodes: z.array(
      z.object({
        locations: z.object({
          nodes: z.array(
            z.object({
              id: z.string(),
              name: nullableStringSchema,
            }),
          ),
        }),
      }),
    ),
  }),
});

export const setDraftMetafieldResponseSchema = z.object({
  metafieldsSet: z.object({
    metafields: z.array(
      z.object({
        namespace: z.string(),
        key: z.string(),
        type: z.string(),
      }),
    ),
    userErrors: z.array(
      z.object({
        field: z.array(z.string()).optional().nullable(),
        message: z.string(),
      }),
    ),
  }),
});
