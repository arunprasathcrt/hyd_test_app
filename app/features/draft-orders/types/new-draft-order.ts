import type {z} from 'zod';
import type {
  deliverySchema,
  newDraftOrderSchema,
  ORDER_TYPES,
  SEGMENT_CODES,
} from '../schemas/new-draft-order.schema';
import type {ShopifyStaffMember as ShopifyStaffMemberSchemaType} from '../schemas/new-draft-order-admin.schema';

export type ShopifyStaffMember = ShopifyStaffMemberSchemaType;

export type NewDraftOrderValues = z.infer<typeof newDraftOrderSchema>;
export type DraftOrderDelivery = z.infer<typeof deliverySchema>;

export type BrandCode = string;
export interface MetaobjectOption {
  id: string;
  handle: string;
  label: string;
}

export interface ProgramCode {
  id: string;
  code: string;
}
export type SegmentCode = (typeof SEGMENT_CODES)[number];
export type OrderType = (typeof ORDER_TYPES)[number];
export type LeadTimeMethod = string;
export type LeadTimeFlag = string;
export type OrderClassification = MetaobjectOption;
export type InterfaceMode = MetaobjectOption;

/** The five builder steps, in order. */
export type DraftOrderStep = 'customer' | 'type' | 'products' | 'ship' | 'review';

/** What the route action returns for a save. */
export interface SavedDraftAdminSummary {
  orderId: string;
  displayId?: string;
  customer: string;
  status: string;
  brands: string[];
}

/** A Company Location the save action created from a delivery's `customAddress`. */
export interface CreatedDeliveryLocation {
  deliveryIndex: number;
  location: NewDraftOrderLocation;
}

export type SaveDraftResult =
  | {ok: true; draft: SavedDraftAdminSummary; createdLocations?: CreatedDeliveryLocation[]; warnings?: string[]}
  | {ok: false; errors: NewDraftOrderFieldErrors; formError?: string; createdLocations?: CreatedDeliveryLocation[]};


/**
 * One customer the builder can pick.
 *
 * Served via (TO CONFIRM, native B2B vs custom metafields is OPEN):
 * - `id`, `name`, `shipTo`: native (Company / Company Location)
 * - `code`, `terms`: native (Company external id / payment terms), synced by Celigo
 * - `segment`, `tier`, `royaltyRate`, `vip`: $app metafield
 * - `rep`: `custom.rep_name` Company metafield (the owning sales rep)
 */
export interface NewDraftOrderCustomer {
  id: string;
  name: string;
  segment: SegmentCode;
  code: string;
  /** `null` when the `$app` metafield is not synced. ❓ TO CONFIRM: the source for tier. */
  tier: string | null;
  /** `null` when the `$app` metafield is not synced. Terms are ERP data, so this is ❓ TO CONFIRM. */
  terms: string | null;
  royaltyRate: number;
  vip: boolean;
  rep?: string;
  shipTo: string[];
  locations?: NewDraftOrderLocation[];
}

export interface NewDraftOrderAddress {
  recipient: string;
  company: string;
  address1: string;
  address2?: string;
  city: string;
  countryCode?: string;
  zoneCode: string;
  zip: string;
  phone: string;
}

export interface NewDraftOrderLocation {
  id: string;
  name: string;
  code: string;
  licensed: boolean;
  shipping: NewDraftOrderAddress | null;
  billing: NewDraftOrderAddress | null;
}

export interface ShipTiming {
  productionDays: number;
  shippingDays: number;
  receivingDays: number;
}

export type WorkflowStageCode =
  | 'customer_art'
  | 'quantity'
  | 'art_production'
  | 'license'
  | 'final_approval'
  | 'inventory'
  | 'capacity'
  | 'pricing'
  | 'financial';

export type WorkflowStageState = 'queued' | 'active' | 'passed' | 'blocked' | 'na';

export interface WorkflowStage {
  code: WorkflowStageCode;
  state: WorkflowStageState;
  owner?: string;
  team?: string;
  automatic?: boolean;
}

export interface DraftOrderSentEmail {
  id: string;
  subject: string;
  sentAt: string;
  attachmentCount: number;
}

