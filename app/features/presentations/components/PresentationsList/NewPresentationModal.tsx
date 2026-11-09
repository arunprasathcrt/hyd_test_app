import { useEffect, useState } from 'react';
import { Layers2, X, Sparkle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/shared/components/ui/Button';
import { getDefaultPresentationName, getDefaultNeededBy } from '../../lib/presentations';
import { PRESENTATIONS_ROUTE } from '~/shared/utils/presentation-context';
import type { CreationPath, PresentationCustomer } from '../../types/presentations';
import { useFetcher, useNavigate } from 'react-router';
import { PresentationCreationOptions } from './PresentationsCreateOptions';
import { SEGMENT_LABEL_KEYS } from '~/shared/constants/segments';
import { PresentationsCustomerAndNeededBy } from './PresentationsCustomerAndNeededBy';
import { Input } from '~/shared/components/ui/Input';
import { toast } from '~/shared/components/ui/Toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '~/shared/components/ui/Form';
import {
	createPresentationCollectionSchema,
	type CreatePresentationCollectionInput,
} from '../../schemas/collection.schema';
import type { Product } from '~/features/products/schemas/product.schema';

interface NewPresentationModalProps {
	open: boolean;
	onClose: () => void;
	customers: PresentationCustomer[];
	productIds?: string[];
	selectedProducts?: Product[];
}

export default function NewPresentationModal({
	open,
	onClose,
	customers,
	productIds = [],
	selectedProducts = []
}: NewPresentationModalProps) {
	const { t } = useTranslation(['presentations', 'enums']);
	const navigate = useNavigate();
	const collectionFetcher = useFetcher();
	const [creationPath, setCreationPath] = useState<CreationPath>('stylesAsTheyAre');
	const form = useForm<CreatePresentationCollectionInput>({
		resolver: zodResolver(createPresentationCollectionSchema),
		mode: 'onChange',
		defaultValues: {
			name: getDefaultPresentationName(
				customers[0]?.name ?? '',
				t('modal.defaultCollectionSuffix'),
			),
			customer: customers[0]?.id ?? '',
			neededBy: getDefaultNeededBy(),
		},
	});
	const customer = form.watch('customer');
	const neededBy = form.watch('neededBy');
	const name = form.watch('name');
	const selectedCustomer = customers.find(
		(item) => item.id === customer,
	);
	const garmentCount = selectedProducts.filter(
		(product) => product.type === 'garment',
	).length;
	const artCount = selectedProducts.filter(
		(product) => product.type === 'art',
	).length;
	const canCreate =
		name.trim().length > 0 &&
		customer.length > 0 &&
		neededBy.length > 0;

	const handleClose = () => {
		form.reset({
			name: getDefaultPresentationName(
				customers[0]?.name ?? '',
				t('modal.defaultCollectionSuffix'),
			),
			customer: customers[0]?.id ?? '',
			neededBy: getDefaultNeededBy(),
		});

		setCreationPath('stylesAsTheyAre');
		onClose();
	};

	useEffect(() => {
		if (!open) {
			return;
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [open, onClose]);

	useEffect(() => {
		if (
			collectionFetcher.data?.ok &&
			collectionFetcher.data?.collectionId
		) {
			void navigate(
				`/presentations/details?id=${encodeURIComponent(
					collectionFetcher.data.collectionId,
				)}`,
				{
					state: {
						presentationCreated: true,
						collectionId: collectionFetcher.data.collectionId,
					},
				},
			);

			return;
		}

		if (collectionFetcher.data?.ok === false) {
			toast.add({
				title: t('modal.createFailed'),
				type: 'error',
				timeout: 6000,
			});
		}
	}, [collectionFetcher.data, navigate, t]);


	if (!open) {
		return null;
	}

	const segmentLabel =
		selectedCustomer?.segment &&
			selectedCustomer.segment in SEGMENT_LABEL_KEYS
			? t(
				SEGMENT_LABEL_KEYS[
				selectedCustomer.segment as keyof typeof SEGMENT_LABEL_KEYS
				],
				{ ns: 'enums' },
			)
			: selectedCustomer?.segment ?? '';

	return (
		<Form {...form}>
			<div
				role="presentation"
				className="
				fixed inset-0 z-[900]
				flex items-center justify-center
				bg-[rgba(17,17,19,0.42)]
				p-4
				max-md:items-end
				max-md:p-0
			"
				onClick={(event) => {
					if (event.target === event.currentTarget) {
						handleClose();
					}
				}}
			>
				<div
					role="dialog"
					aria-modal="true"
					aria-labelledby="new-presentation-title"
					className="
					relative
					w-full
					max-w-[560px]
					max-h-[calc(100vh-32px)]
					overflow-auto
					rounded-[20px]
					bg-white
					p-6
					text-[#111113]
					shadow-[0_30px_80px_rgba(17,17,19,0.28)]
					max-md:max-h-[92vh]
					max-md:max-w-none
					max-md:rounded-t-[18px]
					max-md:rounded-b-none
					max-md:px-4
					max-md:pt-5
					max-md:pb-4
				"
				>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={t('actions.close')}
						onClick={handleClose}
						className="absolute right-[14px] top-[14px] cursor-pointer"
					>
						<X className="h-5 w-5" />
					</Button>

					<h2
						id="new-presentation-title"
						className="mr-11 text-[20px] font-semibold tracking-[-0.015em]"
					>
						{t('actions.newPresentation')}
					</h2>

					<p className="mt-1 text-[13px] leading-[1.5] text-[#5C5C61]">
						{t('modal.description')}
					</p>

					<div className="mt-4 flex items-center gap-3 rounded-[12px] border border-utds-border-subtle bg-white p-[10px]">
						{selectedProducts.length > 0 ? (
							<div className="flex items-center">
								{selectedProducts.slice(0, 6).map((product) => (
									<div
										key={product.id}
										className="-ml-2 first:ml-0 relative h-10 w-10 overflow-hidden rounded-[9px] border-2 border-white bg-[#F5F5F6]"
									>
										<img src={product.image} alt={product.name} />
									</div>
								))}

								{selectedProducts.length > 6 && (
									<div className="-ml-2 flex h-10 w-10 items-center justify-center rounded-[9px] border-2 border-white bg-[#F5F5F6] text-[12px] font-medium text-[#5C5C61]">
										+{selectedProducts.length - 6}
									</div>
								)}
							</div>
						) : (
							<div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F7F7F8] text-[#111113]">
								<Layers2 className="h-4 w-4" />
							</div>
						)}

						<span className="min-w-0 text-[13px] font-medium leading-[1.45] text-[#5C5C61]">
							{productIds.length > 0
								? `${productIds.length} style${productIds.length === 1 ? '' : 's'} · ${garmentCount} garment${garmentCount === 1 ? '' : 's'}${artCount > 0 ? ` · ${artCount} art` : ''}`
								: t('modal.emptyState')}
						</span>
					</div>

					<label className="mt-[18px] mb-[6px] block text-[12px] font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
						{t('modal.name')}
					</label>

					<Input
						maxLength={120}
						value={name}
						onChange={(event) => form.setValue('name', event.target.value)}
					/>
					<PresentationsCustomerAndNeededBy
						customer={customer}
						customers={customers}
						selectedCustomer={selectedCustomer}
						segmentLabel={segmentLabel}
						neededBy={neededBy}
						onCustomerChange={(customerId) => {
							form.setValue('customer', customerId);

							const nextCustomer = customers.find(
								(item) => item.id === customerId,
							);

							if (nextCustomer) {
								form.setValue(
									'name',
									getDefaultPresentationName(
										nextCustomer.name,
										t('modal.defaultCollectionSuffix'),
									),
								);
							}
						}}
						onNeededByChange={(value) =>
							form.setValue('neededBy', value)
						}
					/>

					<p className="mt-[18px] mb-[6px] text-[12px] font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
						{t('modal.buildMethod')}
					</p>

					<PresentationCreationOptions
						value={creationPath}
						onChange={setCreationPath}
					/>

					<div className="mt-[22px] flex flex-wrap justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							size="control"
							shape="md"
							onClick={handleClose}
							className="max-md:flex-1 cursor-pointer"
						>
							{t('actions.cancel')}
						</Button>
						<Button
							type="button"
							variant="default"
							size="control"
							shape="md"
							disabled={
								!canCreate ||
								collectionFetcher.state !== 'idle'
							}
							onClick={() => void form.handleSubmit((values) => {
								const formData = new FormData();
								formData.set('name', values.name);
								formData.set('customer', values.customer);
								formData.set('neededBy', values.neededBy);
								productIds.forEach((productId) =>
									formData.append('productIds', productId),
								);
								void collectionFetcher.submit(formData, {
									method: 'POST',
									action: PRESENTATIONS_ROUTE,
								});
							})()}
							className="max-md:flex-[2] cursor-pointer"
						>
							{creationPath === 'customizeWithAi' && (
								<Sparkle className="h-3 w-2" color="#C9A227" fill='#C9A227' />
							)}
							{collectionFetcher.state !== 'idle'
								? t('form.pending')
								: creationPath === 'customizeWithAi'
									? t('actions.customizeWithAi')
									: t('actions.createPresentation')}
						</Button>
					</div>
				</div>
			</div>
		</Form>
	);
}