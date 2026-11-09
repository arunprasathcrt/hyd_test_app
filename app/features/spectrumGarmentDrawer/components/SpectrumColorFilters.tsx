import { useTranslation } from "react-i18next";
import type { SpectrumColor, SpectrumGarmentFilters } from "../../artDesign/types/artDesign";
import { getSpectrumColorCount } from "../../artDesign/lib/artDesign";
import {
	SPECTRUM_COLORS,
	SPECTRUM_GARMENTS,
} from "mocks/artDesign";
import { Button } from "~/shared/components/ui/Button";

interface Props {
	selected: SpectrumColor;
	onSelect: (color: SpectrumColor) => void;
	filters: SpectrumGarmentFilters
}

const COLOR_CLASSES: Partial<Record<SpectrumColor, string>> = {
	Black: "bg-[#111113]",
	White: "bg-white",
	"Grey / Heather": "bg-[#9A9AA0]",
	"Blue / Navy": "bg-[#1F3A68]",
	Red: "bg-[#C8102E]",
	Green: "bg-[#2E7D4F]",
	Pink: "bg-[#E58FB0]",
};

export function SpectrumColorFilters({
	selected,
	onSelect,
	filters
}: Props) {
	const { t } = useTranslation("artDesign");

	return (
		<div className="flex gap-1.5 overflow-x-auto sm:flex-wrap">
			{SPECTRUM_COLORS.map((option) => {
				const active = selected === option.value;
				const count = getSpectrumColorCount(
					SPECTRUM_GARMENTS,
					option.value,
					filters
				);

				if (option.value === "all") {
					return (
						<Button
							key={option.value}
							type="button"
							variant={active ? "default" : "outline"}
							size="xs"
							shape="pill"
							aria-pressed={active}
							onClick={() => onSelect(option.value)}
							className="min-h-8 cursor-pointer whitespace-nowrap px-3 text-[12.5px] font-normal"
						>
							{t(option.labelKey)}
						</Button>
					);
				}

				const isOther = option.value === "Other";

				return (
					<Button
						key={option.value}
						type="button"
						variant="outline"
						size="icon"
						shape="pill"
						aria-label={t(option.labelKey)}
						title={t(option.labelKey)}
						aria-pressed={active}
						onClick={() => onSelect(option.value)}
						className={`size-8 min-h-8 shrink-0 cursor-pointer overflow-visible bg-white p-0 hover:bg-white ${active
							? "border-[#111113] shadow-[inset_0_0_0_1px_#111113]"
							: count === 0 && !active
								? "border-dashed border-[#ECECEE]"
								: "border-[#ECECEE] hover:border-[#D7D7DA]"
							}`}
					>
						<span
							aria-hidden="true"
							className={`size-4 rounded-full shadow-[inset_0_0_0_1px_rgba(17,17,19,0.24)] ${isOther
								? "bg-[conic-gradient(#C8102E_0_25%,#1F3A68_0_50%,#2E7D4F_0_75%,#9A9AA0_0)]"
								: COLOR_CLASSES[option.value]
								} ${active || isOther ? "opacity-100" : "opacity-40"}
								}`}
						/>
					</Button>
				);
			})}
		</div>
	);
}