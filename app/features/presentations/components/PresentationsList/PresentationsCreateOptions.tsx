import { Card } from "~/shared/components/ui/Card";
import type { CreationPath } from "../../types/presentations";
import { useTranslation } from "react-i18next";
import { Shirt, Sparkle } from 'lucide-react';
import { cn } from '~/shared/components/product';

interface PresentationCreationOptionsProps {
	value: CreationPath;
	onChange: (value: CreationPath) => void;
}

export const PresentationCreationOptions = ({
	value,
	onChange,
}: PresentationCreationOptionsProps) => {
	const { t } = useTranslation('presentations');
	const creationOptions = [
		{
			value: 'customizeWithAi' as const,
			icon: Sparkle,
			title: t('modal.customizeWithAi'),
			description: t('modal.customizeWithAiDescription'),
			recommended: true,
		},
		{
			value: 'stylesAsTheyAre' as const,
			icon: Shirt,
			title: t('modal.stylesAsTheyAre'),
			description: t('modal.stylesAsTheyAreDescription'),
			recommended: false,
		},
	];
	return (
		<div className="grid grid-cols-2 gap-[10px] max-md:grid-cols-1">
			{creationOptions.map((option) => {
				const Icon = option.icon;
				const selected = value === option.value;

				return (
					<Card
						key={option.value}
						size="sm"
						onClick={
							option.value === 'customizeWithAi'
								? undefined
								: () => onChange(option.value)
						}
						className={cn(
							'relative gap-[7px] p-[14px] text-left transition-colors',
							option.value === 'customizeWithAi'
								? 'cursor-not-allowed opacity-60'
								: 'cursor-pointer',
							selected
								? 'border-[#111113] shadow-[inset_0_0_0_1px_#111113]'
								: 'hover:border-[#D7D7DA]',
						)}
					>
						{option.recommended && (
							<span className="absolute right-3 top-3 inline-flex h-[22px] items-center rounded-full bg-[#F2F2F3] px-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#5C5C61]">
								{t('modal.recommended')}
							</span>
						)}

						<span
							className={cn(
								'flex h-[34px] w-[34px] items-center justify-center rounded-[9px]',
								selected
									? 'bg-[#111113] text-white'
									: 'bg-[#F7F7F8] text-[#111113]',
							)}
						>
							<Icon className="h-4 w-3" />
						</span>

						<span className="text-[13.5px] font-semibold text-[#111113]">
							{option.title}
						</span>

						<span className="text-[12px] leading-[1.45] text-[#5C5C61]">
							{option.description}
						</span>
					</Card>
				);
			})}
		</div>
	);
};