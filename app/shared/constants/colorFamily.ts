/**
 * Shopify has no dedicated "color family" field \u2014 only the per-variant
 * color name (e.g. "Pitch Grey Heather"). This buckets that free text into
 * the catalog's fixed family taxonomy so the Color Family facet always shows
 * this exact, deduped set.
 */
export const COLOR_FAMILIES = [
  'Black',
  'Blue / Navy',
  'Green',
  'Grey / Heather',
  'Pink',
  'Red',
  'White',
  'Other',
] as const;

export type ColorFamily = (typeof COLOR_FAMILIES)[number];

/**
 * Representative swatch color per family. Shopify's own per-variant
 * swatch.color is preferred everywhere this is used; this only fills the
 * chip/circle when the merchant hasn't configured a native swatch for that
 * color name — confirmed live, zero of this store's products have one set,
 * so without this every color circle would be permanently blank/gray. Keyed
 * to the fixed 8-value `COLOR_FAMILIES` enum, not to individual products.
 */
export const COLOR_FAMILY_SWATCH: Record<ColorFamily, string> = {
  Black: '#1A1A1A',
  'Blue / Navy': '#1F3A66',
  Green: '#2F6B3C',
  'Grey / Heather': '#8C8C8C',
  Pink: '#E0789E',
  Red: '#B3261E',
  White: '#FFFFFF',
  Other: '#A0A0A0',
};

export function resolveColorFamily(colorName: string): ColorFamily {
  const normalized = colorName.trim().toLowerCase();
  if (!normalized) return 'Other';
  if (normalized.includes('black')) return 'Black';
  if (normalized.includes('navy') || normalized.includes('blue')) return 'Blue / Navy';
  if (normalized.includes('green')) return 'Green';
  if (
    normalized.includes('grey') ||
    normalized.includes('gray') ||
    normalized.includes('heather')
  )
    return 'Grey / Heather';
  if (normalized.includes('pink')) return 'Pink';
  if (
    normalized.includes('red') ||
    normalized.includes('scarlet') ||
    normalized.includes('crimson') ||
    normalized.includes('maroon')
  )
    return 'Red';
  if (normalized.includes('white')) return 'White';
  return 'Other';
}
