import {ChevronDown} from 'lucide-react';
import type {ReactNode} from 'react';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';
import type {DraftProduct} from '../../../schemas/draft-product.schema';
import {getProductQuantity} from '../../../lib/draft-products';
import type {WorkflowStageCode} from '../../../types/new-draft-order';
import {builderInputClass, FieldLabel} from '../BuilderFields';

export type ProductChipTone = 'neutral' | 'warn' | 'bad';

export interface ProductChip {
  key: 'addSizesTag' | 'belowMinimumTag' | 'needsArtTag';
  tone: ProductChipTone;
}

/**
 * Prototype `chipsOf` (V112): Add sizes, then Below minimum, then Needs art.
 * The header shows at most three; the rail shows the first.
 */
export function getProductChips(product: DraftProduct): ProductChip[] {
  const quantity = getProductQuantity(product);
  const chips: ProductChip[] = [];
  if (quantity === 0) chips.push({key: 'addSizesTag', tone: 'bad'});
  if (quantity > 0 && quantity < product.minimumQuantity) {
    chips.push({key: 'belowMinimumTag', tone: 'warn'});
  }
  // ❓ TO CONFIRM — no art is attached to a DraftProduct yet, so every line needs art.
  if (!product.blank) chips.push({key: 'needsArtTag', tone: 'warn'});
  return chips.slice(0, 3);
}

/** `.do112c-btn` — the secondary button (the step's one black primary is the footer's). */
export const secondaryButtonClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border border-[#D7D7DA] bg-white px-4 text-[13px] leading-[1.2] font-medium whitespace-nowrap text-[#111113] transition-[background-color,transform] duration-[120ms] hover:bg-[#F7F7F8] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E] disabled:cursor-not-allowed disabled:bg-white disabled:text-[#111113] disabled:active:scale-100';

/** `.do112c-btn.sm` */
export const smallButtonClass =
  'inline-flex min-h-8 items-center justify-center gap-2 rounded-[9px] border border-[#D7D7DA] bg-white px-3 text-[12.5px] leading-[1.2] font-medium whitespace-nowrap text-[#111113] transition-[background-color,transform] duration-[120ms] hover:bg-[#F7F7F8] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E] disabled:cursor-not-allowed disabled:bg-white disabled:text-[#111113] disabled:active:scale-100';

/** `.do112c-segs` — the segment control track (DS 4.7). */
export const segmentTrackClass =
  'inline-flex max-w-full gap-0.5 overflow-x-auto rounded-xl bg-[#F7F7F8] p-[3px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export function segmentButtonClass(pressed: boolean) {
  return cn(
    'inline-flex min-h-9 items-center gap-[7px] rounded-[9px] px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0E6E6E] disabled:cursor-not-allowed disabled:text-[#5C5C61]',
    pressed
      ? 'bg-white text-[#111113] shadow-[0_1px_3px_rgba(17,17,19,.1)]'
      : 'text-[#5C5C61] hover:text-[#111113]',
  );
}

export const metaClass = 'm-0 text-xs font-normal leading-normal text-[#6B6B70]';
export const subHeadingClass =
  'm-0 mt-1 text-xs font-medium tracking-[0.06em] text-[#6B6B70] uppercase';

export const linkButtonClass =
  'inline-flex min-h-7 items-center border-0 bg-transparent px-0.5 text-[12.5px] font-normal text-[#5C5C61] underline underline-offset-2 hover:text-[#111113] disabled:cursor-not-allowed disabled:no-underline disabled:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]';

export type StageMark = 'done' | 'na' | 'flag' | 'prog';

/** Prototype `WHERE` and the stage owners: where each stage is worked. */
export const STAGE_WHERE: Record<WorkflowStageCode, string> = {
  customer_art: 'customerApprovals',
  quantity: 'sales',
  art_production: 'artProductionQueue',
  license: 'licenseQueue',
  final_approval: 'sales',
  inventory: 'availability',
  capacity: 'plantScheduling',
  pricing: 'salesLeadership',
  financial: 'finance',
};
export const STAGE_OWNER: Record<WorkflowStageCode, string> = {
  customer_art: 'artDesign',
  quantity: 'sales',
  art_production: 'artProduction',
  license: 'licensing',
  final_approval: 'sales',
  inventory: 'operations',
  capacity: 'operations',
  pricing: 'sales',
  financial: 'finance',
};
export const STAGE_GO: Partial<Record<WorkflowStageCode, true>> = {
  art_production: true,
  license: true,
};

/** Sections that start folded (prototype `CLOSED_DEFAULT`). */
export const CLOSED_BY_DEFAULT = new Set([
  'cmts',
  'opt',
  'pricing',
  'price',
  'details',
  'wf',
]);

export const DOC_KEYS = ['art', 'mfg', 'invoice', 'ack', 'packing'] as const;

export type OwnField =
  | 'shipDate'
  | 'po'
  | 'shipIndicator'
  | 'notBefore'
  | 'shipVia'
  | 'inHandsDate'
  | 'eventName'
  | 'discountCode'
  | 'shipCode';

interface FoldProps {
  id: string;
  title: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** `.do112c-sec` / `.u116a-acc` — a folding section with a right-aligned summary. */
export function Fold({
  id,
  title,
  summary,
  open,
  onToggle,
  children,
}: FoldProps) {
  return (
    <section className="min-w-0 border-t border-[#ECECEE]">
      <h3 className="m-0 text-[length:inherit] font-[inherit]">
        <Button
          type="button"
          variant="ghost"
          shape="square"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex min-h-12 w-full cursor-pointer items-center gap-3 border-0 bg-transparent shadow-none hover:bg-transparent hover:shadow-none px-0.5 py-1.5 text-left font-normal text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
        >
          <span className="shrink-0 text-sm font-semibold">{title}</span>
          <span className="min-w-0 flex-1 truncate text-right text-xs font-normal text-[#6B6B70] tabular-nums">
            {summary}
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
      </h3>
      {open && (
        <div id={id} className="flex min-w-0 flex-col gap-3 pt-0.5 pb-4">
          {children}
        </div>
      )}
    </section>
  );
}

/** `.u116a-field`: label, control, helper line, error line. */
export function OptField({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {help && (
        <span id={`${id}-h`} className="text-xs font-normal leading-normal text-[#6B6B70]">
          {help}
        </span>
      )}
      {error && (
        <span role="alert" className="text-xs font-normal leading-normal text-[#A02020]">
          {error}
        </span>
      )}
    </div>
  );
}

/** `.u116a-sel`: a select with the DS chevron. */
export function OptSelect({
  id,
  value,
  options,
  onChange,
  describedBy,
}: {
  id: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
  describedBy: string;
}) {
  return (
    <span className="relative block min-w-0">
      <select
        id={id}
        value={value}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          builderInputClass,
          'cursor-pointer appearance-none pr-10',
        )}
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 -mt-2 text-[#6B6B70]"
      />
    </span>
  );
}
