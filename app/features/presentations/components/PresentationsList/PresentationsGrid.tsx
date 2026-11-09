import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import type {
	Presentation,
	PresentationDensity,
} from '~/features/presentations/types/presentations';
import { presentationDetailsUrl } from '~/shared/utils/presentation-context';
import { PresentationsCard } from './PresentationsCard';

interface PresentationsGridProps {
	presentations: Presentation[];
	density: PresentationDensity;
}

export function PresentationsGrid({
	presentations,
	density,
}: PresentationsGridProps) {
	const { t } = useTranslation('presentations');
	const navigate = useNavigate();

	if (presentations.length === 0) {
		return (
			<div className="mx-auto max-w-[440px] px-5 pb-10 pt-14 text-center">
				<div className="mx-auto mb-[14px] grid h-[42px] w-[42px] place-items-center rounded-[13px] bg-[#F7F7F8] text-utds-ink">
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						className="h-5 w-5"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
					>
						<rect x="4" y="4" width="16" height="16" rx="2" />
						<path d="M8 8h8M8 12h8M8 16h5" />
					</svg>
				</div>

				<h3 className="mb-1.5 text-[16px] font-semibold tracking-[-0.01em] text-utds-ink">
					{t('empty.title')}
				</h3>

				<p className="mb-4 text-[13px] leading-[1.5] text-utds-secondary">
					{t('empty.description')}
				</p>
			</div>
		);
	}

	return (
		<section
			aria-label={t('grid.label')}
			className={`grid items-stretch ${density === 'compact'
					? 'gap-3 [grid-template-columns:repeat(auto-fill,minmax(164px,1fr))]'
					: 'gap-4 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]'
				}`}
		>
			{presentations.map((presentation) => (
				<PresentationsCard
					key={presentation.id}
					presentation={presentation}
					density={density}
					onOpen={(item) => void navigate(presentationDetailsUrl(item.id))}
				/>
			))}
		</section>
	);
}

export default PresentationsGrid;
