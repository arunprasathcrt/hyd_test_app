/** Admin API documents for rep-owned UTX saved collections. */
export const SAVED_COLLECTIONS_QUERY = `
  query SavedCollections($first: Int!, $after: String) {
    collections(
      first: $first
      after: $after
      query: "metafields.custom.tags:utx_saved"
    ) {
      edges {
        node {
          id
          title
          tags: metafield(namespace: "custom", key: "tags") {
            value
          }
          createdBy: metafield(namespace: "custom", key: "created_by") {
            value
          }
          productsCount {
            count
          }
          sources {
            __typename
            id
            title
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const SAVED_COLLECTION_OWNER_QUERY = `
  query SavedCollectionOwner($id: ID!) {
    collection(id: $id) {
      id
      tags: metafield(namespace: "custom", key: "tags") {
        value
      }
      createdBy: metafield(namespace: "custom", key: "created_by") {
        value
      }
      sources {
        __typename
        id
        title
      }
    }
  }
`;

export const SAVED_COLLECTION_CREATE_MUTATION = `
  mutation CreateSavedCollection($collection: CollectionCreateInput!) {
    collectionCreate(collection: $collection) {
      collection {
        id
        title
        handle
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const SAVED_COLLECTION_ADD_PRODUCT_MUTATION = `
  mutation AddProductToSavedCollection(
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

export const COMPANY_NAME_QUERY = `
  query CompanyName($id: ID!) {
    company(id: $id) {
      name
    }
  }
`;
