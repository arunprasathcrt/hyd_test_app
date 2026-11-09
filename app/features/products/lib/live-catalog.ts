import {productSchema, type Product} from '../schemas/product.schema';
import {resolveColorFamily, COLOR_FAMILY_SWATCH} from '../../../shared/constants/colorFamily';
import type {
  LiveProductNode,
  LiveViewCollection,
} from '../schemas/live-catalog.schema';
import type {VIEWS} from './catalog';

type ViewRole = (typeof VIEWS)[number];

type ReferenceListField = {references: {nodes: {field: {value: string} | null}[]}} | null;
type ReferenceField = {reference: {field: {value: string} | null} | null} | null;

function labels(field: ReferenceListField): string[] {
  return (field?.references.nodes ?? [])
    .map((node) => node.field?.value)
    .filter((value): value is string => Boolean(value));
}

function label(field: ReferenceField): string {
  return field?.reference?.field?.value ?? '';
}

/** `list.single_line_text_field` metafields store their array as a JSON string. */
function parseStringList(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function toNumber(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value.replace(/^\+/, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

/** `money` metafields store `{"amount":"2345.0","currency_code":"USD"}`. */
function parseMoneyAmount(value: string | undefined): number | null {
  if (!value) return null;
  try {
    const parsed = Number((JSON.parse(value) as {amount?: string}).amount);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function toBoolean(value: string | undefined): boolean {
  return value === 'true';
}

/** The color chip reads the variant's own `Color` selected option, not a metafield. */
function variantColorValue(variants: LiveProductNode['variants']['nodes']): string {
  const option = variants[0]?.selectedOptions.find(
    (selected) => selected.name.toLowerCase() === 'color',
  );
  return option?.value ?? '';
}

/** Hex for the chip: the matching option value's own live swatch, or a fallback keyed to that color's resolved family when the merchant hasn't configured one. */
function colorSwatchHex(options: LiveProductNode['options'], colorValue: string): string {
  const option = options.find((candidate) => candidate.name.toLowerCase() === 'color');
  const normalized = colorValue.trim().toLowerCase();
  const match = option?.optionValues.find(
    (value) => value.name.trim().toLowerCase() === normalized,
  );
  return match?.swatch?.color || (colorValue ? COLOR_FAMILY_SWATCH[resolveColorFamily(colorValue)] : '');
}

/** Every distinct value Shopify tracks for a named option, across all variants — not just one SKU's selection. */
function optionValueNames(options: LiveProductNode['options'], name: string): string[] {
  const option = options.find((candidate) => candidate.name.toLowerCase() === name);
  return option?.optionValues.map((value) => value.name) ?? [];
}

/** The product's sizes, in Shopify's order: the `garment.size_run` metafield when set, else the Size option's values, uniqued. */
function sizeRunValues(
  metafield: string | undefined,
  options: LiveProductNode['options'],
): string[] {
  const listed = parseStringList(metafield);
  // "includes" rather than an exact "size": some options are named "US Size".
  const option = options.find((candidate) => candidate.name.toLowerCase().includes('size'));
  const values = listed.length
    ? listed
    : (option?.optionValues ?? []).map((value) => value.name);
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

/** Size and color chips in the detail view need every option value, each with its own swatch (live where configured, else its resolved family's color). */
function colorOptionSwatchMap(options: LiveProductNode['options']): Record<string, string> {
  const option = options.find((candidate) => candidate.name.toLowerCase() === 'color');
  return Object.fromEntries(
    (option?.optionValues ?? []).map((value) => [
      value.name,
      value.swatch?.color || COLOR_FAMILY_SWATCH[resolveColorFamily(value.name)],
    ]),
  );
}

/**
 * Maps a Storefront product node into the catalog's `Product` shape. Fields
 * with no live source yet are left at their Zod defaults; the filter/sort
 * engine in `lib/catalog.ts` already treats an empty facet value as "no
 * match", not an error. `type` comes from which view collection the node was
 * fetched under — a live product has no own notion of garment/art/bundle.
 */
export function toCatalogProduct(
  node: LiveProductNode,
  type: Product['type'] = 'garment',
): Product {
  const price = Number(node.priceRange.minVariantPrice.amount);
  const placementNodes = node.artPlacement?.references.nodes ?? [];
  const moq = node.moq?.value ? Number(node.moq.value) : null;
  const colorValue = variantColorValue(node.variants.nodes);

  return productSchema.parse({
    type,
    id: node.id,
    sku: node.variants.nodes[0]?.sku ?? '',
    styleCode: node.styleCode?.value ?? '',
    name: node.title,
    brand: node.vendor,
    productType: node.productType,
    image: node.featuredImage?.url ?? '',
    price: Number.isFinite(price) ? price : null,
    availability: labels(node.available)[0] ?? node.leadTime?.value ?? '',
    colorName: node.color?.value || colorValue,
    colorHex: colorSwatchHex(node.options, colorValue),
    colorFamily: resolveColorFamily(node.color?.value || colorValue),
    category: labels(node.category)[0] ?? '',
    tier: node.tier?.references.nodes[0]?.field?.value ?? '',
    moq: moq !== null && Number.isFinite(moq) ? moq : null,
    // Codes are synthetic (card.placements only needs the count); labels are
    // the resolved `art_name` field, used by the Art Placement filter facet.
    placementCodes: placementNodes.map((_, index) => `art-placement-${index}`),
    placementLabels: placementNodes
      .map((placement) => placement.field?.value)
      .filter((label): label is string => Boolean(label)),
    placementGroupByLabel: Object.fromEntries(
      placementNodes.flatMap((placement) =>
        placement.field?.value && placement.group?.value
          ? [[placement.field.value, placement.group.value]]
          : [],
      ),
    ),
    // Single value, matches the `gen` facet's single-select shape.
    gender: node.productGender?.value ?? '',
    genderTags: parseStringList(node.genderFilter?.value),
    // Facets expect a single value; these metafields are lists, so the first
    // resolved label is kept and the rest is available via the raw field if
    // a future facet needs the full set.
    channel: labels(node.salesChannel)[0] ?? '',
    season: labels(node.season)[0] ?? '',
    sport: labels(node.sportUse)[0] ?? '',
    fabric: labels(node.fabric)[0] ?? '',
    region: labels(node.regionState),
    features: labels(node.feature),
    licenses: labels(node.license),
    decorationMethods: labels(node.decorationMethod),
    isLicensed: toBoolean(node.licensed?.value),
    newnessTags: parseStringList(node.newness?.value),
    customizable: toBoolean(node.customizable?.value),
    colorCount: toNumber(node.colorCount?.value),
    colorOptions: optionValueNames(node.options, 'color'),
    colorOptionSwatches: colorOptionSwatchMap(node.options),
    catalogName: node.brandCatalog?.value ?? '',
    sizeRun: sizeRunValues(node.sizeRun?.value, node.options),
    atpSizeGroup: node.atpSizeGroup?.value ?? '',
    atpSixWeekOutlook: node.atpSixWeekOutlook?.value ?? '',
    atpTotalToday: toNumber(node.atpTotalToday?.value),
    atpIncomingQty: node.atpIncomingQty?.value ?? '',
    atpIncomingPo: node.atpIncomingPo?.value ?? '',
    atpIncomingDate: node.atpIncomingDate?.value ?? '',
    atpFutureIncomingQty: node.atpFutureIncomingQty?.value ?? '',
    atpFuturePo: node.atpFuturePo?.value ?? '',
    atpFutureIncomingDate: node.atpFutureIncomingDate?.value ?? '',
    agvSourceHash: node.agvSourceHash?.value ?? '',
    agvVersion: node.agvVersion?.value ?? '',
    agvStatus: node.agvStatus?.value ?? '',
    agvProductionTypes: parseStringList(node.agvProductionTypes?.value),
    agvProcessMethods: parseStringList(node.agvProcessMethods?.value),
    agvLocations: parseStringList(node.agvLocations?.value),
    agvPayload: node.agvPayload?.value ?? '',
    licenseExpiration: node.licenseExpiration?.value ?? '',
    artProcessMethod: node.artProcessMethod?.value ?? '',
    bundlePrice: parseMoneyAmount(node.bundlePrice?.value),
    bundleWorkflowStatus: node.bundleWorkflowStatus?.value ?? '',
    shopifyDisclosure: node.disclosure?.value ?? '',
    netsuiteItemId: node.netsuiteItemId?.value ?? '',
    catalogBrandName: label(node.catalogBrand),
    institution: node.institution?.value ?? '',
    lifecycleStage: node.lifecycle?.value ?? '',
    blankSupplier: node.blankSupplier?.value ?? '',
    decorationZoneMap: node.decorationZoneMap?.value ?? '',
  });
}

/** Title → view role. Defaults to 'all' so an unmatched/renamed collection still counts somewhere. */
export function classifyViewCollection(title: string): ViewRole {
  const normalized = title.toLowerCase();
  if (normalized.includes('reorder')) return 'bundles';
  if (normalized.includes('art')) return 'art';
  if (normalized.includes('style')) return 'garment';
  return 'all';
}

/**
 * Picks the id of the first collection matching each view role out of a
 * dynamically paged collection list (`COLLECTIONS_LIST_QUERY`) — no id is
 * ever hardcoded. First match wins if the store has more than one
 * similarly-titled collection for a role.
 */
export function pickViewCollectionIds(
  collections: {id: string; title: string}[],
): Partial<Record<ViewRole, string>> {
  const byRole: Partial<Record<ViewRole, string>> = {};
  for (const collection of collections) {
    const role = classifyViewCollection(collection.title);
    if (!byRole[role]) byRole[role] = collection.id;
  }
  return byRole;
}

export interface ViewCollectionGroup {
  title: string;
  /** Length of the fetched page — accurate as long as `$first` covers the collection's real size. */
  count: number;
  products: LiveProductNode[];
}

/** Groups the looked-up collections by chip role, skipping any id Shopify didn't resolve. */
export function groupViewCollections(
  nodes: (LiveViewCollection | null)[],
): Partial<Record<ViewRole, ViewCollectionGroup>> {
  const byView: Partial<Record<ViewRole, ViewCollectionGroup>> = {};
  for (const node of nodes) {
    if (!node) continue;
    const role = classifyViewCollection(node.title);
    byView[role] = {
      title: node.title,
      count: node.products.nodes.length,
      products: node.products.nodes,
    };
  }
  return byView;
}

export function viewCollectionLabels(
  byView: Partial<Record<ViewRole, ViewCollectionGroup>>,
): Partial<Record<ViewRole, string>> {
  return Object.fromEntries(
    Object.entries(byView)
      .map(([view, group]) => [view, group?.title])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
}

