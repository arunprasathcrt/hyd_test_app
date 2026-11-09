import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  accountForecast,
  accountHero,
  accountOpenAr,
  accountOverview,
  accountPastDueAr,
  accountYoyDelta,
} from '../lib/profile-fallback';
import type {Account} from '../../accounts/types/account';
import {CustomerProfileTabPanel} from './CustomerProfileTabPanel';
import {CustomerProfileTabs} from './CustomerProfileTabs';
import type {CustomerProfileTab} from '../types';
import {initialsFor} from '~/features/accounts/lib/company';
import {Button} from '~/shared/components/ui/Button';

export interface CustomerProfileDrawerProps {
  account: Account;
  onClose: () => void;
}

export function CustomerProfileDrawer({
  account,
  onClose,
}: CustomerProfileDrawerProps) {
  const {t} = useTranslation('accounts');
  const {t: tCommon} = useTranslation('common');
  const {t: tEnums} = useTranslation('enums');
  const metricEmpty = t('table.metricEmpty');
  const [activeTab, setActiveTab] = useState<CustomerProfileTab>('overview');
  const tabContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tabContentRef.current?.scrollTo({top: 0, behavior: 'auto'});
  }, [activeTab]);

  function handleTabChange(tab: CustomerProfileTab) {
    setActiveTab(tab);
  }

  const hero = accountHero(account);
  const overview = accountOverview(account);
  const forecast = accountForecast(account);
  const yoyDelta = accountYoyDelta(account);
  const openAr = accountOpenAr(account);
  const pastDueAr = accountPastDueAr(account);
  const segmentLabel = account.segment
    ? tEnums(`segment.${account.segment}`)
    : metricEmpty;

  return (
    <div className="fixed inset-0 z-[200] bg-black/20">
      <Button
        type="button"
        aria-label={t('drawer.close')}
        onClick={onClose}
        variant="ghost"
        shape="square"
        className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent"
      />

      <aside
        aria-labelledby="customer-drawer-title"
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-[90vw] max-w-[1400px] flex-col border-l border-[#ECECEE] bg-white shadow-[0_20px_60px_rgba(17,17,19,0.08)] max-[640px]:w-full"
        role="dialog"
      >
        {/* Hero band */}
        <header className="shrink-0 border-b border-[#ECECEE] px-7 pb-[18px] pt-6 max-[640px]:px-[18px] max-[640px]:pb-4 max-[640px]:pt-[22px]">
          <div className="mb-3.5 flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-[#F3F3F4] px-2.5 py-[3px] text-[10.5px] font-medium uppercase tracking-[0.1em] text-[#5C5C61]">
                {t('drawer.hero.tierBadge', {tier: hero.tier})}
              </span>

              <span className="inline-flex items-center rounded-full bg-[#E8F1F0] px-2.5 py-[3px] text-[10.5px] font-medium uppercase tracking-[0.1em] text-[#0F4C4C]">
                {segmentLabel}
              </span>

              <span className="inline-flex items-center rounded-full bg-[#F3F3F4] px-2.5 py-[3px] text-[10.5px] font-medium uppercase tracking-[0.1em] text-[#5C5C61]">
                {tEnums(`brand.${hero.brand}`)}
              </span>

              {hero.licensed ? (
                <span className="inline-flex items-center rounded-full bg-[#FBF6E5] px-2.5 py-[3px] text-[10.5px] font-medium uppercase tracking-[0.1em] text-[#7A5B16]">
                  {t('drawer.hero.licensedBadge')}
                </span>
              ) : null}

              {hero.platinum ? (
                <span className="inline-flex items-center rounded-full bg-[#F4ECFB] px-2.5 py-[3px] text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#6B21A8]">
                  {t('drawer.hero.platinumBadge')}
                </span>
              ) : null}

              {hero.creditHold.onHold ? (
                <span className="inline-flex items-center rounded-full border border-[#F3D9D6] bg-[#FCF4F3] px-2.5 py-[3px] text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#B42318]">
                  {t('drawer.hero.creditHoldBadge')}
                </span>
              ) : null}
            </div>

            <Button
              type="button"
              variant="iconClose"
              size="icon"
              aria-label={t('drawer.close')}
              onClick={onClose}
              className="h-9 w-9"
            >
              ×
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#444,#111)] text-[15px] font-medium text-white">
              {initialsFor(account.name)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="m-0 text-2xl font-medium leading-[1.15] tracking-[-0.02em] text-[#111113] max-[640px]:text-xl">
                {account.name}
              </p>

              <p className="mt-1 text-xs font-light text-[#5C5C61]">
                {hero.city} · {hero.primaryContact} ·{' '}
                {t('drawer.hero.since', {year: hero.sinceYear})}
              </p>
            </div>

          </div>
        </header>

        {/* KPI strip */}
        <div className="grid shrink-0 grid-cols-3 border-b border-[#ECECEE] max-[640px]:grid-cols-1">
          <div className="border-r border-[#ECECEE] px-6 py-[18px]">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
              {t('drawer.kpis.ytdShipped')}
            </div>

            <div className="mt-1.5 text-[22px] font-medium leading-none tracking-[-0.015em] tabular-nums text-[#C9A227]">
              {tCommon('format.money', {value: overview.shippedYtd})}
            </div>

            <div className="mt-0.5 text-[11px] text-[#5C5C61]">
              {yoyDelta >= 0
                ? t('drawer.kpis.yoyUp', {
                    value: tCommon('format.percent', {value: yoyDelta}),
                  })
                : t('drawer.kpis.yoyDown', {
                    value: tCommon('format.percent', {
                      value: Math.abs(yoyDelta),
                    }),
                  })}
            </div>
          </div>

          <div className="border-r border-[#ECECEE] px-6 py-[18px] max-[640px]:border-r-0 max-[640px]:border-b">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
              {t('drawer.kpis.forecastFy')}
            </div>

            <div className="mt-1.5 text-[22px] font-medium leading-none tracking-[-0.015em] tabular-nums text-[#111113]">
              {tCommon('format.money', {value: forecast.value})}
            </div>

            <div className="mt-0.5 text-[11px] leading-tight text-[#5C5C61]">
              {t(`drawer.kpis.basis.${forecast.basisKey}`)}
            </div>
          </div>

          <div className="px-6 py-[18px]">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
              {t('drawer.kpis.openAr')}
            </div>

            <div
              className="mt-1.5 text-[22px] font-medium leading-none tracking-[-0.015em] tabular-nums"
              style={{color: pastDueAr > 0 ? '#B7404E' : '#4A8569'}}
            >
              {tCommon('format.money', {value: openAr})}
            </div>

            <div className="mt-0.5 text-[11px] text-[#5C5C61]">
              {pastDueAr > 0
                ? t('drawer.kpis.pastDue', {
                    value: tCommon('format.money', {value: pastDueAr}),
                  })
                : t('drawer.kpis.allCurrent')}
            </div>
          </div>
        </div>

        <CustomerProfileTabs activeTab={activeTab} onChange={handleTabChange} />

        {/* Scrollable tab content */}
        <div ref={tabContentRef} className="flex-1 overflow-y-auto p-5">
          <CustomerProfileTabPanel
            account={account}
            activeTab={activeTab}
            onViewInvoices={() => handleTabChange('invoices')}
          />
        </div>

        {/* Drawer footer */}
        <footer className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#ECECEE] bg-white px-6 py-3.5">
          <Button
            type="button"
            variant="outline"
            size="control"
            shape="md"
            onClick={onClose}
          >
            {t('drawer.footer.close')}
          </Button>

          <Button
            type="button"
            variant="default"
            size="control"
            shape="md"
            disabled
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              className="h-[13px] w-[13px] shrink-0"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              viewBox="0 0 24 24"
            >
              <path d="M22 2 11 13" />
              <path d="m22 2-7 20-4-9-9-4Z" />
            </svg>

            <span>{t('drawer.footer.emailPrimaryContact')}</span>
          </Button>
        </footer>
      </aside>
    </div>
  );
}
