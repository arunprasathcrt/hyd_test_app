import {useTranslation} from 'react-i18next';
import {
  accountCurrentlyInFlight,
  accountHotStats,
} from '../../lib/profile-fallback';
import type {Account} from '../../../accounts/types/account';

const KIND_COLOR: Record<string, string> = {
  opp: '#0F4C4C',
  quote: '#C9A227',
  case: '#B7404E',
  order: '#4A8569',
};

export interface OverviewTabProps {
  account: Account;
}

export function OverviewTab({account}: OverviewTabProps) {
  const {t} = useTranslation('accounts');
  const {t: tCommon} = useTranslation('common');
  const hotStats = accountHotStats(account);
  const inFlight = accountCurrentlyInFlight(account);

  return (
    <>
      <div className="mb-6 rounded-[14px] border border-[rgba(201,162,39,0.2)] bg-[#FBF6E5] px-4 py-3.5">
        <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#7A5B16]">
          {t('drawer.panels.overview.nextStepLabel')}
        </div>
        <div className="text-[13.5px] font-medium leading-[1.4] tracking-[-0.005em] text-[#111113]">
          {t('drawer.panels.overview.nextStepDefault')}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <div className="rounded-[14px] border border-[#ECECEE] px-4 py-3.5">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
            {t('drawer.panels.overview.hotStats.activeDraftOrders')}
          </div>
          <div className="mt-1 text-[15px] font-medium tabular-nums text-[#111113]">
            {tCommon('format.count', {value: hotStats.activeDraftOrders})}
          </div>
        </div>
        <div className="rounded-[14px] border border-[#ECECEE] px-4 py-3.5">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
            {t('drawer.panels.overview.hotStats.openOpportunities')}
          </div>
          <div className="mt-1 text-[15px] font-medium tabular-nums text-[#111113]">
            {tCommon('format.count', {value: hotStats.openOpportunities})}
          </div>
        </div>
        <div className="rounded-[14px] border border-[#ECECEE] px-4 py-3.5">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
            {t('drawer.panels.overview.hotStats.lastOrder')}
          </div>
          <div className="mt-1 text-[15px] font-medium tabular-nums text-[#111113]">
            {hotStats.lastOrderDate
              ? tCommon('format.date', {
                  value: hotStats.lastOrderDate,
                  formatParams: {value: {dateStyle: 'medium'}},
                })
              : t('drawer.panels.overview.hotStats.lastOrderEmpty')}
          </div>
        </div>
        <div className="rounded-[14px] border border-[#ECECEE] px-4 py-3.5">
          <div className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
            {t('drawer.panels.overview.hotStats.netTerms')}
          </div>
          <div className="mt-1 text-[15px] font-medium tabular-nums text-[#111113]">
            {t('drawer.panels.overview.hotStats.netTerms', {
              days: hotStats.netTermDays,
            })}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
          {t('drawer.panels.overview.inFlightLabel')}
        </div>
        {inFlight.length === 0 ? (
          <div className="py-4 text-center text-[13px] font-light text-[#8E8E93]">
            {t('drawer.panels.overview.inFlightEmpty')}
          </div>
        ) : (
          inFlight.map((item, index) => (
            <div
              className={`flex w-full items-center gap-3 py-[11px] ${
                index < inFlight.length - 1 ? 'border-b border-[#ECECEE]' : ''
              }`}
              key={item.id}
            >
              <span
                className="inline-flex shrink-0 items-center rounded-full px-2.5 py-[3px] text-[10px] font-medium uppercase tracking-[0.1em]"
                style={{
                  backgroundColor: `${KIND_COLOR[item.kind]}1A`,
                  color: KIND_COLOR[item.kind],
                }}
              >
                {t(`drawer.panels.overview.kind.${item.kind}`)}
              </span>
              <span className="flex-1 truncate text-[13px] font-normal tracking-[-0.005em] text-[#111113]">
                {item.label}
              </span>
              <span className="shrink-0 text-xs font-medium tabular-nums text-[#5C5C61]">
                {tCommon('format.money', {value: item.amount})}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
