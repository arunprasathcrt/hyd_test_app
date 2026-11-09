/**
 * Resource route: Step 2 config for a New order, loaded by a fetcher when the
 * rep picks New order. Reorder never calls it.
 */
import {LEAD_TIME_RULES_QUERY} from '~/features/draft-orders/queries/lead-time-rules';
import type {OrderTypeConfig} from '~/features/draft-orders/types/new-draft-order';
import {readLeadTimeRules} from '~/lib/metaobjects/lead-time-rules';
import type {Route} from './+types/draftorders.new.order-type';

const LEAD_TIME_RULES_PAGE_SIZE = 50;

// Static config: skip the fetcher reload that otherwise races every draft save.
export const shouldRevalidate = () => false;

export async function loader({context}: Route.LoaderArgs): Promise<OrderTypeConfig> {
  // ❓ TO CONFIRM: no auth guard yet, same as the `draftorders.new` loader.
  // Storefront, not Admin: the Admin app has no `read_metaobjects` scope.
  const payload: unknown = await context.storefront.query(LEAD_TIME_RULES_QUERY, {
    variables: {first: LEAD_TIME_RULES_PAGE_SIZE},
    cache: context.storefront.CacheShort(),
  });

  return {
    source: 'shopify',
    leadTime: readLeadTimeRules(payload, {
      methods: [],
      flags: [],
      defaultDays: 0,
      inHandsPaddingDays: 0,
    }),
  };
}
