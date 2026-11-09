/**
 * `$app` metafield and metaobject keys.
 *
 * No metafield key is hardcoded anywhere else in the app (CLAUDE.md coding
 * rule 9). GraphQL documents interpolate these constants rather than inlining
 * the string, so a key rename is a one-line change here.
 *
 * Definitions themselves live in `shopify.app.toml` under the `$app`
 * namespace, version-controlled — never created through the admin UI
 * (data access rule 5).
 */

/**
 * The app-reserved namespace. Shopify resolves `$app` to the app's own
 * reserved namespace on both reads and writes. Not yet used by any live
 * definition — see `COMPANY_METAFIELD_NAMESPACE` below.
 */
export const APP_NAMESPACE = '$app';

/** Shopify collection metadata used by UTX-owned saved collections. */
export const COLLECTION_METAFIELD_NAMESPACE = 'custom';
export const COLLECTION_METAFIELD_KEYS = {
  tags: 'tags',
  createdBy: 'created_by',
  customer: 'customer',
} as const;

/**
 * The store's one customer definition on collections (`collection.customer`,
 * single_line_text_field). Holds the company name so it shows in the admin
 * Metafields card; `custom.customer` (company reference) has no definition.
 * ❓ TO CONFIRM — namespace/key as found on the live store 2026-10-28.
 */
export const COLLECTION_CUSTOMER_NAME_METAFIELD = {
  namespace: 'collection',
  key: 'customer',
} as const;
export const UTX_SAVED_COLLECTION_TAG = 'utx_saved';

/** Company-level `$app` metafields written by the draft-order builder. */
export const COMPANY_APP_METAFIELD_KEYS = {
  defaultShipToLocationId: 'default_ship_to_location_id',
} as const;

/**
 * Company-level metafields backing the Accounts list metric columns.
 *
 * ❗ DEVIATION FROM DATA ACCESS RULE 5 — these definitions were created by hand
 * through the shop's own `/settings/custom_data/company/metafields` screen,
 * not registered via `shopify.app.toml`, so they live in the shop-wide
 * `custom` namespace rather than the app-reserved `$app` one. Confirmed
 * against the live store on 2026-10-01 (`metafieldDefinitions(ownerType:
 * COMPANY)`). Flagging rather than silently complying: moving these into
 * `shopify.app.toml` under `$app` is the compliant fix and should happen
 * before this ships, but the keys below are what the store has *today*.
 *
 * `ordersYtd` and `casesOpen` have NO backing definition on the store at all —
 * there is no "orders YTD" or "open cases" field under any namespace. The
 * keys here are 🔧 SUGGESTED for whoever creates them; until then the
 * metafield selection returns `null` and the table renders "—" for both
 * columns, which is the existing designed fallback.
 *
 * `openOrders` is sourced from the `custom.open_ar` definition ("Open AR"),
 * an Accounts Receivable balance — not an open-order total. ❓ TO CONFIRM
 * with the business whether the "Open" column is meant to show AR or open
 * orders; AR is the only one of the two that exists in the store.
 */
export const COMPANY_METAFIELD_NAMESPACE = 'custom';

export const COMPANY_METAFIELD_KEYS = {
  /** Market segment — free-text label today, not a normalized code. */
  segment: 'account_segment',
  /** Count of orders placed year to date. 🔧 SUGGESTED — field does not exist yet. */
  ordersYtd: 'ytd_orders',
  /** Value shipped year to date, in store currency. Maps to "YTD shipped". */
  shippedYtd: 'ytd_shipped',
  /** Open AR balance, in store currency. Maps to "Open AR". */
  openOrders: 'open_ar',
  /** Annual revenue goal, in store currency. Maps to "metrics.goal". */
  goal: 'metrics_goal',
  /** Forecasted full-year revenue, in store currency. Maps to "Forecast FY". */
  forecastFy: 'forecast_fy',
  /** Year-over-year shipped growth, as a percent. Maps to the "↑ YoY" KPI caption. */
  yoyGrowth: 'yoy_growth',
  /** Past-due AR balance, in store currency. Maps to the "Open AR" KPI's past-due caption. */
  pastDue: 'past_due',
    /** Customer program tier. Maps to the Tier shown in Presentations. */
  tier: 'tier',
  /** Customer code used by Presentations. */
  customerCode: 'customer_code',
  /** Assigned sales representative name. */
  repName: 'rep_name',
} as const;

