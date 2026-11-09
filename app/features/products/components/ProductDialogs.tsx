import {useEffect, useRef, useState} from 'react';
import {useFetcher, useRevalidator} from 'react-router';
import {useTranslation} from 'react-i18next';
import {X} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {toast} from '~/shared/components/ui/Toast';
import type {CatalogModel} from '../lib/catalog';
import type {
  CatalogBook,
  CatalogMutation,
  Product,
} from '../schemas/product.schema';
import type {AtpTable} from '../schemas/atp.schema';
import type {SavedCollection} from '../schemas/saved-collection.schema';
import {savedCollectionNameFormSchema} from '../schemas/saved-collection.schema';
import type {PresentationCustomer} from '~/features/presentations/types/presentations';
import {Button, Dialog} from '../../../shared/components/product';
import {AtpDrawer} from './AtpDrawer';
import {ProductDetails} from '~/features/products/components/ProductDetails';
import {ACTIONS} from './SelectionDock';
import {SaveCollectionDialog} from './SaveCollectionDialog';
import NewPresentationModal from '~/features/presentations/components/PresentationsList/NewPresentationModal';

interface ProductDialogsProps {
  model: CatalogModel & {books: CatalogBook[]; records: Product[]};
  savedCollections: SavedCollection[];
  presentationCustomers: PresentationCustomer[];
  detail: {product: Product; mode: 'quick' | 'atp'} | null;
  onDetailOpenChange: (open: boolean) => void;
  selected: Set<string>;
  onToggleProduct: (id: string) => void;
  onClear: () => void;
  intent: CatalogMutation['intent'] | null;
  onIntentOpenChange: (open: boolean) => void;
  onAddToDraft: () => void;
  onAddProductToDraft: (productId: string) => void;
  selectedIds: string[];
  reviewOpen: boolean;
  onReviewOpenChange: (open: boolean) => void;
  onOpenCatalog: (catalogName: string) => void;
  onShowAtp: (product: Product) => void;
  onSelectColorway: (product: Product) => void;
  actionUrl: string;
  atp: AtpTable | null;
  atpLoading: boolean;
}

