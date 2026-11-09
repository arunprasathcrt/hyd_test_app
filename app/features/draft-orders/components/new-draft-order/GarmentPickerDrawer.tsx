import {useMemo, useState} from 'react';
import {LoaderCircle} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {
  createSearchParams,
  useFetcher,
  type SetURLSearchParams,
} from 'react-router';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {CloseIcon} from '../icons/CloseIcon';
import {z} from 'zod';
import type {loader as productListLoader} from '~/routes/productList';
import {ProductListing} from '~/features/products/components/ProductListing';
import {catalogModel} from '~/features/products/lib/catalog';
import {
  FLAG_ON,
  PRODUCT_VIEW_ART,
  PRODUCT_VIEW_GARMENT,
  ROUTES,
  SEARCH_PARAMS,
} from '~/shared/constants/routes';
import {
  catalogArtSchema,
  draftProductSchema,
  type CatalogArt,
  type DraftProduct,
} from '../../schemas/draft-product.schema';

export type GarmentDrawerMode = 'newBundle' | 'addGarment' | 'art';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: GarmentDrawerMode;
  /** The line this opens for: "Line 3" in the header. */
  lineNumber: number;
  cardNumber?: number;
  brand?: string;
  /** Brands the catalog is limited to: the card's brand, or the order's Step 1 brands. */
  brands?: string[];
  /** Art mode: the line's garment, "Gameday HW Motion Polo UM7410", for the header. */
  garmentLabel?: string;
  initialQuery?: string;
  onAdd: (products: DraftProduct[]) => void;
  /** Art mode: the marks Quick pick adds to the line. */
  onAddArts?: (arts: CatalogArt[]) => void;
}

const addedProductsSchema = z.object({
  selectedProducts: z.array(draftProductSchema),
});

const addedArtsSchema = z.object({
  selectedArts: z.array(catalogArtSchema),
});

const BRAND_PARAM = SEARCH_PARAMS.brand;

const startParams = (view: string) =>
  new URLSearchParams({[SEARCH_PARAMS.view]: view});

/**
 * Keeps the Brand facet inside the allowed brands: a narrower pick stays,
 * anything else (none, or a brand outside the order) falls back to all of them.
 */
function scopeBrands(params: URLSearchParams, allowedBrands: string[]) {
  if (!allowedBrands.length) return;
  const pickedBrands = params
    .getAll(BRAND_PARAM)
    .filter((pickedBrand) => allowedBrands.includes(pickedBrand));
  params.delete(BRAND_PARAM);
  (pickedBrands.length ? pickedBrands : allowedBrands).forEach((brandName) =>
    params.append(BRAND_PARAM, brandName),
  );
}

/**
 * Prototype `#cd116` — the garment catalog in a right-hand drawer. It is the
 * Products page itself (`ProductListing`: the chips, More filters, the grid),
 * so the only things that differ are the header and the footer. The filters
 * live in this component's state instead of the URL, and each change loads
 * the Products route's data, exactly as the page does.
 */
