import {ChevronDown, Shirt} from 'lucide-react';
import {BrandLogo} from '~/shared/components/product';
import {BRAND_LOGOS} from '~/shared/components/product/BrandLogo';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';
import type {DraftProduct} from '../../../schemas/draft-product.schema';
import type {WorkflowStageCode} from '../../../types/new-draft-order';
import {BuilderTag} from '../BuilderFields';
import {smallButtonClass, type ProductChip, type StageMark} from './shared';

export interface ProductCardStageDot {
  code: WorkflowStageCode;
  n: number;
  mark: StageMark;
}

interface Props {
  product: DraftProduct;
  index: number;
  open: boolean;
  onToggle: () => void;
  uid: string;
  color: string;
  chips: ProductChip[];
  soonestInHands: string;
  onTrack: boolean;
  nested: boolean;
  minimum: number;
  minimumQuantity: number;
  metMinimum: boolean;
  progress: string;
  subtotal: number;
  stages: ProductCardStageDot[];
  cleared: number;
  onOpenWorkflow: () => void;
  text: (key: string, options?: Record<string, unknown>) => string;
  money: (value: number) => string;
  units: (count: number) => string;
  stageName: (code: WorkflowStageCode) => string;
  markWord: (mark: StageMark) => string;
}

/**
 * `.do112c-bh`: the card's always-visible header — thumbnail, title, chips,
 * the road-sign pill, total — plus the `.u116a-hx` strip (card number, art
 * status, brand, MOQ meter, stage dots) and the garment actions shown while open.
 */
