// NOTE: https://shopify.dev/docs/api/customer/latest/queries/customer
// Only the id — used to stamp `created_by` on records the signed-in user creates.
export const CURRENT_CUSTOMER_ID_QUERY = `#graphql
  query CurrentCustomerId {
    customer {
      id
    }
  }
` as const;
