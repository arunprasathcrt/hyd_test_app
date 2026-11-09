import { useTranslation } from 'react-i18next';

import type { PresentationActivityEntry } from '~/features/presentations/types/presentations';

interface PresentationActivityProps {
	entries: PresentationActivityEntry[];
}

const NAME_LIST_FORMAT = new Intl.ListFormat('en', {
	style: 'short',
	type: 'unit',
});

const SHORT_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
});

function messageValues(
	entry: PresentationActivityEntry,
): Record<string, string | number> {
	const values: Record<string, string | number> = {};

	Object.entries(entry.values ?? {}).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			values[key] = NAME_LIST_FORMAT.format(value);
		} else if (key === 'date' && typeof value === 'string') {
			values[key] = SHORT_DATE_FORMAT.format(new Date(`${value}T00:00:00`));
		} else {
			values[key] = value;
		}
	});

	return values;
}

function messageKeyFor(entry: PresentationActivityEntry): string | undefined {
	if (entry.messageKey === 'detail.activity.styles' && Number(entry.values?.more) > 0) {
		return 'detail.activity.stylesMore';
	}

	return entry.messageKey;
}

export function PresentationActivity({ entries }: PresentationActivityProps) {
	const { t } = useTranslation('presentations');

	return (
		<section
			aria-labelledby="presentation-activity-title"
			className="rounded-[14px] border border-[#ECECEE] bg-white px-[18px] pb-[18px] pt-4"
		>
			<h2
				id="presentation-activity-title"
				className="mb-2.5 text-[16px] font-semibold tracking-[-0.01em] text-[#111113]"
			>
				{t('detail.activity.title')}
			</h2>

			{entries.length === 0 ? (
				<p className="m-0 text-[13px] leading-[1.45] text-[#5C5C61]">
					{t('detail.activity.empty')}
				</p>
			) : (
				<ol className="relative flex flex-col gap-3 m-0 p-0 list-none">
					{entries.map((entry, index) => {
						const messageKey = messageKeyFor(entry);
						const text = messageKey
							? t(messageKey, messageValues(entry))
							: entry.what;
						const isLast = index === entries.length - 1;

						return (
							<li
								key={entry.id}
								className="relative grid grid-cols-[14px_minmax(0,1fr)] items-start gap-2"
							>
								{!isLast && (
									<span
										aria-hidden="true"
										className="absolute left-[6px] top-[14px] -bottom-[14px] w-px bg-[#ECECEE]"
									/>
								)}

								<i
									aria-hidden="true"
									className="mb-0 ml-[2px] mt-[5px] block h-2 w-2 rounded-full bg-[#D7D7DA]"
								/>

								<div className="min-w-0">
									<span className="block text-[13px] leading-[1.45] text-[#5C5C61]">
										{entry.who && (
											<>
												<b className="font-semibold text-[#111113]">{entry.who}</b>{' '}
											</>
										)}
										{text}
									</span>

									<span className="mt-0.5 block text-[12px] text-[#6B6B70]">
										{entry.when}
									</span>
								</div>
							</li>
						);
					})}
				</ol>
			)}
		</section>
	);
}
