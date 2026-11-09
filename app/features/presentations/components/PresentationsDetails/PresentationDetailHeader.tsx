import { ChevronLeft, Eye, Send, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useFetcher } from 'react-router';

import type {
	PresentationCustomer,
	PresentationDetail,
} from '~/features/presentations/types/presentations';
import { Button } from '~/shared/components/ui/Button';
import { toast } from '~/shared/components/ui/Toast';

interface PresentationDetailHeaderProps {
	presentation: PresentationDetail;
	customers: PresentationCustomer[];
}

const STATUS_LABEL_KEYS = {
	draft: 'status.draft',
	withCustomer: 'status.withCustomer',
	needsUs: 'status.needsUs',
	approved: 'status.approved',
	closed: 'status.closed',
} as const;

const STATUS_DOT_CLASSES = {
	draft: 'bg-[#8E8E93]',
	withCustomer: 'bg-[#B26A00]',
	needsUs: 'bg-[#A02020]',
	approved: 'bg-[#1F7A4D]',
	closed: 'bg-[#8E8E93]',
} as const;

const FIELD_CONTROL_CLASSES =
	'h-8 max-[759.98px]:h-10 min-w-0 max-w-[280px] rounded-[9px] border border-[#D7D7DA] bg-white px-2.5 text-[13px] font-medium text-[#111113] transition-colors hover:border-[#C4C4C8] focus:border-[#6B6B70] focus:outline-none disabled:cursor-not-allowed disabled:border-[#ECECEE] disabled:bg-[#F7F7F8] disabled:text-[#6B6B70]';

const DISABLED_SECONDARY_CLASSES =
	'cursor-not-allowed border-[#ECECEE] bg-[#F7F7F8] text-[#6B6B70] hover:border-[#ECECEE] hover:bg-[#F7F7F8] data-disabled:opacity-100 max-[759.98px]:min-w-0 max-[759.98px]:flex-[1_1_0]';

const SHORT_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
});

const TOAST_TIMEOUT_MS = 3500;

