import { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Trash2 } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';

import type {
	PresentationStyle,
	PresentationStyleDecision,
	PresentationStyleKind,
} from '~/features/presentations/types/presentations';
import { Button } from '~/shared/components/ui/Button';

interface PresentationStyleCardProps {
	style: PresentationStyle;
	onRemove?: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	canMoveUp?: boolean;
	canMoveDown?: boolean;
	isReordering: boolean;
}

const KIND_LABEL_KEYS: Record<PresentationStyleKind, string> = {
	build: 'detail.styles.kind.build',
	art: 'detail.styles.kind.art',
	blank: 'detail.styles.kind.blank',
};

const DECISION_LABEL_KEYS: Record<PresentationStyleDecision | 'waiting', string> = {
	approved: 'detail.styles.decision.approved',
	revising: 'detail.styles.decision.revising',
	declined: 'detail.styles.decision.declined',
	waiting: 'detail.styles.decision.waiting',
};

const DECISION_DOT_CLASSES: Record<PresentationStyleDecision | 'waiting', string> = {
	approved: 'bg-[#1F7A4D]',
	revising: 'bg-[#A02020]',
	declined: 'bg-[#8E8E93]',
	waiting: 'bg-[#B26A00]',
};

const CONFIRM_TIMEOUT_MS = 3000;

const TOOL_BUTTON_CLASSES =
	'h-[30px] min-h-[30px] w-[30px] rounded-none border-0 bg-transparent p-0 text-[#111113] hover:bg-[#F7F7F8] focus-visible:!outline-offset-[-2px] data-disabled:opacity-100';

const TOOL_ENABLED_CLASSES = 'cursor-pointer';

const TOOL_DISABLED_CLASSES =
	'cursor-not-allowed text-[#D7D7DA] hover:bg-transparent';

const REVISE_DISABLED_CLASSES =
	'min-h-8 disabled:pointer-events-auto disabled:cursor-not-allowed gap-1 rounded-[9px] border-[#D7D7DA] bg-[#F7F7F8] px-3 text-[12.5px] text-[#111113] hover:border-[#ECECEE] bg-white hover:bg-white data-disabled:opacity-100';

