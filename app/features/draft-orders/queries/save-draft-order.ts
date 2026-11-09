import {
  APP_NAMESPACE,
  DRAFT_ORDER_LINE_ITEMS_METAFIELD,
  DRAFT_ORDER_METAFIELD_KEYS,
  DRAFT_ORDER_OPTION_METAFIELD_KEYS,
  PROGRAM_CODE_METAFIELD_KEYS,
} from '~/shared/constants/metafields';
import {DRAFT_ORDER_LINE_ITEMS_SELECTION} from './draft-order-line-items';

/**
 * Admin queries/mutations used by New Draft Order save.
 *
 * Deliberately not tagged with `#graphql`: these are Admin API documents,
 * parsed with Zod instead of Storefront codegen.
 */

export const SAVE_DRAFT_COMPANY_QUERY = `
  query SaveDraftCompany($id: ID!) {
    node(id: $id) {
      ... on Company {
        id
        name
      }
    }
  }
`;

export const LOAD_DRAFT_QUERY = `
  query LoadDraftOrder($id: ID!) {
    node(id: $id) {
      ... on DraftOrder {
        id
        name
        poNumber
        createdAt
        subtotalPriceSet {
          shopMoney {
            amount
          }
        }
        totalTaxSet {
          shopMoney {
            amount
          }
        }
        customer {
          displayName
        }

        ${DRAFT_ORDER_LINE_ITEMS_SELECTION}

        appPoNumber: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.poNumber}"
        ) {
          value
        }

        customPoNumber: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.poNumber}"
        ) {
          value
        }

        customAttributes {
          key
          value
        }

        description: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.description}"
        ) {
          value
        }

        orderName: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.orderName}"
        ) {
          value
        }

        leadTimeFlags: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.leadTimeFlags}"
        ) {
          value
        }

        leadTimeMethods: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.leadTimeMethods}"
        ) {
          value
        }

        orderType: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.orderType}"
        ) {
          value
        }

        programCodeList: metafield(
          namespace: "custom",
          key: "${PROGRAM_CODE_METAFIELD_KEYS.first}"
        ) {
          value
        }

        programCodeList2: metafield(
          namespace: "custom",
          key: "${PROGRAM_CODE_METAFIELD_KEYS.second}"
        ) {
          value
        }

        interfaceModeList: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_OPTION_METAFIELD_KEYS.interface}"
        ) {
          value
        }

        orderClassificationList: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_OPTION_METAFIELD_KEYS.classification}"
        ) {
          value
        }

        inHandsDate: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.inHandsDate}"
        ) {
          value
        }

        deliveries: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.deliveries}"
        ) {
          value
        }

        customDeliveries: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.deliveries}"
        ) {
          value
        }

        shipCode: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.shipCode}"
        ) {
          value
        }

        customShipCode: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.shipCode}"
        ) {
          value
        }

        billToLocationId: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.billToLocationId}"
        ) {
          value
        }

        customBillToLocationId: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.billToLocationId}"
        ) {
          value
        }

        eventName: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.eventName}"
        ) {
          value
        }

        customEventName: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.eventName}"
        ) {
          value
        }

        eventDate: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.eventDate}"
        ) {
          value
        }

        customEventDate: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.eventDate}"
        ) {
          value
        }

        cancelDate: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.cancelDate}"
        ) {
          value
        }

        customCancelDate: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.cancelDate}"
        ) {
          value
        }

        customHoldReason: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.holdReason}"
        ) {
          value
        }

        appHoldReason: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.holdReason}"
        ) {
          value
        }

        customHoldUntil: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.holdUntil}"
        ) {
          value
        }

        appHoldUntil: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.holdUntil}"
        ) {
          value
        }

        customHoldStatus: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.holdStatus}"
        ) {
          value
        }

        appHoldStatus: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.holdStatus}"
        ) {
          value
        }

        customHoldNote: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.holdNote}"
        ) {
          value
        }

        appHoldNote: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.holdNote}"
        ) {
          value
        }

        customHeldBy: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.heldBy}"
        ) {
          value
        }

        appHeldBy: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.heldBy}"
        ) {
          value
        }

        artNotes: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.artNotes}"
        ) {
          value
        }

        customArtNotes: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.artNotes}"
        ) {
          value
        }

        manufacturingInstructions: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.manufacturingInstructions}"
        ) {
          value
        }

        customManufacturingInstructions: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.manufacturingInstructions}"
        ) {
          value
        }

        invoicePrintComments: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.invoicePrintComments}"
        ) {
          value
        }

        customInvoicePrintComments: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.invoicePrintComments}"
        ) {
          value
        }

        ackPrintComments: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.ackPrintComments}"
        ) {
          value
        }

        customAckPrintComments: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.ackPrintComments}"
        ) {
          value
        }

        shipExact: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.shipExact}"
        ) {
          value
        }

        customShipExact: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.shipExact}"
        ) {
          value
        }

        finalArtLocked: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.finalArtLocked}"
        ) {
          value
        }

        customFinalArtLocked: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.finalArtLocked}"
        ) {
          value
        }

        quantitiesLocked: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.quantitiesLocked}"
        ) {
          value
        }

        customQuantitiesLocked: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.quantitiesLocked}"
        ) {
          value
        }

        lockedBy: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.lockedBy}"
        ) {
          value
        }

        customLockedBy: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.lockedBy}"
        ) {
          value
        }

        lockedDate: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.lockedDate}"
        ) {
          value
        }

        customLockedDate: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.lockedDate}"
        ) {
          value
        }

        customArtApprover: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.artApprover}"
        ) {
          value
        }

        customProofReader: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.proofReader}"
        ) {
          value
        }

        customArtApproverMessage: metafield(
          namespace: "custom",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.artApproverMessage}"
        ) {
          value
        }

        utxBrands: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.utxBrands}"
        ) {
          value
        }
          utxCustomerName: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.utxCustomerName}"
        ) {
          value
        }

        utxOrderType: metafield(
          namespace: "${APP_NAMESPACE}",
          key: "${DRAFT_ORDER_METAFIELD_KEYS.utxOrderType}"
        ) {
          value
        }

        lineItemProducts: metafield(
          namespace: "${DRAFT_ORDER_LINE_ITEMS_METAFIELD.namespace}",
          key: "${DRAFT_ORDER_LINE_ITEMS_METAFIELD.key}"
        ) {
          value
        }

        lineItems(first: 250) {
          pageInfo {
            hasNextPage
          }
          nodes {
            quantity
            customAttributes {
              key
              value
            }
          }
        }
      }
    }
  }
`;

