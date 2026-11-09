import {APP_NAMESPACE, COMPANY_APP_METAFIELD_KEYS} from '~/shared/constants/metafields';

export const CURRENT_APP_ACCESS_SCOPES_QUERY = `
  query DraftOrderCurrentAppAccessScopes {
    currentAppInstallation {
      accessScopes {
        handle
      }
    }
  }
`;

// Mirrors the company list `NEW_DRAFT_ORDER_STEP1_QUERY` offers in the builder.
export const DRAFT_ORDER_COMPANY_SCOPE_QUERY = `
  query DraftOrderCompanyScope($companyFirst: Int!) {
    companies(first: $companyFirst) {
      nodes {
        id
      }
    }
  }
`;

export const CREATE_COMPANY_LOCATION_MUTATION = `
  mutation CreateDraftDeliveryLocation($companyId: ID!, $input: CompanyLocationInput!) {
    companyLocationCreate(companyId: $companyId, input: $input) {
      companyLocation {
        id
        name
        externalId
        shippingAddress {
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
        billingAddress {
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
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const COMPANY_LOCATION_DELETE_CONTEXT_QUERY = `
  query DraftOrderCompanyLocationDeleteContext($companyId: ID!, $locationFirst: Int!) {
    company(id: $companyId) {
      id
      locations(first: $locationFirst) {
        nodes { id }
      }
      defaultShipTo: metafield(namespace: "${APP_NAMESPACE}", key: "${COMPANY_APP_METAFIELD_KEYS.defaultShipToLocationId}") { value }
    }
  }
`;

export const DELETE_COMPANY_LOCATION_MUTATION = `
  mutation DeleteDraftDeliveryLocation($companyLocationId: ID!) {
    companyLocationDelete(companyLocationId: $companyLocationId) {
      deletedCompanyLocationId
      userErrors {
        field
        message
      }
    }
  }
`;


