import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import type { DraftOrderBrandFilterValue } from '../../types/draft-order';
import { Button } from '~/shared/components/ui/Button';
import { BrandLogo } from '~/shared/components/product/BrandLogo';
import { getBrandDisplayName, getBrandFilterValue } from '../../lib/draft-orders';
import { Input } from '~/shared/components/ui/Input';

type BrandFilter = DraftOrderBrandFilterValue;

interface DraftOrdersFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  activeBrand: BrandFilter;
  onBrandChange: (brand: BrandFilter) => void;
  brandCounts: Record<BrandFilter, number>;
  availableBrands: string[];
}

export function DraftOrdersFilters({
  searchQuery,
  onSearchQueryChange,
  activeBrand,
  onBrandChange,
  brandCounts,
  availableBrands,
}: DraftOrdersFiltersProps) {
  const { t } = useTranslation('draftOrders');
  const brands = [
    {
      value: 'all',
      label: t('draftOrders.page.list.brands.all'),
    },
    ...availableBrands.map((brand) => ({
      value: brand,
      label: brand,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
      <div className="relative min-w-0 flex-[1_1_280px] max-w-[520px]">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8E93]"
          strokeWidth={1.8}
        />
        <Input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder={t('draftOrders.page.list.searchPlaceholder')}
          aria-label={t('draftOrders.page.list.searchAriaLabel')}
          autoComplete="off"
          className="h-10 pl-[38px] pr-3"
        />
      </div>
      <div
        role="group"
        className="-m-[5px] flex max-w-full min-w-0 flex-nowrap gap-2 overflow-x-auto p-[5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={t('draftOrders.page.list.brands.ariaLabel')}
      >
        {brands.map((brand) => {
          const isAll = brand.value === 'all';

          const isActive = isAll
            ? activeBrand === 'all'
            : brand.value === getBrandDisplayName(activeBrand);

          return (
            <Button
              key={brand.value}
              type="button"
              variant="outline"
              shape="md"
              aria-pressed={isActive}
              aria-label={t('draftOrders.page.list.brands.filterAriaLabel', {
                brand: brand.label,
                count: brandCounts[getBrandFilterValue(brand.value)],
              })}
              onClick={() =>
                onBrandChange(
                  brand.value === 'Under Armour'
                    ? 'ua'
                    : brand.value === 'Champion'
                      ? 'champion'
                      : brand.value === 'Lululemon'
                        ? 'lululemon'
                        : brand.value === 'Gear'
                          ? 'other'
                          : 'all',
                )
              }
              className={`group cursor-pointer h-10 min-h-10 shrink-0 gap-2.5 rounded-[10px] bg-white px-3.5 py-0 text-[13px] font-semibold leading-[1.2] shadow-none transition-[border-color] hover:bg-white active:scale-100 ${isActive
                ? 'border-[#111113] shadow-[inset_0_0_0_0.5px_#111113] hover:border-[#111113] hover:bg-white'
                : 'border-[#ECECEE] hover:border-[#D7D7DA] hover:bg-white'
                }`}
            >
              {isAll ? (
                <span>{brand.label}</span>
              ) : (
                <span
                  aria-hidden="true"
                  className={`flex h-[22px] max-w-[132px] items-center opacity-50 grayscale brightness-0 transition-[filter,opacity] duration-[160ms] group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 group-focus-visible:brightness-100 ${isActive ? 'opacity-100 grayscale-0 brightness-100' : ''
                    }`}
                >
                  <BrandLogo
                    name={brand.value}
                    className="flex h-6.5 items-center justify-center [&_svg]:block [&_svg]:h-5.5 [&_svg]:w-auto [&_svg]:max-w-25"
                  />
                </span>
              )}

              <span className="text-xs font-normal tabular-nums text-[#6B6B70]">
                {brandCounts[getBrandFilterValue(brand.value)]}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
