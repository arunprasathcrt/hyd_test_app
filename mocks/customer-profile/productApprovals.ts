export type ApprovalStatus = 'pending' | 'approved';

export interface RoleGate {
  roleKey: string;
  approverKey: string | null;
  status: ApprovalStatus;
}

export const ROLE_GATES: RoleGate[] = [
  {roleKey: 'licensing', approverKey: null, status: 'pending'},
  {roleKey: 'finance', approverKey: 'financeApprover', status: 'approved'},
  {roleKey: 'capacity', approverKey: 'operations', status: 'approved'},
  {roleKey: 'artProduction', approverKey: 'artProductionApprover', status: 'approved'},
];

export const PIPELINE_STAGE_KEYS = [
  'initialized',
  'artTechnicalReview',
  'internalArtistWorkflow',
  'sourceCoordinatorArtist',
  'sourceAuditor',
  'proofing',
  'customerArtApproval',
  'licensing',
  'graphicServices',
  'finalSteps',
];