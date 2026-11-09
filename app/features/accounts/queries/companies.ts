/**
 * Admin API documents for the Accounts list.
 *
 * B2B Companies are Plus-only and exist solely on the Admin API, so these
 * cannot go through the Storefront client. Requires the `read_customers` scope
 * on the custom app.
 *
 * Deliberately NOT tagged `#graphql`. That tag opts a document into Hydrogen's
 * codegen, which only holds the Storefront and Customer Account schemas — it
 * would fail with `Cannot query field "companies" on type "QueryRoot"`. The
 * cost is no editor autocomplete here; the compensating control is that every
 * response is parsed by a Zod schema in `../schemas/account.schema.ts`.
 *
 * Metafield keys are interpolated from `shared/constants/metafields.ts` rather
 * than inlined, so a key rename is a one-line change (coding rule 9). The
 * GraphQL *aliases* match the field names in `companyMetafieldsSchema`, which
 * is what keeps the document and the parser from drifting.
 */
import {
  COMPANY_METAFIELD_NAMESPACE,
  COMPANY_METAFIELD_KEYS,
  COMPANY_BRANDS_METAFIELD_NAMESPACE,
  COMPANY_BRANDS_METAFIELD_KEY,
} from '~/shared/constants/metafields';

/**
 * The metric metafields, aliased to their schema field names.
 *
 * Namespace is `custom`, not `$app` — see the ❗ DEVIATION note on
 * `COMPANY_METAFIELD_NAMESPACE`. `ordersYtd` and `casesOpen` have no backing
 * definition on the store yet; Shopify returns `null` for an undefined
 * metafield rather than erroring, so the selection is safe to keep ahead of
 * those landing.
 */
const COMPANY_METRIC_METAFIELDS = `
    segment: metafield(namespace: "${COMPANY_METAFIELD_NAMESPACE}", key: "${COMPANY_METAFIELD_KEYS.segment}") { value }
    ordersYtd: metafield(namespace: "${COMPANY_METAFIELD_NAMESPACE}", key: "${COMPANY_METAFIELD_KEYS.ordersYtd}") { value }
    shippedYtd: metafield(namespace: "${COMPANY_METAFIELD_NAMESPACE}", key: "${COMPANY_METAFIELD_KEYS.shippedYtd}") { value }
    openOrders: metafield(namespace: "${COMPANY_METAFIELD_NAMESPACE}", key: "${COMPANY_METAFIELD_KEYS.openOrders}") { value }
    goal: metafield(namespace: "${COMPANY_METAFIELD_NAMESPACE}", key: "${COMPANY_METAFIELD_KEYS.goal}") { value }
    forecastFy: metafield(namespace: "${COMPANY_METAFIELD_NAMESPACE}", key: "${COMPANY_METAFIELD_KEYS.forecastFy}") { value }
    yoyGrowth: metafield(namespace: "${COMPANY_METAFIELD_NAMESPACE}", key: "${COMPANY_METAFIELD_KEYS.yoyGrowth}") { value }
    pastDue: metafield(namespace: "${COMPANY_METAFIELD_NAMESPACE}", key: "${COMPANY_METAFIELD_KEYS.pastDue}") { value }
    brands: metafield(namespace: "${COMPANY_BRANDS_METAFIELD_NAMESPACE}", key: "${COMPANY_BRANDS_METAFIELD_KEY}") { value }
`;

/**
 * The location selection. Only the first location is taken: the Accounts row
 * shows one place, and B2B companies commonly fill in one of the two addresses
 * but not the other, which `toAccount` resolves.
 *
 * ❓ TO CONFIRM — which location the row should show when a company has
 * several. `first: 1` reproduces the prototype, which assumed one.
 */
const COMPANY_LOCATIONS = `
    locations(first: 1) {
      nodes {
        id
        name
        billingAddress {
          city
          province
          zip
          countryCode
        }
        shippingAddress {
          city
          province
          zip
          countryCode
        }
      }
    }
`;

/**
 * Order history for the profile drawer's Orders tab, nested directly under
 * `company` rather than fetched by a separate route/call. The list already
 * makes one Admin round trip per page load, so folding orders in here keeps
 * that at one request instead of adding a per-account fetch when the drawer
 * opens — `OrdersTab` just reads `account.orderRows`, no fetcher involved.
 * `first: 10` caps the payload; this is history, not a paginated view.
 */
const COMPANY_ORDERS = `
    orders(first: 10, sortKey: CREATED_AT, reverse: true) {
      nodes {
        id
        name
        poNumber
        createdAt
        displayFinancialStatus
        displayFulfillmentStatus
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 50) {
          nodes {
            id
            title
            variantTitle
            sku
            quantity
            variant {
              selectedOptions {
                name
                value
              }
            }
            originalUnitPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            originalTotalSet {
              shopMoney {
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
 * B2B companies for the Accounts list. Always fetched unfiltered and
 * unsorted — search and sort both run entirely client-side over this page
 * (see `AccountsPage`), so there is no `query`/`sortKey` argument to pass.
 */
export const COMPANIES_QUERY = `
  query AdminCompanies($first: Int!, $after: String) {
    companies(first: $first, after: $after) {
      nodes {
        id
        name
${COMPANY_LOCATIONS}
${COMPANY_METRIC_METAFIELDS}
${COMPANY_ORDERS}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * A single company, for the account overview. The same selection as the list,
 * so `toAccount` can map either response.
 */
export const COMPANY_QUERY = `
  query AdminCompany($id: ID!) {
    company(id: $id) {
      id
      name
${COMPANY_LOCATIONS}
${COMPANY_METRIC_METAFIELDS}
${COMPANY_ORDERS}
    }
  }
`;
