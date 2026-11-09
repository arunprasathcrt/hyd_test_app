import {
  APP_NAMESPACE,
  COMPANY_METAFIELD_KEYS,
  COMPANY_METAFIELD_NAMESPACE,
  COMPANY_APP_METAFIELD_KEYS,
  METAOBJECT_TYPES,
} from '~/shared/constants/metafields';

export const GET_SHOPIFY_USERS_QUERY = `
  query GetShopifyUsers($after: String) {
    staffMembers(first: 100, after: $after) {
      nodes {
        id
        name
        firstName
        lastName
        email
        active
        isShopOwner
        accountType
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_CURRENT_SHOPIFY_USER_QUERY = `
  query GetCurrentShopifyUser {
    currentStaffMember {
      id
      name
      email
      active
      accountType
    }
  }
`;

/**
 * Admin query for New Draft Order Step 1 data (customers + brands).
 *
 * Deliberately not tagged with `#graphql`: this is Admin API, so it is parsed
 * by Zod instead of Storefront codegen.
 */
export const NEW_DRAFT_ORDER_STEP1_QUERY = `
  query NewDraftOrderStep1($companyFirst: Int!, $vendorFirst: Int!) {
    companies(first: $companyFirst) {
      nodes {
        id
        name
        externalId
        locations(first: 250) {
          nodes {
            id
            name
            externalId
            shippingAddress { ...NewDraftOrderAddress }
            billingAddress { ...NewDraftOrderAddress }
          }
        }
        segment: metafield(namespace: "${APP_NAMESPACE}", key: "segment") { value }
        tier: metafield(namespace: "${APP_NAMESPACE}", key: "tier") { value }
        terms: metafield(namespace: "${APP_NAMESPACE}", key: "terms") { value }
        royaltyRate: metafield(namespace: "${APP_NAMESPACE}", key: "royalty_rate") { value }
        vip: metafield(namespace: "${APP_NAMESPACE}", key: "vip") { value }
        repName: metafield(namespace: "${COMPANY_METAFIELD_NAMESPACE}", key: "${COMPANY_METAFIELD_KEYS.repName}") { value }
        defaultShipTo: metafield(namespace: "${APP_NAMESPACE}", key: "${COMPANY_APP_METAFIELD_KEYS.defaultShipToLocationId}") { value }
      }
    }
    productVendors(first: $vendorFirst) {
      nodes
    }
  }

  fragment NewDraftOrderAddress on CompanyAddress {
    recipient
    companyName
    address1
    address2
    city
    countryCode
    zoneCode
    zip
    phone
  }
`;

/** Admin query for one customer, with the same fields Step 1 lists, for the list's Preview. */
export const NEW_DRAFT_ORDER_COMPANY_QUERY = `
  query NewDraftOrderCompany($id: ID!) {
    node(id: $id) {
      ... on Company {
        id
        name
        externalId
        locations(first: 10) {
          nodes {
            id
            name
            externalId
            shippingAddress { ...NewDraftOrderAddress }
            billingAddress { ...NewDraftOrderAddress }
          }
        }
        segment: metafield(namespace: "${APP_NAMESPACE}", key: "segment") { value }
        tier: metafield(namespace: "${APP_NAMESPACE}", key: "tier") { value }
        terms: metafield(namespace: "${APP_NAMESPACE}", key: "terms") { value }
        royaltyRate: metafield(namespace: "${APP_NAMESPACE}", key: "royalty_rate") { value }
        vip: metafield(namespace: "${APP_NAMESPACE}", key: "vip") { value }
        repName: metafield(namespace: "${COMPANY_METAFIELD_NAMESPACE}", key: "${COMPANY_METAFIELD_KEYS.repName}") { value }
      }
    }
  }

  fragment NewDraftOrderAddress on CompanyAddress {
    recipient
    companyName
    address1
    city
    zoneCode
    zip
    phone
  }
`;

/** Storefront query for the two program-code metaobject catalogs used in Step 1. */
export const PROGRAM_CODE_LISTS_QUERY = `
  query NewDraftOrderProgramCodeLists($first: Int!) {
    programCodes: metaobjects(type: "${METAOBJECT_TYPES.programCode}", first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
    programCodes2: metaobjects(type: "${METAOBJECT_TYPES.programCodeList2}", first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
`;

/** Storefront query for the Step 2 classification and interface choices. */
export const DRAFT_ORDER_OPTIONS_QUERY = `
  query NewDraftOrderOptions($first: Int!) {
    classifications: metaobjects(type: "${METAOBJECT_TYPES.orderClassification}", first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
    interfaces: metaobjects(type: "${METAOBJECT_TYPES.draftOrderInterface}", first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
`;
