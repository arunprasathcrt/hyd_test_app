import {useTranslation} from 'react-i18next';
import {CUSTOMER_PROFILE_TABS, type CustomerProfileTab} from '../types';
import { Button } from '~/shared/components/ui/Button';

export interface CustomerProfileTabsProps {
  activeTab: CustomerProfileTab;
  onChange: (tab: CustomerProfileTab) => void;
}

/** The drawer's tab strip. */
export function CustomerProfileTabs({
  activeTab,
  onChange,
}: CustomerProfileTabsProps) {
  const {t} = useTranslation('accounts');

  return (
    <div
      className="flex shrink-0 gap-0 overflow-x-auto border-b border-[#ECECEE] bg-white"
      role="tablist"
    >
      {CUSTOMER_PROFILE_TABS.map((tab) => (
        <Button
          key={tab}
          type="button"
          variant="tabUnderline"
          shape = 'square'
          size="small"
          aria-selected={activeTab === tab}
          role="tab"
          onClick={() => onChange(tab)}
          disabled={
            tab !== 'overview' &&
            tab !== 'orders' &&
            tab !== 'invoices' &&
            tab !== 'finance' &&
            tab !== 'products' &&
            tab !== 'team' &&
            tab !== 'activity'
          }
        >
          {t(`drawer.tabs.${tab}`)}
          {tab !== 'overview' &&
            tab !== 'orders' &&
            tab !== 'invoices' &&
            tab !== 'finance' &&
            tab !== 'products' &&
            tab !== 'draftOrders' &&
            tab !== 'team' && 
            tab !== 'activity' ? (
            <span
              aria-hidden="true"
              className="text-[10px] text-[#B0B0B5]"
            >
              🔒
            </span>
          ) : null}
        </Button>
      ))}
    </div>
  );
}
