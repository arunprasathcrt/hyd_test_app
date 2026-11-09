import {useTranslation} from 'react-i18next';
import {DrawerMetric} from '../../../accounts/components/DrawerMetric';
import type {Account} from '../../../accounts/types/account';
import type {CustomerProfileTab} from '../../types';

export interface MetricsTabProps {
  account: Account;
  kind: CustomerProfileTab;
}

/** Finance, Forecast, and Revenue tabs — share the same two-metric layout. */
export function MetricsTab({account, kind}: MetricsTabProps) {
  const {t} = useTranslation('accounts');
  const {t: tCommon} = useTranslation('common');
  const metricEmpty = t('table.metricEmpty');

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8B8B8B]">
        {t(`drawer.panels.${kind}.title`)}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <DrawerMetric
          label={t('drawer.metrics.shipped')}
          value={
            account.shippedYtd === null
              ? metricEmpty
              : tCommon('format.money', {value: account.shippedYtd})
          }
        />
        <DrawerMetric
          label={t('drawer.metrics.open')}
          value={
            account.openOrders === null
              ? metricEmpty
              : tCommon('format.money', {value: account.openOrders})
          }
        />
      </div>
    </div>
  );
}
