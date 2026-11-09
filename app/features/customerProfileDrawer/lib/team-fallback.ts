import type {Account} from '../../accounts/types/account';
import type {TeamHistoryEntry, TeamMember} from '../types/team';
import {
  CUSTOMER_PROFILE_TEAM_HISTORY_MOCK,
  CUSTOMER_PROFILE_TEAM_MOCK,
} from '../../../../mocks/customer-profile/team';

// `account` isn't used to shape the roster yet — the roster and its history
// are not served from Shopify. Kept as a parameter so this fallback matches
// the shape of the other tabs and is a drop-in once a real source exists.

export function accountTeam(_account: Account): TeamMember[] {
  return CUSTOMER_PROFILE_TEAM_MOCK;
}

export function accountTeamHistory(_account: Account): TeamHistoryEntry[] {
  return CUSTOMER_PROFILE_TEAM_HISTORY_MOCK;
}
