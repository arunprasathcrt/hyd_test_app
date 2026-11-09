import type {DraftProduct} from '../../../schemas/draft-product.schema';
import {Fold, metaClass} from './shared';

interface Props {
  product: DraftProduct;
  garmentUnit: number;
  unitEach: number;
  quantity: number;
  subtotal: number;
  open: boolean;
  onToggle: () => void;
  foldId: string;
  text: (key: string, options?: Record<string, unknown>) => string;
  money: (value: number) => string;
}

/** Read-only "Pricing" fold: the garment/art/decoration/adders breakdown and line total. */
export function ProductPricingSummaryFold({
  product,
  garmentUnit,
  unitEach,
  quantity,
  subtotal,
  open,
  onToggle,
  foldId,
  text,
  money,
}: Props) {
  return (
    <Fold
      id={foldId}
      title={text('pricing')}
      summary={text('priceSummary', {unit: money(unitEach), line: money(subtotal)})}
      open={open}
      onToggle={onToggle}
    >
      <dl className="m-0 flex max-w-[440px] flex-col tabular-nums">
        {[
          ['pricingGarment', money(garmentUnit)],
          ['pricingArt', money(product.artPrice)],
          [
            'pricingDecoration',
            product.decorationPrice ? money(product.decorationPrice) : text('pricingNone'),
          ],
          [
            'pricingAdders',
            product.adderPrice ? money(product.adderPrice) : text('pricingNone'),
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex min-h-[30px] items-baseline justify-between gap-4 py-1"
          >
            <dt className="m-0 text-[13px] whitespace-nowrap text-[#5C5C61]">
              {text(label)}
            </dt>
            <dd className="m-0 text-right text-[13.5px] font-medium whitespace-nowrap text-[#111113]">
              {value}
            </dd>
          </div>
        ))}
        <div className="mt-1 flex min-h-[30px] items-baseline justify-between gap-4 border-t border-[#ECECEE] pt-2 pb-1">
          <dt className="m-0 text-[13px] font-semibold whitespace-nowrap text-[#111113]">
            {text('pricingUnitTotal')}
          </dt>
          <dd className="m-0 text-right text-[13.5px] font-semibold whitespace-nowrap text-[#111113]">
            {money(unitEach)}
          </dd>
        </div>
        <div className="flex min-h-[30px] items-baseline justify-between gap-4 py-1">
          <dt className="m-0 text-[13px] whitespace-nowrap text-[#5C5C61]">
            {text('pricingQtyUnit')}
          </dt>
          <dd className="m-0 text-right text-[13.5px] font-medium whitespace-nowrap text-[#111113]">
            {`${quantity} × ${money(unitEach)}`}
          </dd>
        </div>
        <div className="mt-1 flex min-h-[30px] items-baseline justify-between gap-4 border-t border-[#D7D7DA] pt-2.5 pb-1">
          <dt className="m-0 text-sm font-semibold whitespace-nowrap text-[#111113]">
            {text('pricingLineTotal')}
          </dt>
          <dd className="m-0 text-right text-base font-semibold whitespace-nowrap text-[#111113]">
            {money(subtotal)}
          </dd>
        </div>
      </dl>
      <p className={metaClass}>{text('pricingNote')}</p>
    </Fold>
  );
}
