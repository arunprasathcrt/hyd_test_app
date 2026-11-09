import {
  GET_CURRENT_SHOPIFY_USER_QUERY,
  GET_SHOPIFY_USERS_QUERY,
} from '~/features/draft-orders/queries/new-draft-order';
import {
  currentShopifyStaffMemberResponseSchema,
  shopifyStaffMembersResponseSchema,
} from '~/features/draft-orders/schemas/new-draft-order-admin.schema';
import type {ShopifyStaffMembersData} from '~/features/draft-orders/types/new-draft-order';
import {createLogger} from '~/lib/logger';
import {adminQuery} from '~/lib/shopify/admin.server';
import type {Route} from './+types/draftorders.new.staff';

const log = createLogger('routes.draftorders.new.staff');

export async function loader({context}: Route.LoaderArgs): Promise<ShopifyStaffMembersData> {
  const staffMembers: ShopifyStaffMembersData['staffMembers'] = [];
  const failures: string[] = [];
  let after: string | null = null;

  const [staffResult, currentResult] = await Promise.allSettled([
    (async () => {
      while (true) {
      const payload = await adminQuery({
        env: context.env,
        query: GET_SHOPIFY_USERS_QUERY,
        variables: {after},
      });
      const parsed = shopifyStaffMembersResponseSchema.parse(payload);
      staffMembers.push(...parsed.staffMembers.nodes.filter((member) => member.active));

      if (!parsed.staffMembers.pageInfo.hasNextPage) break;
      after = parsed.staffMembers.pageInfo.endCursor;
      if (!after) break;
      }
    })(),
    adminQuery({
      env: context.env,
      query: GET_CURRENT_SHOPIFY_USER_QUERY,
    }).then((payload) => currentShopifyStaffMemberResponseSchema.parse(payload)),
  ]);

  if (staffResult.status === 'rejected') {
    failures.push(staffResult.reason instanceof Error ? staffResult.reason.message : String(staffResult.reason));
  }
  if (currentResult.status === 'rejected') {
    failures.push(currentResult.reason instanceof Error ? currentResult.reason.message : String(currentResult.reason));
  }

  const currentStaffMember = currentResult.status === 'fulfilled'
    ? currentResult.value.currentStaffMember
    : null;
  if (currentStaffMember?.active) {
    const existingIndex = staffMembers.findIndex((member) => member.id === currentStaffMember.id);
    const currentOption = {
      ...currentStaffMember,
      firstName: null,
      lastName: null,
      isCurrent: true,
    };
    if (existingIndex >= 0) {
      staffMembers[existingIndex] = {...staffMembers[existingIndex], isCurrent: true};
    } else {
      staffMembers.unshift(currentOption);
    }
  }

  if (failures.length) {
    const cause = failures.join(' | ');
    log.warn('Failed loading Shopify staff members', {
      cause,
    });
  }

  return {
    staffMembers,
    error: failures.length > 0 && staffMembers.length === 0,
    debugError: import.meta.env.DEV && failures.length
      ? failures.join(' | ').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500)
      : undefined,
  };
}
