import {Plus} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';
import {BuilderTag} from '../BuilderFields';
import type {SpreadRow} from '../../../lib/draft-products';
import {smallButtonClass} from './shared';

interface Props {
  remaining: number;
  minimumQuantity: number;
  minimum: number;
  methodLabel: string;
  productName: string;
  preview: boolean;
  onTogglePreview: () => void;
  topUpRows: SpreadRow[];
  quantity: number;
  index: number;
  onApply: () => void;
  onCancel: () => void;
  text: (key: string, options?: Record<string, unknown>) => string;
}

/**
 * `.u116a-moqrow.is-lead`: leads the open body while the card is short of its
 * minimum — the note, a "Top up" button, and its preview of the spread.
 */
export function ProductMinimumBanner({
  remaining,
  minimumQuantity,
  minimum,
  methodLabel,
  productName,
  preview,
  onTogglePreview,
  topUpRows,
  quantity,
  index,
  onApply,
  onCancel,
  text,
}: Props) {
  return (
    <div className="mb-3.5">
      <div
        role="status"
        className="flex min-w-0 flex-col gap-1 rounded-[10px] bg-[#FFF6E5] px-3 py-2.5 text-[12.5px] leading-normal text-[#6B4A0B]"
      >
        <b className="text-[13px] font-semibold">
          {text('moqRemaining', {
            count: remaining,
            quantity: minimumQuantity,
            minimum,
          })}
        </b>
        <span>
          {text('moqNoteBody', {
            minimum,
            method: methodLabel,
          })}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-2 max-[599.98px]:[&>button]:flex-[1_1_100%]">
          <Button
            type="button"
            variant="ghost"
            shape="square"
            aria-expanded={preview}
            onClick={onTogglePreview}
            className={smallButtonClass}
          >
            <Plus size={14} aria-hidden="true" />
            <span>
              {text('topUp', {count: remaining, name: productName})}
            </span>
          </Button>
        </span>
        {preview && (
          <div
            role="group"
            aria-label={text('topUpPreview', {
              count: remaining,
              name: productName,
            })}
            className="mt-1.5 flex flex-col gap-2 rounded-[10px] border border-[#D7D7DA] bg-white p-3 text-[#5C5C61]"
          >
            <b className="text-[13px] font-semibold text-[#111113]">
              {text('topUpPreview', {
                count: remaining,
                name: productName,
              })}
            </b>
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {topUpRows.map((row) => (
                <li
                  key={row.variantId}
                  className={cn(
                    'inline-flex min-h-7 items-baseline gap-1.5 rounded-[9px] border px-2.5 py-1 text-[12.5px] whitespace-nowrap tabular-nums text-[#5C5C61]',
                    row.add
                      ? 'border-[#D5EBDD] bg-[#EEF6F1]'
                      : 'border-[#ECECEE]',
                  )}
                >
                  <b className="font-semibold text-[#111113]">
                    {row.size}
                  </b>
                  <span>
                    {row.add ? `${row.now} → ${row.next}` : row.now}
                  </span>
                  {row.add > 0 && (
                    <em className="font-semibold text-[#1F7A4D] not-italic">
                      +{row.add}
                    </em>
                  )}
                </li>
              ))}
            </ul>
            <span>
              {text(
                quantity + remaining >= minimum
                  ? 'topUpReachesMet'
                  : 'topUpReaches',
                {
                  number: index + 1,
                  after: quantity + remaining,
                  minimum,
                },
              )}
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                shape="square"
                onClick={onApply}
                className="inline-flex min-h-8 items-center justify-center gap-2 rounded-[9px] border border-[#1A1A1A] bg-[#1A1A1A] px-3 text-[12.5px] leading-[1.2] font-medium whitespace-nowrap text-white transition-colors hover:bg-[#303030] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
              >
                {text('topUp', {count: remaining, name: productName})}
              </Button>
              <Button
                type="button"
                variant="ghost"
                shape="square"
                onClick={onCancel}
                className={smallButtonClass}
              >
                {text('topUpCancel')}
              </Button>
            </span>
          </div>
        )}
        <span className="mt-1 flex flex-wrap items-center gap-2">
          <BuilderTag tone="warn">{text('notValidated')}</BuilderTag>
          {/* ❓ TO CONFIRM — the manager override has no approval workflow behind it yet */}
          <Button type="button" variant="ghost" shape="square" disabled className={smallButtonClass}>
            {text('overrideMinimum')}
          </Button>
        </span>
      </div>
    </div>
  );
}
