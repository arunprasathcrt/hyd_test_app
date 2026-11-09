import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useFetcher, useLocation, useNavigate, useRevalidator } from 'react-router';

import type {
	PresentationCustomer,
	PresentationDetail,
} from '~/features/presentations/types/presentations';

import { toast } from '~/shared/components/ui/Toast';
import { PresentationActivity } from './PresentationActivity';
import { PresentationDetailHeader } from './PresentationDetailHeader';
import { PresentationStylesSection } from './PresentationStylesSection';
import { PresentationSummary } from './PresentationSummary';
import { PRODUCTS_ROUTE } from '~/shared/utils/presentation-context';
import { PresentationDetailNotFound } from './PresentationDetailNotFound';

interface PresentationsDetailsProps {
	presentation: PresentationDetail | null;
	customers: PresentationCustomer[];
}

function focusAfterRepaint(request: string): void {
	let target = document.querySelector<HTMLElement>(`[data-focus-key="${request}"]`);

	if (target?.getAttribute('aria-disabled') === 'true') {
		const [direction, styleId] = request.split(/-(.*)/);
		const alternate = direction === 'up' ? 'dn' : 'up';
		target = document.querySelector<HTMLElement>(
			`[data-focus-key="${alternate}-${styleId}"]`,
		);
	}
	target?.focus({ preventScroll: true });
}

export default function PresentationsDetails({
	presentation,
	customers,
}: PresentationsDetailsProps) {
	const { t } = useTranslation('presentations');
	const removedStyleRef = useRef<{
		id: string;
		name: string;
	} | null>(null);
	const removeToastIdRef = useRef<string | null>(null);
	const revalidator = useRevalidator();
	const removeFetcher = useFetcher();
	const addFetcher = useFetcher();
	const reorderFetcher = useFetcher();
	const focusRequest = useRef<string | null>(null);
	const location = useLocation();
	const navigate = useNavigate();
	const hasShownCreatedToast = useRef(false);
	const hasRevalidatedReorder = useRef(false);
	const restoreStyleRef = useRef<(productId: string) => void>(() => undefined);

	useEffect(() => {
		restoreStyleRef.current = (productId: string) => {
			if (!presentation) {
				return;
			}
			const formData = new FormData();

			formData.set('collectionId', presentation.id);
			formData.append('productIds', productId);

			void addFetcher.submit(formData, {
				method: 'POST',
				action: PRODUCTS_ROUTE,
			});
		};
	});

	useEffect(() => {
		const request = focusRequest.current;
		if (request === null) {
			return;
		}
		focusRequest.current = null;
		focusAfterRepaint(request);
	}, [presentation]);

	useEffect(() => {
		if (hasShownCreatedToast.current) {
			return;
		}
		if (!location.state?.presentationCreated) {
			return;
		}
		hasShownCreatedToast.current = true;
		toast.add({
			title: t('modal.draftCreated'),
			type: 'success',
			timeout: 3000,
			actionProps: {
				children: t('modal.addStyles'),
				onClick: () =>
					void navigate(
						`${PRODUCTS_ROUTE}?id=${encodeURIComponent(
							location.state.collectionId,
						)}`,
					),
			},
		});
		window.history.replaceState({}, '');
	}, [location.state, navigate, t]);

	useEffect(() => {
		if (
			reorderFetcher.state !== 'idle' ||
			!reorderFetcher.data?.ok ||
			hasRevalidatedReorder.current
		) {
			return;
		}
		hasRevalidatedReorder.current = true;
		void revalidator.revalidate();
	}, [reorderFetcher.state, reorderFetcher.data, revalidator]);
	
	useEffect(() => {
		if (
			removeFetcher.state !== 'idle' ||
			!removeFetcher.data?.ok ||
			!removedStyleRef.current
		) {
			return;
		}
		removeToastIdRef.current = toast.add({
			title: t('detail.styles.removed', {
				name: removedStyleRef.current.name,
			}),
			type: 'success',
			timeout: 6000,
			actionProps: {
				children: t('detail.styles.undo'),
				onClick: () => {
					if (!removedStyleRef.current) {
						return;
					}
					if (removeToastIdRef.current) {
						toast.close(removeToastIdRef.current);
					}
					restoreStyleRef.current(
						removedStyleRef.current.id,
					);
				},
			},
		});
	}, [removeFetcher.state, removeFetcher.data, t]);

	if (!presentation) {
		return (
			<PresentationDetailNotFound />
		);
	}

	const handleRemoveStyle = (styleId: string) => {
		const style = presentation.styles.find(
			(item) => item.id === styleId,
		);

		if (!style) {
			return;
		}
		removedStyleRef.current = {
			id: style.id,
			name: style.styleName,
		};
		const formData = new FormData();
		formData.set('intent', 'remove-product');
		formData.set('collectionId', presentation.id);
		formData.append('productIds', styleId);
		void removeFetcher.submit(formData, {
			method: 'POST',
			action: `/presentations/details?id=${encodeURIComponent(presentation.id)}`,
		});
	};

	const handleMoveStyle = (styleId: string, direction: -1 | 1) => {
		const currentIndex = presentation.styles.findIndex(
			(style) => style.id === styleId,
		);

		if (currentIndex < 0) {
			return;
		}
		const newPosition = currentIndex + direction;
		if (
			newPosition < 0 ||
			newPosition >= presentation.styles.length
		) {
			return;
		}
		const formData = new FormData();
		formData.set('intent', 'reorder');
		formData.set('collectionId', presentation.id);
		formData.set('productId', styleId);
		formData.set('newPosition', String(newPosition));
		focusRequest.current = `${direction === -1 ? 'up' : 'dn'}-${styleId}`;
		hasRevalidatedReorder.current = false;
		toast.add({
			title: t('detail.styles.reorderingStyles'),
			type: 'info',
			timeout: 1500,
		});
		void reorderFetcher.submit(formData, {
			method: 'POST',
			action: `/presentations/details?id=${encodeURIComponent(
				presentation.id,
			)}`,
		});
	};

	return (
		<div className="h-full min-h-0 overflow-y-auto bg-white">
			<div className="mx-auto flex min-h-full w-full max-w-[1264px] flex-col px-4 pb-8 pt-6 sm:px-6 md:px-8 lg:pt-12">
				<PresentationDetailHeader
					presentation={presentation}
					customers={customers}
				/>

				<div className="grid grid-cols-1 items-start gap-6 min-[1200px]:grid-cols-[minmax(0,1fr)_320px]">
					<PresentationStylesSection
						styles={presentation.styles}
						onRemoveStyle={handleRemoveStyle}
						onMoveStyle={handleMoveStyle}
						isReordering={reorderFetcher.state !== 'idle'}
					/>

					<aside
						aria-label={t('detail.summary.title')}
						className="flex min-w-0 flex-col gap-4"
					>
						<PresentationSummary presentation={presentation} />
						<PresentationActivity entries={presentation.activity} />
					</aside>
				</div>
			</div>
		</div>
	);
}
