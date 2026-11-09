import {
  APP_NAMESPACE,
  DRAFT_ORDER_METAFIELD_KEYS,
  METAOBJECT_TYPES,
} from '~/shared/constants/metafields';
import { DRAFT_ORDER_LINE_ITEMS_SELECTION } from './draft-order-line-items';

export const GET_DRAFT_ORDERS_QUERY = `
  query GetDraftOrders($first: Int!, $vendorFirst: Int!, $after: String) {
    draftOrders(first: $first, after: $after) {
      nodes {
        id
        name
        status
        invoiceUrl
        createdAt
        updatedAt

        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }

        customer {
          id
          displayName
          email
        }

        ${DRAFT_ORDER_LINE_ITEMS_SELECTION}

        description: metafield(
          namespace: "${APP_NAMESPACE}"
          key: "${DRAFT_ORDER_METAFIELD_KEYS.description}"
        ) {
          value
        }
        utxBrands: metafield(
          namespace: "${APP_NAMESPACE}"
          key: "${DRAFT_ORDER_METAFIELD_KEYS.utxBrands}"
        ) {
          value
        }
        utxCustomerName: metafield(
          namespace: "${APP_NAMESPACE}"
          key: "${DRAFT_ORDER_METAFIELD_KEYS.utxCustomerName}"
        ) {
          value
        }
        deliveries: metafield(
          namespace: "${APP_NAMESPACE}"
          key: "${DRAFT_ORDER_METAFIELD_KEYS.deliveries}"
        ) {
          value
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    productVendors(first: $vendorFirst) {
      nodes
    }
    companies(first: 50) {
      nodes {
        locations(first: 10) {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`;
