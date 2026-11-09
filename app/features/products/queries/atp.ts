import {VARIANT_ATP_RECORDS_METAFIELD} from '~/shared/constants/metafields';

/** Admin API document for the quick view's on-hand inventory by size. */
export const PRODUCT_ATP_QUERY = `
  query ProductAtp($id: ID!, $after: String) {
    product(id: $id) {
      id
      productType
      variants(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          inventoryQuantity
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
`;

/**
 * Storefront API document for each variant's ATP records (size, PO, date, units).
 * Storefront, not Admin: the Admin token cannot read metaobjects.
 */
export const PRODUCT_ATP_RECORDS_QUERY = `
  query ProductAtpRecords($id: ID!, $after: String) {
    product(id: $id) {
      variants(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          atpRecords: metafield(
            namespace: "${VARIANT_ATP_RECORDS_METAFIELD.namespace}",
            key: "${VARIANT_ATP_RECORDS_METAFIELD.key}"
          ) {
            references(first: 20) {
              nodes {
                ... on Metaobject {
                  fields {
                    key
                    value
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
