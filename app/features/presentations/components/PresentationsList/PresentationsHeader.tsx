import { Boxes, LayoutGrid, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '~/shared/components/ui/Button';

interface PresentationsHeaderProps {
	onOpenProducts?: () => void;
	onCreatePresentation?: () => void;
}

export function PresentationsHeader({
	onOpenProducts,
	onCreatePresentation,
}: PresentationsHeaderProps) {
	const { t } = useTranslation('presentations');

	return (
		<header className="flex items-start justify-between gap-x-6 gap-y-4 pb-6 max-md:flex-nowrap max-md:items-center max-md:gap-3 max-md:pb-4">
			<div className="min-w-0 flex-1 pr-4">
				<h1 className="truncate text-2xl font-semibold tracking-[-0.015em] text-[#111113]">
					{t('page.title')}
				</h1>
				<p className="mt-1 max-w-[720px] text-[13px] leading-[1.5] text-[#66666D] max-md:hidden">
					{t('page.description')}
				</p>
			</div>

			<div
				className="flex shrink-0 items-center gap-1.5 self-start"
				role="group"
				aria-label={t('actions.groupLabel')}
			>
				<Button
					type="button"
					variant="outline"
					size="control"
					shape="md"
					className="h-9 cursor-pointer"
					onClick={onOpenProducts}
				>
					<LayoutGrid aria-hidden="true" className="h-4 w-4 shrink-0" />
					<span className="whitespace-nowrap">
						{t('actions.openProducts')}
					</span>
				</Button>

				<Button
					type="button"
					size="control"
					shape="md"
					className="h-9 cursor-pointer"
					onClick={onCreatePresentation}
				>
					<Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
					<span className="whitespace-nowrap">
						{t('actions.newPresentation')}
					</span>
				</Button>
			</div>
		</header>
	);
}

export default PresentationsHeader;