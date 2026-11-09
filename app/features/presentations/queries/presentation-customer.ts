import { COMPANY_METAFIELD_NAMESPACE, COMPANY_METAFIELD_KEYS, APP_NAMESPACE } from '~/shared/constants/metafields';

export const PRESENTATION_CUSTOMERS_QUERY = `
  query PresentationCustomers($first: Int!) {
    companies(first: $first) {
      nodes {
        id
        name
        mainContact {
          customer {
            firstName
            lastName
          }
        }
        segment: metafield(
          namespace: "${COMPANY_METAFIELD_NAMESPACE}",
          key: "${COMPANY_METAFIELD_KEYS.segment}"
        ) { value }
        tier: metafield(
          namespace: "${COMPANY_METAFIELD_NAMESPACE}",
          key: "${COMPANY_METAFIELD_KEYS.tier}"
        ) { value }
        customerCode: metafield(
          namespace: "${COMPANY_METAFIELD_NAMESPACE}",
          key: "${COMPANY_METAFIELD_KEYS.customerCode}"
        ) { value }
        repName: metafield(
          namespace: "${COMPANY_METAFIELD_NAMESPACE}",
          key: "${COMPANY_METAFIELD_KEYS.repName}"
        ) { value }
      }
    }
  }
`;