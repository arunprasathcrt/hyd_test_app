import { Button } from "~/shared/components/ui/Button";
import { useRef, useState, useEffect } from "react";
import type { PresentationFilterOption, PresentationStage } from "../../types/presentations";
import { PRESENTATION_FILTERS } from "../../lib/presentations";
import { useTranslation } from "react-i18next";

interface PresentationFilterMenuProps {
	selectedFilters: {
		customer: string;
		status: PresentationStage | '';
		rep: string;
	};
	onSelectedFiltersChange: (
		filters: {
			customer: string;
			status: PresentationStage | '';
			rep: string;
		},
	) => void;
	customerOptions: PresentationFilterOption[];
	repOptions: PresentationFilterOption[];
	statusFilterOptions: PresentationFilterOption[];
}

export const PresentationsFilterMenu = ({
	selectedFilters,
	onSelectedFiltersChange,
	customerOptions,
	repOptions,
	statusFilterOptions,
}: PresentationFilterMenuProps) => {
	const { t } = useTranslation('presentations');
	const menuRef = useRef<HTMLDivElement>(null);
	const [openFilter, setOpenFilter] = useState<
		'customer' | 'status' | 'rep' | null
	>(null);

	const getOptions = () => {
		switch (openFilter) {
			case 'customer':
				return customerOptions;

			case 'status':
				return statusFilterOptions;

			case 'rep':
				return repOptions;

			default:
				return [];
		}
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setOpenFilter(null);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<div
			className="flex min-w-0 flex-[1_1_100%] flex-wrap items-center gap-1"
			role="group"
			aria-label={t('filters.groupLabel')}
		>
			{PRESENTATION_FILTERS.map((filter) => {
				const hasSelection = selectedFilters[filter.id].length > 0;
				return (
					<div key={filter.id} ref={openFilter === filter.id ? menuRef : null} className="relative flex-none">
						<Button
							type="button"
							variant="toggle"
							size="small"
							aria-haspopup="dialog"
							aria-expanded={openFilter === filter.id}
							aria-pressed={openFilter === filter.id}
							onClick={() =>
								setOpenFilter((current) =>
									current === filter.id ? null : filter.id,
								)
							}
							className={
								hasSelection && openFilter !== filter.id
									? 'border-[#111113] shadow-[inset_0_0_0_0.5px_#111113]'
									: ''
							}
						>
							<span>{t(filter.labelKey)}</span>

							<span
								aria-hidden="true"
								className={`mb-0.5 ml-0.5 size-[6px] border-b border-r border-[#6B6B70] transition-transform ${openFilter === filter.id
									? 'translate-y-[1px] -rotate-[135deg]'
									: 'rotate-45'
									}`}
							/>

						</Button>
						{openFilter === filter.id && (
							<div className="absolute left-0 top-[calc(100%+8px)] z-[190] w-[340px] max-h-[min(560px,calc(100vh-140px))] max-w-[calc(100vw-32px)] overflow-auto rounded-2xl border border-[#ECECEE] bg-white shadow-[0_28px_70px_-22px_rgba(15,15,15,0.28),0_2px_8px_rgba(15,15,15,0.06)]">
								<div className="flex items-center justify-between gap-2 px-4 pb-2 pt-[14px]">
									<span className="text-[14px] font-semibold text-utds-ink">
										{t(filter.labelKey)}
									</span>
									{hasSelection && (
										<Button
											type="button"
											variant="ghost"
											size="xs"
											onClick={() => {
												onSelectedFiltersChange({
													...selectedFilters,
													[filter.id]: '',
												});

												setOpenFilter(null);
											}}
											className="cursor-pointer min-h-7 border-0 p-0 text-[12.5px] font-normal text-[#5C5C61] underline underline-offset-2 hover:bg-transparent hover:text-[#111113]"
										>
											{t('filters.clearAll')}
										</Button>
									)}
								</div>

								<div className="flex flex-col gap-0.5 p-2">
									{getOptions().map((option) => {
										const selected =
											selectedFilters[filter.id] === option.value;
										return (
											<Button
												key={option.value}
												type="button"
												variant="ghost"
												size="small"
												onClick={() => {
													onSelectedFiltersChange({
														...selectedFilters,
														[filter.id]: selected ? '' : option.value,
													});

													setOpenFilter(null);
												}}
												className="cursor-pointer flex min-h-9 w-full items-center gap-[10px] rounded-[10px] px-2 py-[7px] text-left hover:bg-[#F7F7F8]"
											>
												<span
													className={`grid h-[18px] w-[18px] place-items-center rounded-full border ${selected
														? 'border-[#111113] bg-[#111113]'
														: 'border-[#D7D7DA] bg-white'
														}`}
												>
													{selected && (
														<span className="h-2 w-2 rounded-full bg-white" />
													)}
												</span>

												<span
													className={`flex-1 text-[13px] text-utds-ink ${selected ? 'font-medium' : 'font-normal'
														}`}
												>
													{option.label}
												</span>

												<span className="ml-auto text-xs text-[#6B6B70]">
													{option.count}
												</span>
											</Button>
										)
									})}
								</div>

								<div className="flex justify-end border-t border-[#ECECEE] px-3 pb-3 pt-[10px]">
									<Button
										type="button"
										size="small"
										shape="md"
										onClick={() => setOpenFilter(null)}
										className="cursor-pointer"
									>
										{t('filters.done')}
									</Button>
								</div>
							</div>
						)}
					</div>
				)
			})}
		</div>
	);
};