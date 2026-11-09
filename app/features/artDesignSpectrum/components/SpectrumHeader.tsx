import {
	ArrowLeft,
	// ExternalLink,
	RefreshCw,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SpectrumGarment } from '../../artDesign/types/artDesign';
import { Button } from '~/shared/components/ui/Button';
import { formatShortDate, getDateSummaryValues } from '~/features/artDesign/lib/artDesign';
import { useState } from 'react';
import { DatePicker } from '~/shared/components/DatePicker';

interface SpectrumHeaderProps {
	garment: SpectrumGarment;
	spectrumUrl: string;
	onBack: () => void;
	onChangeProduct: () => void;
	onReload: () => void;
	selectedDate: Date | null;
	today: Date;
	onDateChange: (date: Date) => void;
}

export function SpectrumHeader({
	garment,
	spectrumUrl,
	onBack,
	onChangeProduct,
	onReload,
	selectedDate,
	today,
	onDateChange,
}: SpectrumHeaderProps) {
	const { t } = useTranslation('artDesign');
	const [datePickerOpen, setDatePickerOpen] = useState(false);
	const dateSummary = selectedDate
		? getDateSummaryValues(selectedDate, today)
		: null;

	return (
		<header
			className="flex h-14 min-w-0 shrink-0 items-center gap-4 border-b border-[#ECECEE] bg-white px-5
				[&_:focus-visible]:outline
				[&_:focus-visible]:outline-2
				[&_:focus-visible]:outline-offset-2
				[&_:focus-visible]:outline-[#0E6E6E]
				@max-[860px]/spectrum:gap-2
				@max-[860px]/spectrum:px-3
				@max-[1100px]/spectrum:h-auto
				@max-[1100px]/spectrum:min-h-14
				@max-[1100px]/spectrum:flex-wrap
				@max-[1100px]/spectrum:gap-y-2
				@max-[1100px]/spectrum:py-2"
		>
			<Button
				type="button"
				variant="ghost"
				size="xs"
				shape="pill"
				onClick={onBack}
				aria-label={t('spectrumPage.backToArtDesign')}
				className="-ml-2.5 min-h-0 cursor-pointer gap-1.5 px-2.5 py-2 text-[13px] font-medium text-[#5C5C61] hover:bg-[#F7F7F8] hover:text-[#111113] min-h-0 [@media(pointer:coarse)]:min-h-10"
			>
				<ArrowLeft
					aria-hidden="true"
					className="size-[13px] shrink-0"
					strokeWidth={1.8}
				/>

				<span className="whitespace-nowrap">
					<span className="@max-[560px]/spectrum:hidden">
						{t('spectrumPage.backToArtDesign')}
					</span>

					<span className="hidden @max-[560px]/spectrum:inline">
						{t('spectrumPage.back')}
					</span>
				</span>
			</Button>

			<div className="flex shrink-0 items-center justify-center @max-[860px]/spectrum:hidden">
				<span className="inline-flex items-center gap-1.5 rounded-full bg-[#111113] px-[9px] py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white">
					<span
						aria-hidden="true"
						className="size-1.5 shrink-0 rounded-full bg-white"
					/>

					{t('spectrumPage.title')}
				</span>
			</div>

			<div className="flex min-w-0 flex-1 items-center gap-2.5 @max-[1100px]/spectrum:order-9 @max-[1100px]/spectrum:basis-full @max-[1100px]/spectrum:border-t @max-[1100px]/spectrum:border-[#ECECEE] @max-[1100px]/spectrum:pt-2">
				<img
					src={garment.imageUrl}
					alt=""
					width={36}
					height={36}
					className="size-9 shrink-0 rounded-[9px] border border-[#ECECEE] bg-[#F5F5F6] object-contain" />
				<div className="flex min-w-0 flex-col leading-[1.25]">
					<span className="truncate text-[13px] font-semibold text-[#111113]">
						{garment.name}
					</span>

					<span className="truncate text-xs font-normal text-[#5C5C61]">
						{t('spectrumPage.colorPickedInSpectrum', {
							sku: garment.style,
						})}
					</span>
				</div>
				<Button
					type="button"
					variant="link"
					size="xs"
					shape="md"
					onClick={onChangeProduct}
					className="min-h-8 cursor-pointer px-1.5 py-0 text-[12.5px] font-medium underline underline-offset-[3px] hover:bg-[#F7F7F8] [@media(pointer:coarse)]:min-h-10"
				>
					{t('spectrumPage.changeProduct')}
				</Button>
			</div>

			{selectedDate && dateSummary && (
				<DatePicker
					selectedDate={selectedDate}
					today={today}
					onDateChange={onDateChange}
					open={datePickerOpen}
					onOpenChange={setDatePickerOpen}
					trigger={
						<Button
							type="button"
							variant="outline"
							size="xs"
							shape="pill"
							aria-haspopup="dialog"
							aria-expanded={datePickerOpen}
							className={`min-h-[30px] shrink-0 cursor-pointer gap-[7px] px-3 py-0 text-xs @max-[560px]/spectrum:px-2.5 font-medium hover:border-[#111113] hover:text-[#111113] [@media(pointer:coarse)]:h-10 ${dateSummary.insideSixWeeks
								? 'border-[#D7D7DA] bg-[#F7F7F8] text-[#111113]'
								: 'border-[#BFDCCB] bg-[#EEF6F1] text-[#1F7A4D]'
								}`}
						>
							<span
								aria-hidden="true"
								className={`size-[7px] shrink-0 rounded-full ${dateSummary.daysOut < 0
									? 'bg-[#A02020]'
									: dateSummary.insideSixWeeks
										? 'bg-[#B26A00]'
										: 'bg-[#1F7A4D]'
									}`}
							/>
							<span className="whitespace-nowrap">
								<span className="@max-[560px]/spectrum:hidden">
									{t('spectrumPage.neededBy')}{' '}
								</span>

								<b className="font-semibold">
									{formatShortDate(selectedDate)}
								</b>

								<span className="@max-[560px]/spectrum:hidden">
									{' · '}
									{t('spectrumPage.days', {
										count: dateSummary.daysOut,
									})}
								</span>
							</span>
						</Button>
					}
				/>
			)}

			<div className="flex shrink-0 items-center gap-2 @max-[1100px]/spectrum:ml-auto">
				<Button
					type="button"
					variant="outline"
					size="small"
					shape="pill"
					onClick={onReload}
					aria-label={t('spectrumPage.reload')}
					className="h-9 min-h-9 cursor-pointer gap-[7px] whitespace-nowrap border-[#D7D7DA] bg-white px-3.5 py-0 text-[12.5px] font-medium text-[#111113] transition-[border-color,background] duration-150 hover:border-[#111113] hover:bg-white [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:min-w-10"
				>
					<RefreshCw
						aria-hidden="true"
						size={13}
						strokeWidth={1.8}
					/>

					<span className="@max-[860px]/spectrum:hidden @max-[860px]/spectrum:px-[11px]">
						{t('spectrumPage.reload')}
					</span>
				</Button>
				{/* Business decision: Open in New Tab action temporarily removed. */}
				{/* <Button
					variant="outline"
					size="small"
					shape="pill"
					nativeButton={false}
					render={
						<a
							href={spectrumUrl}
							target="_blank"
							rel="noopener noreferrer"
							aria-hidden="true"
							aria-label={t('spectrumPage.openInNewTab')}
						/>
					}
					aria-label={t('spectrumPage.openInNewTab')}
					className="h-9 min-h-9 cursor-pointer gap-[7px] whitespace-nowrap border-[#D7D7DA] bg-white px-3.5 py-0 text-[12.5px] font-medium text-[#111113] transition-[border-color,background] duration-150 hover:border-[#111113] hover:bg-white [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:min-w-10"
				>
					<ExternalLink
						aria-hidden="true"
						size={13}
						strokeWidth={1.8}
					/>
					<span className="@max-[860px]/spectrum:hidden @max-[860px]/spectrum:px-[11px]">
						{t('spectrumPage.openInNewTab')}
					</span>
				</Button> */}
			</div>
		</header>
	);
}