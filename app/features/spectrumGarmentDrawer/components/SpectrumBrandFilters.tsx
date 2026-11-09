import { useTranslation } from 'react-i18next';

import type {
  SpectrumBrand,
  SpectrumGarment,
  SpectrumGarmentFilters,
} from '../../artDesign/types/artDesign';
import { SPECTRUM_BRANDS } from 'mocks/artDesign';
import { Button } from '~/shared/components/ui/Button';
import { getSpectrumBrandCount } from '~/features/artDesign/lib/artDesign';

interface Props {
  selected: SpectrumBrand;
  garments: SpectrumGarment[];
  onSelect: (brand: SpectrumBrand) => void;
  filters: SpectrumGarmentFilters;
}

export function SpectrumBrandFilters({
  selected,
  garments,
  onSelect,
  filters
}: Props) {
  const { t } = useTranslation('artDesign');

  const getBrandCount = (brand: SpectrumBrand) =>
    getSpectrumBrandCount(garments, brand, filters);

  return (
    <div
      className="flex gap-1.5 overflow-x-auto sm:flex-wrap"
      role="group"
      aria-label={t('spectrumDrawer.brands.label')}
    >
      {SPECTRUM_BRANDS.map((option) => {
        const active = selected === option.value;
        const count = getBrandCount(option.value);

        return (
          <Button
            key={option.value}
            type="button"
            variant={active ? 'default' : 'outline'}
            size="xs"
            shape="pill"
            aria-pressed={active}
            onClick={() => onSelect(option.value)}
            className={`min-h-8 cursor-pointer whitespace-nowrap px-3 text-[12.5px] font-normal ${active
                ? 'bg-[#111113] text-white hover:bg-[#111113] hover:text-white'
                : count === 0
                  ? 'border-dashed border-[#ECECEE] bg-white text-[#6B6B70] hover:border-[#D7D7DA] hover:bg-white hover:text-[#111113]'
                  : 'border-[#ECECEE] bg-white text-[#5C5C61] hover:border-[#D7D7DA] hover:bg-white hover:text-[#111113]'
              }`}
          >
            {t(option.labelKey)}
          </Button>
        );
      })}
    </div>
  );
}