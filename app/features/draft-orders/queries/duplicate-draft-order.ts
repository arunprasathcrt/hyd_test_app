/** Everything `draftOrderCreate` needs to copy a saved draft. */
export const DUPLICATE_SOURCE_DRAFT_QUERY = `
  query DuplicateSourceDraftOrder($id: ID!) {
    node(id: $id) {
      ... on DraftOrder {
        id
        note2
        poNumber
        tags
        taxExempt
        customer {
          id
        }
        customAttributes {
          key
          value
        }
        metafields(first: 250) {
          nodes {
            namespace
            key
            type
            value
          }
        }
        lineItems(first: 100) {
          nodes {
            title
            quantity
            taxable
            variant {
              id
            }
            originalUnitPriceSet {
              shopMoney {
                amount
              }
            }
            customAttributes {
              key
              value
            }
          }
        }
      }
    }
  }
`;

export const DUPLICATE_DRAFT_MUTATION = `
  mutation DuplicateDraftOrder($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
      }
      userErrors {
        field
        message
      }
    }
  }
`;
