import { LayoutGrid, Grid3x3 } from "lucide-react";
import type { PresentationDensity, PresentationFilterState, PresentationSortOption, PresentationStatusOption, PresentationStatus } from "../../types/presentations";
import { useTranslation } from "react-i18next";
import { PRESENTATION_DENSITY_OPTIONS, PRESENTATION_SORT_OPTIONS, PRESENTATION_SEGMENTS } from "../../lib/presentations";
import { Button } from '~/shared/components/ui/Button';

interface PresentationToolbarActionsProps {
	filters: PresentationFilterState;
	resultCount: number;
	statusCounts: PresentationStatusOption[];
	onStatusChange: (status: PresentationStatus) => void;
	onSortChange: (sort: PresentationSortOption) => void;
	onDensityChange: (density: PresentationDensity) => void;
}

export const PresentationsToolbarActions = ({
	filters,
	resultCount,
	statusCounts,
	onStatusChange,
	onSortChange,
	onDensityChange,
}: PresentationToolbarActionsProps) => {
	const { t } = useTranslation('presentations');
	const countLabel =
		resultCount === 1
			? t('count.single', { count: resultCount })
			: t('count.multiple', { count: resultCount });
	return (
		<div className="flex min-w-0 flex-wrap items-center gap-x-[14px] gap-y-2.5">
			<div
				role="group"
				aria-label={t('segments.label')}
				className="inline-flex max-w-full flex-[0_1_auto] items-center gap-0.5 overflow-x-auto rounded-xl bg-[#F7F7F8] p-[3px] scrollbar-none"
			>
				{PRESENTATION_SEGMENTS.map((segment) => {
					const count =
						statusCounts.find((item) => item.value === segment.value)?.count ??
						0;
					const selected = filters.status === segment.value;
					return (
						<Button
							key={segment.value}
							type="button"
							variant="toggle"
							aria-pressed={selected}
							onClick={() => onStatusChange(segment.value)}
							className={`min-h-9 h-9 flex-none gap-[7px] rounded-[9px]
								px-[14px] py-0 border-0 whitespace-nowrap
								text-[13px] font-medium
								${selected
									? 'bg-white text-utds-ink shadow-[0_1px_3px_rgba(17,17,19,0.10)]'
									: 'bg-transparent text-[#5C5C61] hover:text-utds-ink'
								}`}
						>
							<span>{t(segment.labelKey)}</span>

							<span className="text-xs font-medium text-[#5C5C61]">
								{count}
							</span>
						</Button>
					);
				})}
			</div>

			<div className="ml-auto flex min-w-0 flex-[0_1_auto] items-center gap-2 max-md:flex-1 max-md:flex-wrap max-md:justify-end">
				<span
					aria-live="polite"
					className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13.5px] font-medium text-utds-ink"
				>
					{countLabel}
				</span>

				<span className="relative inline-flex flex-none items-center">
					<span className="pointer-events-none absolute left-[13px] top-1/2 -translate-y-1/2 text-[12px] font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
						{t('sort.label')}
					</span>

					<span className="pointer-events-none absolute right-[14px] top-1/2 size-[6px] -translate-y-[65%] rotate-45 border-b border-r border-[#6B6B70]" />

					<select
						value={filters.sortBy}
						onChange={(event) =>
							onSortChange(event.target.value as PresentationSortOption)
						}
						aria-label={t('sort.label')}
						className="cursor-pointer h-9 min-w-[199px] appearance-none rounded-full border border-[#ECECEE] bg-white pl-[56px] pr-[30px] text-[13px] font-medium text-utds-ink hover:border-[#D7D7DA] focus:border-[#D7D7DA] focus:outline-none"
					>
						{PRESENTATION_SORT_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{t(option.labelKey)}
							</option>
						))}
					</select>
				</span>

				<div
					role="group"
					aria-label={t('density.label')}
					className="inline-flex flex-none items-center gap-0.5 rounded-[10px] bg-[#F7F7F8] p-0.5 max-[560px]:hidden"
				>
					{PRESENTATION_DENSITY_OPTIONS.map((option) => {
						const selected = filters.density === option.value;

						return (
							<Button
								key={option.value}
								type="button"
								variant="toggle"
								size="icon"
								aria-label={t(option.labelKey)}
								aria-pressed={selected}
								onClick={() => onDensityChange(option.value)}
								className={`
									size-8 rounded-lg border-0
									${selected
										? 'bg-white text-utds-ink shadow-[0_1px_3px_rgba(17,17,19,0.10)]'
										: 'bg-transparent text-[#6B6B70] hover:bg-[#F7F7F8] hover:text-utds-ink'}
									`}
							>
								{option.value === 'comfortable' ? (
									<LayoutGrid aria-hidden="true" className="size-4" />
								) : (
									<Grid3x3 aria-hidden="true" className="size-4" />
								)}
							</Button>
						);
					})}
				</div>
			</div>
		</div>
	);
};