export type CompanyMetafieldKey =
  (typeof COMPANY_METAFIELD_KEYS)[keyof typeof COMPANY_METAFIELD_KEYS];

/**
 * Brand attribution — a list of references into a "brands" metaobject
 * definition. Confirmed live via `metafieldDefinition(id:
 * "gid://shopify/MetafieldDefinition/264568176832")`: namespace "name", key
 * "brands", `list.metaobject_reference`, validated against
 * `MetaobjectDefinition/22493528256`. This is how the store itself named the
 * field — not `custom` like the other company metrics above, and not `$app`.
 *
 * The Admin API token's scopes do not include `read_metaobjects`
 * (`currentAppInstallation.accessScopes` confirmed its absence live), so the
 * referenced metaobjects' fields cannot be resolved through the Admin API —
 * only the raw GID list on `value` is readable there. The brand names are
 * resolved instead through the Storefront API, which exposes
 * `metaobjects(type: "brands")` without that scope — see
 * `queries/brand-metaobjects.ts`.
 */
export const COMPANY_BRANDS_METAFIELD_NAMESPACE = 'name';
export const COMPANY_BRANDS_METAFIELD_KEY = 'brands';

/** The metaobject `type` (not a Shopify object kind) holding brand names. */
export const BRAND_METAOBJECT_TYPE = 'brands';

/**
 * Product-level metafields backing the Products catalog card content.
 *
 * Confirmed live against `/settings/custom_data/product/metafields` on
 * 2026-10-07. Same ❗ deviation as the company metafields above — each was
 * created by hand through the shop's custom-data screen, so each lives in
 * its own shop-authored namespace rather than the app-reserved `$app` one.
 */
/**
 * Variant ATP records: `custom.atp_size_info` is a `list.metaobject_reference` to
 * the `atp_size_info` ("ATP Record") metaobject, one record per size and incoming
 * purchase order. Confirmed live 2026-11-04. The Admin token has no
 * `read_metaobjects` scope, so records are read through the Storefront API.
 */
export const VARIANT_ATP_RECORDS_METAFIELD = {
  namespace: 'custom',
  key: 'atp_size_info',
} as const;

/** Field keys on an `atp_size_info` record. `available` and `total` are unit counts. */
export const ATP_RECORD_FIELDS = {
  size: 'size',
  available: 'available',
  poNumber: 'po_number',
  futureDate: 'future_date',
  total: 'total',
} as const;