export function GarmentPickerDrawer({
  open,
  onOpenChange,
  mode,
  lineNumber,
  cardNumber,
  brand,
  brands,
  garmentLabel,
  initialQuery = '',
  onAdd,
  onAddArts,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const catalog = useFetcher<typeof productListLoader>();
  const allowedBrands = brand ? [brand] : (brands ?? []);
  // Quick pick browses the Products page's art view; the garment drawers browse garments.
  const view = mode === 'art' ? PRODUCT_VIEW_ART : PRODUCT_VIEW_GARMENT;
  const [params, setParams] = useState(() => {
    const initial = startParams(view);
    if (initialQuery.trim()) initial.set('q', initialQuery.trim());
    scopeBrands(initial, allowedBrands);
    return initial;
  });
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const text = (key: string, options?: Record<string, unknown>) =>
    t(`newDraftOrder.garmentDrawer.${key}`, options);

  const loadCatalog = (next: URLSearchParams) => {
    const query = new URLSearchParams(next);
    query.set(SEARCH_PARAMS.picker, FLAG_ON);
    void catalog.load(`${ROUTES.productList}?${query}`);
  };

  // Same signature as the router's `setSearchParams`, so the listing doesn't care where it is.
  const setCatalogParams: SetURLSearchParams = (init) => {
    const resolved = typeof init === 'function' ? init(params) : init;
    const next = createSearchParams(resolved);
    next.set(SEARCH_PARAMS.view, view);
    scopeBrands(next, allowedBrands);
    setParams(next);
  };

  // The load returns the drawer's whole collection, so search and filters are
  // computed here instead of re-fetching it on every change.
  const model = useMemo(
    () =>
      catalog.data
        ? {...catalog.data, ...catalogModel(catalog.data.records, params)}
        : null,
    [catalog.data, params],
  );

  async function addPicked(ids: string[]) {
    setConfirming(true);
    setFailed(false);
    try {
      const query = new URLSearchParams();
      ids.forEach((id) => query.append(SEARCH_PARAMS.productId, id));
      if (mode === 'art') {
        const response = await fetch(`${ROUTES.draftOrdersNewArts}?${query}`);
        if (!response.ok) throw new Error('add failed');
        const {selectedArts} = addedArtsSchema.parse(await response.json());
        onAddArts?.(selectedArts);
      } else {
        const response = await fetch(`${ROUTES.draftOrdersNewProducts}?${query}`);
        if (!response.ok) throw new Error('add failed');
        const {selectedProducts} = addedProductsSchema.parse(
          await response.json(),
        );
        onAdd(selectedProducts);
      }
      onOpenChange(false);
    } catch {
      setFailed(true);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[170] bg-[rgba(17,17,19,.32)]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onSubmit={(event) => event.stopPropagation()}
          // Load the catalog the first time the drawer opens.
          onOpenAutoFocus={() => {
            if (!catalog.data) loadCatalog(params);
          }}
          className="fixed inset-y-0 right-0 z-[175] flex w-[min(1200px,calc(100vw-33px))] flex-col overflow-hidden rounded-l-[18px] border-l border-[#ECECEE] bg-white shadow-[-24px_0_60px_-18px_rgba(17,17,19,.22)]"
        >
          {/* `.cd116-h` */}
          <header className="flex flex-none items-start gap-4 border-b border-[#ECECEE] bg-white py-5 pr-4 pl-6 max-[759.98px]:py-4 max-[759.98px]:pr-3 max-[759.98px]:pl-4">
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-2 text-xs leading-normal font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                <i
                  aria-hidden="true"
                  className="size-[7px] rounded-full bg-[#111113]"
                />
                {mode === 'art'
                  ? text('artLibrary')
                  : mode === 'addGarment'
                    ? text('catalog')
                    : text('line', {number: lineNumber})}
              </span>
              <DialogPrimitive.Title className="m-0 mt-0.5 text-[20px] leading-[1.3] font-semibold tracking-[-0.015em] text-[#111113]">
                {text(`${mode}.title`)}
              </DialogPrimitive.Title>
              <p className="m-0 mt-0.5 truncate text-[13px] leading-normal text-[#5C5C61]">
                {mode === 'art'
                  ? text('art.sub', {number: lineNumber, garment: garmentLabel})
                  : text(`${mode}.sub`, {number: cardNumber, brand})}
              </p>
            </div>
            {mode === 'art' && brand && (
              <span className="mt-1 inline-flex min-h-8 flex-none items-center rounded-full bg-[#F3F3F4] px-3.5 text-xs font-medium text-[#5C5C61]">
                {text('artTag', {brand})}
              </span>
            )}
            <DialogPrimitive.Close
              aria-label={text('close')}
              className="inline-grid size-10 flex-none place-items-center rounded-full border border-[#ECECEE] bg-white text-[#111113] transition-colors hover:border-[#D7D7DA] hover:bg-[#F3F3F4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
            >
              <CloseIcon size={18} />
            </DialogPrimitive.Close>
          </header>
          {/* The Products page, in the drawer */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {model ? (
              <ProductListing
                model={model}
                pending={catalog.state !== 'idle'}
                presentation={null}
                savedCollections={[]}
                presentationCustomers={[]}
                picker={{
                  searchParams: params,
                  setSearchParams: setCatalogParams,
                  onConfirm: (ids) => void addPicked(ids),
                  onCancel: () => onOpenChange(false),
                  error: failed
                    ? text(mode === 'art' ? 'artAddFailed' : 'addFailed')
                    : null,
                  confirming,
                  confirmLabel:
                    mode === 'art'
                      ? () => text('addToLine', {number: lineNumber})
                      : mode === 'addGarment'
                        ? (count) =>
                            text('addToCard', {count, number: cardNumber})
                        : undefined,
                }}
              />
            ) : (
              <div
                role="status"
                className="grid min-h-[320px] place-items-center text-[13px] text-[#5C5C61]"
              >
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
                  {text('loading')}
                </span>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
