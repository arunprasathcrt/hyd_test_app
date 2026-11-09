import {useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useSearchParams} from 'react-router';
import {Eye, Mail, Printer, Copy} from 'lucide-react';
import {HoldConversionDialog, type HoldDialogValues} from './HoldConversionDialog';
import {toast} from '~/shared/components/ui/Toast';
import {SEARCH_PARAMS} from '~/shared/constants/routes';
import {Button} from '~/shared/components/ui/Button';
import type {getDraftTotals} from '../../../lib/draft-products';
import type {DraftOrderReviewLine, DraftOrderIssue, NewDraftOrderValues, NewDraftOrderCustomer} from '../../../types/new-draft-order';
import {BuilderCard, BuilderTag} from '../BuilderFields';
import {ReviewProductLineCard} from './ReviewProductLineCard';
import {PrintPreviewModal} from './PrintPreviewModal';

interface ReviewSummaryCardProps {
  lines: DraftOrderReviewLine[];
  issues: DraftOrderIssue[];
  onIssue: (issue: DraftOrderIssue) => void;
  totals: ReturnType<typeof getDraftTotals>;
  customer?: NewDraftOrderCustomer;
  orderType: NewDraftOrderValues['orderType'];
  today: string;
  inHandsDate: string;
  validUntil: string;
  version: number;
  taxRate: number;
  onSave: () => void;
  draftOrderNumber?: string;
}

