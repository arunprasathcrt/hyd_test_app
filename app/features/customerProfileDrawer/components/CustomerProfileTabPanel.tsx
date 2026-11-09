import type {Account} from '../../accounts/types/account';
import {InvoicesTab} from './tabs/InvoicesTab';
import {FinanceTab} from './tabs/FinanceTab';
import {MetricsTab} from './tabs/MetricsTab';
import {OrdersTab} from './tabs/OrdersTab';
import {OverviewTab} from './tabs/OverviewTab';
import {ProductsTab} from './tabs/ProductsTab';
import {TeamTab} from './tabs/TeamTab';
import type {CustomerProfileTab} from '../types';
import {UnavailableTab} from './tabs/UnavailableTab';
import {financeAccountFor} from '../lib/finance-fallback';
import { DraftOrdersTab } from './tabs/DraftOrdersTab';
import { ActivitiesTab } from './tabs/ActivitiesTab';

export interface CustomerProfileTabPanelProps {
  account: Account;
  activeTab: CustomerProfileTab;
  onViewInvoices: () => void;
}

/** Routes the active tab to its subcomponent. */
export function CustomerProfileTabPanel({
  account,
  activeTab,
  onViewInvoices,
}: CustomerProfileTabPanelProps) {
  if (activeTab === 'overview') {
    return <OverviewTab account={account} />;
  }

  if (activeTab === 'orders') {
    return <OrdersTab account={account} />;
  }

  if (activeTab === 'invoices') {
    return <InvoicesTab />;
  }

  if (activeTab === 'draftOrders') {
    return <DraftOrdersTab />;
  }

  if (activeTab === 'products') {
    return <ProductsTab />;
  }
  if (activeTab === 'activity') {
    return <ActivitiesTab />;
  }

  if (activeTab === 'team') {
    return <TeamTab account={account} />;
  }

  if (
    activeTab === 'forecast' ||
    activeTab === 'revenue'
  ) {
    return <MetricsTab account={account} kind={activeTab} />;
  }

  if (activeTab === 'finance') {
    return (
      <FinanceTab
        account={financeAccountFor(account)}
        onViewInvoices={onViewInvoices}
      />
    );
  }

  return <UnavailableTab tab={activeTab} />;
}
