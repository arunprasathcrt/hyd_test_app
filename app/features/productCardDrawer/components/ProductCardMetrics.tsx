import {useTranslation} from 'react-i18next';
function Metric({label, value}: {label: string; value: string}) {
  return (
    <div className="flex-1">
      <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#8E8E93]">{label}</div>
      <div className="mb-3 mt-[3px] text-[18px] font-semibold tabular-nums text-[#111113]">{value}</div>
    </div>
  );
}

export function ProductCardMetrics() {
  const {t} = useTranslation('productCardDrawer');
  return (
    <div className="flex shrink-0 gap-0 border-b border-[#F4F4F2] px-8 pt-[14px]">
      <Metric label={t('metrics.bundlePrice')} value={t('metrics.bundlePriceValue')} />
      <Metric label={t('metrics.lifetimeUnits')} value={t('metrics.lifetimeUnitsValue')} />
      <Metric label={t('metrics.openOrders')} value={t('metrics.openOrdersValue')} />
    </div>
  );
}
