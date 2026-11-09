import { useTranslation } from "react-i18next";
import type { SpectrumGarment } from "../../artDesign/types/artDesign";
import { SpectrumGarmentCard } from "./SpectrumGarmentCard";
import { Button } from "~/shared/components/ui/Button";
import { useNavigate } from "react-router";

interface Props {
  garments: SpectrumGarment[];
  selectedGarment: SpectrumGarment | null;
  onSelect: (garment: SpectrumGarment) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export function SpectrumGarmentGrid({
  garments,
  selectedGarment,
  onSelect,
  onClearFilters,
  onClose
}: Props) {
  const { t } = useTranslation("artDesign");
  const navigate = useNavigate();

  if (garments.length === 0) {
    return (
      <div className="mx-auto flex max-w-[420px] flex-col items-center gap-1.5 py-7 text-center">
        <h3 className="mt-1 text-base font-semibold text-[#111113]">
          {t("spectrumDrawer.empty.title")}
        </h3>

        <p className="text-[13px] leading-[1.5] text-[#5C5C61]">
          {t("spectrumDrawer.empty.description")}
        </p>

        <div className="mt-2.5 flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            shape="lg"
            className="cursor-pointer"
            onClick={() => { onClose(); void navigate("/productList")}}
          >
            {t("spectrumDrawer.empty.searchProducts")}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="default"
            shape="lg"
            className="cursor-pointer"
            onClick={onClearFilters}
          >
            {t("spectrumDrawer.empty.clearFilters")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:gap-3">
      {garments.map((garment) => (
        <SpectrumGarmentCard
          key={garment.id}
          garment={garment}
          selected={selectedGarment?.id === garment.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}