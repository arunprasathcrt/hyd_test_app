import {useTranslation} from 'react-i18next';
import {X} from 'lucide-react';
import type {CatalogModel, FacetKey} from '../lib/catalog';
import type {CatalogBook, Product} from '../schemas/product.schema';
import {Button, cn, BrandLogo} from '../../../shared/components/product';
import {CatalogSearch} from '../forms/CatalogForms';
import {CatalogFilters, FacetValue} from './CatalogFilter';
import {SORTS, VIEWS} from '../lib/catalog';

/** Known brand marks — see `BrandLogo`. An unmapped vendor renders without one. */
const BRAND_LOGO_CLASSES: Record<string, string> = {
  'Under Armour': 'ua',
  Champion: 'ch',
  Lululemon: 'lu',
  Gear: 'gs',
};

/** Fixed display order for the brand chip row; unlisted vendors follow, alphabetically. */
const BRAND_ORDER = ['Under Armour', 'Champion', 'Lululemon', 'Gear'];

interface ProductToolbarProps {
  model: CatalogModel & {
    books: CatalogBook[];
    viewLabels?: Partial<Record<(typeof VIEWS)[number], string>>;
  };
  searchParams: URLSearchParams;
  onSetValues: (updates: Record<string, string | null>) => void;
  onToggleFacet: (key: FacetKey, value: string) => void;
  onSelectSuggestedFilter: (key: FacetKey, value: string) => void;
  onReset: () => void;
  onProductSelect: (product: Product) => void;
}

