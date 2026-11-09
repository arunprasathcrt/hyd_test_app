import { useState } from 'react';
import {useTranslation} from 'react-i18next';
import { PresentationsGrid } from './components/PresentationsList/PresentationsGrid';
import { PresentationsHeader } from './components/PresentationsList/PresentationsHeader';
import { PresentationsToolbar } from './components/PresentationsList/PresentationsToolbar';

import type {
	Presentation,
	PresentationDensity,
	PresentationFilterState,
	PresentationCustomer,
	PresentationSortOption,
	PresentationStatus,
	PresentationToolbarFilters,
} from './types/presentations';
import NewPresentationModal from './components/PresentationsList/NewPresentationModal';
import { getPresentationStage, buildStatusCounts, buildCustomerOptions, buildRepOptions } from './lib/presentations';
import { useNavigate } from 'react-router-dom';

interface PresentationsPageProps {
	presentations: Presentation[];
	customers: PresentationCustomer[];
}

export default function PresentationsPage({
	presentations: allPresentations,
	customers,
}: PresentationsPageProps) {
	const { t } = useTranslation('presentations');
	const navigate = useNavigate();
	const [filters, setFilters] = useState<PresentationFilterState>({
		searchQuery: '',
		status: 'all',
		sortBy: 'updated',
		density: 'comfortable',
	});

	const [selectedFilters, setSelectedFilters] =
		useState<PresentationToolbarFilters>({
			customer: '',
			status: '',
			rep: '',
		});

	const [isNewPresentationOpen, setIsNewPresentationOpen] = useState(false);
	const statusCounts = buildStatusCounts(allPresentations);
	const customerOptions = buildCustomerOptions(allPresentations);
	const repOptions = buildRepOptions(allPresentations);
	const statusFilterOptions = [
		{
			value: 'unsent',
			label: t('filters.statusOptions.unsent'),
			count: allPresentations.filter(
				(item) => item.status === 'draft',
			).length,
		},
		{
			value: 'unopened',
			label: t('filters.statusOptions.unopened'),
			count: 0,
		},
		{
			value: 'opened',
			label: t('filters.statusOptions.opened'),
			count: allPresentations.filter(
				(item) => item.status === 'withCustomer',
			).length,
		},
		{
			value: 'changes',
			label: t('filters.statusOptions.changes'),
			count: allPresentations.filter(
				(item) => item.status === 'needsUs',
			).length,
		},
		{
			value: 'nodraft',
			label: t('filters.statusOptions.nodraft'),
			count: allPresentations.filter(
				(item) => item.status === 'approved',
			).length,
		},
		{
			value: 'drafted',
			label: t('filters.statusOptions.drafted'),
			count: 0,
		},
		{
			value: 'closed',
			label: t('filters.statusOptions.closed'),
			count: allPresentations.filter(
				(item) => item.status === 'closed',
			).length,
		},
	];
	const presentations = allPresentations.filter((presentation) => {
		const matchesSearch =
			!filters.searchQuery ||
			presentation.name
				.toLowerCase()
				.includes(filters.searchQuery.toLowerCase()) ||
			presentation.customer
				.toLowerCase()
				.includes(filters.searchQuery.toLowerCase()) ||
			presentation.customerCode
				.toLowerCase()
				.includes(filters.searchQuery.toLowerCase());

		const matchesSegment =
			filters.status === 'all' ||
			presentation.status === filters.status;

		const matchesCustomer =
			!selectedFilters.customer ||
			selectedFilters.customer ===
			presentation.customer.toLowerCase().replace(/\s+/g, '-');

		const matchesStatusFilter =
			!selectedFilters.status ||
			selectedFilters.status === getPresentationStage(presentation);

		const matchesRep =
			!selectedFilters.rep ||
			selectedFilters.rep === presentation.repName;

		return (
			matchesSearch &&
			matchesSegment &&
			matchesCustomer &&
			matchesStatusFilter &&
			matchesRep
		);
	}).sort((a, b) => {
		switch (filters.sortBy) {
			case 'updated': {
				if (a.updatedAtMs !== undefined && b.updatedAtMs !== undefined) {
					return b.updatedAtMs - a.updatedAtMs;
				}

				if (a.updatedAtMs !== undefined) return -1;
				if (b.updatedAtMs !== undefined) return 1;

				return 0;
			}

			case 'needed':
				if (!a.neededBy) return 1;
				if (!b.neededBy) return -1;

				return (
					new Date(a.neededBy).getTime() -
					new Date(b.neededBy).getTime()
				);

			case 'name':
				return a.name.localeCompare(b.name);

			case 'customer':
				return a.customer.localeCompare(b.customer);

			default:
				return 0;
		}
	});


	return (
		<div className="h-full min-h-0 overflow-y-auto bg-white">
			<div className="mx-auto flex min-h-full w-full max-w-[1264px] flex-col px-4 py-6 sm:px-6 md:px-8 lg:py-12">
				<PresentationsHeader 
					onCreatePresentation={() => setIsNewPresentationOpen(true)} 
					onOpenProducts={() => void navigate('/productList')}
				/>
				<PresentationsToolbar
					filters={filters}
					resultCount={presentations.length}
					customerOptions={customerOptions}
					repOptions={repOptions}
					statusFilterOptions={statusFilterOptions}
					statusCounts={statusCounts}
					selectedFilters={selectedFilters}
					onSelectedFiltersChange={setSelectedFilters}
					onSearchChange={(searchQuery) =>
						setFilters((prev) => ({
							...prev,
							searchQuery,
						}))
					}
					onStatusChange={(status: PresentationStatus) =>
						setFilters((prev) => ({
							...prev,
							status,
						}))
					}
					onSortChange={(sortBy: PresentationSortOption) =>
						setFilters((prev) => ({
							...prev,
							sortBy,
						}))
					}
					onDensityChange={(density: PresentationDensity) =>
						setFilters((prev) => ({
							...prev,
							density,
						}))
					}
				/>
				<PresentationsGrid
					presentations={presentations}
					density={filters.density}
				/>
				<NewPresentationModal
					customers={customers}
					open={isNewPresentationOpen}
					onClose={() => setIsNewPresentationOpen(false)}
				/>
			</div>
		</div>
	);
}
