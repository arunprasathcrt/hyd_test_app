import {catalogQuerySchema, type Product} from '../schemas/product.schema';

export const FACETS = [
  {key: 'brand', label: 'facets.brand', scope: 'both'},
  {key: 'col', label: 'facets.col', scope: 'gallery'},
  {key: 'cat', label: 'facets.cat', scope: 'garment'},
  {key: 'slots', label: 'facets.slots', scope: 'both'},
  {key: 'lic', label: 'facets.lic', scope: 'both'},
  {key: 'tier', label: 'facets.tier', scope: 'both'},
  {key: 'av', label: 'facets.av', scope: 'garment'},
  {key: 'szf', label: 'facets.szf', scope: 'garment'},
  {key: 'dec', label: 'facets.dec', scope: 'garment'},
  {key: 'cf', label: 'facets.cf', scope: 'garment'},
  {key: 'gen', label: 'facets.gen', scope: 'garment'},
  {key: 'fresh', label: 'facets.fresh', scope: 'garment'},
  {key: 'fab', label: 'facets.fab', scope: 'garment'},
  {key: 'ft', label: 'facets.ft', scope: 'garment'},
  {key: 'artcat', label: 'facets.artcat', scope: 'art'},
  {key: 'sport', label: 'facets.sport', scope: 'both'},
  {key: 'st', label: 'facets.st', scope: 'both'},
  {key: 'se', label: 'facets.se', scope: 'garment'},
  {key: 'chan', label: 'facets.chan', scope: 'garment'},
  {key: 'moq', label: 'facets.moq', scope: 'garment'},
  {key: 'lz', label: 'facets.lz', scope: 'both'},
] as const;

export type FacetKey = (typeof FACETS)[number]['key'];

/**
 * ❓ TO CONFIRM — hardcoded per business request until the live store's
 * catalog taxonomy (collections/metaobjects) is wired up. The `col` facet
 * always shows exactly this set, with these counts, regardless of what
 * `catalogName` values are actually present on `records`.
 */
export const HARDCODED_CATALOGS = [
  {
    title: '26 Fall Gameday Catalog',
    cover:
      'https://cdn.repspark.net/2/p/6BEWmnLG-CkHwm-yNYJ35CyPLDgylXDoG5l6yvW5fzs/6BEWmnLG-CkHwm-yNYJ35CyPLDgylXDoG5l6yvW5fzs-s_2000x2000',
    styleCount: 14,
  },
  {
    title: '26FA MILITARY',
    cover:
      'https://cdn.repspark.net/2/p/dFx-oMvR2w84JdLhZkbmAUvm7sZP_Rs7q68jIu0DaiQ/dFx-oMvR2w84JdLhZkbmAUvm7sZP_Rs7q68jIu0DaiQ-s_2000x2000',
    styleCount: 13,
  },
  {
    title: '26FA MiLB',
    cover:
      'https://cdn.repspark.net/2/p/PxVi_Gdshqkey7zjaIZaqTn66st7RDyditmPyOD30Z0/PxVi_Gdshqkey7zjaIZaqTn66st7RDyditmPyOD30Z0-s_2000x2000',
    styleCount: 19,
  },
  {
    title: '26FA Sideline | Replica Jerseys & Footwear',
    cover:
      'https://cdn.repspark.net/2/p/HKSEDHhW-dH8ZW4av8JH8BQ6VU4FQyoRPmC8NvSo4JY/HKSEDHhW-dH8ZW4av8JH8BQ6VU4FQyoRPmC8NvSo4JY-s_2000x2000',
    styleCount: 3,
  },
  {
    title: '26YR HIGH SCHOOL',
    cover:
      'https://cdn.repspark.net/2/p/mv4CUXzm2eM9JjsI1qlggcbYUMs-qdtiwS22q2PNfY8/mv4CUXzm2eM9JjsI1qlggcbYUMs-qdtiwS22q2PNfY8-s_2000x2000',
    styleCount: 24,
  },
] as const;
export const PAGE_SIZE = 24;
export const SORTS = [
  'featured',
  'newest',
  'price-low',
  'price-high',
  'min-order-qty',
  'availability',
  'popularity',
  'alphabetical',
] as const;
export const VIEWS = ['all', 'garment', 'art', 'bundles'] as const;
const AVAILABILITY = ['Ready Now', 'In Stock', '6-Week Lead', 'Preorder'];

