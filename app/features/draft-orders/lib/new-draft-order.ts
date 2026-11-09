import {getDraftCards, getProductQuantity} from './draft-products';
import type {
  DraftOrderIssue,
  DraftOrderStep,
  NewDraftOrderLocation,
  NewDraftOrderValues,
  DraftOrderDelivery,
  LeadTimeConfig,
  ShipTiming,
} from '../types/new-draft-order';
import type {DraftProduct} from '../schemas/draft-product.schema';
import {addIsoDays, calculateLeadTime, daysBetweenIsoDays} from './lead-time';

/** The builder steps, in order. */
export const STEP_ORDER: readonly DraftOrderStep[] = [
  'customer',
  'type',
  'products',
  'ship',
  'review',
];

export function isDraftOrderStep(
  value: string | null,
): value is DraftOrderStep {
  return value !== null && (STEP_ORDER as readonly string[]).includes(value);
}

const DAY_MS = 86_400_000;

/** Parse an ISO day as UTC midnight, so formatting with `timeZone: UTC` never shifts it. */
export function isoDayToDate(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

export function dateToIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysToIsoDay(day: string, days: number): string {
  return addIsoDays(day, days);
}

export function daysBetween(from: string, to: string): number {
  return daysBetweenIsoDays(from, to);
}

const AT_RISK_BUFFER_DAYS = 7;

export function isInHandsAtRisk(
  inHandsDate: string,
  soonestInHands: string,
): boolean {
  return daysBetween(soonestInHands, inHandsDate) < AT_RISK_BUFFER_DAYS;
}

export interface ShipSchedulePhase {
  key: string;
  label?: string;
  days: number;
  start: string;
  end: string;
}

export function shipSchedule(
  today: string,
  inHandsDate: string,
  timing: ShipTiming,
  leadTime: LeadTimeConfig,
  selectedMethods: string[],
  selectedFlags: string[],
  orderType: string,
  hasProducts: boolean,
) {
  const targetDate = /^\d{4}-\d{2}-\d{2}$/.test(inHandsDate) ? inHandsDate : today;
  const plan = calculateLeadTime({
    today,
    targetDate,
    timing,
    leadTime,
    selectedMethods,
    selectedFlags,
    orderType,
  });

  return {
    ...plan,
    earliestInHands: plan.minimumInHands,
    shippingDays: timing.shippingDays,
    receivingDays: timing.receivingDays,
  };
}

export function locationInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function findLocation(
  locations: NewDraftOrderLocation[],
  id: string,
): NewDraftOrderLocation | undefined {
  return locations.find((location) => location.id === id);
}

/** Ship-method code → `newDraftOrder` label key. */
export const SHIP_METHOD_LABEL_KEYS = {
  ground: 'newDraftOrder.ship.delivery.methods.ground',
  third_day: 'newDraftOrder.ship.delivery.methods.thirdDay',
  two_day: 'newDraftOrder.ship.delivery.methods.twoDay',
  next_day: 'newDraftOrder.ship.delivery.methods.nextDay',
  next_day_early: 'newDraftOrder.ship.delivery.methods.nextDayEarly',
  two_day_early: 'newDraftOrder.ship.delivery.methods.twoDayEarly',
  next_day_air: 'newDraftOrder.ship.delivery.methods.nextDayAir',
} as const satisfies Record<DraftOrderDelivery['method'], string>;

/** Units of a variant still free for delivery `index`; other locations (and Location 1 for split rows) keep theirs. */
export function availableDeliveryUnits(
  deliveries: DraftOrderDelivery[],
  index: number,
  productId: string,
  variant: {id: string; quantity: number},
): number {
  const otherAllocated = deliveries.reduce(
    (total, delivery, deliveryIndex) => deliveryIndex === index || (index > 0 && deliveryIndex === 0)
      ? total
      : total + (delivery.allocations?.[productId]?.[variant.id] ?? 0),
    0,
  );
  return Math.max(0, variant.quantity - otherAllocated);
}

const PENDING_LOCATION_ID_PREFIX = 'pending-delivery:';

/** A delivery-drawer address not yet saved to Shopify, as a picker option; the draft save creates it. */
export function pendingDeliveryLocation(
  delivery: Pick<DraftOrderDelivery, 'locationId' | 'customAddress'> | undefined,
  index: number,
): NewDraftOrderLocation | undefined {
  const address = delivery?.customAddress;
  if (!address || delivery.locationId) return undefined;
  return {
    id: `${PENDING_LOCATION_ID_PREFIX}${index}`,
    name: address.name,
    code: '',
    licensed: false,
    shipping: {
      recipient: '',
      company: '',
      address1: address.address1,
      address2: address.address2 ?? '',
      city: address.city,
      countryCode: address.countryCode,
      zoneCode: address.state,
      zip: address.zip,
      phone: '',
    },
    billing: null,
  };
}

export interface DeliveryAllocationSummary {
  total: number;
  assigned: number;
  unassigned: number;
  over: number;
  split: boolean;
  perLocation: Array<{units: number; products: number}>;
}

export function getDeliveryAllocationSummary(
  products: DraftProduct[],
  deliveries: DraftOrderDelivery[],
): DeliveryAllocationSummary {
  const perLocation = deliveries.map(() => ({units: 0, products: 0}));
  let total = 0;
  let assigned = 0;
  let over = 0;

  for (const product of products) {
    let productAssigned = false;
    for (const variant of product.variants) {
      const quantity = variant.quantity;
      total += quantity;
      if (deliveries.length === 1) {
        assigned += quantity;
        if (quantity > 0) perLocation[0]!.units += quantity;
        productAssigned ||= quantity > 0;
        continue;
      }

      if (!deliveries.length) continue;

      let variantAssigned = 0;
      deliveries.forEach((delivery, index) => {
        const units = delivery.allocations?.[product.id]?.[variant.id] ?? 0;
        variantAssigned += units;
        perLocation[index]!.units += units;
        productAssigned ||= units > 0;
      });
      assigned += Math.min(quantity, variantAssigned);
      over += Math.max(0, variantAssigned - quantity);
    }
    if (productAssigned && deliveries.length === 1) perLocation[0]!.products += 1;
    else if (productAssigned) {
      deliveries.forEach((delivery, index) => {
        if (product.variants.some((variant) => (delivery.allocations?.[product.id]?.[variant.id] ?? 0) > 0)) {
          perLocation[index]!.products += 1;
        }
      });
    }
  }

  if (deliveries.length === 1) {
    perLocation[0] = {units: total, products: products.filter((product) => product.variants.some((variant) => variant.quantity > 0)).length};
    assigned = total;
    over = 0;
  }

  return {
    total,
    assigned,
    unassigned: Math.max(0, total - assigned),
    over,
    split: deliveries.length > 1,
    perLocation,
  };
}

export function initializeDeliveryAllocations(products: DraftProduct[]) {
  return Object.fromEntries(products.map((product) => [
    product.id,
    Object.fromEntries(product.variants.map((variant) => [variant.id, variant.quantity])),
  ]));
}

export function splitDeliveryAllocationsEvenly(
  products: DraftProduct[],
  deliveries: DraftOrderDelivery[],
): DraftOrderDelivery[] {
  const count = deliveries.length;
  if (count < 2) return deliveries;
  const next = deliveries.map((delivery) => ({
    ...delivery,
    allocations: {} as NonNullable<DraftOrderDelivery['allocations']>,
  }));

  for (const product of products) {
    for (const variant of product.variants) {
      const base = Math.floor(variant.quantity / count);
      const remainder = variant.quantity % count;
      next.forEach((delivery, index) => {
        delivery.allocations![product.id] = {
          ...(delivery.allocations![product.id] ?? {}),
          [variant.id]: base + (index < remainder ? 1 : 0),
        };
      });
    }
  }

  return next;
}

export function saveDeliveryAllocations(
  products: DraftProduct[],
  deliveries: DraftOrderDelivery[],
  index: number,
  updatedDelivery: DraftOrderDelivery,
): DraftOrderDelivery[] {
  const next = deliveries.map((delivery, deliveryIndex) => ({
    ...(deliveryIndex === index ? updatedDelivery : delivery),
    allocations: {...(deliveryIndex === index ? updatedDelivery : delivery).allocations},
  }));
  const current = next[index];
  if (!current) return next;
  const previous = deliveries[index];

  for (const product of products) {
    for (const variant of product.variants) {
      const currentUnits = current.allocations?.[product.id]?.[variant.id] ?? 0;
      const previousUnits = previous?.allocations?.[product.id]?.[variant.id] ?? 0;
      const otherUnits = next.reduce(
        (sum, delivery, deliveryIndex) => deliveryIndex === index
          ? sum
          : sum + (delivery.allocations?.[product.id]?.[variant.id] ?? 0),
        0,
      );
      const unassignedAndPrevious = Math.max(0, variant.quantity - otherUnits - previousUnits);
      const gainBeyondAvailable = currentUnits - previousUnits - unassignedAndPrevious;

      if (index > 0 && gainBeyondAvailable > 0) {
        const primary = next[0]!;
        const primaryUnits = primary.allocations?.[product.id]?.[variant.id] ?? 0;
        primary.allocations![product.id] = {
          ...(primary.allocations![product.id] ?? {}),
          [variant.id]: Math.max(0, primaryUnits - gainBeyondAvailable),
        };
      }
    }
  }

  return next;
}

export function assignUnallocatedToPrimary(
  products: DraftProduct[],
  deliveries: DraftOrderDelivery[],
): DraftOrderDelivery[] {
  if (!deliveries.length) return deliveries;
  const next = deliveries.map((delivery) => ({...delivery, allocations: {...delivery.allocations}}));
  for (const product of products) {
    for (const variant of product.variants) {
      const assigned = next.reduce(
        (sum, delivery) => sum + (delivery.allocations?.[product.id]?.[variant.id] ?? 0),
        0,
      );
      const remainder = variant.quantity - assigned;
      if (remainder <= 0) continue;
      next[0]!.allocations![product.id] = {
        ...(next[0]!.allocations![product.id] ?? {}),
        [variant.id]: (next[0]!.allocations![product.id]?.[variant.id] ?? 0) + remainder,
      };
    }
  }
  return next;
}

export function trimDeliveryAllocations(
  products: DraftProduct[],
  deliveries: DraftOrderDelivery[],
): DraftOrderDelivery[] {
  const next = deliveries.map((delivery) => ({...delivery, allocations: {...delivery.allocations}}));
  for (const product of products) {
    for (const variant of product.variants) {
      let excess = next.reduce(
        (sum, delivery) => sum + (delivery.allocations?.[product.id]?.[variant.id] ?? 0),
        0,
      ) - variant.quantity;
      for (let index = next.length - 1; index >= 0 && excess > 0; index -= 1) {
        const delivery = next[index]!;
        const current = delivery.allocations?.[product.id]?.[variant.id] ?? 0;
        const removed = Math.min(current, excess);
        if (!removed) continue;
        delivery.allocations![product.id] = {
          ...(delivery.allocations![product.id] ?? {}),
          [variant.id]: current - removed,
        };
        excess -= removed;
      }
    }
  }
  return next;
}

export function removeDeliveryAndReturnAllocations(
  products: DraftProduct[],
  deliveries: DraftOrderDelivery[],
  index: number,
): DraftOrderDelivery[] {
  if (deliveries.length <= 1 || index <= 0 || index >= deliveries.length) return deliveries;
  const next: DraftOrderDelivery[] = deliveries.map((delivery) => ({
    ...delivery,
    allocations: {...delivery.allocations},
  }));
  const removed = next.splice(index, 1)[0]!;
  const primary = next[0]!;

  for (const product of products) {
    for (const variant of product.variants) {
      const returned = removed.allocations?.[product.id]?.[variant.id] ?? 0;
      if (!returned) continue;
      primary.allocations![product.id] = {
        ...(primary.allocations![product.id] ?? {}),
        [variant.id]: (primary.allocations![product.id]?.[variant.id] ?? 0) + returned,
      };
    }
  }

  if (next.length === 1) next[0]!.allocations = undefined;
  return next;
}

export function draftOrderIssues(
  values: Pick<
    NewDraftOrderValues,
    | 'brands'
    | 'orderName'
    | 'description'
    | 'orderClass'
    | 'interfaceMode'
    | 'products'
    | 'finalArtLocked'
    | 'quantitiesLocked'
  >,
): DraftOrderIssue[] {
  const issues: DraftOrderIssue[] = [];
  const block = 'block' as const;
  if (!values.brands.length)
    issues.push({
      id: 'brands',
      key: 'brandsRequired',
      step: 'customer',
      severity: block,
    });
  if (!values.orderName.trim())
    issues.push({
      id: 'ordername',
      key: 'ordername',
      step: 'customer',
      severity: block,
    });
  if (!values.description.trim())
    issues.push({
      id: 'description',
      key: 'description',
      step: 'customer',
      severity: 'warn',
    });
  if (!values.orderClass)
    issues.push({
      id: 'classification',
      key: 'classification',
      step: 'type',
      severity: block,
    });
  if (!values.interfaceMode)
    issues.push({
      id: 'interface',
      key: 'interface',
      step: 'type',
      severity: block,
    });

  // Prototype `coreIssues`: "No products yet" / "No line has a quantity yet", then one
  // "needs sizes" per empty line, then one "below minimum" per short card.
  const {products} = values;
  if (!products.length) {
    issues.push({
      id: 'lines',
      key: 'noProducts',
      step: 'products',
      severity: block,
    });
  } else if (!products.some((product) => getProductQuantity(product) > 0)) {
    issues.push({
      id: 'lines',
      key: 'noQuantity',
      productId: products.find((product) => product.variants.length > 0)?.id ?? products[0].id,
      step: 'products',
      severity: block,
    });
  }
  products.forEach((product, index) => {
    const quantity = getProductQuantity(product);
    if (quantity <= 0) {
      issues.push({
        id: `sizes:${index}`,
        key: 'needsSizes',
        step: 'products',
        severity: block,
        values: {number: product.lineNumber ?? index + 1, name: product.name},
        productId: product.id,
      });
    }
  });
  getDraftCards(products).forEach((card, index) => {
    const quantity = card.products.reduce(
      (sum, product) => sum + getProductQuantity(product),
      0,
    );
    const minimum = Math.max(
      ...card.products.map((product) => product.minimumQuantity),
    );
    if (minimum > 0 && quantity < minimum) {
      issues.push({
        id: `moq:${card.id}`,
        key: 'belowMinimum',
        step: 'products',
        severity: block,
        values: {number: index + 1, total: quantity, moq: minimum},
        productId: card.products[0].id,
      });
    }
  });
  if (!values.finalArtLocked || !values.quantitiesLocked)
    issues.push({id: 'locks', key: 'locks', step: 'review', severity: 'warn'});
  return issues;
}

/** The translated label of an issue (`t` is the request or component `t`). */
export function issueLabel(
  t: (key: string, options?: Record<string, unknown>) => string,
  issue: DraftOrderIssue,
): string {
  return t(`newDraftOrder.issues.${issue.key}`, issue.values);
}
