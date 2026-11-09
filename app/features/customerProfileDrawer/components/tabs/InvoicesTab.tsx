import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {AccountInvoiceStatus} from '../../types/profile';
import {CUSTOMER_INVOICES} from '~/features/customerProfileDrawer/lib/invoice-fallback';
import {InvoiceDetailModal} from '~/features/invoiceDrawer/components/InvoiceDetailsModal';
import {Button} from '~/shared/components/ui/Button';

interface InvoiceHistoryRow {
  id: string;
  issued: string;
  due: string;
  terms: string;
  po: string;
  order: string;
  amount: number;
  status: AccountInvoiceStatus;
}

/**
 * Placeholder invoice history. Invoices are ERP-only and not yet served from
 * Shopify (CLAUDE.md open items), so this stands in until that read path is
 * confirmed.
 */

const INVOICES: InvoiceHistoryRow[] = CUSTOMER_INVOICES.map((invoice) => ({
  id: invoice.id,
  issued: invoice.issueDate,
  due: invoice.dueDate,
  terms: invoice.detail.terms,
  po: invoice.detail.poNumber,
  order: invoice.detail.orderNumber,
  amount: Number(invoice.amount.replace(/[$,]/g, '')),
  status: invoice.status.toLowerCase() as AccountInvoiceStatus,
}));

const AGING_BUCKET_KEYS = [
  'current',
  'd1_30',
  'd31_60',
  'd61_90',
  'd90plus',
] as const;

/** Placeholder aging split — populated once the invoice read path is confirmed. */
const AGING_AMOUNTS: Record<(typeof AGING_BUCKET_KEYS)[number], number> = {
  current: 0,
  d1_30: 0,
  d31_60: 0,
  d61_90: 0,
  d90plus: 0,
};

/** Average days-to-pay is not derivable from the placeholder rows above. */
const AVG_DAYS_TO_PAY = 20;
const NET_TERM_DAYS = 30;

