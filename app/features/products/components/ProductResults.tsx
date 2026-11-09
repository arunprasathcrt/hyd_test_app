import {useTranslation} from 'react-i18next';
import {ArrowLeft, ArrowRight, Grid2X2, Grid3X3} from 'lucide-react';
import type {CatalogModel} from '../lib/catalog';
import type {CatalogBook, Product} from '../schemas/product.schema';
import {Button, cn} from '../../../shared/components/product';
import {ProductCard} from './ProductCard';

interface ProductResultsProps {
  model: CatalogModel & {books: CatalogBook[]};
  pending: boolean;
  compact: boolean;
  selected: Set<string>;
  selectionCandidates: string[];
  allCandidatesSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleProduct: (id: string) => void;
  onView: (product: Product, mode: 'quick' | 'atp') => void;
  onSetValues: (updates: Record<string, string | null>) => void;
  onReset: () => void;
}

export function ProductResults({
  model,
  pending,
  compact,
  selected,
  selectionCandidates,
  allCandidatesSelected,
  onToggleSelectAll,
  onToggleProduct,
  onView,
  onSetValues,
  onReset,
}: ProductResultsProps) {
  const {t} = useTranslation('products');
  return (
    <div aria-busy={pending} className="pt-3.5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="m-0 font-editorial text-[22px] font-semibold">
            {model.query.q
              ? `“${model.query.q}”`
              : t(`views.${model.query.view}`)}
          </h2>
          <span aria-live="polite" className="text-[13px] text-mf-ink-3">
            {pending
              ? t('page.loading')
              : model.query.view === 'bundles'
                ? t('results.reorderSummary', {count: model.total})
                : t('results.summary', {
                    results: t('results.count', {count: model.total}),
                    filters: t('filters.count', {count: model.filterCount}),
                  })}
          </span>
        </div>
        <div data-catalog-controls className="flex items-center gap-2">
          <Button
            variant="outline"
            size="small"
            disabled={selectionCandidates.length === 0 || pending}
            onClick={onToggleSelectAll}
          >
            {allCandidatesSelected
              ? t('results.deselect')
              : model.total <= 100
                ? t('results.selectAll', {count: model.total})
                : t('results.selectPage')}
          </Button>
          <div className="flex overflow-hidden rounded-mf-sm border border-mf-border-2">
            {(['compact', 'comfortable'] as const).map((density) => (
              <Button
                key={density}
                size="icon"
                variant={model.query.density === density ? 'default' : 'ghost'}
                className="size-8 rounded-none border-0"
                aria-pressed={model.query.density === density}
                aria-label={t(
                  density === 'compact' ? 'results.comfortable' : 'results.compact',
                )}
                title={t(
                  density === 'compact' ? 'results.comfortable' : 'results.compact',
                )}
                onClick={() => onSetValues({density})}
              >
                {density === 'compact' ? (
                  <Grid2X2 size={15} />
                ) : (
                  <Grid3X3 size={15} />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {model.total === 0 ? (
        <div className="px-5 py-[70px] text-center">
          <h3 className="font-editorial text-2xl">{t('results.none')}</h3>
          <p className="mb-[18px] mt-2 text-sm text-mf-ink-3">
            {t('results.hint')}
          </p>
          <Button onClick={onReset}>{t('results.reset')}</Button>
        </div>
      ) : (
        <div
          data-product-grid
          className={cn(
            'mf-grid grid gap-[18px] max-[700px]:grid-cols-2 max-[700px]:gap-3',
            compact
              ? 'min-[701px]:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]'
              : 'min-[701px]:grid-cols-[repeat(auto-fill,minmax(230px,1fr))]',
            pending && 'opacity-60',
          )}
        >
          {model.products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              compact={compact}
              selected={selected.has(product.id)}
              onToggle={() => onToggleProduct(product.id)}
              onView={(mode) => onView(product, mode)}
              eager={index < 4}
            />
          ))}
        </div>
      )}
      {model.totalPages > 1 && (
        <nav
          data-catalog-controls
          aria-label={t('results.page', {
            page: model.query.page,
            pages: model.totalPages,
          })}
          className="mt-6 flex items-center justify-center gap-4"
        >
          <Button
            size="icon"
            variant="outline"
            disabled={pending || model.query.page === 1}
            aria-label={t('results.previous')}
            onClick={() => onSetValues({page: String(model.query.page - 1)})}
          >
            <ArrowLeft size={16} />
          </Button>
          <span className="text-xs tabular-nums">
            {t('results.page', {
              page: model.query.page,
              pages: model.totalPages,
            })}
          </span>
          <Button
            size="icon"
            variant="outline"
            disabled={pending || model.query.page === model.totalPages}
            aria-label={t('results.next')}
            onClick={() => onSetValues({page: String(model.query.page + 1)})}
          >
            <ArrowRight size={16} />
          </Button>
        </nav>
      )}
    </div>
  );
}
