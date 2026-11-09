import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  useFetcher,
  useNavigate,
  useSearchParams,
  type SetURLSearchParams,
} from 'react-router';
import {toast} from '~/shared/components/ui/Toast';
import {PRODUCTS_ROUTE, presentationDetailsUrl} from '../../../shared/utils/presentation-context';
import type {
  PresentationCustomer,
  PresentationReference,
} from '~/features/presentations/types/presentations';
import type {AtpTable} from '../schemas/atp.schema';
import type {AddProductsResult} from '~/features/presentations/schemas/collection.schema';
import {PresentationTargetStrip, type DockRect} from './PresentationTargetStrip';
import {
  DRAFT_STEP_PRODUCTS,
  FLAG_ON,
  ROUTES,
  SEARCH_PARAMS,
} from '~/shared/constants/routes';
import {useTranslation} from 'react-i18next';
import {useStore} from 'zustand';
import type {CatalogModel, FacetKey, VIEWS} from '../lib/catalog';
import type {
  CatalogBook,
  CatalogMutation,
  Product,
} from '../schemas/product.schema';
import type {SavedCollection} from '../schemas/saved-collection.schema';
import {createCatalogStore} from '../../../store/catalog.store';
import {cn} from '../../../shared/components/product';
import {ProductToolbar} from './ProductToolbar';
import {ProductResults} from './ProductResults';
import {ProductRail} from './ProductRail';
import {SelectionDock} from './SelectionDock';
import {ProductDialogs} from './ProductDialogs';
import { styleItemsForSelection } from '~/features/presentations/lib/presentation-style';

const DOCK_SELECTOR = '[data-catalog-dock]';
const DOCK_GAP_PX = 8;
/**
 * Set when the listing is shown inside the garment picker drawer instead of the
 * Products page: filters live in `searchParams` here, not in the URL, and the
 * rail, selection dock and "return to draft" banner give way to a footer that
 * hands the picked ids to `onConfirm`.
 */
export interface ListingPicker {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  onConfirm: (ids: string[]) => void;
  onCancel: () => void;
  /** Translated error shown above the footer, for example a failed add. */
  error?: string | null;
  confirming?: boolean;
  confirmLabel?: (count: number) => string;
}

