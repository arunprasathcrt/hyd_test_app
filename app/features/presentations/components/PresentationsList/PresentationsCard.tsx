import { ArrowUpRight, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/shared/components/ui/Button';
import { Card } from '~/shared/components/ui/Card';

import type {
	Presentation,
	PresentationDensity,
} from '~/features/presentations/types/presentations';

interface PresentationsCardProps {
	presentation: Presentation;
	density: PresentationDensity;
	onOpen?: (presentation: Presentation) => void;
	onShare?: (presentation: Presentation) => void;
}

function formatNeededBy(date: string): string {
	if (!date) return '';

	return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	});
}

export function PresentationsCard({
	presentation,
	density,
	onOpen,
	onShare,
}: PresentationsCardProps) {
	const { t } = useTranslation('presentations');

	const statusClassMap = {
		draft: {
			dot: 'bg-[#8E8E93]',
			label: t('status.draft'),
		},
		withCustomer: {
			dot: 'bg-[#B26A00]',
			label: t('status.withCustomer'),
		},
		needsUs: {
			dot: 'bg-[#A02020]',
			label: t('status.needsUs'),
		},
		approved: {
			dot: 'bg-[#1F7A4D]',
			label: t('status.approved'),
		},
		closed: {
			dot: 'bg-[#8E8E93]',
			label: t('status.closed'),
		},
	};

	const status = statusClassMap[presentation.status];

	const meterWidth = `${Math.max(
		0,
		Math.min(100, presentation.approvalPercent),
	)}%`;

	const workflowLabelMap = {
		draft: t('card.workflow.draft'),
		withCustomer: t('card.workflow.withCustomer'),
		needsUs: t('card.workflow.needsUs'),
		approved: t('card.workflow.approved'),
		closed: t('card.workflow.closed'),
	};

	const workflowLabel = workflowLabelMap[presentation.status];
	const images = presentation.coverImages;
	const imageCount = images.length;

	return (
		<Card
			size="compact"
			onClick={() => onOpen?.(presentation)}
			className="group relative min-w-0 cursor-pointer overflow-hidden p-0 transition-all duration-150 hover:-translate-y-[2px] hover:shadow-[0_10px_24px_rgba(17,17,19,0.07)]"
		>
			<div className="relative flex flex-1 flex-col">
				<div
					className={`relative overflow-hidden bg-white ${density === 'compact'
							? 'aspect-[1/0.82]'
							: 'aspect-square'
						}`}
				>
					<div className="absolute inset-0">
						{imageCount === 0 && (
							<div className="grid h-full w-full place-items-center bg-[#F5F5F6]">
								<div className="flex flex-col items-center gap-2 text-[#6B6B70]">
									<svg
										aria-hidden="true"
										viewBox="0 0 24 24"
										className="h-7 w-7"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.8"
									>
										<rect x="4" y="4" width="16" height="16" rx="2" />
									</svg>

									<span className="text-xs">
										{t('card.noPreview')}
									</span>
								</div>
							</div>
						)}

						{imageCount === 1 && (
							<div className="grid h-full w-full grid-cols-1 grid-rows-1">
								<div className="relative overflow-hidden bg-[#F5F5F6]">
									<img
										src={images[0].imageUrl}
										alt={images[0].alt}
										className="h-full w-full object-contain"
									/>
								</div>
							</div>
						)}

						{imageCount === 2 && (
							<div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[2px]">
								<div className="relative overflow-hidden bg-[#F5F5F6]">
									<img src={images[0].imageUrl} alt={images[0].alt} className="h-full w-full object-contain" />
								</div>

								<div className="relative overflow-hidden bg-[#F5F5F6]">
									<img src={images[1].imageUrl} alt={images[1].alt} className="h-full w-full object-contain" />
								</div>

								<div className="bg-[#F5F5F6]" />
								<div className="bg-[#F5F5F6]" />
							</div>
						)}

						{imageCount === 3 && (
							<div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[2px]">
								<div className="relative overflow-hidden bg-[#F5F5F6]">
									<img src={images[0].imageUrl} alt={images[0].alt} className="h-full w-full object-contain" />
								</div>

								<div className="relative overflow-hidden bg-[#F5F5F6]">
									<img src={images[1].imageUrl} alt={images[1].alt} className="h-full w-full object-contain" />
								</div>

								<div className="relative overflow-hidden bg-[#F5F5F6]">
									<img src={images[2].imageUrl} alt={images[2].alt} className="h-full w-full object-contain" />
								</div>

								<div className="bg-[#F5F5F6]" />
							</div>
						)}

						{imageCount >= 4 && (
							<div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[2px]">
								{images.slice(0, 4).map((image) => (
									<div
										key={image.id}
										className="relative overflow-hidden bg-[#F5F5F6]"
									>
										<img src={image.imageUrl} alt={image.alt} className="h-full w-full object-contain" />
									</div>
								))}
							</div>
						)}
					</div>

					<div className="absolute bottom-[10px] left-[10px] z-[2] inline-flex h-6 items-center gap-[6px] rounded-full border border-[#ECECEE] bg-white pl-[8px] pr-[9px] text-[12px] font-medium leading-none text-utds-ink">
						<span
							className={`h-[6px] w-[6px] rounded-full ${status.dot}`}
						/>
						<span>{status.label}</span>
					</div>

					<div className="pointer-events-none absolute bottom-[12px] left-1/2 z-[3] flex -translate-x-1/2 gap-1.5 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
						<Button
							type="button"
							variant="ghost"
							shape="pill"
							onClick={(event) => {
								event.stopPropagation();
								onOpen?.(presentation);
							}}
							className="h-[30px] min-h-0 gap-1 px-[10px] py-0 border border-[#ECECEE] bg-white text-[12px] font-medium text-[#111113] shadow-[0_2px_8px_rgba(17,17,19,0.08)] hover:border-[#D7D7DA] hover:bg-[#F7F7F8] hover:text-[#111113]"
						>
							<ArrowUpRight aria-hidden="true" className="size-[14px]" />
							<span>{t('card.open')}</span>
						</Button>

						<Button
							type="button"
							variant="ghost"
							shape="pill"
							disabled
							className="h-[30px] min-h-0 gap-1 px-[10px] py-0 border border-[#ECECEE] bg-white text-[12px] font-medium text-[#8E8E93] shadow-[0_2px_8px_rgba(17,17,19,0.08)] opacity-60 hover:bg-white"
						>
							<Share2 aria-hidden="true" className="size-[14px]" />
							<span>{t('card.share')}</span>
						</Button>
						<Button
							type="button"
							variant="ghost"
							shape="pill"
							disabled
							className="h-[30px] min-h-0 gap-1 px-[10px] py-0 border border-[#ECECEE] bg-white text-[12px] font-medium text-[#8E8E93] shadow-[0_2px_8px_rgba(17,17,19,0.08)] opacity-60 hover:bg-white"
						>
							<svg
								aria-hidden="true"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="size-[14px]"
							>
								<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
								<circle cx="12" cy="12" r="3" />
							</svg>

							<span>{t('card.preview')}</span>
						</Button>
					</div>
				</div>
				<div
					className={`grid flex-1 grid-cols-[minmax(0,1fr)] border-t-0 px-[14px] pb-[14px] pt-3 ${density === 'compact'
						? 'px-3 pb-3 pt-[10px]'
						: ''
						}`}
				>
					<span className="truncate text-[12px] font-medium text-[#6B6B70]">
						{presentation.customer}
					</span>

					<h3
						className={`mt-0.5 line-clamp-2 text-[14px] font-semibold leading-[1.35] tracking-[-0.005em] text-utds-ink ${density === 'compact'
							? 'text-[13px]'
							: ''
							}`}
					>
						{presentation.name}
					</h3>

					<p className="mt-1 truncate text-[13px] text-[#6B6B70]">
						{presentation.styleCount} {presentation.styleCount === 1 ? t('card.styleSingle') : t('card.styleMultiple')} · {t('card.neededBy')} {formatNeededBy(presentation.neededBy)}
					</p>

					{['withCustomer', 'needsUs', 'approved'].includes(
						presentation.status,
					) && (
							<div className="mt-4 flex items-center gap-3">
								<span className="relative block h-[8px] min-w-[88px] flex-1 overflow-hidden rounded-full bg-[#E5E5E7]">
									<span
										className="absolute inset-y-0 left-0 rounded-full bg-[#111113]"
										style={{ width: meterWidth }}
									/>
								</span>

								<span className="whitespace-nowrap text-[12px] font-medium text-[#55555A]">
									{presentation.approvedCount} of {presentation.styleCount} approved
								</span>
							</div>
						)}
					<div
						className={`flex items-center justify-between text-[12px] text-[#6B6B70] ${density === 'compact'
							? 'mt-[10px]'
							: presentation.status === 'draft'
								? 'mt-2'
								: 'mt-4'
							}`}
					>
						<span>{workflowLabel}</span>

						<span>{presentation.repName || ''}</span>
					</div>
				</div>
			</div>
		</Card>
	);
}

export default PresentationsCard;
