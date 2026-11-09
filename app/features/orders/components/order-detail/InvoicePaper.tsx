import {useTranslation} from 'react-i18next';
import {cn} from '~/shared/utils/cn';
import type {OrderInvoice} from '../../types/order-detail';

/*
 * Prototype `invoiceDoc()` draws a US Letter page (612 × 792 pt) shown 816px
 * wide (`#od113L .od113-page`). The root font is 16px at 816px and scales with
 * the container, so every size below is `em` = prototype pt × 4/3 ÷ 16, and the
 * page shrinks as one piece under "Fit width".
 */
const GREY = 'text-[#6B6B70]';
const RULE = 'border-[#D7D7DA]';

export function InvoicePaper({invoice, className}: {invoice: OrderInvoice; className?: string}) {
  const {t} = useTranslation('orders');
  const {t: tEnums} = useTranslation('enums');
  const issued = invoice.issued;
  const kind = invoice.kind;
  const title = issued ? t('detail.invoice.title.issued', {number: issued.number}) : t('detail.invoice.title.proForma');

  const meta = [
    {key: 'number', value: issued ? issued.number : t('detail.invoice.doc.notIssued')},
    {key: 'date', value: issued ? t('detail.format.date', {value: issued.issued}) : t('detail.invoice.doc.whenShips')},
    {
      key: 'due',
      value: issued ? t('detail.invoice.doc.dueValue', {date: t('detail.format.date', {value: issued.due}), terms: invoice.terms}) : invoice.terms,
    },
    {key: 'order', value: invoice.orderId},
    {key: 'po', value: invoice.po || t('detail.invoice.doc.poNotSet')},
    {key: 'rep', value: invoice.rep},
  ] as const;

  const totals = [
    {key: 'subtotal', value: invoice.subtotal},
    ...(invoice.discount ? [{key: 'discount', value: -invoice.discount}] : []),
    {key: 'tax', value: invoice.tax},
  ] as const;

  return (
    <div className={cn('@container', className)}>
      <article
        aria-label={t('detail.invoice.pageLabel', {title})}
        className="flex aspect-[612/792] w-full flex-col bg-white px-[4.5em] pt-[4.1em] pb-[3.4em] text-[length:calc(100cqw/51)] leading-[1.35] text-[#111113] shadow-[0_0_0_1px_#ECECEE,0_4px_12px_rgba(17,17,19,.1)] print:shadow-none"
      >
        <header className="flex items-start justify-between gap-[1em]">
          <div>
            <p className="text-[1.25em] font-semibold">{t('detail.invoice.doc.company')}</p>
            <p className={`text-[0.75em] ${GREY}`}>{t('detail.invoice.doc.tagline')}</p>
          </div>
          <p className="text-[1.333em] font-semibold">{t(`detail.invoice.doc.heading.${kind}`)}</p>
        </header>

        <div className="mt-[1.4em] grid grid-cols-[152fr_154fr_198fr]">
          <div>
            <p className={`text-[0.75em] ${GREY}`}>{t('detail.invoice.doc.billTo')}</p>
            <p className="mt-[0.35em] text-[0.792em] font-semibold">{invoice.billTo.account}</p>
            <p className="text-[0.792em]">{invoice.billTo.contact}</p>
          </div>
          <div>
            <p className={`text-[0.75em] ${GREY}`}>{t('detail.invoice.doc.shipTo')}</p>
            <p className="mt-[0.35em] text-[0.792em] font-semibold">{invoice.shipTo.name}</p>
            <p className="text-[0.792em]">{invoice.shipTo.city}</p>
          </div>
          <dl className="flex flex-col">
            {meta.map((row) => (
              <div key={row.key} className="flex items-baseline justify-between gap-[1em] text-[0.75em] leading-[1.45]">
                <dt className={GREY}>{t(`detail.invoice.doc.meta.${row.key}`)}</dt>
                <dd className="truncate text-right font-semibold">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <table className="mt-[2.2em] w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[56.7%]" />
            <col className="w-[9.5%]" />
            <col className="w-[16.3%]" />
            <col className="w-[17.5%]" />
          </colgroup>
          <thead>
            <tr className={`border-y-[1.33px] ${RULE} text-[0.75em]`}>
              <th className="py-[0.5em] text-left font-semibold">{t('detail.invoice.doc.columns.item')}</th>
              <th className="py-[0.5em] text-right font-semibold">{t('detail.invoice.doc.columns.qty')}</th>
              <th className="py-[0.5em] text-right font-semibold">{t('detail.invoice.doc.columns.unit')}</th>
              <th className="py-[0.5em] text-right font-semibold">{t('detail.invoice.doc.columns.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line) => (
              <tr key={line.sku} className={`border-b-[0.67px] ${RULE} align-top`}>
                <td className="py-[0.6em] pr-[1em]">
                  <p className="truncate text-[0.833em] font-semibold">{line.name}</p>
                  <p className={`truncate text-[0.708em] ${GREY}`}>
                    {t('detail.invoice.doc.lineDetail', {
                      sku: line.sku,
                      color: line.color,
                      method: tEnums(`decorationMethod.${line.decoration}`),
                      placement: line.placement.toLocaleLowerCase(),
                    })}
                  </p>
                  <p className={`truncate text-[0.708em] ${GREY}`}>
                    {t('detail.invoice.doc.lineSizes', {
                      sizes: line.sizes.map((size) => t('detail.invoice.doc.sizeQty', size)).join(', '),
                      upc: line.upc,
                    })}
                  </p>
                </td>
                <td className="py-[0.6em] text-right text-[0.833em] tabular-nums">{t('detail.format.count', {value: line.qty})}</td>
                <td className="py-[0.6em] text-right text-[0.833em] tabular-nums">{t('detail.format.money', {value: line.unit})}</td>
                <td className="py-[0.6em] text-right text-[0.833em] tabular-nums">{t('detail.format.money', {value: line.amount})}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="mt-[0.9em] ml-auto flex w-[39.3%] flex-col">
          {totals.map((row) => (
            <div key={row.key} className="flex justify-between gap-[1em] py-[0.2em] text-[0.792em]">
              <dt className={GREY}>{t(`detail.invoice.doc.${row.key}`)}</dt>
              <dd className="tabular-nums">{t('detail.format.money', {value: row.value})}</dd>
            </div>
          ))}
          <div className={`mt-[0.3em] flex justify-between gap-[1em] border-t-[1.33px] ${RULE} pt-[0.5em] text-[0.917em] font-semibold`}>
            <dt>{t(`detail.invoice.doc.total.${kind}`)}</dt>
            <dd className="tabular-nums">{t('detail.format.money', {value: invoice.total})}</dd>
          </div>
          {issued ? (
            <div className="flex justify-between gap-[1em] py-[0.2em] text-[0.792em]">
              <dt className={GREY}>{t('detail.invoice.doc.amountDue')}</dt>
              <dd className="font-semibold tabular-nums">{t('detail.format.money', {value: invoice.total})}</dd>
            </div>
          ) : null}
        </dl>

        <p className={`mt-[1.5em] text-[0.75em] ${GREY}`}>
          {t(`detail.invoice.doc.footnote.${kind}`, {terms: invoice.terms})}
        </p>

        <footer className={`mt-auto flex justify-between gap-[1em] border-t-[0.67px] ${RULE} pt-[0.9em] text-[0.708em] ${GREY}`}>
          <span>{t('detail.invoice.doc.questions', {rep: invoice.rep})}</span>
          <span>{t('detail.invoice.doc.page')}</span>
        </footer>
      </article>
    </div>
  );
}
