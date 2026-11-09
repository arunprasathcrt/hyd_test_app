import type {
  TeamHistoryEntry,
  TeamMember,
} from '~/features/customerProfileDrawer/types/team';

/** Every role that can show up on the account's team roster. */
export const TEAM_MEMBER_ROLES = [
  'salesRep',
  'accountManager',
  'artProduction',
  'licensing',
  'finance',
  'collector',
] as const;

export const CUSTOMER_PROFILE_TEAM_MOCK: TeamMember[] = [
  {
    role: 'salesRep',
    name: 'Megan Managan',
    initials: 'MM',
    specialty: 'Licensed Collegiate Lead',
  },
  {
    role: 'accountManager',
    name: 'Tanya Housman',
    initials: 'TH',
    specialty: 'Day-to-day account manager',
  },
  {
    role: 'artProduction',
    name: 'Brenda Mosher',
    initials: 'BM',
    specialty: 'Embroidery · Color & Digitizing',
  },
  {
    role: 'artProduction',
    name: 'Jill Cantrell',
    initials: 'JC',
    specialty: 'Screen Print · Art Technical',
  },
  {
    role: 'licensing',
    name: 'Trey Ham',
    initials: 'TH',
    specialty: 'Licensing Coordinator',
  },
  {
    role: 'finance',
    name: 'Tricia Schuler',
    initials: 'TS',
    specialty: 'Credit & Finance · Accounts',
  },
];

export const CUSTOMER_PROFILE_TEAM_HISTORY_MOCK: TeamHistoryEntry[] = [
  {
    date: 'May 2, 2026',
    event: 'Finance approved · credit line set',
    who: 'Tricia Schuler',
  },
  {
    date: 'Apr 28, 2026',
    event: 'Licensing cleared brand mark',
    who: 'Trey Ham',
  },
  {
    date: 'Apr 22, 2026',
    event: 'Production art coordinated',
    who: 'Brenda Mosher',
  },
  {
    date: 'Mar 2026',
    event: 'Account reassigned to lead rep',
    who: 'Megan Managan',
  },
];
