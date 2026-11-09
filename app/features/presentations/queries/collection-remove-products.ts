export const REMOVE_PRODUCTS_FROM_PRESENTATION_MUTATION = `
  mutation RemoveProductsFromPresentationCollection(
    $id: ID!
    $productIds: [ID!]!
  ) {
    collectionRemoveProducts(
      id: $id
      productIds: $productIds
    ) {
      job {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;