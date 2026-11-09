import {useTranslation} from 'react-i18next';
import {BookOpen, ChevronRight, Layers, Plus, Printer} from 'lucide-react';
import type {CatalogModel} from '../lib/catalog';
import type {CatalogBook, CatalogMutation} from '../schemas/product.schema';
import {Button, cn} from '../../../shared/components/product';

interface ProductRailProps {
  model: CatalogModel & {books: CatalogBook[]};
  railOpen: boolean;
  onRailOpenChange: (open: boolean) => void;
  showBooks: boolean;
  onShowBooksChange: (show: boolean) => void;
  onIntent: (intent: CatalogMutation['intent']) => void;
}

export function ProductRail({
  model,
  railOpen,
  onRailOpenChange,
  showBooks,
  onShowBooksChange,
  onIntent,
}: ProductRailProps) {
  const {t} = useTranslation('products');
  return (
    <aside
      data-catalog-rail
      className={cn(
        'utx-rail sticky top-0 z-10 mt-2 flex h-[calc(100dvh-64px)] shrink-0 flex-col overflow-hidden border-l border-mf-line bg-mf-surface max-[1240px]:static max-[1240px]:order-1 max-[1240px]:mb-1.5 max-[1240px]:h-auto max-[1240px]:w-full max-[1240px]:border-b max-[1240px]:border-l-0 max-[1240px]:bg-transparent',
        railOpen ? 'w-[332px] min-[1700px]:w-[368px]' : 'w-14',
      )}
    >
      <div className="utx-rail-h flex items-center justify-between gap-2 border-b border-mf-line py-2.5 pl-[18px] pr-3.5 max-[1240px]:px-1">
        {railOpen && (
          <span className="k truncate text-[11px] font-bold uppercase text-mf-gold-deep">
            {t('page.title')}
          </span>
        )}
        <Button
          variant="outline"
          size="icon"
          aria-expanded={railOpen}
          aria-controls="products-panel"
          aria-label={t(railOpen ? 'page.collapse' : 'page.expand')}
          title={t(railOpen ? 'page.collapse' : 'page.expand')}
          onClick={() => onRailOpenChange(!railOpen)}
        >
          <ChevronRight size={16} className={railOpen ? '' : 'rotate-180'} />
        </Button>
      </div>
      {railOpen ? (
        <div
          id="products-panel"
          className="utx-rail-b flex min-h-0 flex-col gap-3.5 overflow-y-auto px-[18px] pb-[22px] pt-3.5 max-[1240px]:grid max-[1240px]:grid-cols-2 max-[1240px]:gap-x-6 max-[700px]:grid-cols-1"
        >
          <header className="utx-cat-head flex flex-col gap-2.5">
            <h1 className="font-editorial text-2xl leading-[1.1]">
              {t('page.title')}
            </h1>
            <p className="text-[12.5px] leading-[1.45] text-mf-ink-3 max-[700px]:hidden">
              {t('page.subtitle')}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                className="col-span-2 min-h-11 text-[13.5px]"
                onClick={() => onIntent('draft')}
              >
                {t('rail.newDraft')}
              </Button>
              <Button
                variant="outline"
                className="px-2 text-xs"
                disabled
                onClick={() => onIntent('collection')}
              >
                {t('rail.newCollection')}
              </Button>
              <Button
                variant="outline"
                className="px-2 text-xs cursor-pointer"
                onClick={() => onIntent('presentation')}
              >
                {t('rail.newPresentation')}
              </Button>
              <Button
                variant="outline"
                className="col-span-2 text-xs"
                disabled
                onClick={() => window.print()}
              >
                <Printer size={14} />
                {t('rail.print')}
              </Button>
            </div>
          </header>
          <section className="border-t border-mf-line pt-3.5">
            <h2 className="mb-2 text-[11px] font-bold uppercase text-mf-ink-3">
              {t('rail.collections')}
            </h2>
            <p className="text-xs leading-[1.45] text-mf-ink-3">
              {t('rail.empty')}
            </p>
          </section>
          <section className="border-t border-mf-line pt-3.5 max-[1240px]:col-span-2 max-[700px]:col-span-1">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
              <h2 className="text-[11px] font-bold uppercase text-mf-ink-3">
                {t('rail.catalogs', {count: model.books.length})}
              </h2>
              <Button
                variant="ghost"
                size="small"
                className="min-h-6 p-0 text-[11px] text-mf-gold-deep"
                disabled
                onClick={() => onShowBooksChange(!showBooks)}
              >
                {t(showBooks ? 'rail.showLess' : 'rail.showAll')}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2.5 max-[1240px]:grid-cols-6 max-[700px]:grid-cols-4">
              {model.books.slice(0, showBooks ? undefined : 6).map((book) => (
                <div
                  key={book.id}
                  aria-disabled="true"
                  tabIndex={-1}
                  className="group pointer-events-none min-w-0 rounded-md opacity-50"
                  title={t('rail.pdf')}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    loading="lazy"
                    width={90}
                    height={120}
                    className="aspect-[3/4] w-full rounded-md object-cover shadow-mf-1 transition-transform group-hover:-translate-y-0.5 motion-reduce:transform-none"
                  />
                  <span className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-tight text-mf-ink">
                    {book.title}
                  </span>
                </div>
              ))}
              {!showBooks && model.books.length > 6 && (
                <Button
                  variant="outline"
                  className="aspect-[3/4] h-auto flex-col rounded-md px-1 text-[10px]"
                  disabled
                  onClick={() => onShowBooksChange(true)}
                >
                  <BookOpen size={18} />
                  <b className="text-base">{model.books.length - 6}</b>
                  {t('rail.more')}
                </Button>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="utx-rail-mini flex flex-col items-center gap-2.5 px-2 py-3.5 max-[1240px]:hidden">
          <Button
            size="icon"
            aria-label={t('rail.newDraft')}
            title={t('rail.newDraft')}
            onClick={() => onIntent('draft')}
          >
            <Plus size={18} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label={t('rail.collections')}
            title={t('rail.collections')}
            onClick={() => onRailOpenChange(true)}
          >
            <Layers size={18} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label={t('rail.catalogTitle')}
            title={t('rail.catalogTitle')}
            onClick={() => {
              onRailOpenChange(true);
              onShowBooksChange(true);
            }}
          >
            <BookOpen size={18} />
          </Button>
        </div>
      )}
    </aside>
  );
}
