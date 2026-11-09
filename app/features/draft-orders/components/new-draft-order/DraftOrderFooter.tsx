import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {cn} from '~/shared/utils/cn';
import {ArrowRightIcon} from '../icons/ArrowRightIcon';
import {ChevronLeftIcon} from '../icons/ChevronLeftIcon';
import {Tooltip, TooltipContent, TooltipTrigger} from '~/shared/components/ui/Tooltip';

interface Props {
  saved: ReactNode;
  saving: boolean;
  primaryLabel: string;
  primaryTooltip?: string;
  /** `next` shows the arrow; `send` is the last step's action. */
  primaryKind: 'next' | 'send';
  primaryDisabled: boolean;
  backTooltip: string;
  onBack: () => void;
  onSave: () => void;
  onPrimary: () => void;
}

const buttonClass =
  'inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-4 text-[13px] leading-[1.2] font-medium whitespace-nowrap transition-[background,transform] duration-[120ms] ease-[cubic-bezier(.22,1,.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E] active:scale-[.98] max-[359.98px]:px-3';

export function DraftOrderFooter({
  saved,
  saving,
  primaryLabel,
  primaryTooltip,
  primaryKind,
  primaryDisabled,
  backTooltip,
  onBack,
  onSave,
  onPrimary,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const primaryButton = (
    <button
      type="button"
      aria-disabled={primaryDisabled || undefined}
      onClick={primaryDisabled ? undefined : onPrimary}
      className={cn(
        buttonClass,
        'pr-[18px] pl-5 text-[13.5px] max-[768px]:flex-auto max-[599.98px]:min-w-0 max-[599.98px]:flex-[1_1_0] max-[599.98px]:px-3.5',
        primaryDisabled
          ? 'cursor-not-allowed border-[#D7D7DA] bg-[#D7D7DA] text-[#5C5C61] active:scale-100'
          : 'border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-[#303030]',
      )}
    >
      <span className="max-[599.98px]:truncate">{primaryLabel}</span>
      {primaryKind === 'next' ? (
        <ArrowRightIcon className="flex-none max-[359.98px]:hidden" />
      ) : null}
    </button>
  );

  return (
    <footer className="sticky bottom-0 z-[70] mt-5 flex flex-wrap items-center gap-2 border-t border-[#ECECEE] bg-white pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] shadow-[0_-14px_24px_-22px_rgba(17,17,19,.35)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-8 after:bg-white after:content-[''] max-[768px]:after:h-6">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onBack}
              className={cn(buttonClass, 'border-[#D7D7DA] bg-white text-[#111113] hover:bg-[#F7F7F8] max-[599.98px]:w-10 max-[599.98px]:px-0')}
            >
              <ChevronLeftIcon className="flex-none" />
              <span className="max-[599.98px]:sr-only">{t('newDraftOrder.foot.back')}</span>
            </button>
          }
        />
        <TooltipContent>{backTooltip}</TooltipContent>
      </Tooltip>

      <span className="flex-auto max-[768px]:hidden" />

      <span
        aria-live="polite"
        className="mr-1 text-xs leading-[1.5] text-[#6B6B70] tabular-nums max-[768px]:order-first max-[768px]:m-0 max-[768px]:basis-full"
      >
        {saved}
      </span>

      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className={cn(buttonClass, 'border-[#D7D7DA] bg-white text-[#111113] hover:bg-[#F7F7F8] disabled:cursor-progress')}
            >
              {t('newDraftOrder.foot.saveDraft')}
            </button>
          }
        />
        <TooltipContent>{t('newDraftOrder.foot.saveDraftTooltip')}</TooltipContent>
      </Tooltip>

      {primaryKind === 'next' && primaryTooltip ? (
        <Tooltip>
          <TooltipTrigger render={primaryButton} />
          <TooltipContent>{primaryTooltip}</TooltipContent>
        </Tooltip>
      ) : primaryButton}
    </footer>
  );
}
