import * as DialogPrimitive from '@radix-ui/react-dialog';
import {useTranslation} from 'react-i18next';
import type {AtpTable} from '../schemas/atp.schema';
import type {Product} from '../schemas/product.schema';
import {Button} from '../../../shared/components/ui/Button';
import {ProductAtpTable} from './ProductAtpTable';
import {ProductAtpDisclosure} from './ProductAtpDisclosure';

export function AtpDrawer({
  product,
  table,
  loading,
  selected,
  open,
  onOpenChange,
  onToggle,
  onAddDraft,
}: {
  product: Product | null;
  table: AtpTable | null;
  loading: boolean;
  selected: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: () => void;
  onAddDraft: () => void;
}) {
  const {t} = useTranslation('products');
  if (!product) return null;

  const totalAvailable = table?.rows.reduce((total, row) => total + row.available, 0);

  const stockColor =
    product.availability === 'In Stock'
      ? 'bg-mf-gold'
      : product.availability === 'Ready Now'
        ? 'bg-mf-green'
        : product.availability === 'Preorder'
          ? 'bg-mf-ink-3'
          : 'bg-mf-lead';

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[180] bg-mf-ink/40" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="animate-[mfAtpIn_220ms_ease] fixed inset-y-0 right-0 z-[190] flex w-[min(430px,94vw)] flex-col overflow-hidden bg-mf-surface font-[Inter,system-ui,sans-serif] text-mf-ink shadow-[-18px_0_48px_rgba(20,19,15,0.22)]"
        >
          <header className="flex items-start justify-between border-b border-mf-border px-[22px] pb-3 pt-5">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-mf-gold-deep">
                {t('atp.title')}
              </span>
              <DialogPrimitive.Title asChild>
                <h2 className="mb-0.5 mt-[3px] font-[Playfair_Display,Georgia,serif] text-[19px] font-semibold leading-normal text-mf-ink">
                  {product.name}
                </h2>
              </DialogPrimitive.Title>
              <span className="text-xs text-mf-ink-3">
                {product.sku} · {product.brand}
                {product.colorName ? ` · ${product.colorName}` : ''}
              </span>
            </div>
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="iconClose"
                size="icon"
                shape="pill"
                aria-label={t('card.close')}
              >
                ×
              </Button>
            </DialogPrimitive.Close>
          </header>

          <section className="flex items-center gap-4 border-b border-mf-line px-[22px] py-[14px]">
            <img
              src={product.image}
              alt={product.name}
              width={72}
              height={72}
              loading="lazy"
              className="size-[72px] shrink-0 rounded-xl border border-mf-line bg-mf-surface-2 object-contain"
            />
            <div className="flex flex-col gap-0.5">
              <strong className="text-[28px] font-bold leading-none tabular-nums">
                {totalAvailable ?? t('detail.emptyValue')}
              </strong>
              <span className="text-[11.5px] text-mf-ink-3">
                {t('atp.unitsToday')}
              </span>
              <span className="mt-1.5 inline-flex w-fit items-center gap-[5px] rounded-full border border-mf-line bg-mf-surface-2 py-[3px] pl-[7px] pr-[9px] text-[10px] font-semibold text-mf-ink-2">
                <i className={`size-[7px] rounded-full ${stockColor}`} />
                {product.availability}
              </span>
            </div>
          </section>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[22px] pb-[18px] pt-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="m-0 text-[16px] font-semibold leading-[1.3] text-mf-ink">
                {t('detail.atpBySizeAndDate')}
              </h3>
              <span className="inline-flex shrink-0 items-center rounded-full border border-mf-line bg-mf-surface px-3.5 py-1.5 text-[13px] text-mf-ink-2">
                {t('detail.atpByWarehouse')}
              </span>
            </div>
            {table && table.rows.length > 0 ? (
              <>
                <ProductAtpTable table={table} />
              </>
            ) : (
              <p className="m-0 mt-2.5 text-[13px] leading-normal text-mf-ink-3">
                {t(loading ? 'detail.atpLoading' : 'detail.atpUnavailable')}
              </p>
            )}
            <ProductAtpDisclosure
              moq={product.moq}
              hasIncoming={Boolean(table?.purchaseOrders.length)}
              showInventoryNote={Boolean(table && table.rows.length > 0)}
            />
          </div>

          <footer className="flex gap-2.5 border-t border-mf-border px-[22px] py-[14px]">
            <Button
              type="button"
              variant="outline"
              shape="md"
              onClick={onToggle}
              className="min-h-0 flex-1 rounded-[10px] border-mf-border-2 px-3 py-[11px] text-[12.5px] font-bold text-mf-ink hover:border-mf-primary"
            >
              {t(selected ? 'atp.removeSelection' : 'atp.addSelection')}
            </Button>
            <Button
              type="button"
              shape="md"
              onClick={onAddDraft}
              className="min-h-0 flex-1 rounded-[10px] border-mf-primary px-3 py-[11px] text-[12.5px] font-bold hover:bg-mf-primary"
            >
              {t('atp.addDraft')}
            </Button>
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