export const PRODUCT_METAFIELD_NAMESPACES = {
  leadTime: 'custom',
  artPlacement: 'custom',
  color: 'atp',
  styleCode: 'agv',
  tier: 'custom',
  moq: 'garment',
  // --- Confirmed live against the metafields screen on 2026-10-08 ---
  productGender: 'custom',
  genderFilter: 'custom',
  salesChannel: 'custom',
  season: 'custom',
  regionState: 'custom',
  sportUse: 'custom',
  feature: 'custom',
  fabric: 'custom',
  newness: 'custom',
  license: 'custom',
  licensed: 'custom',
  customizable: 'custom',
  colorCount: 'custom',
  brandCatalog: 'custom',
  atpSizeGroup: 'custom',
  atpSixWeekOutlook: 'custom',
  atpTotalToday: 'custom',
  atpIncomingQty: 'custom',
  atpIncomingPo: 'custom',
  atpIncomingDate: 'custom',
  atpFutureIncomingQty: 'custom',
  atpFuturePo: 'custom',
  atpFutureIncomingDate: 'custom',
  agvSourceHash: 'agv',
  agvVersion: 'agv',
  agvStatus: 'agv',
  agvProductionTypes: 'agv',
  agvProcessMethods: 'agv',
  agvLocations: 'agv',
  agvPayload: 'agv',
  licenseExpiration: 'art',
  artProcessMethod: 'art',
  bundlePrice: 'bundle',
  bundleWorkflowStatus: 'bundle',
  disclosure: 'shopify',
  netsuiteItemId: 'uts',
  catalogBrand: 'uts',
  institution: 'uts',
  lifecycle: 'uts',
  blankSupplier: 'garment',
  colorOptions: 'garment',
  decorationZoneMap: 'garment',
  sizeRun: 'garment',
  /** ❓ TO CONFIRM — not yet verified live against the store's custom-data screen. */
  decorationMethod: 'custom',
  /** ❓ TO CONFIRM — not yet verified live against the store's custom-data screen. */
  available: 'custom',
  /** ❓ TO CONFIRM — not yet verified live against the store's custom-data screen. */
  category: 'custom',
} as const;

