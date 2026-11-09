/** Admin API documents for adding products to a presentation collection source. */
export const PRESENTATION_COLLECTION_SOURCES_QUERY = `
  query PresentationCollectionSources($id: ID!) {
    collection(id: $id) {
      id
      sources {
        __typename
        id
        title
      }
    }
  }
`;

export const ADD_PRODUCTS_TO_PRESENTATION_MUTATION = `
  mutation AddProductsToPresentationCollection(
    $collectionId: ID!
    $sourceId: ID!
    $selections: [CollectionInclusionProductSelectionInput!]!
  ) {
    collectionUpdate(
      collection: {
        id: $collectionId
        sourcesToUpdate: [
          {
            condition: {
              id: $sourceId
              inclusion: {selectionsToAdd: $selections}
            }
          }
        ]
      }
    ) {
      collection {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CREATE_PRESENTATION_SOURCE_MUTATION = `
  mutation CreatePresentationSource(
    $collectionId: ID!
    $title: String!
    $selections: [CollectionInclusionProductSelectionInput!]!
  ) {
    collectionUpdate(
      collection: {
        id: $collectionId
        sourcesToCreate: [
          {
            source: {
              title: $title
              inclusion: {
                matchType: ALL
                selections: $selections
              }
            }
          }
        ]
      }
    ) {
      collection {
        id
        sources {
          __typename
          id
          title
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
