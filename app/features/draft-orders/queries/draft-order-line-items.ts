/**
 * Line item selection shared by the list and the single-draft queries, so both
 * feed `mapDraftOrderLines` the same fields. The builder saves custom lines
 * (`utx_*` attributes); lines added in Shopify admin are real variants.
 */
export const DRAFT_ORDER_LINE_ITEMS_SELECTION = `
  lineItems(first: 50) {
    nodes {
      id
      title
      variantTitle
      sku
      quantity
      variant {
        id
        selectedOptions {
          name
          value
        }
        product {
          id
        }
      }
      image {
        url
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
`;
