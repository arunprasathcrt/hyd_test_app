import {ChevronDown} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';
import {FieldLabel, builderInputClass} from '../BuilderFields';

interface Props {
  uid: string;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  detailsSummary: string;
  color: string;
  productType: string;
  sku: string;
  customerSku: string;
  onDetailsChange: (patch: {
    productType?: string;
    customerSku?: string;
  }) => void;
  text: (key: string, options?: Record<string, unknown>) => string;
}

/**
 * Garment: the Details fold (read-only color/type/style) plus the VAS/finishing
 * radio group. The header is hidden on a one-garment card elsewhere; the body
 * always shows.
 */
export function ProductGarmentDetails({
  uid,
  detailsOpen,
  onToggleDetails,
  detailsSummary,
  color,
  productType,
  sku,
  customerSku,
  onDetailsChange,
  text,
}: Props) {
  const foldId = `${uid}-details`;

  return (
    <div className="flex min-w-0 flex-col gap-10 pt-0.5 pb-4">
      <div className="min-w-0 rounded-[10px] border border-[#ECECEE]">
        <Button
          type="button"
          variant="ghost"
          shape="square"
          aria-expanded={detailsOpen}
          aria-controls={foldId}
          onClick={onToggleDetails}
          className="flex min-h-10 w-full items-center gap-2.5 rounded-[10px] bg-transparent px-3 py-1.5 text-left font-normal text-[#111113] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
        >
          <span className="shrink-0 text-[13px] font-semibold">
            {text('details')}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs font-normal text-[#6B6B70] tabular-nums before:text-[#8E8E93] before:content-['·_']">
            {detailsSummary}
          </span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              'shrink-0 text-[#8E8E93] transition-transform duration-200',
              detailsOpen && 'rotate-180',
            )}
          />
        </Button>
        {detailsOpen && (
          <div
            id={foldId}
            className="grid grid-cols-2 gap-x-4 gap-y-3 px-3 pt-1 pb-3 max-[759.98px]:grid-cols-1"
          >
            <div className="flex min-w-0 flex-col gap-1.5">
              <FieldLabel htmlFor={`${uid}-detailsColor`}>
                {text('detailsColor')}
              </FieldLabel>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-4 size-4 -translate-y-1/2 rounded-full border border-[#D7D7DA] bg-[#C7C7CC]"
                />
                <input
                  id={`${uid}-detailsColor`}
                  readOnly
                  value={color}
                  className={cn(
                    builderInputClass,
                    'bg-white pl-11 text-[#111113]',
                  )}
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <FieldLabel htmlFor={`${uid}-detailsType`}>
                {text('detailsType')}
              </FieldLabel>
              <input
                id={`${uid}-detailsType`}
                value={productType === 'garment' ? '' : productType}
                placeholder={text('detailsTypePlaceholder')}
                onChange={(event) =>
                  onDetailsChange({productType: event.target.value})
                }
                className={cn(builderInputClass, 'bg-white text-[#111113]')}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <FieldLabel htmlFor={`${uid}-detailsStyle`}>
                {text('detailsStyle')}
              </FieldLabel>
              <input
                id={`${uid}-detailsStyle`}
                readOnly
                value={sku}
                className={cn(builderInputClass, 'bg-white text-[#111113]')}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <FieldLabel htmlFor={`${uid}-customerSku`}>
                {text('detailsCustomerSku')}{' '}
                <span className="ml-2 font-normal normal-case tracking-normal">
                  {text('detailsOptional')}
                </span>
              </FieldLabel>
              <input
                id={`${uid}-customerSku`}
                value={customerSku}
                maxLength={120}
                placeholder={text('detailsCustomerSkuPlaceholder')}
                onChange={(event) =>
                  onDetailsChange({customerSku: event.target.value})
                }
                className={cn(builderInputClass, 'bg-white text-[#111113]')}
              />
            </div>
          </div>
        )}
      </div>
      {/* `.do112c-gx` — VAS and finishing */}
      <div className="flex flex-col gap-1.5">
        <FieldLabel as="span" id={`${uid}-vas`}>
          {text('vasLabel')}
        </FieldLabel>
        <div
          role="radiogroup"
          aria-labelledby={`${uid}-vas`}
          className="inline-flex flex-wrap gap-1.5"
        >
          {[
            ['vasNo', true],
            ['vasYes', false],
          ].map(([label, checked]) => (
            <Button
              key={String(label)}
              type="button"
              variant="ghost"
              shape="square"
              role="radio"
              aria-checked={Boolean(checked)}
              disabled={!checked}
              className={cn(
                'inline-flex min-h-8 items-center gap-[7px] rounded-full border px-3.5 text-[12.5px] font-normal whitespace-nowrap',
                checked
                  ? 'border-[#111113] bg-[#111113] text-white'
                  : 'border-[#ECECEE] bg-white text-[#5C5C61] disabled:cursor-not-allowed',
              )}
            >
              {text(String(label))}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
