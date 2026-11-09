import {catalogModel} from '~/features/products/lib/catalog';
import {
  loadCatalogRecords,
  type ProductsLoaderContext,
} from './product.server';
import type {DraftProduct} from '~/features/draft-orders/schemas/draft-product.schema';
import {createDraftProductLineDefaults} from '~/features/draft-orders/schemas/draft-product.schema';

/**
 * Use the same catalog as Products — including the live Shopify collections,
 * not just the prototype fixture — so a product picked from the garment
 * drawer always resolves here; never accept a browser-supplied price.
 */
export async function getSelectedDraftProducts(
  productIds: string[],
  context: ProductsLoaderContext,
): Promise<DraftProduct[]> {
  const uniqueIds = [...new Set(productIds)];
  if (uniqueIds.length > 100) throw new Error('Too many selected products');
  if (!uniqueIds.length) return [];
  const {records} = await loadCatalogRecords(context);
  const bundles = catalogModel(
    records,
    new URLSearchParams('view=bundles'),
  ).products;
  const productsById = new Map(
    [...records, ...bundles].map((product) => [product.id, product]),
  );

  return uniqueIds.map((id) => {
    const product = productsById.get(id);
    if (!product || product.price === null)
      throw new Error('Selected product is unavailable or has no price');
    const sizes = [
      ...new Set(product.sizeRun.length ? product.sizeRun : ['One size']),
    ];
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      image: product.image,
      productType: product.garmentType || product.type,
      minimumQuantity: product.moq ?? 0,
      variants: sizes.map((size) => ({
        id: `${product.id}|${size}`,
        title: [product.colorName, size].filter(Boolean).join(' / '),
        sku: product.sku,
        price: product.price!,
        size,
        color: product.colorName,
        quantity: 0,
      })),
      ...createDraftProductLineDefaults(),
      placements: product.placementLabels,
      decorationMethods: product.decorationMethods,
    };
  });
}

export async function buildDraftLineItems(
  products: DraftProduct[],
  context: ProductsLoaderContext,
) {
  const catalogProducts = await getSelectedDraftProducts(
    products.map((product) => product.sourceProductId ?? product.id),
    context,
  );
  return products.flatMap((product) => {
    const catalogProduct = catalogProducts.find(
      (item) => item.id === (product.sourceProductId ?? product.id),
    )!;
    return product.variants
      .filter((variant) => variant.quantity > 0)
      .map((variant) => {
        const catalogVariant = catalogProduct.variants.find(
          (item) => item.id === variant.id,
        );
        if (!catalogVariant) throw new Error('Selected size is unavailable');
        return {
          title: `${catalogProduct.name} — ${catalogVariant.title}`,
          quantity: variant.quantity,
          originalUnitPrice: catalogVariant.price.toFixed(2),
          customAttributes: [
            {key: 'Product', value: catalogProduct.id},
            {key: 'SKU', value: catalogVariant.sku},
            {key: 'Size', value: catalogVariant.size},
            {key: 'Color', value: catalogVariant.color},
            {
              key: 'Art price',
              value: product.artPrice ? product.artPrice.toFixed(2) : '',
            },
            {
              key: 'Decoration price',
              value: product.decorationPrice
                ? product.decorationPrice.toFixed(2)
                : '',
            },
            {
              key: 'Adder price',
              value: product.adderPrice ? product.adderPrice.toFixed(2) : '',
            },
            {
              key: 'Retail price',
              value: product.retailPrice ? product.retailPrice.toFixed(2) : '',
            },
            {key: 'Art comments', value: product.notes.art},
            {key: 'Manufacturing comments', value: product.notes.mfg},
            {key: 'Ship exact', value: product.shipExact ? 'Yes' : ''},
            {key: 'Invoice comments', value: product.notes.invoice},
            {key: 'Order acknowledgement comments', value: product.notes.ack},
            {key: 'Packing list comments', value: product.notes.packing},
            {key: 'Ship date', value: product.shipDate},
            {key: 'PO number', value: product.po},
            {key: 'Ship indicator', value: product.shipIndicator},
            {key: 'Not before', value: product.notBefore},
            {key: 'Ship via', value: product.shipVia},
            {key: 'In-hands date', value: product.inHandsDate},
            {key: 'Event name', value: product.eventName},
            {key: 'Discount code', value: product.discountCode},
            {key: 'Ship code', value: product.shipCode},
          ].filter((attribute) => attribute.value),
        };
      });
  });
}