export function PresentationDetailHeader({
	presentation,
	customers,
}: PresentationDetailHeaderProps) {
	const { t } = useTranslation('presentations');
	const updateFetcher = useFetcher();
	const selectedCustomerId =
		customers.find((customer) => customer.name === presentation.customer)
			?.id ?? '';
	const minDate = new Date().toISOString().split('T')[0];

	return (
		<header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-[14px] pb-4 pt-0.5 max-[759.98px]:flex-col max-[759.98px]:items-stretch">
			<div className="flex min-w-0 flex-[1_1_560px] flex-col max-[759.98px]:w-full max-[759.98px]:flex-none">
				<nav aria-label={t('detail.breadcrumb')} className="-mt-1.5 mb-1.5">
					<Link
						to="/presentations"
						className="-ml-1.5 inline-flex min-h-8 items-center gap-1 rounded-[8px] py-0 pl-1 pr-2 text-[13px] font-medium text-[#5C5C61] no-underline transition-colors hover:bg-[#F7F7F8] hover:text-[#111113] hover:no-underline"
					>
						<ChevronLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
						<span>{t('page.title')}</span>
					</Link>
				</nav>

				<div className="mb-1.5 flex min-w-0 items-center gap-2.5">
					<span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-[#ECECEE] bg-white pl-2 pr-[9px] text-[12px] font-medium leading-none text-[#111113]">
						<span
							aria-hidden="true"
							className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASSES[presentation.status]}`}
						/>
						<span>{t(STATUS_LABEL_KEYS[presentation.status])}</span>
					</span>

					<span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium uppercase leading-[1.5] tracking-[0.06em] text-[#6B6B70]">
						{presentation.customer}
					</span>
				</div>

				<h1 className="flex min-w-0 items-center text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-[#111113]">
					<span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap max-[759.98px]:line-clamp-2 max-[759.98px]:whitespace-normal">
						{presentation.name}
					</span>
				</h1>

				<dl className="mt-2.5 flex flex-wrap items-end gap-x-4 gap-y-2.5">
					<div className="flex min-w-0 flex-col gap-1">
						<dt className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
							{t('detail.facts.customer')}
						</dt>
						<dd className="flex min-h-8 min-w-0 items-center text-[13px] font-medium text-[#111113]">
							<select
								aria-label={t('detail.facts.customer')}
								defaultValue={selectedCustomerId}
								className={FIELD_CONTROL_CLASSES}
								onChange={(event) => {
									const nextCustomerId = event.currentTarget.value;

									const formData = new FormData();

									formData.set('intent', 'update-header');
									formData.set('collectionId', presentation.id);
									formData.set('customer', nextCustomerId);
									formData.set('neededBy', presentation.neededBy);

									void updateFetcher.submit(formData, {
										method: 'POST',
									});

									if (nextCustomerId !== selectedCustomerId) {
										toast.add({
											title: t('detail.toast.customer', {
												name:
													customers.find(
														(customer) => customer.id === nextCustomerId,
													)?.name ?? '',
											}),
											type: 'info',
											timeout: TOAST_TIMEOUT_MS,
										});
									}
								}}
							>
								{selectedCustomerId === '' && (
									<option value="">{t('detail.facts.notSet')}</option>
								)}
								{customers.map((customer) => (
									<option key={customer.id} value={customer.id}>
										{customer.name}
									</option>
								))}
							</select>
						</dd>
					</div>

					<div className="flex min-w-0 flex-col gap-1">
						<dt className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
							{t('detail.facts.neededBy')}
						</dt>
						<dd className="flex min-h-8 min-w-0 items-center text-[13px] font-medium text-[#111113]">
							<input
								type="date"
								min={minDate}
								aria-label={t('detail.facts.neededBy')}
								defaultValue={presentation.neededBy}
								className={FIELD_CONTROL_CLASSES}
								onChange={(event) => {
									const nextDate = event.currentTarget.value;
									const formData = new FormData();

									formData.set('intent', 'update-header');
									formData.set('collectionId', presentation.id);
									formData.set('customer', selectedCustomerId);
									formData.set('neededBy', nextDate);

									void updateFetcher.submit(formData, {
										method: 'POST',
									});

									if (nextDate !== presentation.neededBy) {
										toast.add({
											title: nextDate
												? t('detail.toast.neededBy', {
													date: SHORT_DATE_FORMAT.format(
														new Date(`${nextDate}T00:00:00`),
													),
												})
												: t('detail.toast.neededByCleared'),
											type: 'info',
											timeout: TOAST_TIMEOUT_MS,
										});
									}
								}}
							/>
						</dd>
					</div>

					<div className="flex min-w-0 flex-col gap-1">
						<dt className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
							{t('detail.facts.rep')}
						</dt>
						<dd className="flex min-h-8 items-center text-[13px] font-medium text-[#111113]">
							{presentation.createdByName || t('detail.facts.notSet')}
						</dd>
					</div>
				</dl>
			</div>
			<div
				className="flex shrink-0 flex-wrap items-center justify-end gap-2 max-[759.98px]:w-full max-[759.98px]:justify-start"
				role="group"
				aria-label={t('detail.actions.groupLabel')}
			>
				<Button
					type="button"
					variant="outline"
					size="control"
					shape="md"
					disabled
					className={DISABLED_SECONDARY_CLASSES}
				>
					<Eye aria-hidden="true" className="h-4 w-4 shrink-0" />
					<span className="whitespace-nowrap">
						{t('detail.actions.previewLabel')}
						<span className="max-[759.98px]:hidden">{t('detail.actions.previewSuffix')}</span>
					</span>
				</Button>

				<Button
					type="button"
					variant="outline"
					size="control"
					shape="md"
					disabled
					className={DISABLED_SECONDARY_CLASSES}
				>
					<Share2 aria-hidden="true" className="h-4 w-4 shrink-0" />
					<span className="whitespace-nowrap">{t('detail.actions.share')}</span>
				</Button>
				<Button
					type="button"
					variant="default"
					size="control"
					shape="md"
					disabled
					className="cursor-not-allowed border-[#D7D7DA] bg-[#D7D7DA] px-[18px] text-[13.5px] text-[#5C5C61] hover:border-[#D7D7DA] hover:bg-[#D7D7DA] data-disabled:opacity-100 max-[759.98px]:order-first max-[759.98px]:flex-[1_1_100%]"
				>
					<Send aria-hidden="true" className="h-4 w-4 shrink-0" />
					<span className="whitespace-nowrap">
						{t('detail.actions.sendForReview')}
					</span>
				</Button>
			</div>
		</header>
	);
}
