import type {DraftProduct} from '../../../schemas/draft-product.schema';
import {Fold, metaClass, subHeadingClass} from './shared';

type EditableField = 'artPrice' | 'decorationPrice' | 'adderPrice' | 'retailPrice';

interface Props {
  product: DraftProduct;
  garmentUnit: number;
  unitEach: number;
  subtotal: number;
  open: boolean;
  onToggle: () => void;
  foldId: string;
  onChange: (product: DraftProduct) => void;
  text: (key: string, options?: Record<string, unknown>) => string;
  money: (value: number) => string;
}

/** "Set the prices" fold: the editable garment/art/decoration/adder/retail inputs. */
export function ProductPriceEditor({
  product,
  garmentUnit,
  unitEach,
  subtotal,
  open,
  onToggle,
  foldId,
  onChange,
  text,
  money,
}: Props) {
  const uid = foldId;

  return (
    <Fold
      id={foldId}
      title={text('setPrices')}
      summary={text('priceSummary', {
        unit: money(unitEach),
        line: money(subtotal),
      })}
      open={open}
      onToggle={onToggle}
    >
      <p className={subHeadingClass}>{text('setPrices')}</p>
      {/* `.qb-price-grid` */}
      <div className="max-w-full overflow-x-auto pb-1">
        <div className="grid min-w-[840px] grid-cols-4 gap-x-3 gap-y-4">
          {(
            [
              ['garment', 'garmentTag', garmentUnit, null],
              ['art', 'artTag', product.artPrice, 'artPrice'],
              [
                'decoration',
                'decorationTag',
                product.decorationPrice,
                'decorationPrice',
              ],
              ['adder', 'adderTag', product.adderPrice, 'adderPrice'],
              ['retail', 'retailTag', product.retailPrice, 'retailPrice'],
            ] as [string, string, number, EditableField | null][]
          ).map(([label, tag, value, field]) => (
            <div
              key={label}
              className={
                label === 'retail'
                  ? 'col-span-full flex w-full max-w-[268px] min-w-0 flex-col gap-3'
                  : 'flex min-w-0 flex-col gap-3'
              }
            >
              <label
                htmlFor={`${uid}-price-${label}`}
                className="flex min-h-6 items-center gap-3 font-sans text-xs font-medium tracking-[0.14em] whitespace-nowrap text-[#6B6B70] uppercase"
              >
                <span className="whitespace-nowrap">
                  {text(`prices.${label}`)}
                </span>
                <span className="inline-flex items-center rounded-full bg-[rgba(17,17,19,0.06)] px-[9px] py-[3px] font-sans text-xs font-medium tracking-[0.14em] whitespace-nowrap text-[#7A5F12] uppercase">
                  {text(`prices.${tag}`)}
                </span>
              </label>
              {/* `.qb-price-input-wrap` */}
              <div className="mt-auto flex h-14 w-full min-w-0 items-center rounded-2xl border border-[#D7D7DA] bg-white transition-[border-color,box-shadow] focus-within:border-[#111113] focus-within:shadow-[0_0_0_3px_rgba(15,76,76,0.16)]">
                <span
                  aria-hidden="true"
                  className="pl-4 text-base font-normal text-[#6B6B70] select-none"
                >
                  {text('prices.prefix')}
                </span>
                {field ? (
                  <input
                    id={`${uid}-price-${label}`}
                    key={product.id}
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    defaultValue={value.toFixed(2)}
                    onChange={(event) =>
                      onChange({
                        ...product,
                        [field]: Math.max(
                          0,
                          event.currentTarget.valueAsNumber || 0,
                        ),
                      })
                    }
                    className="h-full w-0 min-w-0 flex-1 [appearance:textfield] border-0 bg-transparent px-4 text-right text-lg font-normal text-[#111113] tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                ) : (
                  <input
                    id={`${uid}-price-${label}`}
                    readOnly
                    value={value.toFixed(2)}
                    className="h-full w-0 min-w-0 flex-1 border-0 bg-transparent px-4 text-right text-lg font-normal text-[#111113] tabular-nums outline-none"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className={subHeadingClass}>{text('charges')}</p>
      <p className={metaClass}>{text('noCharges')}</p>
      <p className={metaClass}>{text('repsOnlyNote')}</p>
    </Fold>
  );
}