function values(product: Product, key: FacetKey): string[] {
  const single = (value: string) => (value ? [value] : []);
  switch (key) {
    case 'fresh':
      return [product.recencyScore >= 5 ? 'new' : 'carryover'];
    case 'lz':
      return [product.isLicensed ? 'licensed' : 'blank'];
    case 'moq':
      return ['12', '24', '48']
        .filter(
          (limit) => product.moq !== null && product.moq <= Number(limit),
        )
        .concat(product.moq !== null && product.moq > 48 ? ['over48'] : []);
    case 'brand':
      return single(product.brand);
    case 'col':
      return single(product.catalogName);
    case 'cat':
      return single(product.category);
    case 'slots':
      return product.placementLabels;
    case 'lic':
      return product.licenses;
    case 'tier':
      return single(product.tier);
    case 'av':
      return single(product.availability);
    case 'szf': {
      // Group heading is the product's own Shopify Type; sizes keep Shopify's order.
      const label = product.productType.trim();
      return product.sizeRun.map((size) => (label ? `${label}|${size}` : size));
    }
    case 'dec':
      return product.decorationMethods;
    case 'cf':
      return single(product.colorFamily);
    case 'gen':
      return single(product.gender);
    case 'fab':
      return single(product.fabric);
    case 'ft':
      return product.features;
    case 'artcat':
      return single(product.artCategory);
    case 'sport':
      return single(product.sport);
    case 'st':
      return product.region;
    case 'se':
      return single(product.season);
    case 'chan':
      return single(product.channel);
  }
}

// Search fields mirror the prototype's per-record index.
export function productSearchText(product: Product) {
  return (
    product.type === 'art'
      ? [
          product.name,
          product.sku,
          product.brand,
          ...product.licenses,
          product.artCategory,
          product.tier,
        ]
      : [
          product.name,
          product.subtitle,
          product.sku,
          product.brand,
          product.family,
          product.colorName,
          product.silhouette,
          product.fabric,
          product.catalogName,
          ...product.licenses,
        ]
  )
    .join(' ')
    .toLowerCase();
}

// Prototype preview combinations, not a customer's persisted order history.
const DECORATION_COST: Record<string, number> = {
  'Screen Print': 4.5,
  Embroidery: 6,
  '3D Puff Embroidery': 7.5,
  DTG: 5,
  'HTV Heat Transfer': 3.75,
  Applique: 6.5,
  Foil: 5.25,
  Rhinestone: 8,
};

