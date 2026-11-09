/**
 * Admin API document for the Collections tagged for presentations. The tag is
 * read from the `custom.tags` metafield, matched through Shopify's search
 * syntax. Products are selected for the Presentations mapper.
 *
 * Deliberately NOT tagged `#graphql`. That tag opts a document into Hydrogen's
 * codegen, which only holds the Storefront and Customer Account schemas. The
 * response is parsed by `adminPresentationCollectionsResponseSchema` instead.
 */
export const PRESENTATION_COLLECTIONS_QUERY = `
  query GetPresentationCollections($first: Int!, $after: String) {
    collections(
      first: $first
      after: $after
      query: "metafields.custom.tags:presentation"
    ) {
      edges {
        node {
          id
          title
          handle
          updatedAt
          tags: metafield(namespace: "custom", key: "tags") {
            value
          }
          neededBy: metafield(namespace: "custom", key: "needed_by") {
            value
          }
          customer: metafield(namespace: "custom", key: "customer") {
            value
          }
          status: metafield(namespace: "custom", key: "status") {
            value
          }
          customerCode: metafield(namespace: "custom", key: "customer_code") {
            value
          }
          repName: metafield(namespace: "custom", key: "rep_name") {
            value
          }
          products(first: 50) {
            nodes {
              id
              title
              handle
              featuredImage {
                url
                altText
              }
              brand: metafield(namespace: "custom", key: "brand") {
                value
              }
              moq: metafield(namespace: "custom", key: "moq") {
                value
              }
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
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

/**
 * Admin API document for one Presentation Collection, by its GID. It feeds the
 * Presentation Details page for Shopify-backed presentations.
 *
 * Deliberately NOT tagged `#graphql`, for the same reason as the queries above.
 * The response is parsed by `adminPresentationCollectionDetailResponseSchema`.
 */
export const PRESENTATION_COLLECTION_DETAIL_QUERY = `
  query GetPresentationCollectionDetail($id: ID!) {
    collection(id: $id) {
      id
      title
      handle
      updatedAt
      tags: metafield(namespace: "custom", key: "tags") {
        value
      }
      customer: metafield(namespace: "custom", key: "customer") {
        value
      }
      neededBy: metafield(namespace: "custom", key: "needed_by") {
        value
      }
      status: metafield(namespace: "custom", key: "status") {
        value
      }
      customerCode: metafield(namespace: "custom", key: "customer_code") {
        value
      }
      repName: metafield(namespace: "custom", key: "rep_name") {
        value
      }
      createdBy: metafield(namespace: "custom", key: "created_by") {
        value
      }
      products(first: 50) {
        nodes {
          id
          title
          handle
          vendor
          featuredImage {
            url
            altText
          }
          moq: metafield(namespace: "garment", key: "min_order_qty") {
            value
          }
          catalogBrand: metafield(namespace: "uts", key: "brand") {
            reference {
              ... on Metaobject {
                field(key: "name") {
                  value
                }
              }
            }
          }
          variants(first: 100) {
            nodes {
              sku
              selectedOptions {
                name
                value
              }
            }
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

/**
 * Admin API mutation that creates the Shopify Collection for a presentation.
 * The metafields are set in the same request, so the collection is created with
 * its tag, customer and needed-by date together.
 *
 * Deliberately NOT tagged `#graphql`, for the same reason as the queries above.
 */
export const COLLECTION_CREATE_MUTATION = `
  mutation CreatePresentationCollection($collection: CollectionCreateInput!) {
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


export const COLLECTION_UPDATE_MUTATION = `
  mutation UpdatePresentationCollection($input: CollectionInput!) {
    collectionUpdate(input: $input) {
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