export function PresentationStyleCard({
	style,
	onRemove,
	onMoveUp,
	onMoveDown,
	canMoveUp = false,
	canMoveDown = false,
	isReordering,
}: PresentationStyleCardProps) {
	const { t } = useTranslation('presentations');
	const [armed, setArmed] = useState(false);
	const armTimer = useRef<number | null>(null);
	const decisionKey = style.decision ?? 'waiting';
	const isRemoved = style.decision === 'declined';
	const isArt = style.kind === 'art';
	const isBuild = style.kind === 'build';
	const skuColor = [style.sku, style.color].filter(Boolean).join(' · ');
	const artId = style.artId ?? style.sku;
	const artNameText =
		isBuild && style.artName && style.artId
			? t('detail.styles.artLineName', { name: style.artName })
			: null;
	const artIdText = isBuild && style.artId ? style.artId : null;
	const slotLine =
		isBuild && style.slot && style.method
			? t('detail.styles.slotMethod', { slot: style.slot, method: style.method })
			: null;

	const handleRemoveClick = () => {
		if (!armed) {
			setArmed(true);
			armTimer.current = window.setTimeout(() => setArmed(false), CONFIRM_TIMEOUT_MS);
			return;
		}

		if (armTimer.current !== null) {
			window.clearTimeout(armTimer.current);
			armTimer.current = null;
		}

		setArmed(false);
		onRemove?.();
	};

	return (
		<article className="relative flex min-w-0 flex-col rounded-[14px] border border-[#ECECEE] bg-white">
			<div className="relative aspect-square overflow-hidden rounded-t-[14px] bg-[#F5F5F6]">
				<img
					src={style.imageUrl}
					alt={style.imageAlt}
					className={`absolute inset-0 h-full w-full object-contain ${isArt ? 'p-[10%]' : ''
						} ${isRemoved ? 'opacity-50' : ''}`}
				/>

				{isBuild && style.artImageUrl && (
					<span
						aria-hidden="true"
						className="absolute bottom-2.5 right-2.5 z-[2] block aspect-square w-[30%] max-w-[84px] overflow-hidden rounded-[10px] border border-[#D7D7DA] bg-white shadow-[0_2px_8px_rgba(17,17,19,0.08)]"
					>
						<img src={style.artImageUrl} alt="" className="absolute left-[6%] top-[6%] h-[88%] w-[88%] object-contain" />
					</span>
				)}

				<div className="absolute left-2.5 top-2.5 z-[2] flex gap-1">
					<span className="inline-flex h-[22px] items-center rounded-full bg-[rgba(255,255,255,0.94)] px-2 text-[12px] font-semibold uppercase leading-none tracking-[0.04em] text-[#5C5C61] whitespace-nowrap shadow-[0_1px_2px_rgba(17,17,19,0.06)]">
						{t(KIND_LABEL_KEYS[style.kind])}
					</span>
				</div>
				<span className="absolute bottom-2.5 left-2.5 z-[2] inline-flex h-6 max-w-[calc(70%-12px)] items-center gap-1.5 overflow-hidden rounded-full border border-[#ECECEE] bg-white px-2 text-[12px] font-medium leading-none text-[#111113]">
					<span
						aria-hidden="true"
						className={`h-1.5 w-1.5 rounded-full ${DECISION_DOT_CLASSES[decisionKey]}`}
					/>
					<span className="overflow-hidden text-ellipsis whitespace-nowrap">
						{t(DECISION_LABEL_KEYS[decisionKey])}
					</span>
				</span>
			</div>

			<div className="flex flex-1 flex-col gap-0.5 px-3.5 pb-3 pt-3">
				<span className="block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-medium uppercase leading-[1.5] tracking-[0.06em] text-[#6B6B70]">
					{style.brand}
				</span>

				<h3 className="my-0.5 line-clamp-2 text-[14px] font-semibold leading-[1.35] tracking-[-0.005em] text-[#111113]">
					{style.styleName}
				</h3>

				{isArt ? (
					<span className="truncate text-[12px] tabular-nums text-[#6B6B70]">
						{t('detail.styles.artId', { id: artId })}
					</span>
				) : (
					<span className="truncate text-[12px] tabular-nums text-[#6B6B70]">
						{skuColor}
					</span>
				)}

				{isBuild && artNameText && artIdText && (
					<span className="line-clamp-2 text-[12px] leading-[1.5] text-[#5C5C61]">
						{artNameText}
						<span className="tabular-nums text-[#6B6B70]">
							{t('detail.styles.artLineId', { id: artIdText })}
						</span>
					</span>
				)}

				{slotLine && (
					<span className="line-clamp-2 text-[12px] leading-[1.5] text-[#5C5C61]">
						{slotLine}
					</span>
				)}

				<div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-2.5 text-[12px] tabular-nums text-[#6B6B70]">
					{isArt ? (
						<span className="whitespace-nowrap">{t('detail.styles.artOnly')}</span>
					) : style.price !== null && style.price > 0 ? (
						<span className="whitespace-nowrap">
							<b className="text-[14px] font-semibold text-[#111113]">
								{t('detail.styles.priceValue', {
									price: style.price,
									formatParams: { price: { style: 'currency', currency: 'USD' } },
								})}
							</b>{' '}
							{t('detail.styles.each')}
						</span>
					) : (
						<span className="whitespace-nowrap">{t('detail.styles.pricePending')}</span>
					)}

					{!isArt && style.moq !== null && (
						<span className="ml-auto whitespace-nowrap">
							<Trans
								ns="presentations"
								i18nKey="detail.styles.moq"
								values={{ moq: style.moq }}
								components={{ 1: <b className="font-semibold text-[#5C5C61]" /> }}
							/>
						</span>
					)}
				</div>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-1.5 px-3 pb-3">
				<Button
					type="button"
					variant="outline"
					size="control"
					shape="md"
					disabled
					className={`${REVISE_DISABLED_CLASSES} !pointer-events-auto`}
				>
					{/* <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0 text-[#C9A227]" /> */}
					<span
						aria-hidden="true"
						className="shrink-0 text-[13px] leading-none text-[#C9A227]"
					>
						✦
					</span>
					<span className="whitespace-nowrap">{t('detail.styles.reviseWithAi')}</span>
				</Button>

				<div
					className="ml-auto inline-flex items-stretch overflow-hidden rounded-[9px] border border-[#D7D7DA] bg-white"
					role="group"
					aria-label={t('detail.styles.removeAria', { name: style.styleName })}
				>
					<Button
						type="button"
						variant="outline"
						size="icon"
						shape="square"
						disabled={!canMoveUp || isReordering}
						aria-disabled={!canMoveUp}
						onClick={canMoveUp ? onMoveUp : undefined}
						aria-label={t('detail.styles.moveUpAria', { name: style.styleName })}
						title={t('detail.styles.moveUp')}
						data-focus-key={`up-${style.id}`}
						className={`${TOOL_BUTTON_CLASSES} ${canMoveUp ? TOOL_ENABLED_CLASSES : TOOL_DISABLED_CLASSES}`}
					>
						<ChevronUp aria-hidden="true" className="h-[15px] w-[15px]" />
					</Button>

					<Button
						type="button"
						variant="outline"
						size="icon"
						shape="square"
						disabled={!canMoveDown || isReordering}
						aria-disabled={!canMoveDown}
						onClick={canMoveDown ? onMoveDown : undefined}
						aria-label={t('detail.styles.moveDownAria', { name: style.styleName })}
						title={t('detail.styles.moveDown')}
						data-focus-key={`dn-${style.id}`}
						className={`${TOOL_BUTTON_CLASSES} border-l border-[#ECECEE] ${canMoveDown ? TOOL_ENABLED_CLASSES : TOOL_DISABLED_CLASSES}`}
					>
						<ChevronDown aria-hidden="true" className="h-[15px] w-[15px]" />
					</Button>

					<Button
						type="button"
						variant="outline"
						size="icon"
						shape="square"
						onClick={handleRemoveClick}
						aria-label={t('detail.styles.removeAria', { name: style.styleName })}
						title={t('detail.styles.remove')}
						data-action="remove"
						data-focus-key={`rm-${style.id}`}
						className={`${TOOL_BUTTON_CLASSES} !pointer-events-auto disabled:cursor-not-allowed border-l border-[#ECECEE] ${'cursor-pointer'} ${armed ? 'w-auto bg-[#FDECEC] px-2.5 text-[12.5px] text-[#A02020] hover:bg-[#FDECEC]' : ''
							}`}
					>
						{armed ? (
							<span>{t('detail.styles.confirmRemove')}</span>
						) : (
							<Trash2 aria-hidden="true" className="h-[15px] w-[15px]" />
						)}
					</Button>
				</div>
				<Button
					type="button"
					variant="outline"
					size="control"
					shape="square"
					disabled
					className="min-h-8 !pointer-events-auto disabled:pointer-events-auto disabled:cursor-not-allowed gap-1 rounded-[9px] border-[#D7D7DA] bg-[#F7F7F8] px-3 text-[12.5px] text-[#111113] hover:border-[#ECECEE] bg-white hover:bg-white data-disabled:opacity-100"
				>
					<span className="whitespace-nowrap">{t('detail.styles.sendToDesignTeam')}</span>
				</Button>
			</div>
		</article>
	);
}
