import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  CUSTOMER_PRODUCTS,
  type CustomerProduct,
} from '../../lib/products-fallback';
import ProductCardDrawer from '~/features/productCardDrawer/components/ProductCardDrawer';
import {Button} from '~/shared/components/ui/Button';

export interface ProductsTabProps {
  products?: CustomerProduct[];
}

export function ProductsTab({products = CUSTOMER_PRODUCTS}: ProductsTabProps) {
  const {t} = useTranslation('accounts');
  const {t: tCommon} = useTranslation('common');
  const [selectedProduct, setSelectedProduct] =
    useState<CustomerProduct | null>(null);

  return (
    <div className="w-full text-utds-ink">
      <div className="w-full">
        <div className="mb-3.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-utds-muted">
          {t('drawer.panels.products.roster', {count: products.length})}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
          {products.map((product) => (
            <Button
              key={product.id}
              type="button"
              variant="productCard"
              shape="lg"
              onClick={() => setSelectedProduct(product)}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-utds-page">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-medium tracking-[-0.005em] text-utds-ink">
                  {product.name}
                </span>
                <span className="mt-0.5 block text-[10.5px] font-normal tabular-nums text-utds-secondary">
                  {t('drawer.panels.products.meta', {
                    units: tCommon('format.count', {value: product.units}),
                    date: product.lastOrderDate,
                  })}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </div>
      {selectedProduct && (
        <ProductCardDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
