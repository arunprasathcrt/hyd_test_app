import {useTranslation} from 'react-i18next';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';
import type {getDraftTotals} from '../../../lib/draft-products';
import {BuilderCard, BuilderCardTitle} from '../BuilderFields';

const moneyClass = 'text-right text-[14px] leading-[1.4] font-medium text-[#111113] tabular-nums';

export function ReviewTotalsCard({
  taxRate,
  totals,
}: {
  taxRate: number;
  totals: ReturnType<typeof getDraftTotals>;
}) {
  const {t} = useTranslation('newDraftOrder');
  const money = (value: number) => t('newDraftOrder.overview.money', {value});
  const {garments, art, decoration, units, tax, total} = totals;

  return (
    <BuilderCard aria-label={t('newDraftOrder.review.total.title')}>
      <header className="mb-4">
        <BuilderCardTitle
          title={t('newDraftOrder.review.total.title')}
          sub={t('newDraftOrder.review.total.sub')}
        />
      </header>
      <dl className="m-0 flex flex-col">
        {(['garments', 'royalty', 'artLicense', 'decoration'] as const).map((key) => (
          <div key={key} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 py-2.5 text-[14px] leading-[1.4] text-[#6B6B70]">
            <dt>
              {key === 'decoration'
                  ? t('newDraftOrder.review.total.lines.decorationUnits', {count: units})
                : t(`newDraftOrder.review.total.lines.${key}`)}
            </dt>
            <dd className={cn('m-0', moneyClass, key === 'royalty' && 'text-[13px] font-normal text-[#6B6B70]')}>
                  {key === 'royalty'
                    ? t('newDraftOrder.review.total.included')
                    : money(key === 'garments' ? garments : key === 'artLicense' ? art : decoration)}
            </dd>
          </div>
        ))}
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 py-2.5 text-[14px] leading-[1.4] text-[#6B6B70]">
          <dt>{t('newDraftOrder.review.total.lines.tax', {rate: taxRate})}</dt>
          <dd className={cn('m-0', moneyClass)}>{money(tax)}</dd>
        </div>
      </dl>
      <div className="mt-2 border-t border-[#ECECEE] pt-3.5">
        <label htmlFor="do112dDiscountCode" className="mb-2 block text-xs leading-[1.4] font-semibold text-[#6B6B70]">
          {t('newDraftOrder.review.total.discount.label')}{' '}
          <span className="font-normal normal-case tracking-normal text-[#6B6B70]">
            {t('newDraftOrder.review.total.discount.scope')}
          </span>
        </label>
        <div className="flex min-w-0 items-center gap-2.5 max-[480px]:flex-col max-[480px]:items-stretch">
          <input
            id="do112dDiscountCode"
            type="text"
            autoComplete="off"
            disabled
            placeholder={t('newDraftOrder.review.total.discount.placeholder')}
            aria-describedby="do112dDiscountHelp"
            className="min-h-11 min-w-0 flex-1 rounded-[10px] border border-[#D7D7DA] bg-white px-[15px] text-[14px] leading-normal text-[#111113] placeholder:text-[#AEAEB4] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0E6E6E]"
          />
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled
            shape="lg"
            title={t('newDraftOrder.review.total.discount.unavailable')}
            aria-describedby="do112dDiscountHelp"
            className="min-h-10 cursor-pointer px-6 py-3 text-[13px] max-[480px]:w-full"
          >
            {t('newDraftOrder.review.total.discount.apply')}
          </Button>
        </div>
      </div>
      <p id="do112dDiscountHelp" className="sr-only">
        {t('newDraftOrder.review.total.discount.unavailable')}
      </p>
      <div className="mt-1.5 flex items-baseline justify-between gap-3 border-t border-[#D7D7DA] pt-3">
        <span className="text-base font-semibold leading-[1.3] text-[#111113]">
          {t('newDraftOrder.review.total.total')}
        </span>
        <b className="text-[22px] leading-[1.2] font-medium text-[#111113] tabular-nums">
          {money(total)}
        </b>
      </div>
    </BuilderCard>
  );
}