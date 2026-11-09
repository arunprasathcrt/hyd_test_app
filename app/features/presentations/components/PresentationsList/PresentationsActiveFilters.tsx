
import { useTranslation } from 'react-i18next';
import type {
	PresentationStage,
	PresentationFilterOption,
} from '~/features/presentations/types/presentations';
import { Button } from '~/shared/components/ui/Button';

interface PresentationActiveFiltersProps {
	searchQuery: string;
	selectedFilters: {
		customer: string;
		status: PresentationStage | '';
		rep: string;
	};
	onSearchChange: (value: string) => void;
	statusFilterOptions: PresentationFilterOption[];
	onSelectedFiltersChange: (
		filters: {
			customer: string;
			status: PresentationStage | '';
			rep: string;
		},
	) => void;
}
export const PresentationsActiveFilters = ({
	searchQuery,
	selectedFilters,
	onSearchChange,
	onSelectedFiltersChange,
	statusFilterOptions,
}: PresentationActiveFiltersProps) => {
	const { t } = useTranslation('presentations');
	const getDisplayValue = (
		filterType: 'customer' | 'status' | 'rep',
		value: string,
	) => {
		if (filterType === 'status') {
			return (
				statusFilterOptions.find((option) => option.value === value)?.label ??
				value
			);
		}

		return value;
	};
	return (
		<div
			className="flex min-w-0 flex-[1_1_280px] flex-wrap items-center gap-1.5"
			role="group"
			aria-label={t('filters.activeFilters')}
		>
			{searchQuery && (
				<div className="inline-flex min-h-9 max-w-full items-center gap-1 rounded-full border border-[#ECECEE] bg-white pl-3 pr-[5px] text-[12.5px] font-medium text-[#111113] transition-colors">
					<span className="text-xs font-normal text-[#6B6B70]">
						{t('search.searchPill')}
					</span>

					<span className="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
						“{searchQuery}”
					</span>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => onSearchChange('')}
						className="cursor-pointer size-[26px] rounded-full border-0 p-0 text-[15px] text-[#6B6B70] hover:bg-[#F7F7F8] hover:text-[#111113]"
					>
						×
					</Button>
				</div>
			)}
			{(
				[
					['customer', selectedFilters.customer],
					['status', selectedFilters.status],
					['rep', selectedFilters.rep],
				] as const
			)
				.filter(([, value]) => Boolean(value))
				.map(([filterType, value]) => (
					<div
						key={`${filterType}-${value}`}
						className="inline-flex min-h-9 max-w-full items-center gap-1 rounded-full border border-[#ECECEE] bg-white pl-3 pr-[5px] text-[12.5px] font-medium text-[#111113]"
					>
						<span className="text-xs font-normal text-[#6B6B70]">
							{t(`filters.${filterType}`)}
						</span>

						<span className="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
							{getDisplayValue(filterType, value)}
						</span>
						
						<Button
							type="button"
							variant="ghost"
							size="icon"
							onClick={() =>
								onSelectedFiltersChange({
									...selectedFilters,
									[filterType]: '',
								})
							}
							className="cursor-pointer size-[26px] rounded-full border-0 p-0 text-[15px] text-[#6B6B70] hover:bg-[#F7F7F8]"
						>
							×
						</Button>
					</div>
				))}
			{(
				searchQuery ||
				selectedFilters.customer ||
				selectedFilters.status ||
				selectedFilters.rep
			) && (
					<Button
						variant="outline"
						shape="md"
						type="button"
						onClick={() => {
							onSearchChange('');
							onSelectedFiltersChange({
								customer: '',
								status: '',
								rep: '',
							})
						}}
						className="cursor-pointer inline-flex min-h-9 items-center rounded-[10px] border border-[#D7D7DA] bg-white px-[14px] text-[12.5px] font-medium text-utds-ink transition-colors hover:bg-[#F7F7F8]"
					>
						{t('filters.clearAll')}
					</Button>
				)}
		</div>
	)
};