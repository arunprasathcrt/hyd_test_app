import type {
	PresentationDensity,
	PresentationFilterOption,
	PresentationFilterState,
	PresentationSortOption,
	PresentationStage,
	PresentationStatus,
	PresentationStatusOption,
} from '~/features/presentations/types/presentations';
import { PresentationsFilterMenu } from './PresentationsFilterMenu';
import { PresentationsActiveFilters } from './PresentationsActiveFilters';
import { PresentationsToolbarActions } from './PresentationsToolbarActions';
import { PresentationsSearch } from './PresentationsSearch';

interface PresentationsToolbarProps {
	filters: PresentationFilterState;
	resultCount: number;
	statusCounts: PresentationStatusOption[];
	onSearchChange: (value: string) => void;
	onStatusChange: (status: PresentationStatus) => void;
	onSortChange: (sort: PresentationSortOption) => void;
	onDensityChange: (density: PresentationDensity) => void;
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

export function PresentationsToolbar({
	filters,
	resultCount,
	onSearchChange,
	onStatusChange,
	onSortChange,
	onDensityChange,
	selectedFilters,
	statusCounts,
	customerOptions,
	repOptions,
	statusFilterOptions,
	onSelectedFiltersChange,
}: PresentationsToolbarProps) {

	return (
		<section className="sticky top-0 z-[70] -my-3 mb-1.5 flex flex-col gap-3 bg-white py-3 max-md:static max-md:m-0 max-md:mb-3 max-md:p-0">
			<div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2.5">
				<PresentationsSearch
					value={filters.searchQuery}
					onChange={onSearchChange}
				/>
				<PresentationsActiveFilters
					searchQuery={filters.searchQuery}
					selectedFilters={selectedFilters}
					statusFilterOptions={statusFilterOptions}
					onSearchChange={onSearchChange}
					onSelectedFiltersChange={onSelectedFiltersChange}
				/>
				<PresentationsFilterMenu
					selectedFilters={selectedFilters}
					customerOptions={customerOptions}
					repOptions={repOptions}
					statusFilterOptions={statusFilterOptions}
					onSelectedFiltersChange={onSelectedFiltersChange}
				/>
			</div>

			<PresentationsToolbarActions
				filters={filters}
				resultCount={resultCount}
				statusCounts={statusCounts}
				onStatusChange={onStatusChange}
				onSortChange={onSortChange}
				onDensityChange={onDensityChange}
			/>
		</section>
	);
}

export default PresentationsToolbar;