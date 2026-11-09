import {METAOBJECT_TYPES} from '~/shared/constants/metafields';

export const BACK_SCHEDULE_QUERY = `
  query GetBackSchedule($first: Int!) {
    backSchedule: metaobjects(type: "${METAOBJECT_TYPES.backSchedule}", first: $first) {
      nodes {
        handle
        fields {
          key
          value
        }
      }
    }
  }
`;