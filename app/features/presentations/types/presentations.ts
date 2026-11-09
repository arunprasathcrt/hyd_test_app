export type PresentationStage =
  | 'unsent'
  | 'unopened'
  | 'opened'
  | 'changes'
  | 'nodraft'
  | 'drafted'
  | 'closed';

export type PresentationStatus =
  | 'all'
  | 'draft'
  | 'withCustomer'
  | 'needsUs'
  | 'approved'
  | 'closed';

export type PresentationDensity = 'comfortable' | 'compact';

export type PresentationSortOption =
  | 'updated'
  | 'needed'
  | 'name'
  | 'customer';

export interface PresentationCoverImage {
  id: string;
  imageUrl: string;
  alt: string;
}

export interface Presentation {
  id: string;
  // Existing fields (keep)
  name: string;
  customer: string;
  customerCode: string;
  status: Exclude<PresentationStatus, 'all'>;
  approvalPercent: number;
  styleCount: number;
  updatedAt: string;
  lastActivity: string;
  coverImages: PresentationCoverImage[];
  neededBy: string;
  approvedCount: number;
  activityStatus: string;
  repName: string;
  // New DOM fields
  totalCount: number;
  draftOrderNumber?: string;
  neededByPastDue?: boolean;
  updatedAtMs?: number;
}

export interface PresentationStatusOption {
  value: PresentationStatus;
  count: number;
}

export interface PresentationFilterState {
  searchQuery: string;
  status: PresentationStatus;
  sortBy: PresentationSortOption;
  density: PresentationDensity;
}

export interface PresentationFilterOption {
  value: PresentationStage | string;
  label: string;
  count: number;
}

export interface PresentationToolbarFilters {
  customer: string;
  status: PresentationStage | '';
  rep: string;
}

export interface PresentationCustomer {
  id: string;
  name: string;
  shortName: string;
  segment: string;
  tier: string;
  customerCode: string;
  repName: string;
  contact: string;
}

export type CreationPath =
  | 'customizeWithAi'
  | 'stylesAsTheyAre';

export interface PresentationStatusItem {
  value: PresentationStatus;
  labelKey: string;
}

export interface PresentationSortItem {
  value: PresentationSortOption;
  labelKey: string;
}

export interface PresentationDensityItem {
  value: PresentationDensity;
  labelKey: string;
}

export interface PresentationFilterItem {
  id: 'customer' | 'status' | 'rep';
  labelKey: string;
}

export type PresentationStyleKind = 'build' | 'art' | 'blank';

export type PresentationStyleDecision = 'approved' | 'revising' | 'declined';

export interface PresentationStyle {
  id: string;
  kind: PresentationStyleKind;
  styleName: string;
  brand: string;
  sku: string;
  color: string;
  imageUrl: string;
  imageAlt: string;
  price: number | null;
  moq: number | null;
  decision: PresentationStyleDecision | null;
  artId?: string;
  artName?: string;
  artImageUrl?: string;
  slot?: string;
  method?: string;
}

export interface PresentationActivityEntry {
  id: string;
  who: string;
  when: string;
  what?: string;
  messageKey?: string;
  values?: Record<string, string | number | string[]>;
}

export interface PresentationDetail extends Presentation {
  /** Display name of the user in `custom.created_by`; '' when unset or unresolved. */
  createdByName: string;
  styles: PresentationStyle[];
  activity: PresentationActivityEntry[];
}
export interface PresentationReference {
    id: string;
    name: string;
}
