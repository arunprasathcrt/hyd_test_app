import {Button} from '~/shared/components/ui/Button';
import type {DraftProduct} from '../../../schemas/draft-product.schema';
import {Fold} from './shared';

interface Props {
  product: DraftProduct;
  quantity: number;
  open: boolean;
  onToggle: () => void;
  foldId: string;
  onSetQuantity: (variantId: string, next: number) => void;
  text: (key: string, options?: Record<string, unknown>) => string;
  units: (count: number) => string;
}

/** Sizes fold: the per-size quantity steppers (`.qb-size-control`). */
export function ProductSizesFold({
  product,
  quantity,
  open,
  onToggle,
  foldId,
  onSetQuantity,
  text,
  units,
}: Props) {
  const first = product.variants[0];

  return (
    <Fold
      id={foldId}
      title={text('sizes')}
      summary={quantity > 0 ? units(quantity) : text('addSizesTag')}
      open={open}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
        {product.variants.map((variant) => (
          <div
            key={variant.id}
            className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-[#ECECEE] bg-white p-2 focus-within:border-[#6B6B70]"
          >
            <span className="font-sans text-xs font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
              {variant.size}
            </span>
            {/* `.qb-size-control` */}
            <span className="flex w-full items-center justify-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                shape="square"
                tabIndex={-1}
                aria-label={text('decreaseSize', {size: variant.size})}
                onClick={() => onSetQuantity(variant.id, variant.quantity - 1)}
                className="h-8 min-h-0 w-6 shrink-0 gap-0 rounded-lg bg-[#F7F7F8] p-0 text-[15px] leading-none text-[#111113] transition-colors hover:bg-[#111113] hover:text-white"
              >
                −
              </Button>
              <input
                type="text"
                data-size-input={
                  variant.id === first?.id ? product.id : undefined
                }
                pattern="[0-9]*"
                maxLength={5}
                inputMode="numeric"
                aria-label={text('sizeQuantity', {
                  name: product.name,
                  size: variant.size,
                })}
                value={variant.quantity || ''}
                placeholder="0"
                onKeyDown={(event) => {
                  if (
                    !event.ctrlKey &&
                    !event.metaKey &&
                    !event.altKey &&
                    event.key.length === 1 &&
                    !/^[0-9]$/.test(event.key)
                  )
                    event.preventDefault();
                }}
                onPaste={(event) => {
                  if (!/^[0-9]*$/.test(event.clipboardData.getData('text'))) {
                    event.preventDefault();
                  }
                }}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  if (!/^[0-9]{0,5}$/.test(value)) return;
                  onSetQuantity(variant.id, value === '' ? 0 : Number(value));
                }}
                className="h-8 w-10 min-w-10 flex-[1_1_40px] [appearance:textfield] rounded-lg border border-[#D7D7DA] bg-white px-0.5 text-center text-sm font-semibold text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0E6E6E] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <Button
                type="button"
                variant="ghost"
                shape="square"
                tabIndex={-1}
                aria-label={text('increaseSize', {size: variant.size})}
                onClick={() => onSetQuantity(variant.id, variant.quantity + 1)}
                className="h-8 min-h-0 w-6 shrink-0 gap-0 rounded-lg bg-[#F7F7F8] p-0 text-[15px] leading-none text-[#111113] transition-colors hover:bg-[#111113] hover:text-white"
              >
                +
              </Button>
            </span>
          </div>
        ))}
      </div>
      {quantity === 0 && (
        <p className="m-0 mt-2.5 rounded-[10px] bg-[#FDECEC] px-2.5 py-2 text-[12.5px] leading-normal text-[#A02020]">
          {text('sizesHint')}
        </p>
      )}
    </Fold>
  );
}
