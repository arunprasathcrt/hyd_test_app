import {useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Eye, ImageOff} from 'lucide-react';
import type {Product} from '../schemas/product.schema';
import {Checkbox, cn} from '../../../shared/components/product';
import {Button} from '../../../shared/components/ui/Button';

export function ProductImage({
  product,
  eager = false,
  className,
}: {
  product: Product;
  eager?: boolean;
  className?: string;
}) {
  const {t} = useTranslation('products');
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div
      className="flex aspect-square items-center justify-center bg-mf-surface-2 text-mf-ink-3"
      role="img"
      aria-label={t('card.missingImage')}
    >
      <ImageOff size={32} />
    </div>
  ) : (
    <img
      src={product.image}
      alt={product.name}
      width={400}
      height={400}
      loading={eager ? 'eager' : 'lazy'}
      className={cn(
        'aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.045] motion-reduce:transform-none',
        product.type === 'art' && 'object-contain p-3.5',
        className,
      )}
      onError={() => setFailed(true)}
    />
  );
}
export function ProductCard({
  product,
  selected,
  compact,
  onToggle,
  onView,
  eager,
}: {
  product: Product;
  selected: boolean;
  compact: boolean;
  onToggle: () => void;
  onView: (mode: 'quick' | 'atp') => void;
  eager: boolean;
}) {
  const {t} = useTranslation('products');
  const availabilityColor =
    product.availability === 'Ready Now'
      ? 'bg-mf-green'
      : product.availability === 'In Stock'
        ? 'bg-mf-gold'
        : product.availability === '6-Week Lead'
          ? 'bg-mf-lead'
          : 'bg-mf-ink-3';
  return (
    <article
      data-product-card
      className={cn(
        'mf-card group relative flex min-w-0 flex-col overflow-hidden rounded-mf-lg border border-mf-border bg-mf-surface shadow-mf-1 transition duration-200 hover:-translate-y-1 hover:shadow-mf-3 motion-reduce:transform-none',
        product.type === 'art' && 'art',
        selected && 'sel border-mf-gold ring-2 ring-mf-gold',
      )}
    >
      <div className="mf-card-img relative aspect-square overflow-hidden bg-mf-surface-2">
        <Button
          type="button"
          variant="ghost"
          shape="square"
          aria-label={t('card.select', {name: product.name})}
          aria-pressed={selected}
          onClick={onToggle}
          className="p-0 overflow-hidden size-full"
        >
          <ProductImage product={product} eager={eager} />

          {product.reorder && (
            <span className="pointer-events-none absolute bottom-2.5 right-2.5 z-[2] grid size-11 place-items-center overflow-hidden rounded-[10px] border border-mf-border-2 bg-white shadow-mf-1">
              {product.reorder.artImage}
            </span>
          )}
        </Button>
        <Checkbox
          aria-label={t('card.select', {name: product.name})}
          checked={selected}
          onCheckedChange={onToggle}
          className="absolute left-[11px] top-[11px] size-6 rounded-mf-sm bg-mf-surface/95 max-sm:size-8"
        />
        <div className="pointer-events-none absolute right-[11px] top-[11px] flex flex-col items-end gap-[5px] text-[9.5px] font-bold uppercase">
          {product.reorder && (
            <span className="rounded-mf-pill bg-mf-primary px-2 py-[3px] text-white">
              {t('views.bundles')}
            </span>
          )}
          {product.isLicensed && (
            <span className="rounded-mf-pill bg-mf-teal px-2 py-[3px] text-white">
              {t('card.licensed')}
            </span>
          )}
          {product.recencyScore >= 5 && (
            <span className="rounded-mf-pill bg-mf-gold px-2 py-[3px] text-white">
              {t('card.new')}
            </span>
          )}
          {product.type === 'art' && (
            <span className="rounded-mf-pill bg-mf-ink/75 px-2 py-[3px] text-white">
              {t('card.art')}
            </span>
          )}
        </div>
        {product.availability && (
          <span className="pointer-events-none absolute bottom-[11px] left-[11px] flex items-center gap-[5px] rounded-mf-pill bg-mf-surface/95 py-[3px] pl-[7px] pr-[9px] text-[10px] font-semibold text-mf-ink-2">
            <i className={cn('size-[7px] rounded-full', availabilityColor)} />
            {product.availability}
          </span>
        )}
        <div className="absolute bottom-11 right-2 flex gap-1 opacity-100 transition-opacity min-[1100px]:opacity-0 min-[1100px]:group-hover:opacity-100 min-[1100px]:group-focus-within:opacity-100">
          <Button
            type="button"
            variant="default"
            size="icon"
            aria-label={t('card.quickView')}
            title={t('card.quickView')}
            onClick={() => onView('quick')}
          >
            <Eye aria-hidden="true" size={14} />
          </Button>
          {product.type !== 'art' && (
            <Button
              size="xs"
              shape="pill"
              title={t('card.atpTitle')}
              aria-label={t('card.atpTitle')}
              onClick={() => onView('atp')}
            >
              {t('card.atp')}
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 px-3.5 pb-[15px] pt-3">
        <span className="truncate text-[10px] font-bold uppercase text-mf-ink-3">
          {product.brand}
        </span>
        <Button
          type="button"
          variant="ghost"
          shape="square"
          onClick={() => onView('quick')}
          className={cn(
            'justify-start min-h-0 p-0 text-left text-sm font-semibold leading-[1.3] text-mf-ink hover:bg-transparent hover:text-mf-ink',
            compact && 'text-[12.5px]',
          )}
        >
          {product.reorder
            ? t('card.reorderName', {
                art: product.reorder.artName,
                garment: product.reorder.garmentName,
              })
            : product.name}
        </Button>

        {!compact && (
          <>
            <p className="mt-px text-xs text-mf-ink-3">
              {product.reorder ? (
                t('card.reorderSubtitle', {
                  placement: product.reorder.placement,
                  method: product.reorder.method,
                })
              ) : product.type === 'garment' && product.styleCode ? (
                product.gender && product.garmentType ? (
                  <Trans
                    t={t}
                    i18nKey="card.subtitleWithCode"
                    values={{
                      gender: product.gender,
                      type: product.garmentType,
                      code: product.styleCode,
                    }}
                    components={{bold: <strong className="font-bold" />}}
                  />
                ) : (
                  <Trans
                    t={t}
                    i18nKey="card.subtitleCodeOnly"
                    values={{code: product.styleCode}}
                    components={{bold: <strong className="font-bold" />}}
                  />
                )
              ) : product.type === 'garment' ? (
                t('card.subtitle', {
                  gender: product.gender,
                  type: product.garmentType,
                  sku: product.sku,
                })
              ) : (
                product.sku
              )}
            </p>
            {product.colorName && (
              <div className="mt-[9px] flex items-center gap-1 text-[10.5px] text-mf-ink-3">
                <svg width="13" height="13" aria-hidden="true">
                  <circle
                    cx="6.5"
                    cy="6.5"
                    r="6"
                    fill={product.colorHex || 'var(--mf-border)'}
                    stroke="var(--mf-border-2)"
                  />
                </svg>
                <span>{product.colorName}</span>
              </div>
            )}
            {product.placementCodes.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1 text-[11px] text-mf-ink-3">
                <span aria-hidden="true" className="flex gap-[3px]">
                  {[0, 1, 2].map((dot) => (
                    <i
                      key={dot}
                      className="size-[5px] rounded-full bg-mf-gold-line"
                    />
                  ))}
                </span>
                {t('card.placements', {count: product.placementCodes.length})}
              </div>
            )}
          </>
        )}
        <div className="mt-auto flex items-end justify-between gap-1 pt-3">
          <div className="text-base font-bold tabular-nums text-mf-ink">
            {product.price !== null ? (
              <>
                <span className="mr-[3px] text-[10.5px] font-medium text-mf-ink-3">
                  {t('card.from')}
                </span>
                {t('card.price', {value: product.price})}
              </>
            ) : (
              <span className="rounded-mf-pill bg-mf-teal-soft px-2 py-1 text-[11px] text-mf-teal">
                {product.tier}
              </span>
            )}
          </div>
          {product.moq !== null && product.moq > 0 && (
            <div className="shrink-0 text-[11px] text-mf-ink-3">
              {t('card.moq')}{' '}
              <b className="font-semibold text-mf-ink-2">{product.moq}</b>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