export function ProductToolbar({
  model,
  searchParams,
  onSetValues,
  onToggleFacet,
  onSelectSuggestedFilter,
  onReset,
  onProductSelect,
}: ProductToolbarProps) {
  const {t} = useTranslation('products');
  const isActive = (key: FacetKey, value: string) =>
    model.facets
      .find((facet) => facet.key === key)
      ?.options.some((option) => option.value === value && option.selected) ??
    false;
  const brandFacet = model.facets.find((facet) => facet.key === 'brand');
  const selectedBrand = brandFacet?.options.find(
    (option) => option.selected,
  )?.value;
  // Live per-brand counts come straight from the generic facet aggregation
  // in `catalogModel` — no separate brand-counting call needed.
  const brandTiles = (brandFacet?.options ?? [])
    .map((option) => ({
      value: option.value,
      count: option.count,
      logo: BRAND_LOGO_CLASSES[option.value] ?? '',
    }))
    .sort((a, b) => {
      const left = BRAND_ORDER.indexOf(a.value);
      const right = BRAND_ORDER.indexOf(b.value);
      if (left === -1 && right === -1) return a.value.localeCompare(b.value);
      if (left === -1) return 1;
      if (right === -1) return -1;
      return left - right;
    });
  const searchBelowFilters =
    model.query.view === 'garment' || model.query.view === 'bundles';

  return (
    <>
      <div
        data-catalog-controls
        className="mf-bar utx-banded sticky top-0 z-20 flex flex-col gap-2 border-b border-mf-border bg-mf-bg px-1 pb-2.5 pt-3.5 max-[700px]:static"
      >
        <div className="mf-tb0 mb-0.5 flex items-center gap-3 overflow-hidden border-b border-mf-line pb-1.5">
          <span className="k shrink-0 text-[11px] font-bold uppercase text-mf-gold-deep">
            {t('brands.heading')}
          </span>
          <div
            id="mfBrands"
            role="group"
            aria-label={t('brands.heading')}
            className="mf-brands flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5"
          >
            <button
              type="button"
              data-brand-tile="__all__"
              onClick={() => onSetValues({brand: null})}
              aria-pressed={!selectedBrand}
              className={cn(
                'mf-bt flex min-h-[68px] min-w-[116px] shrink-0 flex-col items-start justify-center rounded-mf-md border border-mf-border-2 bg-mf-surface px-4 py-2 text-left shadow-mf-1 transition-colors hover:border-mf-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mf-primary',
                !selectedBrand &&
                  'on border-mf-primary bg-mf-primary text-white',
              )}
            >
              <span className="nm text-[13.5px] font-bold leading-tight">
                {t('brands.all')}
              </span>
              <span className="ct mt-1 text-[11px] font-medium opacity-70">
                {t('brands.styles', {count: model.counts.all})}
              </span>
            </button>
            {brandTiles.map((brand) => (
              <button
                type="button"
                key={brand.value}
                data-brand-tile={brand.value}
                data-lg="1"
                title={brand.value}
                aria-label={`${brand.value} · ${t('brands.styles', {count: brand.count})}`}
                onClick={() => onSetValues({brand: brand.value})}
                aria-pressed={isActive('brand', brand.value)}
                className={cn(
                  'mf-bt has-lg flex min-h-[68px] min-w-[134px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-mf-md border border-mf-border-2 bg-mf-surface px-4 py-1.5 shadow-mf-1 transition-colors hover:border-mf-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mf-primary',
                  isActive('brand', brand.value) && 'on border-mf-primary',
                )}
              >
                <BrandLogo
                  name={brand.value}
                  className={`utx-lg ${brand.logo} flex h-6 w-full items-center justify-center [&_svg]:block [&_svg]:max-h-full [&_svg]:max-w-full`}
                />
                <span className="nm text-[12px] font-semibold leading-tight">
                  {brand.value}
                </span>
                <span className="ct text-[11px] font-medium opacity-70">
                  {t('brands.styles', {count: brand.count})}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="mf-tb1 flex flex-wrap items-center gap-2.5">
          <div className="min-w-0 flex-[1_1_auto]">
            <CatalogFilters
              model={model}
              onToggle={onToggleFacet}
              onClear={(key) => onSetValues({[key]: null})}
              onPrice={(min, max) =>
                onSetValues({min: String(min), max: String(max)})
              }
              onReset={onReset}
            />
          </div>
          <div
            className={cn(
              'mf-tb1r flex min-w-0 items-center gap-2 max-[1080px]:ml-0 max-[1080px]:min-w-0 max-[1080px]:flex-[1_1_100%]',
              searchBelowFilters
                ? 'ml-0 flex-[1_1_100%]'
                : 'ml-auto min-w-[300px] flex-[1_1_420px]',
            )}
          >
            <CatalogSearch
              query={model.query.q}
              onSearch={(q) => onSetValues({q: q || null})}
              products={model.products}
              facets={model.facets}
              onProductSelect={(product) => onProductSelect(product)}
              onFilterSelect={onSelectSuggestedFilter}
            />
            <div className="mf-sortwrap relative shrink-0 max-[450px]:w-full">
              <select
                aria-label={t('sorts.label')}
                value={model.query.sort}
                onChange={(event) => onSetValues({sort: event.target.value})}
                className="h-10 max-w-full appearance-none rounded-mf-pill border border-mf-border-2 bg-mf-surface py-0 pl-4 pr-[38px] text-[13px] font-medium focus-visible:outline-2 focus-visible:outline-mf-primary max-[450px]:w-full"
              >
                {SORTS.map((sort) => (
                  <option key={sort} value={sort}>
                    {t(`sorts.${sort}`)}
                  </option>
                ))}
              </select>
              <span aria-hidden="true" className="pointer-events-none absolute right-[15px] top-1/2 size-[7px] -translate-y-[70%] rotate-45 border-b-2 border-r-2 border-mf-ink-3" />
            </div>
          </div>
        </div>
        <div className="mf-tb2 flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label={t('views.label')}
            className="mf-seg flex max-w-full gap-0.5 overflow-x-auto rounded-mf-pill border border-mf-border-2 bg-mf-surface-2 p-[3px]"
          >
            {VIEWS.map((view) => (
              <Button
                key={view}
                variant="ghost"
                size="small"
                aria-pressed={model.query.view === view}
                onClick={() => onSetValues({view})}
                className={cn(
                  'gap-[7px] px-[15px] py-2 text-[13px] font-semibold',
                  model.query.view === view &&
                    'bg-mf-surface text-mf-ink shadow-mf-1',
                )}
              >
                <span>{model.viewLabels?.[view] ?? t(`views.${view}`)}</span>
                {model.counts[view] !== null && (
                  <span className="text-[11px] text-mf-ink-3">
                    {model.counts[view]}
                  </span>
                )}
              </Button>
            ))}
          </div>
          <div className="mf-tb2r ml-auto flex items-center gap-2">
            <span className="whitespace-nowrap text-[13px] text-mf-ink-2">
              {model.query.view === 'bundles'
                ? t('results.reorders', {count: model.total})
                : t('results.of', {
                    count: model.total,
                    total: model.scopeTotal,
                  })}
            </span>
            {model.filterCount > 0 && (
              <Button size="small" onClick={onReset}>
                {t('filters.count', {count: model.filterCount})}
                <X size={12} />
                {t('filters.clear')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="small"
              className="text-mf-gold-deep"
              onClick={onReset}
            >
              {t('filters.reset')}
            </Button>
          </div>
        </div>
      </div>
      {model.filterCount > 0 && (
        <div
          data-catalog-controls
          className="flex flex-wrap gap-2 px-1 pb-0.5 pt-3"
        >
          {model.facets.flatMap((facet) =>
            facet.options.filter((option) => option.selected).map((option) => (
              <Button
                key={`${facet.key}-${option.value}`}
                variant="outline"
                size="small"
                className="gap-2 text-xs"
                onClick={() => onToggleFacet(facet.key, option.value)}
              >
                <span className="text-xs">
                  <span className="text-mf-ink-3">{t(facet.label)}:</span>
                  <FacetValue facetKey={facet.key} value={option.value} />
                </span>
                <X size={13} aria-label={t('filters.clear')} />
              </Button>
            )),
          )}
          {(model.query.min > 0 || model.query.max < 1000) && (
            <Button
              variant="outline"
              size="small"
              onClick={() => onSetValues({min: null, max: null})}
            >
              {t('filters.priceRange', {
                min: model.query.min,
                max: model.query.max,
              })}
              <X size={13} aria-label={t('filters.clear')} />
            </Button>
          )}
        </div>
      )}
    </>
  );
}
