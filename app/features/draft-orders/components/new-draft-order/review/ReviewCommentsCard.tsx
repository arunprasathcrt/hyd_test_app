import {useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import type {NewDraftOrderValues} from '../../../types/new-draft-order';
import {BuilderCard, BuilderCardTitle} from '../BuilderFields';

export function ReviewCommentsCard() {
  const {t} = useTranslation('newDraftOrder');
  const {control, register} = useFormContext<NewDraftOrderValues>();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [artComment, manufacturingComment, invoiceComment, acknowledgementComment] = useWatch({
    control,
    name: ['artComment', 'manufacturingComment', 'invoiceComment', 'acknowledgementComment'],
  });
  const commentCount = [artComment, manufacturingComment, invoiceComment, acknowledgementComment]
    .filter((comment) => comment && comment.trim().length > 0).length;

  return (
    <BuilderCard aria-label={t('newDraftOrder.review.comments.title')}>
      <header className="mb-4">
        <BuilderCardTitle
          title={t('newDraftOrder.review.comments.title')}
          sub={t('newDraftOrder.review.comments.sub')}
        />
      </header>
      <div className="-mx-[18px] mb-4 overflow-hidden rounded-[14px] bg-white">
        <button
          type="button"
          aria-expanded={commentsOpen}
          aria-controls="do112dOrderComments"
          onClick={() => setCommentsOpen((open) => !open)}
          className="flex w-full cursor-pointer items-center justify-start gap-2.5 border-0 bg-white px-[18px] py-[15px] text-left transition-colors duration-150 hover:bg-[#FAFAF8] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0E6E6E]"
        >
          <span className="shrink-0 text-[13px] font-semibold text-[#5C5C61]">
            {t('newDraftOrder.review.comments.toggle')}
          </span>
          <span className="inline-flex shrink-0 items-center rounded-full bg-[rgba(201,162,39,0.14)] px-[9px] py-[3px] font-['Inter'] text-xs font-medium tracking-[0.14em] !text-[#6B4A0B] uppercase">
            {t('newDraftOrder.review.comments.optional')}
          </span>
          <span className="min-w-0 flex-1 overflow-hidden text-right text-xs whitespace-nowrap text-ellipsis text-[#8A8A8F]">
            {commentCount
              ? t('newDraftOrder.review.comments.count', {count: commentCount})
              : t('newDraftOrder.review.comments.none')}
          </span>
        </button>
        {commentsOpen ? (
          <div
            id="do112dOrderComments"
            className="grid grid-cols-2 gap-[14px] px-[18px] pt-1.5 pb-5 max-[759.98px]:grid-cols-1"
          >
            <label className="flex min-w-0 flex-col text-[11px] leading-[1.4] font-bold tracking-[0.07em] text-[#86868B] uppercase">
              {t('newDraftOrder.review.comments.art.label')}
              <textarea
                maxLength={255}
                rows={3}
                placeholder={t('newDraftOrder.review.comments.art.placeholder')}
                className="mt-1.5 box-border min-h-[62px] w-full resize-y rounded-[12px] border border-[#E4E2DC] bg-white px-3 py-2.5 text-[13px] leading-normal font-normal tracking-normal text-[#111113] normal-case placeholder:text-[#AEAEB4] focus-visible:border-[#C9A227] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(201,162,39,0.16)]"
                {...register('artComment')}
              />
            </label>
            <div className="flex min-w-0 flex-col">
              <div className="mb-1.5 flex min-h-[15px] flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] leading-[1.4] font-bold tracking-[0.07em] text-[#86868B] uppercase">
                <label htmlFor="do112dManufacturingComment" className="min-w-0">
                  {t('newDraftOrder.review.comments.manufacturing.label')}
                </label>
                <label htmlFor="do112dShipExact" className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium tracking-normal text-[#3A3A3E] normal-case">
                  <input id="do112dShipExact" type="checkbox" className="size-4 accent-[#C9A227]" {...register('shipExact')} />
                  {t('newDraftOrder.review.comments.shipExact')}
                </label>
              </div>
              <textarea
                id="do112dManufacturingComment"
                maxLength={255}
                rows={3}
                placeholder={t('newDraftOrder.review.comments.manufacturing.placeholder')}
                className="box-border min-h-[62px] w-full resize-y rounded-[12px] border border-[#E4E2DC] bg-white px-3 py-2.5 text-[13px] leading-normal text-[#111113] placeholder:text-[#AEAEB4] focus-visible:border-[#C9A227] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(201,162,39,0.16)]"
                {...register('manufacturingComment')}
              />
            </div>
            <label className="flex min-w-0 flex-col text-[11px] leading-[1.4] font-bold tracking-[0.07em] text-[#86868B] uppercase">
              <span className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span>{t('newDraftOrder.review.comments.invoice.label')}</span>
                <span className="text-xs leading-normal font-medium tracking-normal text-[#A6A6AC] normal-case">
                  {t('newDraftOrder.review.comments.invoice.note')}
                </span>
              </span>
              <textarea
                maxLength={255}
                rows={3}
                placeholder={t('newDraftOrder.review.comments.invoice.placeholder')}
                className="box-border min-h-[62px] w-full resize-y rounded-[12px] border border-[#E4E2DC] bg-white px-3 py-2.5 text-[13px] leading-normal font-normal tracking-normal text-[#111113] normal-case placeholder:text-[#AEAEB4] focus-visible:border-[#C9A227] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(201,162,39,0.16)]"
                {...register('invoiceComment')}
              />
            </label>
            <label className="flex min-w-0 flex-col text-[11px] leading-[1.4] font-bold tracking-[0.07em] text-[#86868B] uppercase">
              <span className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span>{t('newDraftOrder.review.comments.acknowledgement.label')}</span>
                <span className="text-xs leading-normal font-medium tracking-normal text-[#A6A6AC] normal-case">
                  {t('newDraftOrder.review.comments.acknowledgement.note')}
                </span>
              </span>
              <textarea
                maxLength={255}
                rows={3}
                placeholder={t('newDraftOrder.review.comments.acknowledgement.placeholder')}
                className="box-border min-h-[62px] w-full resize-y rounded-[12px] border border-[#E4E2DC] bg-white px-3 py-2.5 text-[13px] leading-normal font-normal tracking-normal text-[#111113] normal-case placeholder:text-[#AEAEB4] focus-visible:border-[#C9A227] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(201,162,39,0.16)]"
                {...register('acknowledgementComment')}
              />
            </label>
          </div>
        ) : null}
      </div>
    </BuilderCard>
  );
}
