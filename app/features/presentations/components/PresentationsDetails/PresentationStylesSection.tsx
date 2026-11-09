import { useTranslation } from 'react-i18next';

import type { PresentationStyle } from '~/features/presentations/types/presentations';
import { PresentationAddStylesCard } from './PresentationAddStylesCard';
import { PresentationStyleCard } from './PresentationStyleCard';

interface PresentationStylesSectionProps {
	styles: PresentationStyle[];
	onRemoveStyle?: (styleId: string) => void;
	onMoveStyle?: (styleId: string, direction: -1 | 1) => void;
	isReordering: boolean;
}

export function PresentationStylesSection({
	styles,
	onRemoveStyle,
	onMoveStyle,
	isReordering,
}: PresentationStylesSectionProps) {
	const { t } = useTranslation('presentations');

	return (
		<section
			aria-labelledby="presentation-styles-title"
			className="flex min-w-0 flex-col"
		>
			<div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
				<h2
					id="presentation-styles-title"
					className="text-[16px] font-semibold leading-[1.5] tracking-[-0.01em] text-[#111113]"
				>
					{t('detail.styles.title')}
				</h2>

				<p className="text-[12px] text-[#6B6B70]">
					{t('detail.styles.count', { count: styles.length })}
				</p>
				{isReordering && (
					<span className="inline-flex items-center rounded-full bg-[#F7F7F8] px-2 py-0.5 text-[11px] font-medium">
						{t('detail.styles.reorderingStyles')}
					</span>
				)}
			</div>

			<div className="grid grid-cols-1 items-start gap-3 min-[600px]:grid-cols-2 min-[760px]:grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))] min-[760px]:gap-4">
				{styles.map((style, index) => (
					<PresentationStyleCard
						key={style.id}
						style={style}
						onRemove={
							onRemoveStyle ? () => onRemoveStyle(style.id) : undefined
						}
						onMoveUp={onMoveStyle ? () => onMoveStyle(style.id, -1) : undefined}
						onMoveDown={
							onMoveStyle ? () => onMoveStyle(style.id, 1) : undefined
						}
						canMoveUp={index > 0}
						canMoveDown={index < styles.length - 1}
						isReordering={isReordering}
					/>
				))}
				
				<PresentationAddStylesCard />
			</div>
		</section>
	);
}
