import {Check, Eye, Flag, Layers, Shirt, X} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';
import {BuilderTag} from '../BuilderFields';
import {smallButtonClass} from './shared';

const actionPillClass = cn(
  smallButtonClass,
  'min-h-9 rounded-full px-3.5 py-2 text-[12.5px] font-medium tracking-[0.06em]',
);

interface Props {
  productName: string;
  onDuplicateInColor: () => void;
  onRemove: () => void;
  text: (key: string, options?: Record<string, unknown>) => string;
}

/**
 * `.qb-card-head > .qb-card-actions` plus `.ape-strip` — the disabled
 * product/Spectrum actions, Duplicate in color, remove, and the approval status.
 */
export function ProductCardActions({
  productName,
  onDuplicateInColor,
  onRemove,
  text,
}: Props) {
  return (
    <>
      <div className="mt-1.5 mb-1 flex flex-wrap justify-end gap-1.5">
        <Button
          type="button"
          variant="ghost"
          shape="square"
          disabled
          className={actionPillClass}
        >
          {text('productCard')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          shape="square"
          disabled
          className={actionPillClass}
        >
          <Shirt size={14} strokeWidth={1.7} aria-hidden="true" />
          {text('buildInSpectrum')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          shape="square"
          onClick={onDuplicateInColor}
          className={actionPillClass}
        >
          <Layers size={14} strokeWidth={1.7} aria-hidden="true" />
          {text('duplicateInColor')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          shape="square"
          aria-label={text('removeLine', {name: productName})}
          onClick={onRemove}
          className={cn(
            actionPillClass,
            'w-11 px-0 border-[#EDBDBF] text-[#B42324] hover:border-[#D98F93] hover:bg-[#FFF5F5] hover:text-[#B42324]',
          )}
        >
          <X size={14} strokeWidth={1.5} aria-hidden="true" />
        </Button>
      </div>

      {/* `.ape-strip`: the approval status and its actions */}
      <div className="mb-3 rounded-[10px] border border-[#ECECEE] bg-white px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <BuilderTag tone="neutral">{text('approval.none')}</BuilderTag>
        </div>
        {/* ❓ TO CONFIRM — flagging and approving need the approval link and workflow, which are not built yet */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            className={smallButtonClass}
          >
            <Flag size={14} aria-hidden="true" />
            <span>{text('approval.flag')}</span>
            <Eye size={14} aria-hidden="true" className="text-[#6B6B70]" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            className={smallButtonClass}
          >
            <Check size={14} aria-hidden="true" />
            <span>{text('approval.approve')}</span>
          </Button>
        </div>
      </div>
    </>
  );
}
