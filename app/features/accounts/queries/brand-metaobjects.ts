/**
 * Storefront API document resolving the "brands" metaobjects referenced by
 * `name.brands` on Company.
 *
 * Goes through the Storefront client, not `adminQuery`, even though the
 * reader is the Accounts (rep) page: the Admin API token's access scopes do
 * not include `read_metaobjects` (confirmed live against
 * `currentAppInstallation.accessScopes`), so `company.metafield.references`
 * resolves every node to `null` there. The Storefront API exposes
 * `metaobjects(type:)` without that scope, and these are brand display
 * names, not anything privileged, so reading them through the public client
 * is not a security-boundary concern (CLAUDE.md data access rule 1).
 *
 * Deliberately NOT tagged `#graphql` — `metaobjects`/`Metaobject` are not in
 * this app's codegen'd Storefront schema snapshot, so the tag would fail
 * codegen the same way it would on an Admin-only field. Validated by
 * `brandMetaobjectsResponseSchema` instead.
 */
export const BRAND_METAOBJECTS_QUERY = `
  query AccountsBrandMetaobjects($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first) {
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
