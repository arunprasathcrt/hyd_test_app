import { Check, Layers2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '~/shared/components/ui/Button';

export interface DockRect {
	left: number;
	right: number;
	bottom: number;
}

interface PresentationTargetStripProps {
	presentationName: string;
	selectedCount: number;
	createdCount: number;
	artPairing: number | null;
	addedCount: number | null;
	dockRect: DockRect | null;
	onAdd: () => void;
	onOpen: () => void;
	onDone: () => void;
}

export function PresentationTargetStrip({
	presentationName,
	selectedCount,
	createdCount,
	artPairing,
	addedCount,
	dockRect,
	onAdd,
	onOpen,
	onDone,
}: PresentationTargetStripProps) {
	const { t } = useTranslation('products');
	const isAdded = addedCount !== null;
	const canAdd = selectedCount > 0;

	let selectionText: string;
	if (artPairing !== null) {
		selectionText = t('presentationContext.selectedWithArt', { count: artPairing });
	} else if (canAdd) {
		selectionText = t('presentationContext.selected', { count: selectedCount });
	} else {
		selectionText = t('presentationContext.status');
	}

	const positionClass = dockRect
		? ''
		: 'left-4 right-4 bottom-5 max-[600px]:bottom-3';

	return (
		<div
			role="region"
			aria-label={t('presentationContext.regionLabel')}
			style={
				dockRect
					? {
						left: dockRect.left,
						right: dockRect.right,
						bottom: dockRect.bottom,
					}
					: undefined
			}
			className={`fixed z-[60] mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-3 gap-y-2 rounded-[16px] border border-[#ECECEE] bg-white py-2 pl-3 pr-2 shadow-[0_28px_70px_-22px_rgba(15,15,15,0.28),0_2px_8px_rgba(15,15,15,0.06)] ${positionClass}`}
		>
			<span className="grid h-7 w-7 flex-none place-items-center rounded-[9px] bg-[#F7F7F8] text-[#111113]">
				{isAdded ? (
					<Check aria-hidden="true" className="h-4 w-4" />
				) : (
					<Layers2 aria-hidden="true" className="h-4 w-4" />
				)}
			</span>

			{isAdded ? (
				<span className="min-w-0 flex-[1_1_260px] text-[13px] leading-[1.4] text-[#5C5C61] max-sm:basis-full">
					<b className="font-semibold text-[#111113]">
						{t('presentationContext.addedStatus', { count: addedCount })}
					</b>{' '}
					{t('presentationContext.addedTo')} {presentationName}
				</span>
			) : (
				<span className="min-w-0 flex-[1_1_260px] text-[13px] leading-[1.4] text-[#5C5C61] max-sm:basis-full">
					{t('presentationContext.addingTo')}{' '}
					<b className="font-semibold text-[#111113]">{presentationName}</b>
					<span className="ml-1">{selectionText}</span>
				</span>
			)}

			<div className="ml-auto flex items-center gap-1.5 max-sm:w-full">
				{isAdded ? (
					<Button
						type="button"
						variant="default"
						size="control"
						shape="md"
						onClick={onOpen}
						className="min-h-8 cursor-pointer rounded-[9px] px-3 text-[12.5px] max-sm:flex-1"
					>
						{t('presentationContext.openPresentation')}
					</Button>
				) : (
					<Button
						type="button"
						variant="default"
						size="control"
						shape="md"
						disabled={!canAdd}
						onClick={onAdd}
						className={
							canAdd
								? 'min-h-8 cursor-pointer rounded-[9px] px-3 text-[12.5px] max-sm:flex-1'
								: 'min-h-8 cursor-not-allowed rounded-[9px] border-[#D7D7DA] bg-[#D7D7DA] px-3 text-[12.5px] text-[#5C5C61] hover:border-[#D7D7DA] hover:bg-[#D7D7DA] data-disabled:opacity-100 max-sm:flex-1'
						}
					>
						{canAdd
							? t('presentationContext.addSelected', { count: createdCount })
							: t('presentationContext.addToPresentation')}
					</Button>
				)}

				<Button
					type="button"
					variant="outline"
					size="control"
					shape="md"
					onClick={onDone}
					className="min-h-8 cursor-pointer rounded-[9px] px-3 text-[12.5px] max-sm:flex-1"
				>
					{t('presentationContext.done')}
				</Button>
			</div>
		</div>
	);
}