export function ReviewSummaryCard({
  lines,
  issues,
  onIssue,
  totals,
  customer,
  orderType,
  today,
  inHandsDate,
  validUntil,
  version,
  taxRate,
  onSave,
  draftOrderNumber,
}: ReviewSummaryCardProps) {
  const {t} = useTranslation('newDraftOrder');
  const {control, setValue} = useFormContext<NewDraftOrderValues>();
  const [, setSearchParams] = useSearchParams();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [holdConversionOpen, setHoldConversionOpen] = useState(false);
  const [orderName, description, brands, holdReason, holdUntil, holdStatus, holdNote] = useWatch({
    control,
    name: ['orderName', 'description', 'brands', 'holdReason', 'holdUntil', 'holdStatus', 'holdNote'],
  });
  // A hold lapses once its hold-until date has passed.
  const conversionHeld = holdStatus === 'on_hold' && (!holdUntil || holdUntil >= today);
  const money = (value: number) => t('newDraftOrder.overview.money', {value});

  const goToProducts = () => {
    setSearchParams((params) => {
      params.set(SEARCH_PARAMS.step, 'products');
      return params;
    });
  };

  const handleHoldAction = () => {
    if (!conversionHeld) {
      setHoldConversionOpen(true);
      return;
    }

    setValue('holdStatus', 'released', {shouldDirty: true});
    setValue('holdReason', '', {shouldDirty: true});
    setValue('holdUntil', '', {shouldDirty: true});
    setValue('holdNote', '', {shouldDirty: true});
    setValue('heldBy', '', {shouldDirty: true});
    onSave();
    const id = draftOrderNumber;
    toast.add({
      title: id
        ? t('newDraftOrder.review.holdDialog.toast.released', {id})
        : t('newDraftOrder.review.holdDialog.toast.releasedWithoutId'),
      type: 'success',
    });
  };

  const setHoldValues = ({reason, until, note}: HoldDialogValues) => {
    setValue('holdReason', reason, {shouldDirty: true});
    setValue('holdUntil', until, {shouldDirty: true});
    setValue('holdNote', note, {shouldDirty: true});
  };

  const saveHold = (values: HoldDialogValues) => {
    setHoldValues(values);
    setValue('holdStatus', 'on_hold', {shouldDirty: true});
    setValue('heldBy', customer?.rep ?? '', {shouldDirty: true});
    onSave();
  };

  return (
    <BuilderCard aria-label={t('newDraftOrder.review.title')}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-base leading-6 font-semibold text-[#111113]">
            {t('newDraftOrder.review.title')}
          </h3>
          <p className="m-0 mt-0.5 text-[13px] leading-normal text-[#5C5C61]">
            {t('newDraftOrder.review.sub')}
          </p>
        </div>
        <span className="shrink-0 text-xs leading-[1.5] text-[#6B6B70] tabular-nums">
          {t('newDraftOrder.review.bundleCount', {bundles: lines.length, units: totals.units})}
        </span>
      </header>

      {lines.length ? (
        <ol className="m-0 flex list-none flex-col p-0">
          {lines.map((line) => (
            <ReviewProductLineCard
              key={line.id}
              line={line}
              issues={issues.filter((issue) =>
                issue.productId === line.id &&
                (issue.key === 'needsSizes' || issue.key === 'belowMinimum'),
              )}
              onIssue={onIssue}
            />
          ))}
        </ol>
      ) : (
        <div className="rounded-[10px] bg-[#F7F7F8] px-4 py-5">
          <b className="font-semibold text-[#111113]">{t('newDraftOrder.review.empty.title')}</b>
          <p className="mt-1 mb-3 text-[13px] leading-normal text-[#5C5C61]">
            {t('newDraftOrder.review.empty.sub')}
          </p>
          <Button
            type="button"
            variant="outline"
            size="small"
            shape="md"
            onClick={goToProducts}
            className="min-h-9 px-[13px]"
          >
            {t('newDraftOrder.review.empty.action')}
          </Button>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-[#D7D7DA] pt-3">
        <span className="text-[13px] text-[#5C5C61]">
          {t('newDraftOrder.review.linesSummary', {lines: money(totals.subtotal)})}
        </span>
        <b>
          {t('newDraftOrder.review.estimatedSubtotal')}{' '}
          <span className="tabular-nums">{money(totals.subtotal)}</span>
        </b>
      </div>

      <div
        className="mt-4 flex min-w-0 flex-wrap items-center gap-2 border-t border-[#ECECEE] pt-4"
        role="group"
        aria-label={t('newDraftOrder.review.actions.label')}
      >
        <Button
          type="button"
          variant="outline"
          size="control"
          shape="md"
          aria-expanded={previewOpen}
          aria-controls="do112dCustomerPreview"
          aria-describedby="do112dCustomerNote"
          onClick={() => setPreviewOpen((open) => !open)}
          title={t('newDraftOrder.review.actions.previewTip')}
          className="cursor-pointer"
          disabled
        >
          {t(
            previewOpen
              ? 'newDraftOrder.review.actions.closePreview'
              : 'newDraftOrder.review.actions.preview',
          )}
          <span aria-hidden="true" className="inline-flex items-center text-[#6B6B70]">
            <Eye size={14} />
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="control"
          shape="md"
          aria-describedby="do112dCustomerNote"
          onClick={() => setPrintPreviewOpen(true)}
          title={t('newDraftOrder.review.actions.printTip')}
          className="cursor-pointer"
        >
          <Printer size={16} aria-hidden="true" />
          {t('newDraftOrder.review.actions.print')}
          <span aria-hidden="true" className="inline-flex items-center text-[#6B6B70]">
            <Eye size={14} />
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="control"
          shape="md"
          disabled
          title={t('newDraftOrder.review.actions.emailUnavailable')}
          aria-describedby="do112dEmailUnavailable do112dCustomerNote"
          className="cursor-not-allowed"
        >
          <Mail size={16} aria-hidden="true" />
          {t('newDraftOrder.review.actions.emailCustomer')}
          <span aria-hidden="true" className="inline-flex items-center text-[#8E8E93]">
            <Eye size={14} />
          </span>
        </Button>
        

        <Button
          type="button"
          variant="outline"
          size="control"
          shape="md"
          disabled
          title={t('newDraftOrder.review.actions.emailUnavailable')}
          aria-describedby="do112dEmailUnavailable"
          className="cursor-not-allowed"
        >
          <Copy size={16} aria-hidden="true" />
          {t('newDraftOrder.review.actions.emailCopy')}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="control"
          shape="md"
          title={t(
            conversionHeld
              ? 'newDraftOrder.review.actions.releaseHold'
              : 'newDraftOrder.review.actions.holdConversion',
          )}
          aria-describedby="holdConversion"
          className='cursor-pointer'
          onClick={handleHoldAction}
          
        >
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
          {t(
            conversionHeld
              ? 'newDraftOrder.review.actions.releaseHold'
              : 'newDraftOrder.review.actions.holdConversion',
          )}
        </Button>
        <span
          id="do112dCustomerNote"
          className="ml-auto inline-flex min-h-9 items-center gap-1.5 text-xs leading-[1.5] text-[#6B6B70] max-[759.98px]:ml-0"
          title={t('newDraftOrder.review.actions.customerNote')}
        >
          <Eye size={14} aria-hidden="true" />
          {t('newDraftOrder.review.actions.customerNote')}
        </span>
      </div>

      {previewOpen ? (
        <section
          id="do112dCustomerPreview"
          aria-label={t('newDraftOrder.review.actions.previewTitle')}
          className="mt-4 rounded-[10px] border border-[#D7D7DA] bg-[#F7F7F8] p-4"
        >
          <h4 className="m-0 text-[14px] font-semibold text-[#111113]">
            {orderName || t('newDraftOrder.review.actions.previewTitle')}
          </h4>
          {description ? <p className="mt-1 mb-0 text-[13px] text-[#5C5C61]">{description}</p> : null}
          <p className="mt-2 mb-0 text-[13px] text-[#111113]">
            {brands.map((brand) => t(`newDraftOrder.brands.names.${brand}`)).join(', ') || t('newDraftOrder.overview.notSet')}
          </p>
          <p className="mt-3 mb-0 text-xs leading-[1.5] text-[#6B6B70]">
            {t('newDraftOrder.review.actions.previewProductsEmpty')}
          </p>
        </section>
      ) : null}

      <PrintPreviewModal
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        customer={customer}
        orderName={orderName}
        description={description}
        brands={brands}
        orderType={orderType}
        today={today}
        inHandsDate={inHandsDate}
        validUntil={validUntil}
        version={version}
        taxRate={taxRate}
        lines={lines}
        totals={totals}
        draftOrderNumber={draftOrderNumber}
      />
      <HoldConversionDialog
        open={holdConversionOpen}
        onOpenChange={setHoldConversionOpen}
        onValuesChange={setHoldValues}
        reason={holdReason || 'customerPo'}
        holdUntil={holdUntil || ''}
        note={holdNote || ''}
        onSubmitHold={saveHold}
        orderId={draftOrderNumber}
        today={today}
      />
    </BuilderCard>
  );
}