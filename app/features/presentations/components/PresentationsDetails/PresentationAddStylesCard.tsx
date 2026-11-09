import { LayoutGrid, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '~/shared/components/ui/Button';
import { PRODUCTS_ROUTE } from '~/shared/utils/presentation-context';


export function PresentationAddStylesCard() {
	const { t } = useTranslation('presentations');
	const location = useLocation();
	const navigate = useNavigate();

	const handleAddStyles = () => {
		const presentationId = new URLSearchParams(location.search).get('id');
		void navigate(
			presentationId
				? `${PRODUCTS_ROUTE}?id=${encodeURIComponent(presentationId)}`
				: PRODUCTS_ROUTE,
		);
	};

	return (
		<section
			aria-labelledby="presentation-add-styles-title"
			className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#D7D7DA] bg-white px-[18px] py-6 text-center"
		>
			<span className="mb-1 grid h-[42px] w-[42px] place-items-center rounded-[13px] bg-[#F7F7F8] text-[#111113]">
				<Plus aria-hidden="true" className="h-4 w-4" />
			</span>

			<h3
				id="presentation-add-styles-title"
				className="text-[14px] font-semibold text-[#111113]"
			>
				{t('detail.addStyles.title')}
			</h3>

			<p className="mb-2 max-w-[260px] text-[12px] leading-[1.5] text-[#5C5C61]">
				{t('detail.addStyles.description')}
			</p>

			<Button
				type="button"
				variant="outline"
				size="control"
				shape="md"
				onClick={handleAddStyles}
				data-focus-key="add-products"
				className="w-full max-w-[260px] cursor-pointer"
			>
				<LayoutGrid aria-hidden="true" className="h-4 w-4 shrink-0" />
				<span className="whitespace-nowrap">
					{t('detail.addStyles.button')}
				</span>
			</Button>

			<Button
				type="button"
				variant="outline"
				size="control"
				shape="md"
				disabled
				className="w-full max-w-[260px] cursor-not-allowed"
			>
				<span
					aria-hidden="true"
					className="shrink-0 text-[13px] leading-none text-[#C9A227]"
				>
					✦
				</span>
				<span className="whitespace-nowrap">
					{t('detail.addStyles.buttonAi')}
				</span>
			</Button>
		</section>
	);
}
