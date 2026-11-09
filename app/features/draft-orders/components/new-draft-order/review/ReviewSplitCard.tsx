import {useMemo} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useNewDraftOrderProductsStore} from '../../../store/new-draft-order-products.store';
import {getDraftTotals, getProductQuantity, getProductSubtotal} from '../../../lib/draft-products';
import type {NewDraftOrderValues} from '../../../types/new-draft-order';
import {BuilderCard, BuilderCardTitle} from '../BuilderFields';

export function ReviewSplitCard() {
  const {t} = useTranslation('newDraftOrder');
  const {control} = useFormContext<NewDraftOrderValues>();
  const products = useNewDraftOrderProductsStore((state) => state.products);
  const [brands, inHandsDate] = useWatch({
    control,
    name: ['brands', 'inHandsDate'],
  });
  const taxRate = 0;
  const totals = useMemo(() => getDraftTotals(products, taxRate), [products, taxRate]);
  const money = (value: number) => t('newDraftOrder.overview.money', {value});

  // Group products by brand, then by shipTo (organization)
  const splitData = useMemo(() => {
    const grouped: Record<string, Record<string, typeof products>> = {};

    products.forEach((product) => {
      const brand = product.brand || 'Unbranded';
      const org = 'Default Org';

      if (!grouped[brand]) grouped[brand] = {};
      if (!grouped[brand][org]) grouped[brand][org] = [];
      grouped[brand][org].push(product);
    });

    return grouped;
  }, [products]);

  const totalOrders = Object.values(splitData).reduce((sum, brandOrgs) => {
    return sum + Object.keys(brandOrgs).length;
  }, 0);

  if (!products.length) {
    return (
      <BuilderCard aria-label={t('newDraftOrder.review.split.title')}>
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <BuilderCardTitle
              title={t('newDraftOrder.review.split.title')}
              sub={t('newDraftOrder.review.split.empty')}
            />
          </div>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className="mt-1 shrink-0 text-[#5C5C61]"
          >
            <path d="M16 3h5v5" />
            <path d="M8 3H3v5" />
            <path d="M12 22v-8.3a4 4 0 0 0-1.2-2.8L3 3" />
            <path d="m15 9 6-6" />
          </svg>
        </header>
      </BuilderCard>
    );
  }

  return (
    <BuilderCard aria-label={t('newDraftOrder.review.split.title')}>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <BuilderCardTitle
            title={t('newDraftOrder.review.split.title')}
            sub={t('newDraftOrder.review.split.sub')}
          />
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className="mt-1 shrink-0 text-[#5C5C61]"
        >
          <path d="M16 3h5v5" />
          <path d="M8 3H3v5" />
          <path d="M12 22v-8.3a4 4 0 0 0-1.2-2.8L3 3" />
          <path d="m15 9 6-6" />
        </svg>
      </header>

      <div className="flex flex-col gap-4">
        {Object.entries(splitData).map(([brand, orgProducts]) => {
          const brandProducts = Object.values(orgProducts).flat();
          const brandTotal = brandProducts.reduce((sum, p) => sum + getProductSubtotal(p), 0);
          const brandUnits = brandProducts.reduce((sum, p) => sum + getProductQuantity(p), 0);
          const brandImage = brandProducts[0]?.image;

          return (
            <section key={brand} aria-label={brand} className="border-t border-[#ECECEE] pt-3">
              <h4 className="flex items-center gap-2 mb-3">
                {brandImage && (
                  <img
                    src={brandImage}
                    alt={brand}
                    className="h-6 w-auto object-contain shrink-0"
                  />
                )}
                <span className="text-[13px] font-semibold text-[#111113]">{brand}</span>
                <span className="text-xs text-[#6B6B70]">
                  {Object.keys(orgProducts).length} {Object.keys(orgProducts).length === 1 ? 'order' : 'orders'} · {brandUnits} units · {money(brandTotal)}
                </span>
              </h4>

              <ol className="flex flex-col gap-2">
                {Object.entries(orgProducts).map(([org, orgProds], orderIndex) => {
                  const uniqueStyles = new Set(orgProds.map(p => p.id)).size;
                  const orgUnits = orgProds.reduce((sum, p) => sum + getProductQuantity(p), 0);
                  const orgTotal = orgProds.reduce((sum, p) => sum + getProductSubtotal(p), 0);

                  return (
                    <li key={`${brand}-${org}-${orderIndex}`} className="text-[13px] border border-[#D7D7DA] rounded-[10px] p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="font-medium text-[#111113]">Order {orderIndex + 1}</span>
                        <span className="tabular-nums text-[#111113] font-semibold">{money(orgTotal)}</span>
                      </div>
                      <p className="m-0 text-xs text-[#5C5C61]">
                        <b className="block font-medium text-[#111113] mb-0.5">Card {orderIndex + 1} · Art not chosen yet</b>
                        {org} · {uniqueStyles} {uniqueStyles === 1 ? 'style' : 'styles'} · {orgUnits} units · ships for {new Date(`${inHandsDate}T00:00:00Z`).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      <div className="mt-4 border-t border-[#ECECEE] pt-3 flex items-center justify-between">
        <span className="text-xs text-[#6B6B70]">
          {totalOrders} {totalOrders === 1 ? 'order' : 'orders'} on convert · adds up to the draft total
        </span>
        <b className="text-[13px] text-[#111113] tabular-nums">{money(totals.total)}</b>
      </div>
    </BuilderCard>
  );
}
