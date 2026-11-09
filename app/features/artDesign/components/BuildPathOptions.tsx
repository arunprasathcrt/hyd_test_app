import { ArrowRight, Clock3, Database, Zap } from "lucide-react";
import { Badge } from "~/shared/components/ui/Badge";
import { useTranslation } from "react-i18next";
import type { BuildPath } from "../types/artDesign";
import { Button } from "~/shared/components/ui/Button";

interface Props {
  path: BuildPath;
  recommended: boolean;
  showCaution: boolean;
  daysShort: number;
  daysOut: number;
  onSelect: (id: BuildPath["id"]) => void;
}

export const BuildPathCard = ({
  path,
  recommended,
  showCaution,
  daysShort,
  daysOut,
  onSelect,
}: Props) => {
  const { t } = useTranslation("artDesign");
  const isSpectrum = path.id === "spectrum";
  const isDisabled = path.id === "ai";

  return (
    <div
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-disabled={isDisabled}
      onClick={() => {
        if (!isDisabled) {
          onSelect(path.id);
        }
      }}
      onKeyDown={(event) => {
        if (
          !isDisabled &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          onSelect(path.id);
        }
      }}
      className={`grid gap-7 rounded-[14px] border bg-white p-6 min-[800px]:grid-cols-2 ${recommended
        ? "border-[#111113] ring-1 ring-inset ring-[#111113]"
        : "border-[#D7D7DA]"
        } ${isDisabled
          ? "cursor-not-allowed"
          : "cursor-pointer hover:border-[#6B6B70] hover:shadow-[0_10px_24px_rgba(17,17,19,0.07)]"
        }`}
    >
      <div className="flex min-w-0 flex-col">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
            <span
              className={`size-2 rounded-full ${isSpectrum ? "bg-[#5C5C61]" : "bg-[#5B3BA8]"
                }`}
            />
            {t(path.tagKey)}
          </span>
          <Badge
            variant="neutral"
            className={`h-[22px] px-[9px] py-0 text-xs font-semibold uppercase leading-none tracking-[0.04em] ${recommended
              ? "bg-[#111113] text-white"
              : "bg-[#F2F2F3] text-[#5C5C61]"
              }`}
          >
            {recommended
              ? t("buildPaths.recommended")
              : t("buildPaths.alsoOpen")}
          </Badge>
        </div>

        <h2 className="mb-2 text-xl font-semibold tracking-[-0.012em] text-[#111113]">
          {t(path.titleKey)}
        </h2>

        <p className="mb-4 max-w-[62ch] text-[13px] leading-[1.5] text-[#5C5C61]">
          {t(path.descriptionKey)}
        </p>

        <div className="mb-[18px] flex items-center gap-3 rounded-xl border border-[#ECECEE] bg-[#F7F7F8] px-4 py-3">
          {isSpectrum ? <Zap size={18} /> : <Clock3 size={18} />}

          <div>
            <strong className="block text-sm font-semibold">
              {t(path.timeTitleKey)}
            </strong>
            <span className="text-xs text-[#6B6B70]">
              {t(path.timeDescriptionKey, {
                days: daysOut,
              })}
            </span>
          </div>
        </div>

        <div className="mb-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-[10px] bg-[#F7F7F8] px-2.5 py-2 text-xs leading-[1.5] text-[#5C5C61]">
          <Database
            aria-hidden="true"
            size={14}
            strokeWidth={1.8}
            className="shrink-0 text-[#6B6B70]"
          />

          <span>
            <strong className="font-semibold text-[#111113]">
              {t(path.creditTitleKey)}
            </strong>{" "}
            {t(path.creditDescriptionKey)}
          </span>

          {!isSpectrum && (
            <>
              <Button
                type="button"
                variant="link"
                size="xs"
                shape="md"
                className="min-h-6 cursor-pointer px-0.5 py-0 !text-[12.5px] !font-normal leading-[1.5] text-[#5C5C61] underline underline-offset-2 hover:text-[#111113]"
              >
                {t("buildPaths.ai.topUpCredits")}
              </Button>

              <span
                role="img"
                aria-label={t("buildPaths.ai.unlimitedCredits")}
                className="h-1.5 w-full overflow-hidden rounded-full bg-[#ECECEE]"
              >
                <span className="block h-full w-full rounded-full bg-[#111113]" />
              </span>
            </>
          )}
        </div>
        <Button
          type="button"
          variant={recommended ? "default" : "outline"}
          size="default"
          shape="lg"
          disabled={isDisabled}
          onClick={(event) => {
            event.stopPropagation();

            if (!isDisabled) {
              onSelect(path.id);
            }
          }}
          className="mt-auto w-full sm:self-start xl:w-auto xl:min-w-[260px] cursor-pointer"
        >
          {t(path.ctaKey)}
          <ArrowRight aria-hidden="true" size={15} />
        </Button>
      </div>

      <div className="min-w-0 min-[800px]:border-l min-[800px]:border-[#ECECEE] min-[800px]:pl-7">
        <ListSection
          title={t("buildPaths.whatYouGet")}
          items={path.prosKeys.map((key) => t(key))}
          positive
        />

        <div className="mt-5">
          <ListSection
            title={t("buildPaths.tradeOffs")}
            items={path.consKeys.map((key) => t(key))}
          />
        </div>

        {showCaution && (
          <div className="mt-4 rounded-[10px] border border-[#F0D49A] bg-[#FFF6E5] p-3 text-xs leading-5 text-[#6B4A0B]">
            {t("buildPaths.ai.caution", {
              daysOut,
              daysShort,
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ListSection = ({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) => (
  <>
    <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
      {title}
    </h3>

    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className={`flex gap-2 text-[13px] leading-[1.45] ${positive ? "text-[#5C5C61]" : "text-[#6B6B70]"
            }`}

        >
          <span
            aria-hidden="true"
            className={`relative mt-px size-[14px] shrink-0 rounded-full ${positive ? "bg-[#111113]" : "bg-[#F2F2F3]"
              }`}
          >
            {positive ? (
              <span className="absolute left-[5px] top-[3px] h-[7px] w-1 rotate-45 border-b-2 border-r-2 border-white" />
            ) : (
              <span className="absolute left-1 top-[6px] h-0.5 w-1.5 rounded-sm bg-[#6B6B70]" />
            )}
          </span>
          {item}
        </li>
      ))}
    </ul>
  </>
);