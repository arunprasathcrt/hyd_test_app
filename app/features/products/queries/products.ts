/**
 * Storefront API documents for the live Products catalog.
 *
 * Deliberately NOT tagged `#graphql` — these documents haven't been run
 * through `npm run codegen` against the store, so there is no generated type
 * for them yet; the response is validated by `liveProductsResponseSchema` /
 * `collectionProductsPageResponseSchema` instead (same convention as the
 * Accounts `queries/companies.ts` document).
 *
 * Metafield namespaces/keys are interpolated from
 * `shared/constants/metafields.ts`, never inlined (coding rule 9).
 */
import {
  ART_PLACEMENT_GROUP_FIELD_KEY,
  PRODUCT_METAFIELD_NAMESPACES,
  PRODUCT_METAFIELD_KEYS,
  PRODUCT_REFERENCE_LABEL_FIELD_KEYS,
} from '~/shared/constants/metafields';

const NS = PRODUCT_METAFIELD_NAMESPACES;
const KEYS = PRODUCT_METAFIELD_KEYS;
const LABEL_KEYS = PRODUCT_REFERENCE_LABEL_FIELD_KEYS;

/** Plain scalar metafield — read directly off `.value`. */
const scalarField = (alias: string, namespace: string, key: string) => `
        ${alias}: metafield(namespace: "${namespace}", key: "${key}") {
          value
        }`;

/** `list.metaobject_reference` metafield — resolve each reference's label field. */
const referenceListField = (
  alias: string,
  namespace: string,
  key: string,
  labelFieldKey: string,
  first = 10,
) => `
        ${alias}: metafield(namespace: "${namespace}", key: "${key}") {
          references(first: ${first}) {
            nodes {
              ... on Metaobject {
                field(key: "${labelFieldKey}") {
                  value
                }
              }
            }
          }
        }`;

/** Single `metaobject_reference` metafield (not a list) — resolve the one reference's label field. */
const referenceField = (
  alias: string,
  namespace: string,
  key: string,
  labelFieldKey: string,
) => `
        ${alias}: metafield(namespace: "${namespace}", key: "${key}") {
          reference {
            ... on Metaobject {
              field(key: "${labelFieldKey}") {
                value
              }
            }
          }
        }`;