export function ProductCardHeader({
  product,
  index,
  open,
  onToggle,
  uid,
  color,
  chips,
  soonestInHands,
  onTrack,
  nested,
  minimum,
  minimumQuantity,
  metMinimum,
  progress,
  subtotal,
  stages,
  cleared,
  onOpenWorkflow,
  text,
  money,
  units,
  stageName,
  markWord,
}: Props) {
  const first = product.variants[0];
  const quantity = product.variants.reduce(
    (total, variant) => total + variant.quantity,
    0,
  );
  const hasBrandLogo = Boolean(product.brand && BRAND_LOGOS[product.brand]);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-2.5 gap-y-2 py-2.5 pr-3.5 pl-2.5 max-[759.98px]:py-2 max-[759.98px]:pr-2.5 max-[759.98px]:pl-1.5',
        open && 'border-b border-[#ECECEE]',
      )}
    >
      {/* `.do112c-bt` */}
      <Button
        type="button"
        variant="ghost"
        shape="square"
        aria-expanded={open}
        aria-controls={`${uid}-body`}
        onClick={onToggle}
        className="flex min-h-12 min-w-0 flex-[1_1_280px] items-center gap-3 rounded-[10px] border-0 bg-transparent p-1 text-left font-normal text-[#111113] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
      >
        <span
          aria-hidden="true"
          className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F6] text-[#8E8E93]"
        >
          {product.image ? (
            <img
              src={product.image}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <Shirt size={20} />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <b className="truncate text-sm leading-[1.35] font-semibold tracking-[-0.005em]">
            {text('lineTitle', {number: index + 1, name: product.name})}
          </b>
          <span className="truncate text-xs font-normal leading-normal text-[#6B6B70] tabular-nums">
            {[
              first?.sku,
              color,
              product.blank ? text('blank') : null,
              units(quantity),
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn(
            'shrink-0 text-[#8E8E93] transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </Button>
      {/* `.do112c-chips` */}
      <span className="inline-flex min-w-0 flex-wrap gap-1.5">
        {chips.map((chip) => (
          <BuilderTag key={chip.key} tone={chip.tone}>
            {text(chip.key)}
          </BuilderTag>
        ))}
      </span>
      {/* `.do112c-sign`: the road sign */}
      {soonestInHands && (
        <span
          role="note"
          aria-label={text(onTrack ? 'sign.onTrack' : 'sign.atRisk')}
          className="inline-flex h-6 items-center gap-1.5 rounded-full border border-[#ECECEE] bg-white pr-[9px] pl-2 text-xs font-medium whitespace-nowrap text-[#111113]"
        >
          <i
            aria-hidden="true"
            className={cn(
              'size-1.5 rounded-full',
              onTrack ? 'bg-[#1F7A4D]' : 'bg-[#B26A00]',
            )}
          />
          {text(onTrack ? 'sign.onTrack' : 'sign.atRisk')}
        </span>
      )}
      {/* `.do112c-tot` */}
      <span className="ml-auto text-sm font-semibold whitespace-nowrap tabular-nums max-[759.98px]:ml-0">
        {money(subtotal)}
      </span>
      {/* `.u116a-hx`: card number, art, brand, the minimum meter, the nine dots */}
      {!nested && (
        <div className="order-1 flex min-w-0 basis-full flex-wrap items-center gap-x-3.5 gap-y-1.5 pr-1 pb-0.5 pl-16 text-xs leading-normal text-[#6B6B70] max-[759.98px]:pl-1">
          <span className="inline-flex h-[22px] items-center rounded-full bg-[#F2F2F3] px-2 text-xs font-medium whitespace-nowrap text-[#5C5C61]">
            {text('cardNumber', {number: index + 1})}
          </span>
          <span className="inline-flex min-w-0 max-w-[280px] items-center gap-1.5 text-[#6B6B70]">
            <span className="truncate">
              {text(product.blank ? 'blankGarments' : 'artNotChosen')}
            </span>
          </span>
          {product.brand && (
            <span className="inline-flex h-[22px] items-center whitespace-nowrap text-[#5C5C61]">
              {hasBrandLogo ? (
                <>
                  <BrandLogo
                    name={product.brand}
                    className="flex h-[22px] max-w-[120px] items-center opacity-[.62] brightness-0 grayscale [&_svg]:block [&_svg]:h-3.5 [&_svg]:w-auto [&_svg]:max-w-[120px]"
                  />
                  <span className="sr-only">{product.brand}</span>
                </>
              ) : (
                <span>{product.brand}</span>
              )}
            </span>
          )}
          {
            <span
              role="img"
              aria-label={
                minimum > 0
                  ? `${text('moqStrip', {minimum})} · ${text('moqSourceProgram')} · ${progress}`
                  : text('moqUnset')
              }
              className="inline-flex max-w-full shrink-0 flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap tabular-nums"
            >
              <span>
                <span
                  className={metMinimum ? 'text-[#1F7A4D]' : 'text-[#6B4A0B]'}
                >
                  {minimum > 0 ? text('moqStrip', {minimum}) : text('moqUnset')}
                </span>
                <span className="text-[#6B6B70]">
                  {minimum > 0 && ` · ${text('moqSourceProgram')}`}
                </span>
                <span
                  className={metMinimum ? 'text-[#1F7A4D]' : 'text-[#6B4A0B]'}
                >
                  {' · '}
                  {minimum > 0 ? progress : units(quantity)}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="relative block h-1.5 w-16 shrink-0 self-center overflow-hidden rounded-full bg-[#ECECEE]"
              >
                <i
                  style={{
                    width: `${minimum > 0 ? Math.min(100, (minimumQuantity / minimum) * 100) : 0}%`,
                  }}
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full',
                    metMinimum ? 'bg-[#1F7A4D]' : 'bg-[#B26A00]',
                  )}
                />
              </span>
            </span>
          }
          {/* `.u116a-dots`: one click opens the card's Workflow status */}
          {stages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              shape="square"
              aria-label={text('dotsLabel', {
                cleared,
                total: stages.length,
                list: stages
                  .map((stage) =>
                    text('dotItem', {
                      n: stage.n,
                      name: stageName(stage.code),
                      state: markWord(stage.mark),
                    }),
                  )
                  .join(', '),
              })}
              onClick={() => {
                if (!open) onToggle();
                onOpenWorkflow();
              }}
              className="group -my-1.5 inline-flex min-h-8 basis-full justify-start items-center gap-2 rounded-[9px] border border-transparent bg-transparent px-2 font-normal leading-normal whitespace-nowrap text-inherit transition-colors duration-[120ms] hover:border-[#ECECEE] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
            >
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-[3px]"
              >
                {stages.map((stage) => (
                  <i
                    key={stage.code}
                    className={cn(
                      'box-border block rounded-full',
                      stage.mark === 'done' && 'size-2 bg-[#1F7A4D]',
                      stage.mark === 'prog' &&
                        'size-2 border border-[#8E8E93] bg-white',
                      stage.mark === 'flag' && 'size-2 bg-[#B26A00]',
                      stage.mark === 'na' &&
                        'h-0.5 w-2 rounded-[1px] bg-[#D7D7DA]',
                    )}
                  />
                ))}
              </span>
              <span className="text-[#5C5C61] tabular-nums group-hover:text-[#111113] group-hover:underline group-hover:underline-offset-2">
                {text('dotsCleared', {cleared, total: stages.length})}
              </span>
            </Button>
          )}
        </div>
      )}
      {/* `.u116a-gacts`: Change garment and View availability, shown while the card is open */}
      {(open || nested) && (
        <div className="order-2 flex flex-[0_1_auto] flex-wrap items-center gap-x-2 gap-y-1.5">
          <BuilderTag tone="neutral">
            {text('availabilityOnRequest')}
          </BuilderTag>
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            className={smallButtonClass}
          >
            {text('changeGarment')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            className={smallButtonClass}
          >
            {text('viewAvailability')}
          </Button>
        </div>
      )}
    </div>
  );
}
