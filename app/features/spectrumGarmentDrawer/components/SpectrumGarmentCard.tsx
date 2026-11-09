import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SpectrumGarment } from "../../artDesign/types/artDesign";
import { Button } from "~/shared/components/ui/Button";

interface Props {
	garment: SpectrumGarment;
	selected: boolean;
	onSelect: (garment: SpectrumGarment) => void;
}

export function SpectrumGarmentCard({
	garment,
	selected,
	onSelect,
}: Props) {
	const { t } = useTranslation("artDesign");

	return (
		<>
			<Button
				type="button"
				variant="ghost"
				aria-pressed={selected}
				onClick={() => onSelect(garment)}
				className={`relative flex h-auto min-w-0 cursor-pointer shrink flex-col items-stretch justify-start gap-0 overflow-hidden rounded-[14px] border border-[#ECECEE] bg-white p-0 text-left hover:bg-white ${selected
						? "after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[14px] after:border-[2.34px] after:border-[#111113] after:content-['']"
						: "hover:-translate-y-px hover:border-[#D7D7DA] hover:shadow-[0_10px_24px_rgba(17,17,19,0.07)]"
					}`}
			>
				<span className="flex aspect-square w-full items-center justify-center overflow-hidden bg-[#F5F5F6]">
					<img
						src={garment.imageUrl}
						alt=""
						loading="lazy"
						className="h-full w-full object-contain mix-blend-multiply"
					/>
				</span>

				<span className="flex min-w-0 flex-col items-start gap-1 px-3 pb-3 pt-2.5">
					<span className="line-clamp-2 text-[12.5px] font-medium leading-[1.3] text-[#111113]">
						{garment.name}
					</span>

					<span className="w-full truncate text-xs font-normal text-[#6B6B70]">
						{t("spectrumDrawer.garmentMeta", {
							style: garment.style,
							count: garment.colors,
						})}
					</span>
				</span>

				<span
					aria-hidden="true"
					className={`absolute right-[9px] top-[9px] grid size-[22px] place-items-center rounded-full border-[1.5px] ${selected
						? "border-[#111113] bg-[#111113] text-white"
						: "border-[#D7D7DA] bg-white text-white"
						}`}
				>
					<Check size={12} strokeWidth={3} />
				</span>
			</Button>
		</>
	);
}