import {loadCatalogRecords, type ProductsLoaderContext} from './product.server';
import type {CatalogArt} from '~/features/draft-orders/schemas/draft-product.schema';

/**
 * The art picked in Quick pick, from the same catalog as Products. Like the garment
 * path, the browser only sends ids: the name, brand and image come from here.
 */
export async function getSelectedDraftArts(
  artIds: string[],
  context: ProductsLoaderContext,
): Promise<CatalogArt[]> {
  const uniqueIds = [...new Set(artIds)];
  if (uniqueIds.length > 100) throw new Error('Too many selected arts');
  if (!uniqueIds.length) return [];
  const {records, viewMembership} = await loadCatalogRecords(context, ['art']);
  const isArt = (product: (typeof records)[number]) =>
    viewMembership?.art?.has(product.id) ?? product.type === 'art';
  const artsById = new Map(
    records
      .filter(isArt)
      .map((product) => [product.id, product]),
  );

  return uniqueIds.map((id) => {
    const art = artsById.get(id);
    if (!art) throw new Error('Selected art is unavailable');
    return {
      id: art.id,
      sku: art.sku,
      name: art.name,
      brand: art.brand,
      image: art.image,
      licensed: art.isLicensed,
    };
  });
}
