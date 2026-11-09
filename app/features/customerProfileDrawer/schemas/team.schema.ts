import {z} from 'zod';
// ❓ TO CONFIRM: role codes are mocked until the BE contract defines the roster's role set.
import {TEAM_MEMBER_ROLES} from '../../../../mocks/customer-profile/team';

export const teamMemberRoleSchema = z.enum(TEAM_MEMBER_ROLES);

export type TeamMemberRole = z.infer<typeof teamMemberRoleSchema>;

export const teamMemberSchema = z.object({
  role: teamMemberRoleSchema,
  name: z.string(),
  initials: z.string(),
  specialty: z.string(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

export const teamHistoryEntrySchema = z.object({
  date: z.string(),
  event: z.string(),
  who: z.string(),
});

export type TeamHistoryEntry = z.infer<typeof teamHistoryEntrySchema>;