/** Shared product field selection — reused by the flat feed and the per-collection fetch below. */
export const PRODUCT_NODE_FIELDS = `
        id
        handle
        title
        vendor
        productType
        featuredImage {
          url
        }
        priceRange {
          minVariantPrice {
            amount
          }
        }
        variants(first: 1) {
          nodes {
            sku
            selectedOptions {
              name
              value
            }
          }
        }
        options(first: 5) {
          name
          optionValues {
            name
            swatch {
              color
            }
          }
        }
        leadTime: metafield(namespace: "${PRODUCT_METAFIELD_NAMESPACES.leadTime}", key: "${PRODUCT_METAFIELD_KEYS.leadTime}") {
          value
        }
        color: metafield(namespace: "${PRODUCT_METAFIELD_NAMESPACES.color}", key: "${PRODUCT_METAFIELD_KEYS.color}") {
          value
        }
        styleCode: metafield(namespace: "${PRODUCT_METAFIELD_NAMESPACES.styleCode}", key: "${PRODUCT_METAFIELD_KEYS.styleCode}") {
          value
        }
        tier: metafield(namespace: "${PRODUCT_METAFIELD_NAMESPACES.tier}", key: "${PRODUCT_METAFIELD_KEYS.tier}") {
          references(first: 1) {
            nodes {
              ... on Metaobject {
                field(key: "name") {
                  value
                }
              }
            }
          }
        }
        moq: metafield(namespace: "${PRODUCT_METAFIELD_NAMESPACES.moq}", key: "${PRODUCT_METAFIELD_KEYS.moq}") {
          value
        }
        artPlacement: metafield(namespace: "${PRODUCT_METAFIELD_NAMESPACES.artPlacement}", key: "${PRODUCT_METAFIELD_KEYS.artPlacement}") {
          references(first: 50) {
            nodes {
              ... on Metaobject {
                id
                field(key: "art_name") {
                  value
                }
                group: field(key: "${ART_PLACEMENT_GROUP_FIELD_KEY}") {
                  value
                }
              }
            }
          }
        }
        ${scalarField('productGender', NS.productGender, KEYS.productGender)}
        ${scalarField('genderFilter', NS.genderFilter, KEYS.genderFilter)}
        ${referenceListField('salesChannel', NS.salesChannel, KEYS.salesChannel, LABEL_KEYS.salesChannel, 5)}
        ${referenceListField('season', NS.season, KEYS.season, LABEL_KEYS.season, 5)}
        ${referenceListField('regionState', NS.regionState, KEYS.regionState, LABEL_KEYS.regionState, 10)}
        ${referenceListField('sportUse', NS.sportUse, KEYS.sportUse, LABEL_KEYS.sportUse, 5)}
        ${referenceListField('feature', NS.feature, KEYS.feature, LABEL_KEYS.feature, 10)}
        ${referenceListField('fabric', NS.fabric, KEYS.fabric, LABEL_KEYS.fabric, 5)}
        ${scalarField('newness', NS.newness, KEYS.newness)}
        ${referenceListField('license', NS.license, KEYS.license, LABEL_KEYS.license, 10)}
        ${scalarField('licensed', NS.licensed, KEYS.licensed)}
        ${scalarField('customizable', NS.customizable, KEYS.customizable)}
        ${scalarField('colorCount', NS.colorCount, KEYS.colorCount)}
        ${scalarField('brandCatalog', NS.brandCatalog, KEYS.brandCatalog)}
        ${scalarField('sizeRun', NS.sizeRun, KEYS.sizeRun)}
        ${scalarField('atpSizeGroup', NS.atpSizeGroup, KEYS.atpSizeGroup)}
        ${scalarField('atpSixWeekOutlook', NS.atpSixWeekOutlook, KEYS.atpSixWeekOutlook)}
        ${scalarField('atpTotalToday', NS.atpTotalToday, KEYS.atpTotalToday)}
        ${scalarField('atpIncomingQty', NS.atpIncomingQty, KEYS.atpIncomingQty)}
        ${scalarField('atpIncomingPo', NS.atpIncomingPo, KEYS.atpIncomingPo)}
        ${scalarField('atpIncomingDate', NS.atpIncomingDate, KEYS.atpIncomingDate)}
        ${scalarField('atpFutureIncomingQty', NS.atpFutureIncomingQty, KEYS.atpFutureIncomingQty)}
        ${scalarField('atpFuturePo', NS.atpFuturePo, KEYS.atpFuturePo)}
        ${scalarField('atpFutureIncomingDate', NS.atpFutureIncomingDate, KEYS.atpFutureIncomingDate)}
        ${scalarField('agvSourceHash', NS.agvSourceHash, KEYS.agvSourceHash)}
        ${scalarField('agvVersion', NS.agvVersion, KEYS.agvVersion)}
        ${scalarField('agvStatus', NS.agvStatus, KEYS.agvStatus)}
        ${scalarField('agvProductionTypes', NS.agvProductionTypes, KEYS.agvProductionTypes)}
        ${scalarField('agvProcessMethods', NS.agvProcessMethods, KEYS.agvProcessMethods)}
        ${scalarField('agvLocations', NS.agvLocations, KEYS.agvLocations)}
        ${scalarField('agvPayload', NS.agvPayload, KEYS.agvPayload)}
        ${scalarField('licenseExpiration', NS.licenseExpiration, KEYS.licenseExpiration)}
        ${scalarField('artProcessMethod', NS.artProcessMethod, KEYS.artProcessMethod)}
        ${scalarField('bundlePrice', NS.bundlePrice, KEYS.bundlePrice)}
        ${scalarField('bundleWorkflowStatus', NS.bundleWorkflowStatus, KEYS.bundleWorkflowStatus)}
        ${scalarField('disclosure', NS.disclosure, KEYS.disclosure)}
        ${scalarField('netsuiteItemId', NS.netsuiteItemId, KEYS.netsuiteItemId)}
        ${referenceField('catalogBrand', NS.catalogBrand, KEYS.catalogBrand, LABEL_KEYS.catalogBrand)}
        ${scalarField('institution', NS.institution, KEYS.institution)}
        ${scalarField('lifecycle', NS.lifecycle, KEYS.lifecycle)}
        ${scalarField('blankSupplier', NS.blankSupplier, KEYS.blankSupplier)}
        ${scalarField('colorOptions', NS.colorOptions, KEYS.colorOptions)}
        ${scalarField('decorationZoneMap', NS.decorationZoneMap, KEYS.decorationZoneMap)}
        ${referenceListField('decorationMethod', NS.decorationMethod, KEYS.decorationMethod, LABEL_KEYS.decorationMethod, 10)}
        ${referenceListField('available', NS.available, KEYS.available, LABEL_KEYS.available, 5)}
        ${referenceListField('category', NS.category, KEYS.category, LABEL_KEYS.category, 5)}`;

/** Cursor-paginated so every vendor's full catalog is fetched, not just one page. */
export const PRODUCTS_LIVE_QUERY = `
  query ProductsLive($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      nodes {
        ${PRODUCT_NODE_FIELDS}
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * Lightweight paginated list of every collection in the store — id + title
 * only. Walked page by page (see `discoverViewCollectionIds` in
 * `product.server.ts`) to classify each collection by title into a view role
 * (all/styles/arts/reorder) without hardcoding any collection id.
 */
export const COLLECTIONS_LIST_QUERY = `
  query CollectionsList($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      nodes {
        id
        title
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

/**
 * One page of a view collection's products. The ids are discovered dynamically via
 * `COLLECTIONS_LIST_QUERY` + title classification, never hardcoded. The loader walks
 * `pageInfo` until every product of the collection is read, so the chip counts are
 * the store's real sizes, not a page cap.
 */
export const COLLECTION_PRODUCTS_PAGE_QUERY = `
  query CollectionProductsPage($id: ID!, $first: Int!, $after: String) {
    collection(id: $id) {
      id
      title
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ${PRODUCT_NODE_FIELDS}
        }
      }
    }
  }
`;
