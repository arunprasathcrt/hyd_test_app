import {useTranslation} from 'react-i18next';

import type {PresentationDetail} from '~/features/presentations/types/presentations';

interface PresentationSummaryProps {
	presentation: PresentationDetail;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const NEEDED_BY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const SHORT_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
});

export function PresentationSummary({
	presentation
}: PresentationSummaryProps) {
	const {t} = useTranslation('presentations');

	let neededByValue: string = presentation.neededBy || t('detail.facts.notSet');

	if (NEEDED_BY_PATTERN.test(presentation.neededBy)) {
		const dueDate = new Date(`${presentation.neededBy}T00:00:00`);
		const today = new Date();
		const startOfToday = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
		).getTime();
		const days = Math.round((dueDate.getTime() - startOfToday) / DAY_MS);
		const date = SHORT_DATE_FORMAT.format(dueDate);

		neededByValue =
			days >= 0
				? t('detail.summary.dueIn', {date, count: days})
				: t('detail.summary.dueAgo', {date, count: -days});
	}

	return (
		<section
			aria-labelledby="presentation-summary-title"
			className="rounded-[14px] border border-[#ECECEE] bg-white px-[18px] pb-[18px] pt-4"
		>
			<h2
				id="presentation-summary-title"
				className="mb-2.5 text-[16px] font-semibold tracking-[-0.01em] text-[#111113]"
			>
				{t('detail.summary.title')}
			</h2>

			<dl className="flex flex-col">
				<div className="grid grid-cols-[112px_minmax(0,1fr)] max-[599.98px]:grid-cols-[96px_minmax(0,1fr)] gap-2 border-t border-[#ECECEE] py-2 first:border-t-0 first:pt-0">
					<dt className="text-[12px] font-medium uppercase tracking-[0.06em] leading-[1.6] text-[#6B6B70]">
						{t('detail.summary.approvals')}
					</dt>
					<dd className="flex min-w-0 flex-col gap-1.5 text-[13px] text-[#111113]">
						<span>
							{t('detail.summary.notSent')}
						</span>
					</dd>
				</div>

				<div className="grid grid-cols-[112px_minmax(0,1fr)] max-[599.98px]:grid-cols-[96px_minmax(0,1fr)] gap-2 border-t border-[#ECECEE] py-2 first:border-t-0 first:pt-0">
					<dt className="text-[12px] font-medium uppercase tracking-[0.06em] leading-[1.6] text-[#6B6B70]">
						{t('detail.summary.customerLink')}
					</dt>
					<dd className="text-[13px] text-[#111113]">{t('detail.summary.notSent')}</dd>
				</div>

				<div className="grid grid-cols-[112px_minmax(0,1fr)] max-[599.98px]:grid-cols-[96px_minmax(0,1fr)] gap-2 border-t border-[#ECECEE] py-2 first:border-t-0 first:pt-0">
					<dt className="text-[12px] font-medium uppercase tracking-[0.06em] leading-[1.6] text-[#6B6B70]">
						{t('detail.summary.draftOrder')}
					</dt>
					<dd className="text-[13px] text-[#111113]">
						{presentation.draftOrderNumber ?? t('detail.summary.notMadeYet')}
					</dd>
				</div>

				<div className="grid grid-cols-[112px_minmax(0,1fr)] max-[599.98px]:grid-cols-[96px_minmax(0,1fr)] gap-2 border-t border-[#ECECEE] py-2 first:border-t-0 first:pt-0">
					<dt className="text-[12px] font-medium uppercase tracking-[0.06em] leading-[1.6] text-[#6B6B70]">
						{t('detail.summary.neededBy')}
					</dt>
					<dd className="text-[13px] text-[#111113]">{neededByValue}</dd>
				</div>
			</dl>
		</section>
	);
}
