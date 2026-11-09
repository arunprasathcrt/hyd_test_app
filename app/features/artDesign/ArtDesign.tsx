import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BuildPathCard } from "./components/BuildPathOptions";
import { DeliveryDateCard } from "./components/DeliveryDateCard";
import { getDateSummaryValues, getSavedBuildPath, getSavedNeededByDate, saveBuildPath, saveNeededByDate, startOfDay } from "./lib/artDesign";
import type { BuildPathType, SpectrumGarment } from "./types/artDesign";
import { BUILD_PATHS } from "mocks/artDesign";
import { Button } from "~/shared/components/ui/Button";
import { SpectrumGarmentDrawer } from "../spectrumGarmentDrawer/components/SpectrumDrawer";
import { useStore } from 'zustand';
import { spectrumDrawerStore } from '~/store/spectrum-drawer.store';
import { useNavigate } from "react-router";

export function ArtDesign() {
  const { t } = useTranslation("artDesign");
  const navigate = useNavigate();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] =
    useState<Date | null>(() => getSavedNeededByDate());
  const [selectedBuildPath, setSelectedBuildPath] =
    useState<BuildPathType | null>(() => getSavedBuildPath());
  const selectedDateIsPast =
    selectedDate !== null && selectedDate < today;

  const spectrumDrawerOpen = useStore(
    spectrumDrawerStore,
    (state) => state.isOpen,
  );

  const openSpectrumDrawer = useStore(
    spectrumDrawerStore,
    (state) => state.open,
  );

  const closeSpectrumDrawer = useStore(
    spectrumDrawerStore,
    (state) => state.close,
  );
  const dateSummary = useMemo(
    () =>
      selectedDate
        ? getDateSummaryValues(selectedDate, today)
        : null,
    [selectedDate, today],
  );

  const recommendedPath: BuildPathType | null =
    dateSummary
      ? dateSummary.insideSixWeeks
        ? "spectrum"
        : "ai"
      : null;

  const orderedBuildPaths = useMemo(() => {
    if (!recommendedPath) {
      return BUILD_PATHS;
    }

    return [...BUILD_PATHS].sort((a, b) => {
      if (a.id === recommendedPath) return -1;
      if (b.id === recommendedPath) return 1;
      return 0;
    });
  }, [recommendedPath]);

  const handleDateChange = (date: Date) => {
    const normalizedDate = startOfDay(date);
    setSelectedDate(normalizedDate);
    saveNeededByDate(normalizedDate);
  };

  const handleBuildPathSelect = (path: BuildPathType) => {
    if (!selectedDate) {
      return;
    }
    switch (path) {
      case "spectrum":
        handleSpectrumSelect();
        break;
      case "ai":
        handleAISelect();
        break;
    }
  };
  const handleSpectrumSelect = () => {
    setSelectedBuildPath("spectrum");
    saveBuildPath("spectrum");
    openSpectrumDrawer();
  };

  const handleSpectrumContinue = (garment: SpectrumGarment) => {
  closeSpectrumDrawer();

  void navigate("/artDesignSpectrum", {
    state: {
      garment,
    },
  });
};

  const handleAISelect = () => {
    setSelectedBuildPath("ai");
  };
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-white">
      <div className="mx-auto flex min-h-full w-full max-w-[1264px] flex-col px-4 py-6 sm:px-6 md:px-8 lg:py-12">
        <section
          aria-labelledby="art-design-title"
          className="w-full rounded-[20px] border border-[#ECECEE] bg-white px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"
        >
          <div id="art-design-title">
            <DeliveryDateCard
              selectedDate={selectedDate}
              today={today}
              selectedBuildPath={selectedBuildPath}
              onDateChange={handleDateChange}
            />
          </div>
          {selectedDate && dateSummary && !selectedDateIsPast && (
            <div className="mt-7">
              <div className="mb-3 flex items-center gap-3">
                <span className="shrink-0 text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
                  {t("buildPaths.heading")}
                </span>

                <span
                  aria-hidden="true"
                  className="h-px min-w-0 flex-1 bg-[#ECECEE]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {orderedBuildPaths.map((path) => {
                  const isRecommended =
                    path.id === recommendedPath;

                  const showCaution =
                    path.id === "ai" &&
                    dateSummary.insideSixWeeks;

                  return (
                    <BuildPathCard
                      key={path.id}
                      path={path}
                      recommended={isRecommended}
                      showCaution={showCaution}
                      daysShort={dateSummary.daysShort}
                      daysOut={dateSummary.daysOut}
                      onSelect={handleBuildPathSelect}
                    />
                  );
                })}
              </div>

              <p className="mb-0 mt-3.5 text-xs leading-5 text-[#6B6B70]">
                {t(
                  dateSummary.insideSixWeeks
                    ? "buildPaths.spectrumFooter"
                    : "buildPaths.aiFooter",
                )}
              </p>
            </div>
          )}
        </section>

        <div className="mt-4 flex w-full flex-wrap items-center justify-end gap-3 px-1">
          <span className="text-xs text-[#6B6B70]">
            {t("handoff.label")}
          </span>
          <Button
            type="button"
            variant="outline"
            size="small"
            shape="pill"
            disabled
            className="disabled:pointer-events-auto disabled:cursor-not-allowed"
          >
            {t("handoff.action")}
          </Button>
        </div>
      </div>
      <SpectrumGarmentDrawer
        open={spectrumDrawerOpen}
        onClose={() => closeSpectrumDrawer()}
        onContinue={handleSpectrumContinue}
      />
    </div>
  );
};

export default ArtDesign;