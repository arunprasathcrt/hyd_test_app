import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '~/shared/components/ui/Button';
import {toast} from '~/shared/components/ui/Toast';
import {cn} from '~/shared/utils/cn';
import {useFormContext, useWatch} from 'react-hook-form';
import type {NewDraftOrderValues, ShopifyStaffMembersData} from '../../../types/new-draft-order';
import {BuilderCard, BuilderCardTitle} from '../BuilderFields';
import {ArtProductionSubmitDialog} from './ArtProductionSubmitDialog';

export function ReviewLocksCard({
  onLock,
  onSubmitArtProduction,
  staffMembersData,
  staffMembersLoading,
  onLoadStaffMembers,
  onRetryStaffMembers,
  customerName,
  previewImage,
}: {
  onLock: (kind: 'art' | 'quantity', locked: boolean) => void;
  onSubmitArtProduction: () => void;
  staffMembersData?: ShopifyStaffMembersData;
  staffMembersLoading: boolean;
  onLoadStaffMembers: () => void;
  onRetryStaffMembers: () => void;
  customerName?: string;
  previewImage?: string;
}) {
  const {t} = useTranslation('newDraftOrder');
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const {control} = useFormContext<NewDraftOrderValues>();
  const [finalArtLocked, quantitiesLocked, lockedBy] = useWatch({
    control,
    name: ['finalArtLocked', 'quantitiesLocked', 'lockedBy'],
  });
  const lockedByCode = {customer_art: finalArtLocked, quantity: quantitiesLocked};

  return (
    <BuilderCard id="do112dLocks" aria-label={t('newDraftOrder.review.locks.title')}>
      <header className="mb-4">
        <BuilderCardTitle
          title={t('newDraftOrder.review.locks.title')}
          sub={t('newDraftOrder.review.locks.sub')}
        />
      </header>
      <div className="flex flex-col">
        {(['customer_art', 'quantity', 'handoff'] as const).map((code, index) => {
          const locked = code === 'handoff' ? false : Boolean(lockedByCode[code]);
          const complete = code === 'handoff' ? Boolean(finalArtLocked && quantitiesLocked) : locked;
          return (
            <div
              key={code}
              className={cn(
                'flex min-w-0 items-center gap-3 border-b border-[#ECECEE] py-[9px]',
                index === 0 && 'pt-2',
                index === 2 && 'border-b-0',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-[26px] flex-[0_0_26px] items-center justify-center rounded-full text-[11px] leading-none font-bold text-white',
                  complete ? 'bg-[#1F7A4D]' : 'bg-[#D7D7DA]',
                )}
              >
                {complete ? '✓' : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-[13px] leading-[1.35] font-medium text-[#111113] whitespace-nowrap">
                  {t(`newDraftOrder.review.locks.${code}.title`)}
                </p>
                <p className="mt-0.5 mb-0 text-xs leading-[1.4] text-[#5C5C61]">
                  {code === 'handoff' && complete
                    ? t('newDraftOrder.review.locks.handoff.completeDescription')
                    : locked && lockedBy
                      ? t('newDraftOrder.review.locks.lockedBy', {name: lockedBy})
                      : t(`newDraftOrder.review.locks.${code}.description`)}
                </p>
              </div>
              {code === 'handoff' ? (
                complete ? (
                  <span className="inline-flex shrink-0 items-center gap-[5px] rounded-full bg-[#EAF1ED] px-2.5 py-[3px] text-xs leading-[1.3] font-semibold text-[#2E5944]">
                    {t('newDraftOrder.review.locks.handoff.complete')}
                  </span>
                ) : (
                  <span className="inline-flex shrink-0 items-center gap-[5px] rounded-full bg-[#FFF6E5] px-2.5 py-[3px] text-xs leading-[1.3] font-semibold text-[#6B4A0B]">
                    {t(
                      finalArtLocked
                        ? 'newDraftOrder.review.locks.awaitingQuantity'
                        : quantitiesLocked
                          ? 'newDraftOrder.review.locks.awaitingArt'
                          : 'newDraftOrder.review.locks.awaiting',
                    )}
                  </span>
                )
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  shape="md"
                  onClick={() => {
                    const kind = code === 'customer_art' ? 'art' : 'quantity';
                    onLock(kind, !locked);
                    toast.add({
                      title: t(`newDraftOrder.review.locks.toast.${kind}.${locked ? 'removed' : 'locked'}`),
                      type: 'success',
                    });
                  }}
                  className="min-h-9 shrink-0 cursor-pointer"
                >
                  {locked
                    ? t('newDraftOrder.review.locks.locked')
                    : t(`newDraftOrder.review.locks.${code}.action`)}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-[#ECECEE] pt-4">
        <p className="m-0 mb-2 text-xs text-[#5C5C61] font-medium">
          {t('newDraftOrder.review.locks.submitTitle')}
        </p>
        <p className="m-0 mb-4 text-[13px] leading-[1.5] text-[#5C5C61]">
          Submitting <b className="font-semibold text-[#6B6B70]">locks the final art and the quantities</b> on every product card and sends the order into the Art Production & Licensing queue. You won&apos;t need to do anything else · it passes straight to production <b className="font-semibold text-[#6B6B70]">unless</b> Art Production or Licensing makes a significant change, in which case you&apos;ll be asked for <b className="font-semibold text-[#6B6B70]">Sales Production Approval</b> (and can choose whether to notify the customer).
        </p>
        <Button
          type="button"
          variant="outline"
          shape="lg"
          className="w-auto min-h-10 !text-[#111113] whitespace-nowrap"
          onClick={() => {
            onLoadStaffMembers();
            setSubmitDialogOpen(true);
          }}
        >
          {t('newDraftOrder.review.locks.submitButton')}
        </Button>
      </div>

      <ArtProductionSubmitDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        staffMembersData={staffMembersData}
        staffMembersLoading={staffMembersLoading}
        onLoadStaffMembers={onLoadStaffMembers}
        onRetryStaffMembers={onRetryStaffMembers}
        customerName={customerName}
        previewImage={previewImage}
        onConfirm={onSubmitArtProduction}
      />
    </BuilderCard>
  );
}