export const PRODUCT_METAFIELD_KEYS = {
  /** Lead-time copy (e.g. "6-Week Lead"). Maps to the card's availability pill. */
  leadTime: 'product_lead_time',
  /** List reference into the `art_placement` metaobjects. Maps to the card's placement count. */
  artPlacement: 'art_placement_filter',
  /** Color name (e.g. "Pitch Grey Heather"). Maps to the card's color row. */
  color: 'color',
  /** Style code (e.g. "UY2621"). Maps to the card's SKU / style-code line. */
  styleCode: 'style_code',
  /** Program tier badge (e.g. "Pro · MiLB"). Shown in place of price when price is unset. */
  tier: 'program_tier',
  /** Minimum order quantity. Maps to the card's MOQ figure. */
  moq: 'min_order_qty',
  /** Single gender value (e.g. "Male"). Maps to the `gen` facet. */
  productGender: 'product_gender',
  /** List reference — multi-select gender/fit tags, not yet surfaced by any facet. */
  genderFilter: 'gender_filter',
  /** List reference into `sales_channel` metaobjects. Maps to the `chan` facet. */
  salesChannel: 'sales_channel_filter',
  /** List reference into `season_filter` metaobjects. Maps to the `se` facet. */
  season: 'season_filter',
  /** List reference into `region_state` metaobjects. Maps to the `st` facet. */
  regionState: 'region_state_filter',
  /** List reference into `sport_use_filter` metaobjects. Maps to the `sport` facet. */
  sportUse: 'sport_use_filter',
  /** List reference into `feature_filter` metaobjects. Maps to the `ft` facet. */
  feature: 'feature_filter',
  /** List reference into `fabric_filter` metaobjects. Maps to the `fab` facet. */
  fabric: 'fabric_filter',
  /** `list.single_line_text_field` (e.g. `["Newness","Carryover"]`). Not yet wired into the `fresh` facet (that reads `recencyScore`). */
  newness: 'newness_filter',
  /** List reference into `license_filter` metaobjects. Maps to the `lic` facet. */
  license: 'license_filter',
  /** Boolean. Maps to the `lz` facet (`isLicensed`). */
  licensed: 'licensed',
  /** Boolean — whether the style can be customized. No facet yet. */
  customizable: 'customizable_product',
  /** `number_integer` — distinct color count. No facet yet. */
  colorCount: 'color_count',
  /** Catalog/book label. Maps to the `col` facet (`catalogName`). */
  brandCatalog: 'productlist_brand_catalog',
  /** `single_line_text_field` — youth/adult size bucket. No UI yet. */
  atpSizeGroup: 'atp_size_group',
  /** `single_line_text_field` — ATP outlook narrative. No UI yet. */
  atpSixWeekOutlook: 'atp_six_week_outlook',
  /** Stock on hand today, available-to-promise. No UI yet. */
  atpTotalToday: 'atp_total_atp_today',
  /** Next incoming PO quantity (e.g. "+286"). No UI yet. */
  atpIncomingQty: 'atp_incoming_quantity',
  atpIncomingPo: 'atp_incoming_po_number',
  atpIncomingDate: 'atp_incoming_date',
  /** Further-out incoming PO quantity (e.g. "+207"). No UI yet. */
  atpFutureIncomingQty: 'atp_future_incoming_quantity',
  atpFuturePo: 'atp_future_po_number',
  atpFutureIncomingDate: 'atp_future_incoming_date',
  /** ❓ TO CONFIRM — no live product sampled has this set; type unconfirmed, treated as plain text. */
  agvSourceHash: 'source_hash',
  agvVersion: 'version',
  agvStatus: 'status',
  /** `list.single_line_text_field` assumed from the plural key name — ❓ TO CONFIRM. */
  agvProductionTypes: 'production_types',
  agvProcessMethods: 'process_methods',
  agvLocations: 'locations',
  /** Assumed raw JSON blob — ❓ TO CONFIRM. */
  agvPayload: 'payload',
  /** `date_time`. No UI yet. */
  licenseExpiration: 'license_expiration',
  /** ❓ TO CONFIRM — type unconfirmed, treated as plain text. */
  artProcessMethod: 'process_method',
  /** `money` (e.g. `{"amount":"2345.0","currency_code":"USD"}`) — only the amount is kept. */
  bundlePrice: 'bundle_price',
  /** ❓ TO CONFIRM — type unconfirmed, treated as plain text. */
  bundleWorkflowStatus: 'workflow_status',
  disclosure: 'disclosure',
  /** NetSuite internal item id, as text. */
  netsuiteItemId: 'netsuite_item_id',
  /** Single metaobject reference into `brand` metaobjects — a normalized brand name, independent of the Shopify `vendor` field. */
  catalogBrand: 'brand',
  /** ❓ TO CONFIRM — type unconfirmed, treated as plain text (could be a metaobject reference like `catalogBrand`). */
  institution: 'institution',
  lifecycle: 'lifecycle',
  blankSupplier: 'blank_supplier',
  /** `list.single_line_text_field` assumed, mirroring `garment.size_run` — ❓ TO CONFIRM. */
  colorOptions: 'color_options',
  /** Assumed raw JSON blob — ❓ TO CONFIRM. */
  decorationZoneMap: 'decoration_zone_map',
  /** `list.single_line_text_field` (e.g. `["S","M","L"]`). Maps to the `szf` facet (`sizeRun`). */
  sizeRun: 'size_run',
  /**
   * List reference into decoration-method metaobjects. Maps to the `dec`
   * facet (`decorationMethods`). ❓ TO CONFIRM — field existence/type not yet
   * verified live; assumed `list.metaobject_reference` to match the other
   * `_filter`-suffixed keys above.
   */
  decorationMethod: 'decoration_method_filter',
  /**
   * List reference into availability metaobjects. Maps to the `av` facet,
   * replacing the `leadTime` metafield as that facet's data source.
   * ❓ TO CONFIRM — field existence/type not yet verified live; assumed
   * `list.metaobject_reference` to match the other `_filter`-suffixed keys.
   */
  available: 'available_filter',
  /**
   * List reference into category metaobjects. Maps to the `cat` facet
   * (`category`). ❓ TO CONFIRM — field existence/type not yet verified live;
   * assumed `list.metaobject_reference` to match the other `_filter`-suffixed
   * keys above.
   */
  category: 'category_filter',
} as const;

/**
 * Field key holding the human-readable label on each metaobject `type`
 * referenced by a product metafield above. Confirmed live on 2026-10-08 via
 * direct `node(id: ...)` introspection — NOT all metaobject types use `name`
 * (`art_placement` uses `art_name`, `sales_channel` uses `sales_channel`, etc.),
 * so never assume `name` without checking.
 */
