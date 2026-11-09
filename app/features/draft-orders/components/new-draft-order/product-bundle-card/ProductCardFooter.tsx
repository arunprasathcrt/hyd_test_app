import {Check} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {metaClass} from './shared';

interface Props {
  allClear: boolean;
  short: boolean;
  approved: boolean;
  remaining: number;
  quantity: number;
  minimum: number;
  openStageNames: string[];
  productName: string;
  unitEach: number;
  subtotal: number;
  text: (key: string, options?: Record<string, unknown>) => string;
  money: (value: number) => string;
  units: (count: number) => string;
}

/**
 * `.u116a-foot`: what Convert waits on, then the line's units and total.
 * Shown once per grouped card (not per nested garment).
 */
export function ProductCardFooter({
  allClear,
  short,
  approved,
  remaining,
  quantity,
  minimum,
  openStageNames,
  productName,
  unitEach,
  subtotal,
  text,
  money,
  units,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-t border-[#ECECEE] pt-3 max-[599.98px]:flex-col max-[599.98px]:items-stretch">
      {allClear ? (
        <div
          role="status"
          className="flex min-w-0 flex-[1_1_100%] flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-[10px] border border-[#D5EBDD] bg-[#EEF6F1] px-3.5 py-3"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1F7A4D] text-white"
          >
            <Check size={16} />
          </span>
          <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
            <b className="text-sm font-semibold text-[#1F7A4D]">
              {text('readyTitle')}
            </b>
            <span className="text-xs leading-normal text-[#6B6B70]">
              {text('readyBody', {whom: productName})}
            </span>
          </div>
          {/* ❓ TO CONFIRM — converting one card to an order is not built yet */}
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border border-[#D7D7DA] bg-[#F7F7F8] px-4 text-[13px] font-medium whitespace-nowrap text-[#6B6B70] disabled:cursor-not-allowed"
          >
            {text('convertCard')}
          </Button>
        </div>
      ) : (
        <div className="flex min-w-0 flex-[1_1_320px] flex-wrap items-center gap-x-3.5 gap-y-2">
          <span className={metaClass}>
            {short
              ? openStageNames.length > 0
                ? text('convertWaitsMinimumThen', {
                    remaining,
                    total: quantity,
                    moq: minimum,
                    stages: openStageNames.slice(0, 3).join(', '),
                  })
                : text('convertWaitsMinimum', {
                    remaining,
                    total: quantity,
                    moq: minimum,
                  })
              : text('convertWaitsStages', {
                  why: approved
                    ? openStageNames.slice(0, 3).join(', ')
                    : text('convertWaitsApproval'),
                })}
          </span>
        </div>
      )}
      <div className="ml-auto flex min-w-0 flex-wrap items-baseline justify-end gap-x-3.5 gap-y-1 text-right tabular-nums max-[599.98px]:order-first max-[599.98px]:ml-0 max-[599.98px]:w-full max-[599.98px]:flex-nowrap max-[599.98px]:justify-between">
        <span className="text-[13px] whitespace-nowrap text-[#6B6B70]">
          {text('footUnitsEach', {units: units(quantity), unit: money(unitEach)})}
        </span>
        <b className="text-base font-semibold whitespace-nowrap text-[#111113]">
          {money(subtotal)}
        </b>
      </div>
    </div>
  );
}