/** One Review step line, derived from the products store (`lib/review-lines.ts`). */
export interface DraftOrderReviewLine {
  id: string;
  lineNumber: number;
  sku: string;
  name: string;
  color: string;
  /** Merchant vendor name from the catalog, not a locale key. */
  brand: string;
  image?: string;
  thumbnailFallback: string;
  /** ❓ TO CONFIRM: art selection is not on product lines yet. */
  artworkCode?: string;
  /** Merchant label of the decoration method (`production_lead_time` metaobject). */
  decoration?: string;
  shipTo: string;
  /** ❓ TO CONFIRM: ship-to addresses arrive with the Ship step. */
  shipToAddress?: string;
  quantity: number;
  sizes: Array<{size: string; quantity: number}>;
  garmentUnitPrice: number;
  artUnitPrice: number;
  decorationUnitPrice: number;
  lineTotal: number;
  bundleCard: number;
  artSelected: boolean;
  convertsWithLine?: number;
}

/** Something on the draft that still needs the rep. Labels: `newDraftOrder.issues.<key>`. */
export type DraftOrderIssueKey =
  | 'brandsRequired'
  | 'ordername'
  | 'description'
  | 'classification'
  | 'interface'
  | 'noProducts'
  | 'noQuantity'
  | 'needsSizes'
  | 'belowMinimum'
  | 'locks';

export interface DraftOrderIssue {
  /** Unique per issue: per-line issues carry the line, for example `sizes:0`. */
  id: string;
  /** The label key under `newDraftOrder.issues`. */
  key: DraftOrderIssueKey;
  step: DraftOrderStep;
  /** `block` stops sending; `warn` does not. */
  severity: 'block' | 'warn';
  /** Interpolation values for the label. */
  values?: Record<string, string | number>;
  /** The product line the issue lives on, so a click can open and focus it. */
  productId?: string;
}

/**
 * One lead-time option: a decoration method (`production_lead_time`) or an
 * art/account modifier (`art_and_account`).
 * Served via: metaobject (Storefront). `label` is merchant data, not a locale key.
 */
export interface LeadTimeOption {
  code: string;
  label: string;
  days: number;
}

/** Lead-time rules for Step 2. Days per decoration method and per art/account flag. */
export interface LeadTimeConfig {
  methods: LeadTimeOption[];
  flags: LeadTimeOption[];
  /** Used when no decoration method is selected. */
  defaultDays: number;
  /** Ship + receive days added to the ship date to get the in-hands date. */
  inHandsPaddingDays: number;
}

/** What the order-type resource route returns. */
export interface OrderTypeConfig {
  source: 'shopify' | 'mock';
  leadTime: LeadTimeConfig;
}

/** What the route loader hands the builder. Dates are ISO days (`YYYY-MM-DD`). */
export interface NewDraftOrderView {
  today: string;
  soonestInHands: string;
  validUntil: string;
  version: number;
  taxRate: number;
  customers: NewDraftOrderCustomer[];
  availableBrands: BrandCode[];
  programCodes: ProgramCode[];
  programCodes2: ProgramCode[];
  orderTypes: OrderType[];
  orderClassifications: OrderClassification[];
  interfaceModes: InterfaceMode[];
  defaultCustomerId: string;
  workflow: WorkflowStage[];
  sentEmails: DraftOrderSentEmail[];
  /** Fallback until the New order config loads from Shopify. */
  leadTimeDefaults: LeadTimeConfig;
  /** Shipping and receiving buffers used by the Step 4 date summary. */
  shipTiming: ShipTiming;
  /** Draft values to hydrate when editing an existing draft. */
  initialValues?: NewDraftOrderValues;
  /** Existing draft id being edited. */
  draftId?: string;
  /** Shopify DraftOrder.name shown to users, for example `QT-10007`. */
  draftDisplayId?: string;
}

export interface ShopifyStaffMembersData {
  staffMembers: ShopifyStaffMember[];
  error: boolean;
  debugError?: string;
}

/** Field errors returned by the save action: field name → message key. */
export type NewDraftOrderFieldErrors = Partial<Record<keyof NewDraftOrderValues, string>>;