export const PRODUCT_REFERENCE_LABEL_FIELD_KEYS = {
  tier: 'name',
  artPlacement: 'art_name',
  salesChannel: 'sales_channel',
  season: 'season',
  regionState: 'region_state',
  sportUse: 'sport_use',
  feature: 'feature',
  fabric: 'name',
  license: 'name',
  catalogBrand: 'name',
  /** ❓ TO CONFIRM — guessed default of `name`, not yet verified live. */
  decorationMethod: 'name',
  /** ❓ TO CONFIRM — guessed default of `name`, not yet verified live. */
  available: 'name',
  /** ❓ TO CONFIRM — guessed default of `name`, not yet verified live. */
  category: 'name',
} as const;

/** The metaobject `type` referenced by the `custom.art_placement` metafield. */
export const ART_PLACEMENT_METAOBJECT_TYPE = 'art_placement';

/** 🔧 SUGGESTED — optional text field on each `art_placement` metaobject naming its filter group (e.g. "Back"); ungrouped when absent. */
export const ART_PLACEMENT_GROUP_FIELD_KEY = 'placement_group';

/**
 * Metaobject types.
 *
 * `production_lead_time` is a merchant-owned definition created in Shopify
 * Admin, not an `$app` type.
 */
export const METAOBJECT_TYPES = {
  productionLeadTime: 'production_lead_time',
  artAndAccount: 'art_and_account',
  backSchedule: 'back_schedule',
  programCode: 'program_codes',
  programCodeList2: 'program_code_list_2',
  draftOrderInterface: 'interface',
  orderClassification: 'order_classification',
} as const;

/** Field keys on `production_lead_time`. `method` holds the display name, e.g. "Screen Print". */
export const PRODUCTION_LEAD_TIME_FIELDS = {
  method: 'method',
  days: 'days',
} as const;

/** Field keys on `art_and_account`. `name` holds the display name, e.g. "Licensed art". */
export const ART_AND_ACCOUNT_FIELDS = {
  name: 'name',
  days: 'days',
} as const;

/** Field keys on `program_codes` and `program_code_list_2` metaobjects. */
export const PROGRAM_CODE_FIELDS = {
  code: 'code',
} as const;

export const PROGRAM_CODE_METAFIELD_KEYS = {
  first: 'program_code_list',
  second: 'program_code_list_2',
} as const;

export const DRAFT_ORDER_OPTION_METAFIELD_KEYS = {
  // Shopify's live definition uses this spelling.
  interface: 'draft_order_interfacce',
  classification: 'draft_order_classification',
} as const;

export const DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS = {
  customerId: 'utx_customer_id',
  programCode: 'utx_program_code',
  programCode2: 'utx_program_code_2',
  interfaceMode: 'utx_draft_order_interface',
  orderClassification: 'utx_draft_order_classification',
} as const;

/** Custom attributes the builder writes on each draft order LINE item (one line per size). */
export const DRAFT_ORDER_LINE_ATTRIBUTE_KEYS = {
  placeholder: 'utx_placeholder',
  sku: 'utx_sku',
  size: 'utx_size',
  color: 'utx_color',
  productId: 'utx_product_id',
} as const;

/** Separator the builder puts between name, colour and size in a line title. */
export const DRAFT_ORDER_LINE_TITLE_SEPARATOR = ' · ';

/**
 * The one draft order metafield holding every Step-3 card's data (brief, ink,
 * prices, product comments, order line details). Created by hand on the shop in
 * the `custom` namespace, so it is written there only.
 */
export const DRAFT_ORDER_LINE_ITEMS_METAFIELD = {
  namespace: 'custom',
  key: 'draft_order_line_item_products',
  type: 'json',
} as const;

/**
 * Draft Order metafield keys used by the New Draft Order builder.
 *
 * These keys mirror the current Admin definitions and UI labels shown in the
 * Draft Order metafields panel.
 */