export function ProductDialogs({
  model,
  savedCollections,
  presentationCustomers,
  detail,
  onDetailOpenChange,
  selected,
  onToggleProduct,
  onClear,
  intent,
  onIntentOpenChange,
  onAddToDraft,
  onAddProductToDraft,
  selectedIds,
  reviewOpen,
  onReviewOpenChange,
  onOpenCatalog,
  onShowAtp,
  onSelectColorway,
  actionUrl,
  atp,
  atpLoading,
}: ProductDialogsProps) {
  const {t} = useTranslation('products');
  const savedCollectionFetcher = useFetcher<
    {ok: true; collectionId: string} | {ok: false}
  >();
  const handledCollectionResult = useRef<
    {ok: true; collectionId: string} | {ok: false} | undefined
  >(undefined);
  const revalidator = useRevalidator();
  const [presentationProductId, setPresentationProductId] = useState<string | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [addedCollection, setAddedCollection] = useState<{
    productId: string;
    name: string;
  } | null>(null);
  const collectionContext = useRef<
    | {mode: 'quick'; productId: string; name: string}
    | {mode: 'dock'; count: number}
    | null
  >(null);
  const collectionForm = useForm({
    resolver: zodResolver(savedCollectionNameFormSchema),
    defaultValues: {name: ''},
    mode: 'onChange',
  });
  const resetCollectionForm = collectionForm.reset;
  const activeAction = ACTIONS.find((action) => action.intent === intent);

  useEffect(() => {
    if (
      savedCollectionFetcher.state !== 'idle' ||
      !savedCollectionFetcher.data ||
      savedCollectionFetcher.data === handledCollectionResult.current
    ) {
      return;
    }
    handledCollectionResult.current = savedCollectionFetcher.data;
    if (savedCollectionFetcher.data.ok) {
      const context = collectionContext.current;
      const savedCount = context?.mode === 'dock' ? context.count : 1;
      if (context?.mode === 'quick') {
        setAddedCollection({productId: context.productId, name: context.name});
        setCollectionOpen(false);
      }
      if (context?.mode === 'dock') {
        onClear();
        onIntentOpenChange(false);
      }
      collectionContext.current = null;
      resetCollectionForm({name: ''});
      toast.add({
        title: t('detail.collectionSaved', {count: savedCount}),
        type: 'success',
        timeout: 5000,
      });
      void revalidator.revalidate();
    } else {
      collectionContext.current = null;
      toast.add({
        title: t('detail.collectionSaveFailed'),
        type: 'error',
        timeout: 6000,
      });
    }
  }, [
    savedCollectionFetcher.state,
    savedCollectionFetcher.data,
    resetCollectionForm,
    revalidator,
    t,
    onClear,
    onIntentOpenChange,
  ]);

  const submitSavedCollection = (formData: FormData) => {
    handledCollectionResult.current = undefined;
    void savedCollectionFetcher.submit(formData, {method: 'post', action: actionUrl});
  };

  const addProductToSavedCollection = (collection: SavedCollection) => {
    if (detail?.mode !== 'quick') return;
    collectionContext.current = {
      mode: 'quick',
      productId: detail.product.id,
      name: collection.name,
    };
    const formData = new FormData();
    formData.set('operation', 'add');
    formData.set('collectionId', collection.id);
    formData.set('productIds', detail.product.id);
    void submitSavedCollection(formData);
  };

  const createSavedCollection = (
    name: string,
    productIds: string[],
    mode: 'quick' | 'dock',
    customerId = '',
  ) => {
    collectionContext.current =
      mode === 'quick' && detail?.mode === 'quick'
        ? {mode, productId: detail.product.id, name}
        : {mode: 'dock', count: productIds.length};
    const formData = new FormData();
    formData.set('operation', 'create');
    formData.set('name', name);
    formData.set('customerId', customerId);
    productIds.forEach((productId) => formData.append('productIds', productId));
    void submitSavedCollection(formData);
  };

  return (
    <>
      <Dialog
        open={detail?.mode === 'quick'}
        onOpenChange={(open) => {
          if (!open) setCollectionOpen(false);
          onDetailOpenChange(open);
        }}
        title={t('page.title')}
        bodyClassName="p-0"
        hideHeader
        overlayClassName="bg-[rgba(17,17,19,.42)]"
        closeClassName="size-10 border-0 bg-white/95 text-[#6B6B70] shadow-[0_1px_3px_rgba(17,17,19,.1)] hover:bg-white hover:text-[#111113]"
        contentClassName="max-h-[92vh] w-[min(920px,100%)] max-w-none rounded-[18px] shadow-[0_30px_80px_rgba(0,0,0,.5)]"
      >
        {detail?.mode === 'quick' && (
          <ProductDetails
            product={detail.product}
            catalogTitle={detail.product.catalogName || undefined}
            colorwayProducts={model.records.filter(
              (product) =>
                product.type === 'garment' &&
                detail.product.sku !== '' &&
                product.sku === detail.product.sku &&
                product.id !== detail.product.id,
            )}
              savedCollections={savedCollections}
              collectionOpen={collectionOpen}
              collectionPending={savedCollectionFetcher.state !== 'idle'}
              addedCollectionName={
                addedCollection?.productId === detail.product.id
                  ? addedCollection.name
                  : null
              }
            onAddToCollection={() => {
                setCollectionOpen((open) => !open);
            }}
              onAddSavedCollection={addProductToSavedCollection}
              onCreateSavedCollection={(name) =>
                createSavedCollection(name, [detail.product.id], 'quick')
              }
            onAddToDraft={() => {
              onDetailOpenChange(false);
              onAddProductToDraft(detail.product.id);
            }}
            onCreatePresentation={() => {
              setPresentationProductId(detail.product.id);
              onDetailOpenChange(false);
            }}
            onShowAtp={() => onShowAtp(detail.product)}
            onOpenCatalog={() => {
              onDetailOpenChange(false);
              onOpenCatalog(detail.product.catalogName);
            }}
            onSelectColorway={onSelectColorway}
            atp={atp}
          />
        )}
      </Dialog>
      <AtpDrawer
        product={detail?.mode === 'atp' ? detail.product : null}
        table={atp}
        loading={atpLoading}
        selected={
          detail?.mode === 'atp' ? selected.has(detail.product.id) : false
        }
        open={detail?.mode === 'atp'}
        onOpenChange={onDetailOpenChange}
        onToggle={() => {
          if (detail?.mode === 'atp') onToggleProduct(detail.product.id);
        }}
        onAddDraft={() => {
          if (detail?.mode === 'atp') {
            onDetailOpenChange(false);
            onAddProductToDraft(detail.product.id);
          }
        }}
      />
      <Dialog
        open={intent === 'draft'}
        onOpenChange={onIntentOpenChange}
        title={activeAction ? t(activeAction.title) : t('page.title')}
      >
        {intent === 'draft' ? (
          <div className="space-y-4">
            <p className="text-sm">{t('draftPicker.description')}</p>
            <p className="text-sm">
              {t('form.selection', {count: selectedIds.length})}
            </p>
            {!selectedIds.length && (
              <p role="status" className="text-sm">
                {t('draftPicker.empty')}
              </p>
            )}
            {selectedIds.length > 100 && (
              <p role="alert" className="text-sm text-mf-terra">
                {t('draftPicker.limit')}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onIntentOpenChange(false)}
              >
                {t('form.cancel')}
              </Button>
              <Button
                type="button"
                disabled={!selectedIds.length || selectedIds.length > 100}
                onClick={() => {
                  onIntentOpenChange(false);
                  onAddToDraft();
                }}
              >
                {t('draftPicker.newDraft')}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
      <SaveCollectionDialog
        open={intent === 'collection'}
        onOpenChange={onIntentOpenChange}
        items={selectedIds.map((id) => {
          const record = model.records.find((entry) => entry.id === id);
          return {
            id,
            name: record?.name ?? t('card.unavailable'),
            image: record?.image ?? '',
          };
        })}
        customers={presentationCustomers}
        pending={savedCollectionFetcher.state !== 'idle'}
        onSubmit={({name, customer}) =>
          createSavedCollection(name, selectedIds, 'dock', customer)
        }
      />
      <Dialog
        open={reviewOpen}
        onOpenChange={onReviewOpenChange}
        title={t('dock.review')}
      >
        <ul className="space-y-2">
          {selectedIds.map((id) => {
            const product = model.selectionItems.find(
              (entry) => entry.id === id,
            );
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-3 rounded-mf-sm border border-mf-border p-2 text-sm"
              >
                <span className="min-w-0 break-all">
                  {product?.name ?? t('card.unavailable')}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t('dock.remove', {
                    name: product?.name ?? t('card.unavailable'),
                  })}
                  onClick={() => onToggleProduct(id)}
                >
                  <X size={16} />
                </Button>
              </li>
            );
          })}
        </ul>
      </Dialog>
      <NewPresentationModal
        open={presentationProductId !== null || intent === 'presentation'}
        onClose={() => {
          setPresentationProductId(null);
          onIntentOpenChange(false);
        }}
        customers={presentationCustomers}
        productIds={presentationProductId ? [presentationProductId] : selectedIds}
        selectedProducts={model.records.filter((product) =>
          (presentationProductId
            ? [presentationProductId]
            : selectedIds
          ).includes(product.id),
        )}
      />
    </>
  );
}
