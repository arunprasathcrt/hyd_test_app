import {useTranslation} from 'react-i18next';
import {UnrivaledLogo} from '~/components/UnrivaledLogo';
import type {getDraftTotals} from '../../../lib/draft-products';
import type {DraftOrderReviewLine, NewDraftOrderCustomer} from '../../../types/new-draft-order';

interface Props {
  customer: NewDraftOrderCustomer | undefined;
  /** The order the draft became, for example `ORD-9872`. */
  orderId: string;
  /** The draft order it came from, for example `QT-05015`. */
  reference: string;
  today: string;
  inHandsDate: string;
  promiseDate: string;
  taxRate: number;
  lines: DraftOrderReviewLine[];
  totals: ReturnType<typeof getDraftTotals>;
  /** ISO day each line was approved, by line id. */
  approvedOn?: Record<string, string>;
  /** Owning rep from the Company; "Unassigned" shows when absent. */
  rep?: string;
}

/** Order confirmation: the customer's document once a draft has become an order. */
export function OrderConfirmationPrintCopy({
  customer,
  orderId,
  reference,
  today,
  inHandsDate,
  promiseDate,
  taxRate,
  lines,
  totals,
  approvedOn = {},
  rep,
}: Props) {
  const {t} = useTranslation('newDraftOrder');

  const date = (value: string) =>
    t('newDraftOrder.review.print.date', {
      date: new Date(`${value}T00:00:00.000Z`),
    });
  const money = (value: number) => t('newDraftOrder.overview.money', {value});
  const {units, subtotal, tax, total} = totals;

  return (
    <article
      aria-label={t('newDraftOrder.review.confirmation.ariaLabel')}
      className="mx-auto flex w-full max-w-[816px] flex-col bg-white px-12 py-12 text-[13px] leading-[1.4] text-[#111113] print:max-w-none print:px-0 print:py-0"
    >
      <header className="flex items-start justify-between gap-8">
        <div className="w-[190px] shrink-0">
          <UnrivaledLogo />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <h2 className="m-0 text-[22px] leading-[1.2] font-semibold">
            {t('newDraftOrder.review.confirmation.title')}
          </h2>
          <dl className="mt-3 ml-auto grid w-fit max-w-full grid-cols-[auto_auto] gap-x-3 gap-y-1 text-xs">
            <dt className="text-right text-[#6B6B70]">{t('newDraftOrder.review.confirmation.order')}</dt>
            <dd className="m-0 text-right font-medium">{orderId}</dd>
            <dt className="text-right text-[#6B6B70]">{t('newDraftOrder.review.print.dateLabel')}</dt>
            <dd className="m-0 text-right">{date(today)}</dd>
            <dt className="text-right text-[#6B6B70]">{t('newDraftOrder.review.print.reference')}</dt>
            <dd className="m-0 text-right">{reference}</dd>
          </dl>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-3 gap-5 border-y border-[#D7D7DA] py-4">
        <div className="min-w-0">
          <h3 className="m-0 text-xs font-semibold text-[#6B6B70]">{t('newDraftOrder.review.print.billTo')}</h3>
          <p className="mt-2 mb-0 text-[13px] font-semibold">{customer?.name || t('newDraftOrder.overview.notSet')}</p>
          {customer?.code ? <p className="mt-0.5 mb-0 text-xs text-[#6B6B70]">{customer.code}</p> : null}
        </div>
        <div className="min-w-0">
          <h3 className="m-0 text-xs font-semibold text-[#6B6B70]">{t('newDraftOrder.review.print.shipTo')}</h3>
          <p className="mt-2 mb-0 text-[13px]">
            {customer?.shipTo[0] || t('newDraftOrder.review.print.shipToPending')}
          </p>
        </div>
        <div className="min-w-0">
          <h3 className="m-0 text-xs font-semibold text-[#6B6B70]">{t('newDraftOrder.review.print.rep')}</h3>
          <p className="mt-2 mb-0 text-[13px]">{rep || t('newDraftOrder.review.print.repPending')}</p>
        </div>
      </section>

      <section className="grid bg-[#F7F7F8] grid-cols-4 gap-4 py-4">
        <div>
          <p className="m-0 text-xs text-[#6B6B70]">{t('newDraftOrder.customer.fields.inHands.label')}</p>
          <b className="mt-1 block text-[13px]">{date(inHandsDate)}</b>
        </div>
        <div>
          <p className="m-0 text-xs text-[#6B6B70]">{t('newDraftOrder.review.confirmation.promiseDate')}</p>
          <b className="mt-1 block text-[13px]">{date(promiseDate)}</b>
        </div>
        <div>
          <p className="m-0 text-xs text-[#6B6B70]">{t('newDraftOrder.review.print.terms')}</p>
          <b className="mt-1 block text-[13px]">{customer?.terms || t('newDraftOrder.overview.notSet')}</b>
        </div>
        <div>
          <p className="m-0 text-xs text-[#6B6B70]">{t('newDraftOrder.review.print.units')}</p>
          <b className="mt-1 block text-[13px] tabular-nums">{units}</b>
        </div>
      </section>

      <div className="mt-6">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[4%]" />
            <col className="w-[28%]" />
            <col className="w-[22%]" />
            <col className="w-[16%]" />
            <col className="w-[8%]" />
            <col className="w-[11%]" />
            <col className="w-[11%]" />
          </colgroup>
          <thead>
            <tr className="border-y border-[#D7D7DA] text-xs">
              {(['number', 'item', 'artDecoration', 'sizes', 'quantity', 'unitPrice', 'lineTotal'] as const).map((key) => (
                <th key={key} scope="col" className={`py-2 font-semibold ${key === 'number' || key === 'item' || key === 'artDecoration' || key === 'sizes' ? 'text-left' : 'text-right'}`}>
                  {t(`newDraftOrder.review.print.columns.${key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.length ? lines.map((line) => (
              <tr key={line.id} className="border-b border-[#ECECEE] align-top">
                <td className="py-3 text-xs tabular-nums">{line.lineNumber}</td>
                <td className="py-3 pr-3">
                  <p className="m-0 text-xs font-semibold">{line.name}</p>
                  <p className="m-0 text-[10px] text-[#6B6B70]">{[line.sku, line.color].filter(Boolean).join(' · ')}</p>
                </td>
                <td className="py-3 text-[10px]">
                  <p className="m-0">{line.artworkCode ?? t('newDraftOrder.review.confirmation.artwork')}</p>
                  <p className="m-0 text-[#6B6B70]">
                    {line.decoration
                      ? t(`newDraftOrder.leadTime.methods.options.${line.decoration}.label`)
                      : t('newDraftOrder.overview.notSet')}
                  </p>
                </td>
                <td className="py-3 text-[10px]">
                  {line.sizes.length
                    ? line.sizes.map((size) => `${size.quantity} ${size.size}`).join(' · ')
                    : t('newDraftOrder.review.lines.sizesNotSet')}
                </td>
                <td className="py-3 text-right text-xs tabular-nums">{line.quantity}</td>
                <td className="py-3 text-right text-xs tabular-nums">{money(line.garmentUnitPrice + line.artUnitPrice + line.decorationUnitPrice)}</td>
                <td className="py-3 text-right text-xs tabular-nums">{money(line.lineTotal)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="py-6 text-center text-[13px] text-[#6B6B70]">
                  {t('newDraftOrder.review.print.noItems')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-5 ml-auto w-full max-w-[320px]">
        <dl className="m-0 flex flex-col">
          <div className="flex justify-between gap-4 py-1.5 text-[13px]">
            <dt className="text-[#6B6B70]">{t('newDraftOrder.overview.subtotal')}</dt>
            <dd className="m-0 tabular-nums">{money(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 py-1.5 text-[13px]">
            <dt className="text-[#6B6B70]">{t('newDraftOrder.review.total.lines.tax', {rate: taxRate})}</dt>
            <dd className="m-0 tabular-nums">{money(tax)}</dd>
          </div>
          <div className="mt-1 flex justify-between gap-4 border-t border-[#D7D7DA] pt-3 text-base font-semibold">
            <dt>{t('newDraftOrder.review.print.total')}</dt>
            <dd className="m-0 tabular-nums">{money(total)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 border-t border-[#D7D7DA] pt-4">
        <h3 className="m-0 text-sm font-semibold">{t('newDraftOrder.review.print.approvalSummary')}</h3>
        {lines.length ? (
          <ul className="mt-3 mb-0 flex list-none flex-col divide-y divide-[#ECECEE] border-y border-[#ECECEE] p-0">
            {lines.map((line) => (
              <li key={line.id} className="flex items-start justify-between gap-2 py-2.5 text-[13px]">
                <span className="font-medium text-[#111113]">
                  {t('newDraftOrder.review.confirmation.approvalLine', {
                    number: line.lineNumber,
                    name: line.name,
                  })}
                </span>
                <span className="text-xs text-[#6B6B70]">
                  {approvedOn[line.id]
                    ? t('newDraftOrder.review.confirmation.approvedOn', {
                        date: new Date(`${approvedOn[line.id]}T00:00:00.000Z`),
                      })
                    : t('newDraftOrder.review.confirmation.approved')}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <footer className="border-t border-[#D7D7DA] pt-4 text-xs leading-[1.5] text-[#6B6B70]">
        <p className="m-0">{t('newDraftOrder.review.confirmation.footer')}</p>
        <p className="mt-2 mb-0">{t('newDraftOrder.review.confirmation.companyFooter')}</p>
      </footer>
    </article>
  );
}
