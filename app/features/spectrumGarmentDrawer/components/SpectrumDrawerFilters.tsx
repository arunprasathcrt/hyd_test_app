import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  SpectrumCategory,
  SpectrumGarmentFilters,
} from "../../artDesign/types/artDesign";
import {
  SPECTRUM_CATEGORIES,
  SPECTRUM_GARMENTS,
} from "mocks/artDesign";
import { getSpectrumCategoryCount } from "../../artDesign/lib/artDesign";
import { Button } from "~/shared/components/ui/Button";
import { SpectrumColorFilters } from "./SpectrumColorFilters";
import { SpectrumBrandFilters } from "./SpectrumBrandFilters";

interface Props {
  filters: SpectrumGarmentFilters;
  onChange: (filters: SpectrumGarmentFilters) => void;
}

interface FilterChipProps {
  values: { value: SpectrumCategory; labelKey: string }[];
  selected: SpectrumCategory;
  getCount: (value: SpectrumCategory) => number;
  onSelect: (value: SpectrumCategory) => void;
}


export function SpectrumDrawerFilters({
  filters,
  onChange,
}: Props) {
  const { t } = useTranslation("artDesign");
  const update = (next: Partial<SpectrumGarmentFilters>) => {
    onChange({ ...filters, ...next });
  };

  return (
    <div className="flex flex-col gap-2 border-b border-[#ECECEE] px-4 pb-3 min-gap-2.5 min-px-6 min-[600px]:pb-3.5">
      <label className="relative block">
        <Search
          aria-hidden="true"
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B70]"
        />

        <input
          type="search"
          value={filters.query}
          onChange={(event) => update({ query: event.target.value })}
          placeholder={t("spectrumDrawer.searchPlaceholder")}
          aria-label={t("spectrumDrawer.searchLabel")}
          autoComplete="off"
          spellCheck={false}
          className="min-h-10 w-full rounded-[10px] border border-[#D7D7DA] bg-white pl-9 pr-3 text-[13.5px] text-[#111113] outline-none placeholder:text-[#6B6B70] focus:border-[#111113] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0E6E6E]"
        />
      </label>

      <FilterChips
        values={SPECTRUM_CATEGORIES}
        selected={filters.category}
        getCount={(value) =>
          getSpectrumCategoryCount(
            SPECTRUM_GARMENTS,
            value,
            filters,
          )
        }

        onSelect={(category) => update({ category })}
      />
      <SpectrumBrandFilters
        selected={filters.brand}
        garments={SPECTRUM_GARMENTS}
        filters={filters}
        onSelect={(brand) => update({ brand })}
      />
      <SpectrumColorFilters
        selected={filters.color}
        filters={filters}
        onSelect={(color) => update({ color })}
      />
    </div>
  );
}

function FilterChips({
  values,
  selected,
  getCount,
  onSelect,
}: FilterChipProps) {
  const { t } = useTranslation("artDesign");

  return (
    <div className="flex gap-1.5 overflow-x-auto sm:flex-wrap">
      {values.map((option) => {
        const count = getCount(option.value);
        const active = option.value === selected;
        if (count === 0 && !active) {
          return null;
        }

        return (
          <Button
            key={option.value}
            type="button"
            variant={active ? "default" : "outline"}
            size="xs"
            shape="pill"
            aria-pressed={active}
            onClick={() => onSelect(option.value)}
            className={`min-h-8 cursor-pointer whitespace-nowrap px-3 text-[12.5px] font-normal ${active
              ? "bg-[#111113] text-white hover:bg-[#111113] hover:text-white"
              : "bg-white text-[#5C5C61] hover:border-[#D7D7DA] hover:bg-white hover:text-[#111113]"
              } ${!active && count === 0
                ? "border-dashed text-[#6B6B70]"
                : ""
              }`}      >
            {t(option.labelKey)}
            <span className="text-xs opacity-80">
              {count}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
