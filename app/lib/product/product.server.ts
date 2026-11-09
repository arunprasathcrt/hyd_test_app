import {data} from 'react-router';
import type {CachingStrategy} from '@shopify/hydrogen';
import {catalogModel, HARDCODED_CATALOGS, VIEWS} from '../../features/products/lib/catalog';
import {
  groupViewCollections,
  pickViewCollectionIds,
  toCatalogProduct,
  viewCollectionLabels,
  type ViewCollectionGroup,
} from '../../features/products/lib/live-catalog';
import {
  collectionListResponseSchema,
  collectionProductsPageResponseSchema,
  type LiveViewCollection,
} from '../../features/products/schemas/live-catalog.schema';
import {
  COLLECTION_PRODUCTS_PAGE_QUERY,
  COLLECTIONS_LIST_QUERY,
} from '../../features/products/queries/products';
import {
  catalogMutationSchema,
  type CatalogBook,
} from '../../features/products/schemas/product.schema';
import {PRODUCT_NAMESPACES} from '../../shared/constants/products';
import {assertSameOrigin} from '../same-origin.server';
import {createLogger} from '../logger';

const log = createLogger('product.server');

type ViewRole = (typeof VIEWS)[number];

/** `col` facet chip covers — same hardcoded source `catalogModel` uses to override that facet's options. */
const HARDCODED_CATALOG_BOOKS: CatalogBook[] = HARDCODED_CATALOGS.map(
  (catalog, index) => ({
    id: `catalog-${index}`,
    title: catalog.title,
    cover: catalog.cover,
    pdf: catalog.cover,
    pageCount: catalog.styleCount,
    styleCount: catalog.styleCount,
  }),
);

/** The slice of the route's loader context this module actually needs. */
export interface ProductsLoaderContext {
  storefront: {
    query: (
      query: string,
      options?: {variables?: Record<string, unknown>; cache?: CachingStrategy},
    ) => Promise<unknown>;
    CacheLong: (overrideOptions?: CachingStrategy) => CachingStrategy;
  };
}

/** The collection list barely changes. */
const COLLECTIONS_CACHE: CachingStrategy = {maxAge: 3600, staleWhileRevalidate: 86400};
/** Product data (price, lead time, availability) is shown to reps: at most 5 minutes old, or 10 while it refreshes behind the request. */
const PRODUCTS_CACHE: CachingStrategy = {maxAge: 300, staleWhileRevalidate: 300};

/** The Storefront API's largest page; each view collection is walked page by page. */
const COLLECTION_PRODUCTS_PAGE_SIZE = 250;

/** Page size for the lightweight id-discovery walk over every collection in the store. */
const COLLECTIONS_LIST_PAGE_SIZE = 250;

/**
 * Walks every collection in the store (paginated, no hardcoded ids) and
 * classifies each by title into a view role, stopping early once all four
 * roles are found or the store runs out of pages. Returns the discovered ids
 * in no particular role order — `fetchCollectionProducts` just needs
 * the full set.
 */
async function discoverViewCollectionIds(
  context: ProductsLoaderContext,
  roles: readonly ViewRole[],
): Promise<string[]> {
  const found: Partial<Record<ViewRole, string>> = {};
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage && roles.some((role) => !found[role])) {
    const response = await context.storefront.query(COLLECTIONS_LIST_QUERY, {
      variables: {first: COLLECTIONS_LIST_PAGE_SIZE, after},
      cache: context.storefront.CacheLong(COLLECTIONS_CACHE),
    });
    const {collections} = collectionListResponseSchema.parse(response);
    const picked = pickViewCollectionIds(collections.nodes);
    roles.forEach((role) => {
      if (!found[role] && picked[role]) found[role] = picked[role];
    });
    hasNextPage = collections.pageInfo.hasNextPage;
    after = collections.pageInfo.endCursor;
  }

  return Object.values(found).filter((id): id is string => Boolean(id));
}

/**
 * Walks one view collection's products page by page until the store has no more,
 * so a collection larger than one page (the Arts collection has 345) is read in full.
 */