export function catalogModel(
  records: Product[],
  params: URLSearchParams,
  liveCounts?: Partial<Record<(typeof VIEWS)[number], number>>,
  // Real Shopify collections overlap (a product can be in Styles, Arts AND
  // Reorder at once) — when given, a view's visibility is "is this product
  // in that collection's own id set", not the single `type` field.
  viewMembership?: Partial<Record<(typeof VIEWS)[number], Set<string>>>,
) {
  const inView = (product: Product, role: (typeof VIEWS)[number]) =>
    viewMembership
      ? (viewMembership[role]?.has(product.id) ?? false)
      : product.type === role;
  const query = catalogQuerySchema.parse(Object.fromEntries(params));
  const min = Math.min(query.min, query.max);
  const max = Math.max(query.min, query.max);
  const facets = FACETS.filter(
    (facet) =>
      query.view === 'bundles' ||
      facet.scope === 'both' ||
      (facet.scope === 'gallery'
        ? query.view !== 'art'
        : query.view !== 'all' && facet.scope === query.view),
  );
  const selected = Object.fromEntries(
    FACETS.map(({key}) => [key, [...new Set(params.getAll(key))]]),
  ) as Record<FacetKey, string[]>;
  const scoped = records.filter((product) =>
    viewMembership
      ? inView(product, query.view)
      : query.view === 'all' || query.view === 'bundles' || product.type === query.view,
  );
  const matchesFacet = (product: Product, key: FacetKey) =>
    !selected[key].length ||
    values(product, key).some((value) => selected[key].includes(value));
  const matchesPrice = (product: Product) =>
    product.type !== 'garment' ||
    product.price === null ||
    (product.price >= min && product.price <= max);
  const matches = (product: Product, except?: FacetKey) =>
    productSearchText(product).includes(query.q.toLowerCase()) &&
    matchesPrice(product) &&
    facets.every(({key}) => key === except || matchesFacet(product, key));

  const garments = records.filter(
    (product) =>
      product.type === 'garment' &&
      matchesPrice(product) &&
      FACETS.every(
        (facet) => facet.scope === 'art' || matchesFacet(product, facet.key),
      ),
  );
  const arts = records
    .filter(
      (product) =>
        product.type === 'art' &&
        FACETS.every(
          (facet) =>
            facet.scope === 'garment' ||
            facet.scope === 'gallery' ||
            facet.key === 'slots' ||
            matchesFacet(product, facet.key),
        ),
    )
    .sort((a, b) => b.popularity - a.popularity);
  const tokens = query.q.toLowerCase().split(/\s+/).filter(Boolean);
  // A real Reorder collection product wins over the synthetic art+garment
  // pairing below — only fabricate combos when the store has none yet.
  const liveBundles = records.filter((product) => inView(product, 'bundles'));
  const reorders: Product[] = liveBundles.length
    ? liveBundles.filter((product) => matches(product))
    : [];
  const seen = new Set<string>();
  if (!liveBundles.length) {
  for (const art of arts) {
    const pool = garments
      .filter((garment) => garment.brand === art.brand)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 3);
    for (const garment of pool) {
      const id = `${art.id}|${garment.id}`;
      if (
        reorders.length >= 60 ||
        seen.has(id) ||
        !tokens.every((token) =>
          `${productSearchText(garment)} ${productSearchText(art)}`.includes(
            token,
          ),
        )
      )
        continue;
      seen.add(id);
      const method =
        ['Screen Print', 'Embroidery', 'DTG', 'HTV Heat Transfer'].find(
          (value) => garment.decorationMethods.includes(value),
        ) ??
        garment.decorationMethods[0] ??
        'Screen Print';
      reorders.push({
        ...garment,
        type: 'bundles',
        id,
        name: art.name,
        price: (garment.price ?? 0) + (DECORATION_COST[method] ?? 4.5),
        popularity: art.popularity + garment.popularity,
        isLicensed: art.isLicensed,
        reorder: {
          artId: art.id,
          artName: art.name,
          artSku: art.sku,
          artImage: art.image,
          garmentId: garment.id,
          garmentName: garment.name,
          method,
          placement: garment.placementLabels[0] ?? 'Left Chest',
        },
      });
    }
    if (reorders.length >= 60) break;
  }
  }
  const results =
    query.view === 'bundles'
      ? reorders
      : scoped.filter((product) => matches(product));
  results.sort((left, right) => {
    if (query.view === 'bundles' && query.sort !== 'price-low' && query.sort !== 'price-high')
      return right.popularity - left.popularity;
    switch (query.sort) {
      case 'price-low':
        return (left.price ?? Infinity) - (right.price ?? Infinity);
      case 'price-high':
        return (right.price ?? -Infinity) - (left.price ?? -Infinity);
      case 'alphabetical':
        return left.name.localeCompare(right.name);
      case 'newest':
        return (
          right.recencyScore - left.recencyScore ||
          right.popularity - left.popularity
        );
      case 'min-order-qty':
        return (left.moq ?? Infinity) - (right.moq ?? Infinity);
      case 'availability':
        return (
          ((AVAILABILITY.indexOf(left.availability) + 4) % 4) -
          ((AVAILABILITY.indexOf(right.availability) + 4) % 4)
        );
      default:
        return right.popularity - left.popularity;
    }
  });
  const pageSize = query.view === 'bundles' ? 60 : PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const page = Math.min(query.page, totalPages);
  const options = facets.map((facet) => {
  const counts = new Map<string, number>();
    scoped
      .filter((product) => matches(product, facet.key))
      .forEach((product) => {
        values(product, facet.key).forEach((value) =>
          counts.set(value, (counts.get(value) ?? 0) + 1),
        );
      });
    const all = new Set(
      scoped
        .flatMap((product) => values(product, facet.key))
        .concat(selected[facet.key]),
    );
    return {
      ...facet,
      options:
        facet.key === 'col'
          ? HARDCODED_CATALOGS.map((catalog) => ({
              value: catalog.title,
              count: catalog.styleCount,
              selected: selected.col.includes(catalog.title),
            }))
          : [...all].map((value) => ({
              value,
              count: counts.get(value) ?? 0,
              selected: selected[facet.key].includes(value),
            })),
    };
  });
  const quickChannels = [...new Set(
    records
      .filter((product) => product.type === 'garment')
      .flatMap((product) => values(product, 'chan')),
  )].sort((a, b) => a.localeCompare(b));
  // View-tab counts react to 'both'/'gallery' scoped facets (e.g. Art Placement),
  // mirroring the prototype's segCounts() — everything else stays out of scope.
  const catalogFacetActive = FACETS.some(
    (facet) => facet.scope === 'gallery' && selected[facet.key].length,
  );
  const segBase = records.filter(
    (product) =>
      productSearchText(product).includes(query.q.toLowerCase()) &&
      FACETS.every((facet) => {
        if (facet.scope === 'gallery')
          return product.type !== 'garment' || matchesFacet(product, facet.key);
        return facet.scope !== 'both' || matchesFacet(product, facet.key);
      }),
  );
  const segGarmentCount = segBase.filter(
    (product) => product.type === 'garment',
  ).length;
  const segArtCount = segBase.filter((product) => product.type === 'art').length;
  return {
    query: {...query, min, max, page},
    products: results.slice((page - 1) * pageSize, page * pageSize),
    catalogCovers: Object.fromEntries([
      ...records
        .filter((product) => product.catalogName && product.image)
        .map((product) => [product.catalogName, product.image]),
      ...HARDCODED_CATALOGS.map((catalog) => [catalog.title, catalog.cover]),
    ]),
    placementGroups: Object.fromEntries(
      records.flatMap((product) => Object.entries(product.placementGroupByLabel)),
    ) as Record<string, string>,
    // colorHex is a live swatch when Shopify has one configured, else the
    // fixed family palette (see COLOR_FAMILY_SWATCH) — so this always has an
    // entry per family actually present in the catalog.
    colorSwatches: Object.fromEntries(
      records
        .filter((product) => product.colorFamily && product.colorHex)
        .map((product) => [product.colorFamily, product.colorHex]),
    ),
    selectionItems: [...records, ...reorders].map(({id, name}) => ({
      id,
      name,
    })),
    resultIds: results.map((product) => product.id),
    total: results.length,
    totalPages,
    scopeTotal: query.view === 'bundles' ? reorders.length : scoped.length,
    // Real Shopify collection totals (when the live fetch succeeded) win over
    // the derived segment math, since "All"/"Styles"/"Arts" are curated
    // collections, not simply garment+art unions.
    counts: {
      all: liveCounts?.all ?? segGarmentCount + (catalogFacetActive ? 0 : segArtCount),
      garment: liveCounts?.garment ?? segGarmentCount,
      art: liveCounts?.art ?? segArtCount,
      bundles: liveCounts?.bundles ?? reorders.length,
    },
    facets: options,
    quickChannels,
    filterCount:
      facets.reduce((count, facet) => count + selected[facet.key].length, 0) +
      Number(query.view !== 'art' && (min > 0 || max < 1000)),
  };
}

export type CatalogModel = ReturnType<typeof catalogModel>;
