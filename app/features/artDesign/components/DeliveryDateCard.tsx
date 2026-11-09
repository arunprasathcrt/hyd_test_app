import { CalendarDays, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  formatDate,
  formatShortDate,
  getDateSummaryValues,
} from "../lib/artDesign";
import { Button } from "~/shared/components/ui/Button";
import type { BuildPathType } from "../types/artDesign";
import { DatePicker } from "~/shared/components/DatePicker";

interface Props {
  selectedDate: Date | null;
  today: Date;
  onDateChange: (date: Date) => void;
  selectedBuildPath: BuildPathType | null;
}

export const DeliveryDateCard = ({
  selectedDate,
  today,
  onDateChange,
  selectedBuildPath,
}: Props) => {
  const { t } = useTranslation("artDesign");
  const [open, setOpen] = useState(false);
  const summary = selectedDate
    ? getDateSummaryValues(selectedDate, today)
    : null;
  const selectedDateIsPast =
    summary !== null && summary.daysOut < 0;

  return (
    <>
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
          {t("neededBy.eyebrow")}
        </span>
        {selectedDate ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#111113]">
            {selectedBuildPath && !selectedDateIsPast && (
              <span className="grid size-3.5 place-items-center rounded-full bg-[#111113] text-white">
                <Check size={9} strokeWidth={2.5} />
              </span>
            )}

            {selectedDateIsPast
              ? t("neededBy.pastStatus")
              : selectedBuildPath === "spectrum"
                ? t("neededBy.spectrumStatus", {
                  date: formatShortDate(selectedDate),
                })
                : selectedBuildPath === "ai"
                  ? t("neededBy.aiStatus", {
                    date: formatShortDate(selectedDate),
                  })
                  : t("neededBy.choosePathStatus", {
                    date: formatShortDate(selectedDate),
                  })}
          </span>
        ) : (
          <span className="text-xs font-medium text-[#6B6B70]">
            {t("neededBy.pickDateStatus")}
          </span>
        )}
      </div>

      <h1 className="mb-2.5 text-xl font-semibold tracking-[-0.015em] text-[#111113] sm:text-2xl">
        {t("neededBy.title")}
      </h1>

      <p className="mb-5 max-w-[72ch] text-sm leading-[1.55] text-[#5C5C61]">
        {t("neededBy.description")}
      </p>

      <div className="grid items-center gap-4 xl:grid-cols-[420px_minmax(0,1fr)] xl:gap-8">
        <div className="relative w-full max-w-[420px]">
          <label
            id="needed-by-label"
            className="mb-2.5 block text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]"
          >
            {t("neededBy.label")}
          </label>
          <DatePicker
            selectedDate={selectedDate}
            today={today}
            onDateChange={onDateChange}
            open={open}
            onOpenChange={setOpen}
            trigger={
              <Button
                type="button"
                variant={selectedDate ? 'outline' : 'default'}
                size="default"
                shape="lg"
                aria-labelledby="needed-by-label"
                className={`w-full cursor-pointer justify-start gap-3 rounded-2xl px-4 py-[13px] text-left ${!selectedDate
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white hover:border-[#303030] hover:bg-[#303030]'
                    : open
                      ? 'border-[#111113]'
                      : 'border-[#D7D7DA] hover:border-[#6B6B70]'
                  }`}
              >
                <span
                  className={`grid size-[34px] shrink-0 place-items-center rounded-[10px] ${selectedDate
                    ? 'bg-[#F7F7F8] text-[#111113]'
                    : 'bg-white/15 text-white'
                    }`}
                >
                  <CalendarDays
                    aria-hidden="true"
                    size={17}
                  />
                </span>

                <span
                  className={`min-w-0 flex-1 truncate text-[15px] font-medium tracking-[-0.005em] ${selectedDate
                    ? 'text-[#111113]'
                    : 'text-white'
                    }`}
                >
                  {selectedDate && summary ? (
                    <>
                      {formatDate(selectedDate)}

                      <small className="mt-px block truncate text-xs font-normal tracking-normal text-[#6B6B70]">
                        {t('neededBy.daysOut', {
                          count: summary.daysOut,
                        })}
                        {' · '}
                        {summary.insideSixWeeks
                          ? t('neededBy.insideWindow')
                          : t('neededBy.outsideWindow')}
                      </small>
                    </>
                  ) : (
                    t('neededBy.chooseDate')
                  )}
                </span>

                <ChevronDown
                  aria-hidden="true"
                  size={16}
                  className={`shrink-0 transition-transform ${selectedDate
                      ? 'text-[#6B6B70]'
                      : 'text-white/70'
                    } ${open ? 'rotate-180' : ''}`}
                />

              </Button>
            }
          />
        </div>

        {selectedDate && summary && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 xl:mt-7 xl:self-center">
            <div
              className={`flex min-w-0 flex-1 items-center gap-[9px] text-[13px] font-medium ${selectedDateIsPast
                ? "text-[#A02020]"
                : summary.insideSixWeeks
                  ? "text-[#6B4A0B]"
                  : "text-[#1F7A4D]"
                }`}
            >
              <span
                className={`size-2 shrink-0 rounded-full ${selectedDateIsPast
                  ? "bg-[#A02020]"
                  : summary.insideSixWeeks
                    ? "bg-[#B26A00]"
                    : "bg-[#1F7A4D]"
                  }`}
              />
              {selectedDateIsPast ? (
                t("neededBy.pastSummary")
              ) : (
                <Trans
                  ns="artDesign"
                  i18nKey={
                    summary.insideSixWeeks
                      ? "neededBy.summarySpectrum"
                      : "neededBy.summaryAi"
                  }
                  values={{ days: summary.daysOut }}
                />
              )}
            </div>
            <Button
              type="button"
              variant="link"
              size="xs"
              shape="md"
              onClick={() => setOpen(true)}
              className="min-h-0 shrink-0 cursor-pointer px-1 py-0 text-[12.5px] font-medium underline underline-offset-[3px]"
            >
              {t("neededBy.changeDate")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};