async function fetchCollectionProducts(
  context: ProductsLoaderContext,
  id: string,
): Promise<LiveViewCollection | null> {
  const nodes: LiveViewCollection['products']['nodes'] = [];
  let title: string | null = null;
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await context.storefront.query(COLLECTION_PRODUCTS_PAGE_QUERY, {
      variables: {id, first: COLLECTION_PRODUCTS_PAGE_SIZE, after},
      cache: context.storefront.CacheLong(PRODUCTS_CACHE),
    });
    const {collection} = collectionProductsPageResponseSchema.parse(response);
    if (!collection) return null;
    title = collection.title;
    nodes.push(...collection.products.nodes);
    hasNextPage = collection.products.pageInfo.hasNextPage;
    after = collection.products.pageInfo.endCursor;
  }

  return {id, title: title ?? '', products: {nodes}};
}

/**
 * Resolves the record pool every catalog consumer (the Products page, the garment
 * picker drawer, the art drawer, draft-order line building) reads. It comes only
 * from the live store: the view collections are discovered by title, and their
 * products are read in full. If the store cannot be read, the pool is empty and
 * the failure is logged; no fixture stands in for it.
 *
 * `roles` limits which view collections are read. Each one is walked page by
 * page, so a consumer that only needs the art (or garment) collection passes
 * just that role instead of paying for all four.
 */
export async function loadCatalogRecords(
  context: ProductsLoaderContext,
  roles: readonly ViewRole[] = VIEWS,
) {
  let byView: Partial<Record<(typeof VIEWS)[number], ViewCollectionGroup>> = {};
  try {
    const ids = await discoverViewCollectionIds(context, roles);
    if (!ids.length) {
      log.error('No view collections found in the store; the catalog is empty');
    } else {
      const nodes = await Promise.all(ids.map((id) => fetchCollectionProducts(context, id)));
      byView = groupViewCollections(nodes);
      if (!Object.keys(byView).length)
        log.error('View collections in the store resolved to no products');
    }
  } catch (error) {
    log.error('Live product catalog unavailable; the catalog is empty', {error});
  }

  // Real Shopify collections overlap heavily (a product can be in Styles,
  // Arts AND Reorder at once), so merge every role's products into one pool
  // by id (first occurrence wins — the `type` tag is cosmetic only here) and
  // separately record each role's own id set for `catalogModel` to scope by.
  const merged = new Map<string, ReturnType<typeof toCatalogProduct>>();
  VIEWS.forEach((role) => {
    byView[role]?.products.forEach((node) => {
      if (!merged.has(node.id))
        merged.set(node.id, toCatalogProduct(node, role === 'all' ? 'garment' : role));
    });
  });
  const records = [...merged.values()];
  const viewMembership = Object.keys(byView).length
    ? Object.fromEntries(
        VIEWS.map((role) => [
          role,
          new Set(byView[role]?.products.map((node) => node.id) ?? []),
        ]),
      )
    : undefined;

  const liveCounts = Object.keys(byView).length
    ? {
        all: byView.all?.count,
        garment: byView.garment?.count,
        art: byView.art?.count,
        bundles: byView.bundles?.count,
      }
    : undefined;

  return {
    records,
    liveCounts,
    viewMembership,
    byView,
    source: records.length ? ('live' as const) : ('unavailable' as const),
  };
}

export async function loadProducts(
  request: Request,
  context: ProductsLoaderContext,
  roles: readonly ViewRole[] = VIEWS,
) {
  const {records, liveCounts, viewMembership, byView, source} =
    await loadCatalogRecords(context, roles);

  return {
    ...catalogModel(
      records,
      new URL(request.url).searchParams,
      liveCounts,
      viewMembership,
    ),
    records,
    books: HARDCODED_CATALOG_BOOKS,
    viewLabels: viewCollectionLabels(byView),
    locale: 'en' as const,
    namespaces: PRODUCT_NAMESPACES,
    source,
    capabilities: {write: false, inventory: false, builds: false},
  };
}


export async function submitProducts(request: Request) {
  assertSameOrigin(request);
  const form = await request.formData();
  const parsed = catalogMutationSchema.safeParse({
    intent: form.get('intent'),
    ids: form.getAll('ids'),
    name: form.get('name') ?? '',
  });
  if (!parsed.success)
    return data(
      {ok: false, fieldErrors: parsed.error.flatten().fieldErrors, error: null},
      {status: 400},
    );
  return data(
    {ok: false, fieldErrors: {}, error: 'integrationPending'},
    {status: 501},
  );
}