export function ProductListing({
  model,
  pending,
  presentation,
  savedCollections = [],
  presentationCustomers = [],
  picker,
}: {
  model: CatalogModel & {
    records: Product[];
    books: CatalogBook[];
    viewLabels?: Partial<Record<(typeof VIEWS)[number], string>>;
  };
  pending: boolean;
  presentation: PresentationReference | null;
  savedCollections?: SavedCollection[];
  presentationCustomers?: PresentationCustomer[];
  picker?: ListingPicker;
}) {
  const {t} = useTranslation('products');
  const navigate = useNavigate();
  const [addedCount, setAddedCount] = useState<number | null>(null);
  const routerParams = useSearchParams();
  const [searchParams, setParams] = picker
    ? [picker.searchParams, picker.setSearchParams]
    : routerParams;
  const [store] = useState(createCatalogStore);
  const {selectedIds, toggle, select, clear} = useStore(store);
  const [dockRect, setDockRect] = useState<DockRect | null>(null);
  const [railOpen, setRailOpen] = useState(true);
  const [showBooks, setShowBooks] = useState(false);
  const [detail, setDetail] = useState<{
    product: Product;
    mode: 'quick' | 'atp';
  } | null>(null);
  const [intent, setIntent] = useState<CatalogMutation['intent'] | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const addFetcher = useFetcher<AddProductsResult>();
  const atpFetcher = useFetcher<AtpTable>();
  // Both detail modes share live inventory; start loading when either opens.
  const showDetail = (product: Product, mode: 'quick' | 'atp') => {
    setDetail({product, mode});
    if (product.type === 'garment') {
      const params = new URLSearchParams({id: product.id, color: product.colorName});
      void atpFetcher.load(`${ROUTES.productAtp}?${params}`);
    }
  };
  const handledAddResult = useRef<AddProductsResult | undefined>(undefined);

  useLayoutEffect(() => {
    const measure = () => {
      const dock = document.querySelector<HTMLElement>(DOCK_SELECTOR);
      const page = document.querySelector<HTMLElement>(
        '[data-products-page]',
      );
      if (!page) {
        setDockRect(null);
        return;
      }
      const pageRect = page.getBoundingClientRect();
      if (!dock) {
        setDockRect({
          left: pageRect.left,
          right: window.innerWidth - pageRect.right,
          bottom: 20,
        });
        return;
      }
      const dockRect = dock.getBoundingClientRect();
      setDockRect({
        left: pageRect.left,
        right: window.innerWidth - pageRect.right,
        bottom: window.innerHeight - dockRect.top + DOCK_GAP_PX,
      });
      };
    measure();
    const dock = document.querySelector<HTMLElement>(DOCK_SELECTOR);
    const resizeObserver = dock ? new ResizeObserver(measure) : null;
    if (dock && resizeObserver) {
      resizeObserver.observe(dock);
    }
    window.addEventListener('resize', measure);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [selectedIds.length, addedCount]);


  const compact = model.query.density === 'comfortable';
  const selected = new Set(selectedIds);
  const selectionCandidates =
    model.resultIds.length <= 100
      ? model.resultIds
      : model.products.map((product) => product.id);
  const allCandidatesSelected =
    selectionCandidates.length > 0 &&
    selectionCandidates.every((id) => selected.has(id));
  const setValues = (updates: Record<string, string | null>) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('page');
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null) next.delete(key);
          else next.set(key, value);
        });
        return next;
      },
      {preventScrollReset: true},
    );
  };
  const toggleFacet = (key: FacetKey, value: string) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        const existing = next.getAll(key);
        next.delete(key);
        (existing.includes(value)
          ? existing.filter((entry) => entry !== value)
          : [...existing, value]
        ).forEach((entry) => next.append(key, entry));
        next.delete('page');
        return next;
      },
      {preventScrollReset: true},
    );
  };
  const selectSuggestedFilter = (key: FacetKey, value: string) => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete('q');
        next.delete('page');
        const existing = next.getAll(key);
        next.delete(key);
        (existing.includes(value)
          ? existing.filter((entry) => entry !== value)
          : [...existing, value]
        ).forEach((entry) => next.append(key, entry));
        return next;
      },
      {preventScrollReset: true},
    );
  };
  const reset = () => {
    setParams(
      (previous) => {
        const next = new URLSearchParams();
        const id = previous.get('id');

        if (id) next.set('id', id);
        next.set('view', model.query.view);
        next.set('density', model.query.density);
        return next;
      },
      {preventScrollReset: true},
    );
  };
  const toggleSelectAll = () =>
    allCandidatesSelected
      ? clear()
      : select([...selectedIds, ...selectionCandidates]);
  const fromDraft =
    !picker && searchParams.get(SEARCH_PARAMS.fromDraft) === FLAG_ON;
  function addSelectedProductsToDraft(extraProductIds: string[] = []) {
    const productIds = [...new Set([...selectedIds, ...extraProductIds])];
    if (!productIds.length || productIds.length > 100) return;
    const draftParams = new URLSearchParams({
      [SEARCH_PARAMS.step]: DRAFT_STEP_PRODUCTS,
    });
    if (fromDraft) draftParams.set(SEARCH_PARAMS.resume, FLAG_ON);
    const draftId = searchParams.get(SEARCH_PARAMS.draftId);
    if (draftId) draftParams.set(SEARCH_PARAMS.draftId, draftId);
    productIds.forEach((id) =>
      draftParams.append(SEARCH_PARAMS.productId, id),
    );
    void navigate(`${ROUTES.draftOrdersNew}?${draftParams}`);
  }

  const handleDetailOpenChange = (open: boolean) => {
    if (!open) setDetail(null);
  };
  const openPresentation = useCallback(() => {
    if (presentation) {
      void navigate(presentationDetailsUrl(presentation.id));
    }
  }, [navigate, presentation]);
  // Sends the selected products that have a Shopify id. Products with no entry in
  // the temporary mapping are not sent.
  const addShopifyProducts = (collectionId: string) => {
    const productIds = selectedIds;
    if (productIds.length === 0) return;
    const formData = new FormData();
    formData.set('collectionId', collectionId);
    productIds.forEach((productId) => formData.append('productIds', productId));
    void addFetcher.submit(formData, {method: 'POST', action: PRODUCTS_ROUTE});
  };

  // Handles each Shopify add result once: clears the selection and shows the
  // success toast when the action reports success.
  useEffect(() => {
    const result = addFetcher.data;

    if (addFetcher.state !== 'idle' || !result || result === handledAddResult.current) {
      return;
    }

    handledAddResult.current = result;

    if (!result.ok) {
      toast.add({
        title: t('presentationContext.addFailed'),
        type: 'error',
        timeout: 6000,
      });

      return;
    }

    if (!presentation) {
      return;
    }

    clear();
    setAddedCount(result.addedCount);

    toast.add({
      title: t('presentationContext.added', {
        count: result.addedCount,
        name: presentation.name,
      }),
      type: 'success',
      timeout: 6000,
      actionProps: {
        children: t('presentationContext.open'),
        onClick: openPresentation,
      },
    });
  }, [addFetcher.state, addFetcher.data, clear, openPresentation, presentation, t]);

  const addSelectedToPresentation = () => {
    if (!presentation) return;
    addShopifyProducts(presentation.id);
  };
  const pendingItems = styleItemsForSelection(
    selectedIds,
    model.records,
  );
  const pairedGarmentCount = pendingItems.some((item) => item.kind === 'build')
    ? pendingItems.length
    : null;
 const shopifySelectedCount = selectedIds.length;
  const handleIntentOpenChange = (open: boolean) => {
    if (!open) setIntent(null);
  };  

  return (
    <>
      {presentation && (
        <PresentationTargetStrip
          presentationName={presentation.name}
          selectedCount={selectedIds.length}
          createdCount={shopifySelectedCount}
          artPairing={pairedGarmentCount}
          addedCount={selectedIds.length === 0 ? addedCount : null}
          dockRect={dockRect}
          onAdd={addSelectedToPresentation}
          onOpen={openPresentation}
          onDone={openPresentation}
        />
      )}
    <section
      data-products-page
      aria-label={t('page.title')}
      className={cn(
        'mf-root flex min-w-0 bg-mf-bg p-1 font-catalog text-mf-ink [letter-spacing:0] [&_button]:cursor-pointer [&_button:disabled]:cursor-default px-6',
        // The drawer stacks the results above its footer; the page puts the rail beside them.
        picker ? 'flex-col' : 'items-start max-[1240px]:flex-col',
        // `utx-railed` also lays out the card grid, so the drawer keeps it; only the rail itself is dropped.
        'utx-railed',
        !picker && 'pb-44',
        compact && 'dens-k',
        !picker && !railOpen && 'utx-rail-closed',
      )}
    >
      <div className="utx-main-col min-w-0 flex-1 pr-[22px] max-[1240px]:order-2 max-[1240px]:w-full max-[1240px]:pr-0">
        {fromDraft && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-mf-border p-3 text-sm">
            <span>{t('draftPicker.context')}</span>
            <button
              type="button"
              className="underline"
              onClick={() =>
                void navigate(
                  (() => {
                    const returnParams = new URLSearchParams({
                      [SEARCH_PARAMS.step]: DRAFT_STEP_PRODUCTS,
                      [SEARCH_PARAMS.resume]: FLAG_ON,
                    });
                    const draftId = searchParams.get(SEARCH_PARAMS.draftId);
                    if (draftId) returnParams.set(SEARCH_PARAMS.draftId, draftId);
                    return `${ROUTES.draftOrdersNew}?${returnParams}`;
                  })(),
                )
              }
            >
              {t('draftPicker.return')}
            </button>
          </div>
        )}
        <ProductToolbar
          model={model}
          searchParams={searchParams}
          onSetValues={setValues}
          onToggleFacet={toggleFacet}
          onSelectSuggestedFilter={selectSuggestedFilter}
          onReset={reset}
          onProductSelect={(product) => showDetail(product, 'quick')}
        />
        <ProductResults
          model={model}
          pending={pending}
          compact={compact}
          selected={selected}
          selectionCandidates={selectionCandidates}
          allCandidatesSelected={allCandidatesSelected}
          onToggleSelectAll={toggleSelectAll}
          onToggleProduct={toggle}
          onView={showDetail}
          onSetValues={setValues}
          onReset={reset}
        />
      </div>
      {!picker && (
        <ProductRail
          model={model}
          railOpen={railOpen}
          onRailOpenChange={setRailOpen}
          showBooks={showBooks}
          onShowBooksChange={setShowBooks}
          onIntent={setIntent}
        />
      )}
      {picker && (
        <div className="sticky bottom-0 z-10 -mx-6 mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-mf-border bg-mf-surface px-6 py-3">
          {picker.error && (
            <p role="alert" className="m-0 mr-auto text-sm text-[#A02020]">
              {picker.error}
            </p>
          )}
          <button
            type="button"
            onClick={picker.onCancel}
            className="inline-flex min-h-10 items-center rounded-[10px] border border-[#D7D7DA] bg-white px-4 text-[13px] font-medium"
          >
            {t('picker.cancel')}
          </button>
          <button
            type="button"
            disabled={!selectedIds.length || picker.confirming}
            onClick={() => picker.onConfirm(selectedIds)}
            className="inline-flex min-h-10 items-center rounded-[10px] border border-[#1A1A1A] bg-[#1A1A1A] px-5 text-[13.5px] font-medium text-white hover:bg-[#303030] disabled:cursor-not-allowed disabled:border-[#D7D7DA] disabled:bg-[#D7D7DA] disabled:text-[#5C5C61]"
          >
            {picker.confirmLabel?.(selectedIds.length) ??
              t('picker.add', {count: selectedIds.length})}
          </button>
        </div>
      )}
      {!picker && selectedIds.length > 0 && (
        <SelectionDock
          count={selectedIds.length}
          onReview={() => setReviewOpen(true)}
          onClear={clear}
          onIntent={setIntent}
        />
      )}
      <ProductDialogs
        model={model}
        savedCollections={savedCollections}
        presentationCustomers={presentationCustomers}
        detail={detail}
        onDetailOpenChange={handleDetailOpenChange}
        selected={selected}
        onToggleProduct={toggle}
        onClear={clear}
        intent={intent}
        onIntentOpenChange={handleIntentOpenChange}
        onAddToDraft={addSelectedProductsToDraft}
        onAddProductToDraft={(productId) =>
          addSelectedProductsToDraft([productId])
        }
        selectedIds={selectedIds}
        reviewOpen={reviewOpen}
        onReviewOpenChange={setReviewOpen}
        onOpenCatalog={(catalogName) => setValues({col: catalogName})}
        onShowAtp={(product) => showDetail(product, 'atp')}
        onSelectColorway={(product) => showDetail(product, 'quick')}
        atp={
          atpFetcher.state === 'idle' && detail?.product.type === 'garment'
            ? (atpFetcher.data ?? null)
            : null
        }
        atpLoading={
          detail?.product.type === 'garment' &&
          (atpFetcher.state !== 'idle' || !atpFetcher.data)
        }
        actionUrl={PRODUCTS_ROUTE}
      />
    </section>
    </>
  );
}