export const DRAFT_ORDER_METAFIELD_KEYS = {
  description: 'description',
  orderName: 'order_name',
  poNumber: 'po_no',
  leadTimeFlags: 'lead_time_flags',
  leadTimeMethods: 'lead_time_methods',
  orderType: 'order_type',
  inHandsDate: 'in_hands_date',
  deliveries: 'deliveries',
  defaultShipToLocationId: 'default_ship_to_location_id',
  shipCode: 'ship_code',
  billToLocationId: 'bill_to_location_id',
  eventName: 'event_name',
  eventDate: 'event_date',
  cancelDate: 'cancel_date',
  utxCustomerName: 'utx_customer_name',
  utxBrands: 'utx_brands',
  utxOrderType: 'utx_order_type',
  /** Order line details aggregated from `DraftProduct` per-card overrides. */
  shipDate: 'ship_date',
  shipIndicator: 'ship_indicator',
  shipVia: 'ship_via',
  discountCode: 'discount_code',
  /** Print comments, one per document the builder's Sizes/notes panel collects. */
  artNotes: 'art_notes',
  manufacturingInstructions: 'manufacturing_instructions',
  ackPrintComments: 'ack_print_comments',
  invoicePrintComments: 'invoice_print_comments',
  shippingInstructions: 'shipping_instructions',
  shipExact: 'ship_exact',
  /**
   * Step 5 locks. 🔧 SUGGESTED keys: Shopify derives them from the definition
   * names "Final Art Locked", "Quantities Locked", "Locked By", "Locked Date".
   */
  finalArtLocked: 'final_art_locked',
  quantitiesLocked: 'quantities_locked',
  lockedBy: 'locked_by',
  lockedDate: 'locked_date',
  artApprover: 'art_approver',
  proofReader: 'proof_reader',
  artApproverMessage: 'art_approver_message',
  /** 🔧 SUGGESTED custom metafield keys inferred from the Hold dialog labels. */
  holdReason: 'hold_reason',
  holdUntil: 'hold_until',
  holdStatus: 'hold_status',
  holdNote: 'hold_note',
  heldBy: 'held_by',
} as const;

export const DRAFT_ORDER_METAFIELD_NAMESPACE = 'custom';

/**
 * Draft order "workflow.*" metafields confirmed live on the store (one flat
 * namespace with dotted keys). These track the order's lifecycle PAST
 * creation — review checks, locks, send-to-buyer, convert, fulfil, invoice —
 * which is a different, more granular state machine than this app's own
 * nine-stage `WorkflowStage` model (`types/new-draft-order.ts`:
 * `customer_art` / `quantity` / `art_production` / `license` /
 * `final_approval` / `inventory` / `capacity` / `pricing` / `financial`).
 *
 * ❓ TO CONFIRM — no 1:1 mapping from our nine stages to these keys has been
 * confirmed with the business, so New Draft Order save does not write any of
 * these yet; inventing a mapping would be a guess. Keys are recorded here so
 * whichever feature owns post-creation workflow can read/write them without
 * re-deriving the key strings.
 */
export const DRAFT_ORDER_WORKFLOW_METAFIELD_KEYS = {
  addLine: 'workflow.add_line',
  cartBuild: 'workflow.cart_build',
  artPlacementConfig: 'workflow.art_placement_config',
  moqCheck: 'workflow.moq_check',
  inventoryRoadSigns: 'workflow.inventory_road_signs',
  lockArt: 'workflow.lock_art',
  lockInventory: 'workflow.lock_inventory',
  sendToBuyer: 'workflow.send_to_buyer',
  check01: 'workflow.check_01',
  check02: 'workflow.check_02',
  check03: 'workflow.check_03',
  check04: 'workflow.check_04',
  check05: 'workflow.check_05',
  check06: 'workflow.check_06',
  check07: 'workflow.check_07',
  check08: 'workflow.check_08',
  convert: 'workflow.convert',
  fulfil: 'workflow.fulfil',
  invoice: 'workflow.invoice',
} as const;

