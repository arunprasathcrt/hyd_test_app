/**
 * Admin API document for one Presentation Collection's title. The Products page
 * reads it to name the target strip for a Shopify presentation.
 *
 * Deliberately NOT tagged `#graphql`, for the same reason as the other Admin
 * documents. The response is parsed by `adminPresentationCollectionNameResponseSchema`.
 */
export const PRESENTATION_COLLECTION_NAME_QUERY = `
  query GetPresentationCollectionName($id: ID!) {
    collection(id: $id) {
      id
      title
    }
  }
`;
