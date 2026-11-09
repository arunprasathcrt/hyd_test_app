export const REORDER_PRODUCTS_IN_PRESENTATION_COLLECTION_MUTATION = `
  mutation ReorderProductsInPresentationCollection(
    $id: ID!
    $moves: [MoveInput!]!
  ) {
    collectionReorderProducts(
      id: $id
      moves: $moves
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