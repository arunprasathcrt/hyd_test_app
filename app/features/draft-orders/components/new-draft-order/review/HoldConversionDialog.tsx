import type {FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {ChevronDown, X} from 'lucide-react';
import {Dialog} from '@base-ui/react/dialog';
import {Button} from '~/shared/components/ui/Button';
import {toast} from '~/shared/components/ui/Toast';
import {HOLD_CONVERSION_REASONS} from '../../../schemas/new-draft-order.schema';

type HoldReason = (typeof HOLD_CONVERSION_REASONS)[number];

export interface HoldDialogValues {
  reason: HoldReason;
  until: string;
  note: string;
}

interface HoldConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValuesChange: (values: HoldDialogValues) => void;
  onSubmitHold: (values: HoldDialogValues) => void;
  reason: HoldReason;
  holdUntil: string;
  note: string;
  orderId?: string;
  today: string;
}

export function HoldConversionDialog({
  open,
  onOpenChange,
  onValuesChange,
  onSubmitHold,
  reason,
  holdUntil,
  note,
  orderId,
  today,
}: HoldConversionDialogProps) {
  const {t} = useTranslation('newDraftOrder');
  const values: HoldDialogValues = {reason, until: holdUntil, note};

  const submitHold = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const id = orderId?.replace(/^QT-/, '');
    onSubmitHold(values);
    const date = holdUntil ? new Date(`${holdUntil}T00:00:00`) : undefined;
    toast.add({
      title: date
        ? id
          ? t('newDraftOrder.review.holdDialog.toast.heldUntil', {
              id,
              date,
              formatParams: {date: {dateStyle: 'medium'}},
            })
          : t('newDraftOrder.review.holdDialog.toast.heldUntilWithoutId', {
              date,
              formatParams: {date: {dateStyle: 'medium'}},
            })
        : id
          ? t('newDraftOrder.review.holdDialog.toast.held', {id})
          : t('newDraftOrder.review.holdDialog.toast.heldWithoutId'),
      type: 'success',
    });
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1200] bg-[rgba(17,17,19,.42)] transition-opacity duration-[220ms] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[1200] flex max-h-[calc(100dvh-32px)] w-[min(604px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-[#E7E7E9] bg-white font-sans text-[13px] leading-[1.5] text-[#111113] shadow-[0_24px_64px_rgba(17,17,19,.22)] transition-[opacity,scale] duration-[220ms] ease-[cubic-bezier(.22,1,.36,1)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <header className="flex items-start justify-between gap-4 border-b border-[#ECECEE] px-6 pt-5 pb-4 max-[720px]:px-4">
            <div className="min-w-0">
              <p className="m-0 text-[12px] leading-normal font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                {t('newDraftOrder.review.holdDialog.eyebrow')}
              </p>
              <Dialog.Title className="mt-1 mb-1 text-[20px] leading-[1.3] font-semibold text-[#111113]">
                {orderId
                  ? t('newDraftOrder.review.holdDialog.title', {orderNumber: orderId})
                  : t('newDraftOrder.review.holdDialog.titleWithoutId')}
              </Dialog.Title>
              <Dialog.Description className="m-0 text-[13px] leading-[1.45] text-[#5C5C61]">
                {t('newDraftOrder.review.holdDialog.description')}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={t('newDraftOrder.review.holdDialog.close')}
              title={t('newDraftOrder.review.holdDialog.close')}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#6B6B70] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.8} />
            </Dialog.Close>
          </header>

          <form onSubmit={submitHold} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-5 overflow-y-auto px-6 pt-5 pb-2 max-[720px]:px-4">
              <label htmlFor="hold-conversion-reason" className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#5C5C61]">
                  {t('newDraftOrder.review.holdDialog.reason')}
                </span>
                <span className="relative block">
                  <select
                    id="hold-conversion-reason"
                    value={reason}
                    onChange={(event) => onValuesChange({...values, reason: event.target.value as HoldReason})}
                    className="min-h-11 w-full appearance-none rounded-lg border border-[#D7D7DA] bg-white px-3 pr-10 text-[13px] text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
                  >
                    <option value="customerPo">{t('newDraftOrder.review.holdDialog.reasons.customerPo')}</option>
                    <option value="creditReview">{t('newDraftOrder.review.holdDialog.reasons.creditReview')}</option>
                    <option value="customerWait">{t('newDraftOrder.review.holdDialog.reasons.customerWait')}</option>
                    <option value="productionSlot">{t('newDraftOrder.review.holdDialog.reasons.productionSlot')}</option>
                    <option value="other">{t('newDraftOrder.review.holdDialog.reasons.other')}</option>
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    size={16}
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#6B6B70]"
                  />
                </span>
              </label>

              <label htmlFor="hold-conversion-note" className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#5C5C61]">
                  {t('newDraftOrder.review.holdDialog.note')}
                </span>
                <textarea
                  id="hold-conversion-note"
                  rows={3}
                  maxLength={2000}
                  value={note}
                  onChange={(event) => onValuesChange({...values, note: event.target.value})}
                  placeholder={t('newDraftOrder.review.holdDialog.notePlaceholder')}
                  className="w-full resize-y rounded-lg border border-[#D7D7DA] bg-white px-3 py-2.5 text-[13px] text-[#111113] placeholder:text-[#8E8E93] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
                />
              </label>

              <label htmlFor="hold-conversion-until" className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-[#5C5C61]">
                  {t('newDraftOrder.review.holdDialog.until')}
                </span>
                <input
                  id="hold-conversion-until"
                  type="date"
                  min={today}
                  value={holdUntil}
                  onChange={(event) => onValuesChange({...values, until: event.target.value})}
                  className="min-h-11 w-full rounded-lg border border-[#D7D7DA] bg-white px-3 text-[13px] text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
                />
                <small className="text-[12px] leading-[1.45] text-[#6B6B70]">
                  {t('newDraftOrder.review.holdDialog.untilHelp')}
                </small>
              </label>
            </div>

            <footer className="flex items-center gap-2 border-t border-[#ECECEE] px-6 py-2 max-[720px]:px-4">
              <Button
                type="button"
                variant="outline"
                size="control"
                shape="md"
                onClick={() => onOpenChange(false)}
              >
                {t('newDraftOrder.review.holdDialog.cancel')}
              </Button>
              <span className="flex-1" />
              <Button type="submit" variant="default" size="control" shape="md">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                {t('newDraftOrder.review.holdDialog.submit')}
              </Button>
            </footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}