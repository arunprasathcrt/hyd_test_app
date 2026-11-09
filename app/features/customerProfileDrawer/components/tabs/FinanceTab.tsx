import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {FinanceAccount} from '../../types/finance';
import { Button } from '~/shared/components/ui/Button';

export interface FinanceTabProps {
  account: FinanceAccount;
  onViewInvoices: () => void;
}

type PillTone = 'success' | 'warning' | 'neutral';

const moneyFormat = {
  formatParams: {value: {maximumFractionDigits: 0}},
};

export function FinanceTab({account, onViewInvoices}: FinanceTabProps) {
  const {t} = useTranslation('finance');
  const {t: tCommon} = useTranslation('common');
  const [shippingSearch, setShippingSearch] = useState('');

  const usedPercent =
    account.credit.orderLimit > 0
      ? Math.min(
          100,
          Math.round((account.credit.used / account.credit.orderLimit) * 100),
        )
      : 0;
  const filteredShippingAddresses = useMemo(() => {
    const query = shippingSearch.trim().toLowerCase();
    if (!query) return account.shippingAddresses;

    return account.shippingAddresses.filter((address) =>
      [address.name, address.address, address.siteNumber, address.billToNumber]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [account.shippingAddresses, shippingSearch]);

  return (
    <div className="w-full text-sm leading-6 text-utds-ink tabular-nums">
      <div className="w-full">
        <div className="mb-4 rounded-xl border border-[#CFE3D7] bg-[#EAF1ED] px-3.5 py-[11px] text-xs text-[#223344]">
          {t('overview.intro')}{' '}
          <strong>{t('overview.readOnly')}</strong>{' '}
          {t('overview.systemPrefix')}{' '}
          <strong>{t('overview.systemName')}</strong>
          {t('overview.systemSuffix')}
        </div>

        <FinanceCard>
          <FinanceLabel>{t('status.label')}</FinanceLabel>
          <div className="mt-1.5">
            <FinancePill>{t('status.approved')}</FinancePill>{' '}
            <span className="text-[11px] text-utds-muted">
              {t('status.approvedByDate', {
                name: account.approvedBy,
                date: account.approvedDate,
              })}
            </span>
          </div>
          <div className="mt-[11px] flex flex-wrap gap-4 border-t border-utds-border-subtle pt-[11px] text-[11px] text-utds-muted">
            <span>
              {t('status.customerNumber')}{' '}
              <strong className="text-utds-ink">{account.customerNumber}</strong>
            </span>
            <span>
              {t('status.organizationNumber')}{' '}
              <strong className="text-utds-ink">{account.organizationNumber}</strong>
            </span>
            <span>
              {t('status.collector')}{' '}
              <strong className="text-utds-ink">{account.collector}</strong>
            </span>
            <span>
              {t('status.invoiceDelivery')}{' '}
              <strong className="text-utds-ink">{account.invoiceDelivery}</strong>
              {' · '}
              {account.invoiceEmail}
            </span>
          </div>
        </FinanceCard>

        <FinanceSection title={t('credit.section')}>
          <div className="flex flex-wrap items-start gap-[18px]">
            <div className="min-w-[200px] flex-1">
              <FinanceLabel>
                {account.credit.bureau} · {t('credit.pulled')} {account.credit.pulled}
              </FinanceLabel>
              <div className="mt-1.5 flex items-baseline gap-3.5">
                <span className="text-[22px] font-semibold leading-6 text-utds-ink">
                  {account.credit.grade}
                </span>
                <FinancePill>
                  {account.credit.risk} {t('credit.riskSuffix')}
                </FinancePill>
              </div>
              <FinanceHelper>
                {t('credit.scoreHint')}{' '}
                {tCommon('format.money', {value: account.credit.suggested, ...moneyFormat})}
              </FinanceHelper>
            </div>

            <div className="min-w-[220px] flex-1">
              <div className="grid grid-cols-2 gap-x-[18px] gap-y-3">
                <FinanceField label={t('credit.requested')}>
                  {formatMoney(tCommon, account.credit.requested)}
                </FinanceField>
                <FinanceField label={t('credit.approvedLimit')}>
                  {formatMoney(tCommon, account.credit.approved)}
                </FinanceField>
              </div>
              <FinanceLabel className="mt-2.5 block">
                {t('credit.utilization', {
                  used: formatMoney(tCommon, account.credit.used),
                  limit: formatMoney(tCommon, account.credit.orderLimit),
                  percent: usedPercent,
                })}
              </FinanceLabel>
              <div className="my-[7px] h-[7px] overflow-hidden rounded bg-utds-border-subtle">
                <div
                  className={`h-full ${usedPercent > 90 ? 'bg-[#B42318]' : usedPercent > 70 ? 'bg-[#B4540A]' : 'bg-[#2E5944]'}`}
                  style={{width: `${usedPercent}%`}}
                />
              </div>
              <div className="mt-2.5 flex flex-wrap gap-[18px]">
                <FinanceField label={t('credit.orderLimit')}>
                  {formatMoney(tCommon, account.credit.orderLimit)}
                </FinanceField>
                <FinanceField label={t('credit.available')}>
                  {formatMoney(tCommon, account.credit.available)}
                </FinanceField>
              </div>
              <FinanceHelper>{t('credit.helper')}</FinanceHelper>
            </div>
          </div>
        </FinanceSection>

        <FinanceSection title={t('profile.section')}>
          <div className="grid grid-cols-1 gap-x-[18px] gap-y-3 min-[681px]:grid-cols-3">
            <FinanceField label={t('profile.collector')}>{account.collector}</FinanceField>
            <FinanceField label={t('profile.rating')}>{account.profile.rating}</FinanceField>
            <FinanceField label={t('profile.classification')}>{account.profile.classification}</FinanceField>
            <FinanceField label={t('profile.reviewCycle')}>{account.profile.reviewCycle}</FinanceField>
            <FinanceField label={t('profile.accountStatus')}>{account.profile.accountStatus}</FinanceField>
            <FinanceField label={t('profile.riskCode')}>{account.profile.riskCode}</FinanceField>
            <FinanceField label={t('profile.tolerance')}>{`${account.profile.tolerancePct}%`}</FinanceField>
            <FinanceField label={t('profile.creditCheck')}>
              <FinancePill tone={account.profile.creditCheck ? 'success' : 'neutral'}>
                {account.profile.creditCheck ? t('profile.on') : t('profile.off')}
              </FinancePill>
            </FinanceField>
            <FinanceField label={t('profile.creditHold')}>
              <FinancePill tone={account.profile.creditHold ? 'neutral' : 'success'}>
                {account.profile.creditHold ? t('profile.on') : t('profile.off')}
              </FinancePill>
            </FinanceField>
            <FinanceField label={t('profile.overrideTerms')}>
              {account.profile.overrideTerms ? t('profile.yes') : t('profile.no')}
            </FinanceField>
            <FinanceField label={t('profile.discountGrace')}>{`${account.profile.discountGraceDays} ${t('days')}`}</FinanceField>
            <FinanceField label={t('profile.receiptGrace')}>{`${account.profile.receiptGraceDays} ${t('days')}`}</FinanceField>
          </div>
          <FinanceHelper>{t('profile.helper', {rule: account.profile.autoCashRule})}</FinanceHelper>
        </FinanceSection>

        <FinanceSection title={t('terms.section')}>
          <div className="grid grid-cols-1 gap-x-[18px] gap-y-3 min-[681px]:grid-cols-3">
            <FinanceField label={t('terms.label')}>{account.terms}</FinanceField>
            <FinanceField label={t('terms.tier')}>{account.tier}</FinanceField>
            <FinanceField label={t('terms.methods')}>{account.paymentMethods.join(' · ')}</FinanceField>
          </div>
          <FinanceHelper>{t('terms.helper')}</FinanceHelper>
        </FinanceSection>

        <FinanceSection title={t('charges.section')}>
          <div className="grid grid-cols-1 gap-x-[18px] gap-y-3 min-[681px]:grid-cols-3">
            <FinanceField label={t('charges.interest')}>{`${account.charges.interestRatePct}%`}</FinanceField>
            <FinanceField label={t('charges.maxInterest')}>{formatMoney(tCommon, account.charges.maxInterest)}</FinanceField>
            <FinanceField label={t('charges.minStatement')}>{formatMoney(tCommon, account.charges.minStatement)}</FinanceField>
            <FinanceField label={t('charges.minDunning')}>{formatMoney(tCommon, account.charges.minDunning)}</FinanceField>
            <FinanceField label={t('charges.minReceipt')}>{formatMoney(tCommon, account.charges.minReceipt)}</FinanceField>
            <FinanceField label={t('charges.minCustomerBalance')}>{formatMoney(tCommon, account.charges.minCustBalForCharges)}</FinanceField>
          </div>
          <FinanceHelper>{t('charges.helper')}</FinanceHelper>
        </FinanceSection>

        <FinanceSection title={t('tax.section')}>
          <div className="grid grid-cols-1 gap-x-[18px] gap-y-3 min-[681px]:grid-cols-3">
            <FinanceField label={t('tax.salesTax')}><FinancePill tone={account.tax.exempt ? 'success' : 'neutral'}>{account.tax.exempt ? t('tax.taxExempt') : t('tax.taxable')}</FinancePill></FinanceField>
            <FinanceField label={t('tax.exemptionCertificate')}>{account.tax.cert}</FinanceField>
            <FinanceField label={t('tax.certExpires')}>{account.tax.expires}</FinanceField>
            <FinanceField label={t('tax.ein')}>{account.tax.ein}</FinanceField>
            <FinanceField label={t('status.invoiceDelivery')}>{account.invoiceDelivery} · {account.invoiceEmail}</FinanceField>
          </div>
        </FinanceSection>

        <FinanceSection title={t('classification.section')}>
          <div className="grid grid-cols-1 gap-x-[18px] gap-y-3 min-[681px]:grid-cols-3">
            <FinanceField label={t('classification.customerType')}>{account.classification.customerType}</FinanceField>
            <FinanceField label={t('classification.customerClass')}>{account.classification.customerClass}</FinanceField>
            <FinanceField label={t('classification.profileClass')}>{account.classification.profileClass}</FinanceField>
          </div>
          <FinanceHelper>{t('classification.helper')}</FinanceHelper>
        </FinanceSection>

        <FinanceSection title={t('addresses.billing', {count: account.billingAddresses.count})}>
          <FinanceHelper>{t('addresses.billingHelper')}</FinanceHelper>
        </FinanceSection>

        <FinanceSection title={t('addresses.shipping', {count: account.shippingAddresses.length})}>
          <input
            type="text"
            value={shippingSearch}
            onChange={(event) => setShippingSearch(event.target.value)}
            placeholder={t('addresses.searchPlaceholder')}
            aria-label={t('addresses.searchAriaLabel')}
            className="box-border w-full rounded-[10px] border border-[#E4E4E6] bg-utds-raised px-3 py-[9px] text-[13px] text-utds-ink outline-none placeholder:text-utds-muted focus:border-utds-charcoal"
          />
          <FinanceHelper>
            {t('addresses.showing', {shown: filteredShippingAddresses.length, total: account.shippingAddresses.length})}
          </FinanceHelper>
          <div className="mt-2">
            {filteredShippingAddresses.slice(0, 12).map((address) => (
              <div key={address.siteNumber} className="flex flex-col gap-1 border-b border-utds-border-row py-2.5 min-[681px]:flex-row min-[681px]:items-center min-[681px]:gap-3">
                <div className="text-[12.5px] font-medium text-utds-ink">
                  {address.name}{' '}
                  {address.inactive ? <FinancePill tone="neutral">{t('addresses.inactive')}</FinancePill> : null}
                </div>
                <div className="text-[11px] text-utds-muted">
                  {t('addresses.row', {address: address.address, site: address.siteNumber, billTo: address.billToNumber})}
                </div>
              </div>
            ))}
            {filteredShippingAddresses.length === 0 ? <FinanceHelper>{t('addresses.noResults')}</FinanceHelper> : null}
          </div>
        </FinanceSection>

        <FinanceSection title={t('ar.section')}>
          <div className="grid grid-cols-2 gap-x-[18px] gap-y-3 min-[681px]:grid-cols-4">
            <FinanceAmount label={t('ar.current')} value={account.ar.current} />
            <FinanceAmount label={t('ar.pastDue1To30')} value={account.ar.pastDue1To30} danger={account.ar.pastDue1To30 > 0} />
            <FinanceAmount label={t('ar.pastDue31To60')} value={account.ar.pastDue31To60} danger={account.ar.pastDue31To60 > 0} />
            <FinanceAmount label={t('ar.pastDue61Plus')} value={account.ar.pastDue61Plus} danger={account.ar.pastDue61Plus > 0} />
          </div>
          <div className="mt-3 flex flex-wrap gap-5 border-t border-utds-border-subtle pt-3">
            <FinanceField label={t('ar.outstanding')}>{formatMoney(tCommon, account.ar.outstanding)}</FinanceField>
            <FinanceField label={t('ar.onAccountCash')}>{formatMoney(tCommon, account.ar.onAccountCash)}</FinanceField>
            <FinanceField label={t('ar.onAccountCredits')}>{formatMoney(tCommon, account.ar.onAccountCredits)}</FinanceField>
            <FinanceField label={t('ar.unappliedCash')}>{formatMoney(tCommon, account.ar.unappliedCash)}</FinanceField>
            <FinanceField label={t('ar.receiptsAtRisk')}>{formatMoney(tCommon, account.ar.receiptsAtRisk)}</FinanceField>
            <FinanceField label={t('ar.customerBalance')} weight="bold">{formatMoney(tCommon, account.ar.customerBalance)}</FinanceField>
          </div>
          <Button
            type="button"
            variant="outline"
            size="small"
            shape="md"
            onClick={onViewInvoices}
            className="mt-3"
          >
            {t('ar.viewInvoices')}
          </Button>
        </FinanceSection>

        <FinanceSection title={t('requests.section')}>
          {account.requests.openCount === 0 ? (
            <div className="py-1.5 text-xs text-utds-muted">{t('requests.empty')}</div>
          ) : (
            <div className="py-1.5 text-xs text-utds-ink">
              {t('requests.open', {count: account.requests.openCount})}
            </div>
          )}
        </FinanceSection>
      </div>
    </div>
  );
}

function FinanceSection({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <section className="mb-3.5">
      <h2 className="my-[18px] mb-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-utds-muted">{title}</h2>
      <div className="rounded-[14px] border border-utds-border-subtle bg-utds-raised p-3.5 min-[681px]:px-4">{children}</div>
    </section>
  );
}

function FinanceCard({children}: {children: React.ReactNode}) {
  return <div className="mb-3.5 rounded-[14px] border border-utds-border-subtle bg-utds-raised p-3.5 min-[681px]:px-4">{children}</div>;
}

function FinanceLabel({children, className = ''}: {children: React.ReactNode; className?: string}) {
  return <div className={`text-[9px] font-semibold uppercase tracking-[0.08em] text-utds-muted ${className}`}>{children}</div>;
}

function FinanceHelper({children}: {children: React.ReactNode}) {
  return <div className="mt-2 text-[11px] leading-5 text-utds-muted">{children}</div>;
}

function FinanceField({label, children, weight = 'normal'}: {label: string; children: React.ReactNode; weight?: 'normal' | 'semibold' | 'bold'}) {
  return (
    <div>
      <FinanceLabel>{label}</FinanceLabel>
      <div className={`mt-0.5 break-words text-[13px] text-utds-ink ${weight === 'semibold' ? 'font-semibold' : weight === 'bold' ? 'font-bold' : 'font-normal'}`}>{children}</div>
    </div>
  );
}

function FinancePill({children, tone = 'success'}: {children: React.ReactNode; tone?: PillTone}) {
  const toneClass = tone === 'success' ? 'bg-[#EAF1ED] text-[#2E5944]' : tone === 'warning' ? 'bg-[#FBF6E5] text-[#7A5B16]' : 'bg-[#F1F1F1] text-[#6B6B6B]';
  return <span className={`inline-flex items-center gap-[5px] rounded-full px-2.5 py-[3px] text-[10.5px] font-semibold leading-6 ${toneClass}`}>{children}</span>;
}

function FinanceAmount({label, value, danger = false}: {label: string; value: number; danger?: boolean}) {
  const {t} = useTranslation('common');
  return <div><FinanceLabel>{label}</FinanceLabel><div className={`mt-[3px] text-[22px] font-semibold leading-8 ${danger ? 'text-[#B4540A]' : 'text-[#2E5944]'}`}>{t('format.money', {value})}</div></div>;
}

function formatMoney(t: (key: string, options?: Record<string, unknown>) => string, value: number) {
  return t('format.money', {value});
}
