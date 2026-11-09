import {METAOBJECT_TYPES} from '~/shared/constants/metafields';

/** Storefront API: decoration methods and art/account modifiers for Step 2. Parsed by `lib/metaobjects/lead-time-rules`. */
export const LEAD_TIME_RULES_QUERY = `
  query GetLeadTimeRules($first: Int!) {
    methods: metaobjects(type: "${METAOBJECT_TYPES.productionLeadTime}", first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
    flags: metaobjects(type: "${METAOBJECT_TYPES.artAndAccount}", first: $first) {
      nodes {
        id
        handle
        fields {
          key
          value
        }
      }
    }
  }
`;
