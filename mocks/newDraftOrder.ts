import type {
  DraftOrderSentEmail,
  NewDraftOrderCustomer,
  ShipTiming,
  WorkflowStage,
} from '../app/features/draft-orders/types/new-draft-order';

/**
 * Customers offered by the new draft order builder.
 *
 * via the Admin API (native B2B vs custom metafields is still OPEN). Only
 * Pebble Beach's account line is quoted from the prototype; the other
 * accounts' code, tier, terms, royalty and ship-to are fixture values.
 */
export const NEW_DRAFT_ORDER_CUSTOMERS: NewDraftOrderCustomer[] = [
  {id: 'cust-pebble', name: 'Pebble Beach Resorts', segment: 'golf', code: 'PEBBLE-001', tier: 'A', terms: 'Net 30', royaltyRate: 0.1, vip: true, shipTo: ['Main Pro Shop']},
  {id: 'cust-vail', name: 'Vail Mountain Resort', segment: 'resort', code: 'VAIL-001', tier: 'A', terms: 'Net 30', royaltyRate: 0.1, vip: false, shipTo: ['Lionshead Village', 'Golden Peak']},
  {id: 'cust-um', name: 'U of M Athletics', segment: 'bookstore', code: 'UMICH-001', tier: 'A', terms: 'Net 45', royaltyRate: 0.12, vip: true, shipTo: ['Schembechler Hall']},
  {id: 'cust-scheels', name: 'Scheels All Sports', segment: 'retail', code: 'SCHEELS-001', tier: 'B', terms: 'Net 60', royaltyRate: 0.08, vip: false, shipTo: ['Fargo DC']},
  {id: 'cust-bragg', name: 'Fort Bragg Exchange', segment: 'military', code: 'BRAGG-001', tier: 'B', terms: 'Net 30', royaltyRate: 0, vip: false, shipTo: ['Main Exchange']},
  {id: 'cust-otl', name: 'On the Lam', segment: 'corporate', code: 'OTL-001', tier: 'C', terms: 'Net 30', royaltyRate: 0, vip: false, shipTo: ['HQ']},
  {id: 'acc-notre-dame', name: 'Notre Dame Athletics', segment: 'bookstore', code: 'ND-001', tier: 'A', terms: 'Net 45', royaltyRate: 0.12, vip: true, shipTo: ['Hammes Bookstore']},
  {id: 'acc-lidsu', name: 'Lids U', segment: 'retail', code: 'LIDSU-001', tier: 'B', terms: 'Net 60', royaltyRate: 0.1, vip: false, shipTo: ['Indianapolis DC']},
  {id: 'acc-aggie', name: 'Aggieland Outfitters', segment: 'bookstore', code: 'AGGIE-001', tier: 'B', terms: 'Net 30', royaltyRate: 0.12, vip: false, shipTo: ['Northgate Store']},
  {id: 'acc-mills', name: 'Mills Gear', segment: 'retail', code: 'MILLS-001', tier: 'C', terms: 'Net 30', royaltyRate: 0, vip: false, shipTo: ['Warehouse']},
  {id: 'acc-augusta', name: 'Augusta National GC', segment: 'golf', code: 'AUGUSTA-001', tier: 'A', terms: 'Net 30', royaltyRate: 0.1, vip: true, shipTo: ['Golf Shop']},
  {id: 'acc-aspen', name: 'Aspen Snowmass Resort', segment: 'resort', code: 'ASPEN-001', tier: 'A', terms: 'Net 30', royaltyRate: 0.1, vip: false, shipTo: ['Snowmass Village']},
  {id: 'acc-osu', name: 'Ohio State Bookstore', segment: 'bookstore', code: 'OSU-001', tier: 'A', terms: 'Net 45', royaltyRate: 0.12, vip: false, shipTo: ['Ohio Union']},
  {id: 'acc-dicks', name: "Dick's Sporting Goods", segment: 'retail', code: 'DICKS-001', tier: 'A', terms: 'Net 60', royaltyRate: 0.08, vip: false, shipTo: ['Coraopolis DC']},
  {id: 'acc-fanatics', name: 'Fanatics', segment: 'retail', code: 'FANATICS-001', tier: 'A', terms: 'Net 60', royaltyRate: 0.08, vip: false, shipTo: ['Jacksonville DC']},
  {id: 'acc-pendleton', name: 'Camp Pendleton Exchange', segment: 'military', code: 'PENDLETON-001', tier: 'B', terms: 'Net 30', royaltyRate: 0, vip: false, shipTo: ['Main Exchange']},
  {id: 'acc-otl-creator', name: 'On the Lam · Creator Partners', segment: 'corporate', code: 'OTL-002', tier: 'C', terms: 'Net 30', royaltyRate: 0, vip: false, shipTo: ['Studio']},
];

/** The customer a new draft order opens with (the prototype preselects Pebble Beach). */
export const NEW_DRAFT_ORDER_DEFAULT_CUSTOMER_ID = 'cust-pebble';

/** The nine workflow stages a draft order clears before it converts. */
export const NEW_DRAFT_ORDER_WORKFLOW: WorkflowStage[] = [
  {code: 'customer_art', state: 'queued', owner: 'Jay Yi', team: 'Art Design'},
  {code: 'quantity', state: 'queued', owner: 'Jake Torres', team: 'Sales'},
  {code: 'art_production', state: 'queued', owner: 'Eric Schoenbach', team: 'Art Production'},
  {code: 'license', state: 'queued', owner: 'Trey Ham', team: 'Licensing'},
  {code: 'final_approval', state: 'queued', owner: 'Jake Torres', team: 'Sales'},
  {code: 'inventory', state: 'queued', owner: 'Dana Whitfield', team: 'Operations'},
  {code: 'capacity', state: 'queued', owner: 'Marcus Bell', team: 'Plant scheduling'},
  {code: 'pricing', state: 'queued', owner: 'Renee Vaughn', team: 'Sales leadership'},
  {code: 'financial', state: 'queued', automatic: true},
];

export const NEW_DRAFT_ORDER_SENT_EMAILS: DraftOrderSentEmail[] = [];

/**
 * Builder timing, in days from today.
 *
 * 🔧 SUGGESTED: the prototype shows a 30-day validity and a 42-day soonest
 * in-hands date; the real lead time comes from capacity planning.
 */
export const NEW_DRAFT_ORDER_TIMING = {
  validForDays: 30,
  soonestInHandsDays: 42,
};

export const NEW_DRAFT_ORDER_SHIP_TIMING: ShipTiming = {
  productionDays: 34,
  shippingDays: 5,
  receivingDays: 3,
};

export const NEW_DRAFT_ORDER_TAX_RATE = 0.0825;

