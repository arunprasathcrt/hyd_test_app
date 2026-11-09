/**
 * Admin API document for one Customer's display name. The Presentation Details
 * header reads it to name the user in the collection's `custom.created_by`.
 *
 * Deliberately NOT tagged `#graphql`, for the same reason as the other Admin
 * documents. The response is parsed by `adminCustomerNameResponseSchema`.
 */
export const CUSTOMER_NAME_QUERY = `
  query GetCustomerName($id: ID!) {
    customer(id: $id) {
      id
      displayName
    }
  }
`;
