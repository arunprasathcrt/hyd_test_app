import {useTranslation} from 'react-i18next';
import {ORDER_BRAND_COUNTS} from 'app/features/orders/lib/orders';
import type {OrderBrand, BrandFilter} from 'app/features/orders/types/order';
import { Button } from '~/shared/components/ui/Button';

const BRAND_KEYS: Record<OrderBrand | 'all', string> = {
  all: 'brands.all',
  underArmour: 'brands.underArmour',
  champion: 'brands.champion',
  other: 'brands.other',
};

function getBrandFilterActiveClasses(brand: OrderBrand | 'all') {
  switch (brand) {
    case 'underArmour':
      return `
        border-[color-mix(in_srgb,#C9A227_100%,transparent)]
        bg-[color-mix(in_srgb,#C9A227_8%,#fff)]
        text-[#C9A227]
        shadow-[0_0_0_1px_#C9A227_inset]
      `;

    case 'champion':
      return `
        border-[#0F4C4C]
        bg-[color-mix(in_srgb,#0F4C4C_8%,#fff)]
        text-[#0F4C4C]
        shadow-[0_0_0_1px_#0F4C4C_inset]
      `;

    case 'other':
      return `
        border-[#8E8E93]
        bg-[color-mix(in_srgb,#8E8E93_8%,#fff)]
        text-[#8E8E93]
        shadow-[0_0_0_1px_#8E8E93_inset]
      `;

    case 'all':
    default:
      return `
        border-[#111113]
        bg-[color-mix(in_srgb,#111113_8%,#fff)]
        text-[#111113]
        shadow-[0_0_0_1px_#111113_inset]
      `;
  }
}

function getBrandDotClasses(brand: OrderBrand | 'all') {
  switch (brand) {
    case 'underArmour':
      return 'bg-[#C9A227]';

    case 'champion':
      return 'bg-[#0F4C4C]';

    case 'other':
      return 'bg-[#8E8E93]';

    case 'all':
    default:
      return 'bg-[#111113]';
  }
}

export interface OrdersBrandFilterProps {
  activeBrand: BrandFilter;
  onBrandChange: (brand: BrandFilter) => void;
}

export function OrdersBrandFilter({
  activeBrand,
  onBrandChange,
}: OrdersBrandFilterProps) {
  const {t} = useTranslation('orders');

  return (
    <div
      className="
        mb-[18px]
        mt-7
        flex
        flex-wrap
        items-center
        gap-2
        px-0
        py-[6px]
      "
      role="tablist"
      aria-label={t('page.brand')}
    >
      <span
        className="
          mr-[6px]
          font-sans
          text-[11px]
          font-semibold
          uppercase
          leading-[1.4]
          tracking-[0.06em]
          text-[#8B8B8B]
        "
      >
        {t('page.brand')}
      </span>

      {ORDER_BRAND_COUNTS.map(({brand, count}) => (
        <Button
          key={brand}
          size = 'xs'
          type="button"
          variant="secondary"
          role="tab"
          aria-selected={activeBrand === brand}
          onClick={() => onBrandChange(brand)}
          className={`
          gap-2
          border
          px-[14px]
          font-sans
          text-[12.5px]
          font-medium
          leading-[1.35]
          focus-visible:outline-[#0F0F0F]
    ${
      activeBrand === brand
        ? getBrandFilterActiveClasses(brand)
        : 'border-[#EAEAEA] bg-white text-[#525252] hover:border-[#8B8B8B] hover:bg-[#F8F8F8] hover:text-[#0F0F0F]'
    }
  `}
        >
          <span
            aria-hidden="true"
            className={`
            h-2
            w-2
            shrink-0
            rounded-full
      ${getBrandDotClasses(brand)}
    `}
          />

          <span>{t(BRAND_KEYS[brand])}</span>

          <span
            className={`
      font-sans
      text-[11px]
      font-normal
      tabular-nums
      ${activeBrand === brand ? 'text-[#525252]' : 'text-[#8B8B8B]'}
    `}
          >
            {count}
          </span>
        </Button>
      ))}
    </div>
  );
}