export const SAVE_DRAFT_MUTATION = `
  mutation SaveDraftOrder($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        status

        customer {
          id
          displayName
        }

        customAttributes {
          key
          value
        }

        metafields(first: 50) {
          nodes {
            id
            namespace
            key
            type
            value
          }
        }
      }

      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Reads a draft's current tags. `draftOrderUpdate` replaces the whole tag list,
 * so the update reads these first and keeps the tags it does not own.
 */
export const DRAFT_ORDER_TAGS_QUERY = `
  query GetDraftOrderTags($id: ID!) {
    draftOrder(id: $id) {
      id
      tags
    }
  }
`;

export const UPDATE_DRAFT_MUTATION = `
  mutation UpdateDraftOrder($id: ID!, $input: DraftOrderInput!) {
    draftOrderUpdate(id: $id, input: $input) {
      draftOrder {
        id
        name
        status

        customer {
          id
          displayName
        }

        customAttributes {
          key
          value
        }

        metafields(first: 50) {
          nodes {
            id
            namespace
            key
            type
            value
          }
        }
      }

      userErrors {
        field
        message
      }
    }
  }
`;

export const DELETE_DRAFT_METAFIELDS_MUTATION = `
  mutation DeleteDraftMetafields($metafields: [MetafieldIdentifierInput!]!) {
    metafieldsDelete(metafields: $metafields) {
      userErrors {
        field
        message
      }
    }
  }
`;

// Keep optional reference writes outside draftOrderCreate/Update.
export const SET_DRAFT_METAFIELD_MUTATION = `
  mutation SetDraftMetafield($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        namespace
        key
        type
      }
      userErrors {
        field
        message
      }
    }
  }
`;