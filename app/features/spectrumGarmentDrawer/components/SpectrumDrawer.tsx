import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  filterSpectrumGarments,
} from "../../artDesign/lib/artDesign";
import type {
  SpectrumGarment,
  SpectrumGarmentFilters,
} from "../../artDesign/types/artDesign";
import { SPECTRUM_GARMENTS } from "mocks/artDesign";
import { SpectrumDrawerFilters } from "./SpectrumDrawerFilters";
import { SpectrumGarmentGrid } from "./SpectrumGarmentGrid";
import { Button } from "~/shared/components/ui/Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onContinue: (garment: SpectrumGarment) => void;
  initialGarment?: SpectrumGarment | null;
}

const INITIAL_FILTERS: SpectrumGarmentFilters = {
  query: "",
  category: "all",
  color: "all",
  brand: "all",
};

export function SpectrumGarmentDrawer({
  open,
  onClose,
  onContinue,
  initialGarment
}: Props) {
  const { t } = useTranslation("artDesign");

  const [filters, setFilters] =
    useState<SpectrumGarmentFilters>(() => ({
      ...INITIAL_FILTERS,
    }));

  const [selectedGarment, setSelectedGarment] =
    useState<SpectrumGarment | null>(null);

  const handleClose = () => {
    setSelectedGarment(null);
    onClose();
  };

  const garments = useMemo(
    () => filterSpectrumGarments(SPECTRUM_GARMENTS, filters),
    [filters],
  );
  const [visible, setVisible] = useState(open);
  const initialGarmentRef = useRef(initialGarment);

  useEffect(() => {
    initialGarmentRef.current = initialGarment;
  });

  useEffect(() => {
    if (open) {
      setSelectedGarment(initialGarmentRef.current ?? null);
      setFilters((current) => ({
        ...current,
        brand: current.brand ?? "all",
      }));
      setVisible(true);
      return;
    }
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 280);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[1250] flex justify-end text-[13px] leading-[1.45] text-[#111113]">
      <button
        type="button"
        aria-label={t("spectrumDrawer.close")}
        onClick={handleClose}
        className={`absolute inset-0 border-0 bg-[rgba(17,17,19,0.32)] p-0 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="spectrum-drawer-title"
        aria-describedby="spectrum-drawer-description"
        className={`relative flex h-full w-full flex-col bg-white shadow-[-24px_0_60px_-18px_rgba(17,17,19,0.22)] transition-transform duration-[280ms] ease-[cubic-bezier(.22,1,.36,1)] sm:w-[600px] sm:border-l sm:border-[#ECECEE] ${open ? "translate-x-0" : "translate-x-[104%]"
          }`}
      >
        <header className="flex items-start gap-3 px-4 pb-2.5 pt-3.5 sm:pb-3 sm:pl-6 sm:pr-4 sm:pt-5">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-[7px] text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
              <span className="size-[7px] rounded-full bg-[#111113]" />
              {t("spectrumDrawer.eyebrow")}
            </span>

            <h2
              id="spectrum-drawer-title"
              className="mt-1 text-xl font-semibold leading-[1.3] tracking-[-0.015em] text-[#111113]"
            >
              {t("spectrumDrawer.title")}
            </h2>

            <p
              id="spectrum-drawer-description"
              className="mt-1 hidden text-[13px] leading-[1.5] text-[#5C5C61] min-[600px]:block"
            >
              {t("spectrumDrawer.description")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            shape="pill"
            onClick={handleClose}
            aria-label={t("spectrumDrawer.close")}
            className="size-10 cursor-pointer"
          >
            <span
              aria-hidden="true"
              className="text-[22px] font-normal leading-none"
            >
              ×
            </span>
          </Button>
        </header>

        <SpectrumDrawerFilters
          filters={filters}
          onChange={setFilters}
        />

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 sm:px-6 sm:pb-6 sm:pt-4">
          <SpectrumGarmentGrid
            garments={garments}
            selectedGarment={selectedGarment}
            onSelect={setSelectedGarment}
            onClearFilters={() => setFilters(INITIAL_FILTERS)}
            onClose={handleClose}
          />
        </div>

        <footer className="flex flex-wrap items-center gap-2.5 border-t border-[#ECECEE] bg-white px-4 py-2.5 sm:flex-nowrap sm:gap-3.5 sm:px-6 sm:py-3">
          <div className="min-w-0 flex-1 basis-full sm:basis-auto">
            {selectedGarment ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedGarment.imageUrl}
                  alt=""
                  className="size-11 shrink-0 rounded-[10px] bg-[#F5F5F6] object-contain mix-blend-multiply" />

                <div className="flex min-w-0 flex-col gap-0.5">
                  <b className="block truncate text-[13px] font-semibold">
                    {selectedGarment.name}
                  </b>
                  <small className="block truncate text-xs text-[#6B6B70]">
                    {t("spectrumDrawer.garmentMeta", {
                      style: selectedGarment.style,
                      count: selectedGarment.colors,
                    })}
                  </small>
                  <small className="block truncate text-xs text-[#6B6B70]">
                    {t("spectrumDrawer.pickColorInSpectrum")}
                  </small>
                </div>
              </div>
            ) : (
              <span className="text-[12.5px] text-[#5C5C61]">
                {t("spectrumDrawer.pickHint")}
              </span>
            )}
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="default"
              shape="lg"
              onClick={handleClose}
              className="flex-1 border-[#D7D7DA] text-[13px]  cursor-pointer font-medium hover:bg-[#F7F7F8] sm:flex-none"
            >
              {t("spectrumDrawer.cancel")}
            </Button>
            <Button
              type="button"
              variant="default"
              size="default"
              shape="lg"
              disabled={!selectedGarment}
              onClick={() => {
                if (selectedGarment) {
                  onContinue(selectedGarment);
                }
              }}
              className="flex-[2] cursor-pointer px-5 text-[13.5px] font-medium disabled:pointer-events-auto disabled:cursor-not-allowed disabled:border-[#D7D7DA] disabled:bg-[#D7D7DA] disabled:text-[#5C5C61] disabled:opacity-100 sm:flex-none"
            >
              {t("spectrumDrawer.customize")}
            </Button>
          </div>
        </footer>
      </aside>
    </div>
  );
}