export function InvoicesTab() {
  const {t} = useTranslation('accounts');
  const {t: tCommon} = useTranslation('common');
  const {t: tEnums} = useTranslation('enums');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );

  const outstanding = INVOICES.filter(
    (invoice) => invoice.status !== 'paid',
  ).reduce((sum, invoice) => sum + invoice.amount, 0);
  const pastDue = INVOICES.filter(
    (invoice) => invoice.status === 'overdue',
  ).reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidTrailing12Mo = INVOICES.filter(
    (invoice) => invoice.status === 'paid',
  ).reduce((sum, invoice) => sum + invoice.amount, 0);
  const openCount = INVOICES.filter(
    (invoice) => invoice.status === 'due',
  ).length;
  const pastDueCount = INVOICES.filter(
    (invoice) => invoice.status === 'overdue',
  ).length;
  const paidCount = INVOICES.filter(
    (invoice) => invoice.status === 'paid',
  ).length;

  return (
    <>
      <div className="w-full space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[14px] border border-[#ECECEE] bg-white px-4 py-3.5">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
              {t('drawer.panels.invoices.summary.outstanding')}
            </div>
            <div className="mt-2 text-[22px] font-medium tracking-[-0.015em] text-[#4A8569] tabular-nums">
              {tCommon('format.money', {value: outstanding})}
            </div>
            <div className="mt-1 text-[11px] font-normal text-[#8E8E93]">
              {t('drawer.panels.invoices.summary.outstandingCount', {
                count: openCount,
              })}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#ECECEE] bg-white px-4 py-3.5">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
              {t('drawer.panels.invoices.summary.pastDue')}
            </div>
            <div className="mt-2 text-[22px] font-medium tracking-[-0.015em] text-[#4A8569] tabular-nums">
              {tCommon('format.money', {value: pastDue})}
            </div>
            <div className="mt-1 text-[11px] font-normal text-[#8E8E93]">
              {t('drawer.panels.invoices.summary.pastDueGood')}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#ECECEE] bg-white px-4 py-3.5">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
              {t('drawer.panels.invoices.summary.paidTrailing')}
            </div>
            <div className="mt-2 text-[22px] font-medium tracking-[-0.015em] text-[#111113] tabular-nums">
              {tCommon('format.money', {value: paidTrailing12Mo})}
            </div>
            <div className="mt-1 text-[11px] font-normal text-[#8E8E93]">
              {t('drawer.panels.invoices.summary.settledCount', {
                count: paidCount,
              })}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#ECECEE] bg-white px-4 py-3.5">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
              {t('drawer.panels.invoices.summary.avgDaysToPay')}
            </div>
            <div className="mt-2 text-[22px] font-medium tracking-[-0.015em] text-[#111113] tabular-nums">
              {tCommon('format.count', {value: AVG_DAYS_TO_PAY})}
            </div>
            <div className="mt-1 text-[11px] font-normal text-[#8E8E93]">
              {t('drawer.panels.invoices.summary.netTerms', {
                days: NET_TERM_DAYS,
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[14px] border border-[#ECECEE] bg-white px-4 py-4">
          <div className="mb-8 text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
            {t('drawer.panels.invoices.summary.aging')}
          </div>

          <div className="grid grid-cols-5 gap-3">
            {AGING_BUCKET_KEYS.map((bucket) => (
              <div key={bucket} className="min-w-0">
                <div className="h-[3px] w-full rounded-full bg-[#D7D7DA]" />
                <div className="mt-2 text-[11px] font-normal text-[#8E8E93]">
                  {t(`drawer.panels.invoices.summary.agingBuckets.${bucket}`)}
                </div>
                <div className="mt-1 text-[12px] font-medium tabular-nums text-[#111113]">
                  {AGING_AMOUNTS[bucket] > 0
                    ? tCommon('format.money', {value: AGING_AMOUNTS[bucket]})
                    : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" variant="default" size="control" shape="pill">
            {t('drawer.panels.invoices.summary.filters.all', {
              count: INVOICES.length,
            })}
          </Button>
          <Button type="button" variant="outline" size="control" className = 'font-normal text-[#5C5C61]'>
            {t('drawer.panels.invoices.summary.filters.open', {
              count: openCount,
            })}
          </Button>
          <Button type="button" variant="outline" size="control" className = 'font-normal text-[#5C5C61]'>
            {t('drawer.panels.invoices.summary.filters.pastDue', {
              count: pastDueCount,
            })}
          </Button>
          <Button type="button" variant="outline" size="control" className = 'font-normal text-[#5C5C61]' >
            {t('drawer.panels.invoices.summary.filters.paid', {
              count: paidCount,
            })}
          </Button>

          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              placeholder={t(
                'drawer.panels.invoices.summary.searchPlaceholder',
              )}
              aria-label={t('drawer.panels.invoices.summary.searchAriaLabel')}
              className="h-10 w-full rounded-full border border-[#ECECEE] bg-white px-4 text-[12.5px] font-normal text-[#111113] outline-none transition-colors duration-150 placeholder:text-[#8E8E93] focus:border-[#B8B8BC]"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-[#ECECEE] bg-white">
          {INVOICES.map((invoice, index) => (
            <Button
              key={invoice.id}
              type="button"
              onClick={() => setSelectedInvoiceId(invoice.id)}
              variant="ghost"
            >
              <span
                aria-hidden="true"
                className="ml-1 h-12 w-1 shrink-0 rounded-full bg-[#C7C7CC]"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold tracking-[-0.005em] text-[#111113]">
                    {invoice.id}
                  </span>

                  <span className="inline-flex items-center rounded-full bg-[#EAF1ED] px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.05em] text-[#2E5944]">
                    {tEnums(`invoiceStatus.${invoice.status}`)}
                  </span>
                </div>

                <div className="mt-1 text-[11.5px] font-normal leading-[1.4] text-[#5C5C61]">
                  {t('drawer.panels.invoices.summary.issuedDue', {
                    issued: invoice.issued,
                    due: invoice.due,
                    terms: invoice.terms,
                  })}
                  {' · '}
                  {invoice.po}
                  {' · '}
                  {invoice.order}
                </div>
              </div>

              <div className="shrink-0 text-right text-[14px] font-medium tabular-nums text-[#111113]">
                {tCommon('format.money', {value: invoice.amount})}
              </div>

              <span
                aria-hidden="true"
                className="mr-1 shrink-0 text-[18px] font-light leading-none text-[#C7C7CC]"
              >
                ›
              </span>
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t-2 border-[#111113] pt-3.5">
          <span className="text-[11.5px] font-medium uppercase tracking-[0.1em] text-[#5C5C61]">
            {t('drawer.panels.invoices.totalOutstanding')}
          </span>
          <span className="text-[18px] font-semibold tabular-nums text-[#111113]">
            {tCommon('format.money', {
              value: outstanding,
              formatParams: {
                value: {minimumFractionDigits: 2, maximumFractionDigits: 2},
              },
            })}
          </span>
        </div>

        <div className="text-[11px] font-light leading-[1.4] text-[#8E8E93]">
          {t('drawer.panels.invoices.summary.footerNote')}
        </div>
      </div>
      {selectedInvoiceId && (
        <InvoiceDetailModal
          invoiceId={selectedInvoiceId}
          invoices={CUSTOMER_INVOICES}
          onClose={() => setSelectedInvoiceId(null)}
          onNavigate={setSelectedInvoiceId}
        />
      )}
    </>
  );
}
