import type {
  Account,
  AccountBrand,
  AccountCreditHold,
  AccountTier,
} from '../../accounts/types/account';
import type {AccountInvoice, AccountOrder} from '../types/profile';
import {
  CUSTOMER_PROFILE_ACTIVE_DRAFT_ORDERS_MOCK,
  CUSTOMER_PROFILE_FORECAST_MOCK,
  CUSTOMER_PROFILE_HERO_MOCK,
  CUSTOMER_PROFILE_INVOICES_MOCK,
  CUSTOMER_PROFILE_NET_TERM_DAYS_MOCK,
  CUSTOMER_PROFILE_OPEN_OPPORTUNITIES_MOCK,
  CUSTOMER_PROFILE_ORDERS_MOCK,
  CUSTOMER_PROFILE_OVERVIEW_MOCK,
} from '../../../../mocks/customer-profile/profile';

export interface AccountOverview {
  shippedYtd: number;
  openOrders: number;
  ordersYtd: number;
  casesOpen: number;
}

export function accountOverview(account: Account): AccountOverview {
  return {
    shippedYtd: account.shippedYtd ?? CUSTOMER_PROFILE_OVERVIEW_MOCK.shippedYtd,
    openOrders: account.openOrders ?? CUSTOMER_PROFILE_OVERVIEW_MOCK.openOrders,
    ordersYtd: account.ordersYtd ?? CUSTOMER_PROFILE_OVERVIEW_MOCK.ordersYtd,
    casesOpen: account.casesOpen ?? CUSTOMER_PROFILE_OVERVIEW_MOCK.casesOpen,
  };
}

export function accountOrders(account: Account): AccountOrder[] {
  return account.recentOrders && account.recentOrders.length > 0
    ? account.recentOrders
    : CUSTOMER_PROFILE_ORDERS_MOCK;
}

export function accountInvoices(account: Account): AccountInvoice[] {
  return account.invoices && account.invoices.length > 0
    ? account.invoices
    : CUSTOMER_PROFILE_INVOICES_MOCK;
}

export function accountOpenAr(account: Account): number {
  return (
    account.openOrders ??
    accountInvoices(account).reduce((sum, invoice) => sum + invoice.balance, 0)
  );
}

export function accountPastDueAr(account: Account): number {
  return (
    account.pastDue ??
    accountInvoices(account)
      .filter((invoice) => invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.balance, 0)
  );
}

export interface AccountHero {
  tier: AccountTier;
  city: string;
  primaryContact: string;
  sinceYear: number;
  brand: AccountBrand;
  licensed: boolean;
  platinum: boolean;
  creditHold: AccountCreditHold;
}

export function accountHero(account: Account): AccountHero {
  const sinceYear = account.sinceYear ?? CUSTOMER_PROFILE_HERO_MOCK.sinceYear;

  return {
    tier: account.tier ?? CUSTOMER_PROFILE_HERO_MOCK.tier,
    city: account.city ?? account.address ?? CUSTOMER_PROFILE_HERO_MOCK.city,
    primaryContact:
      account.primaryContact ?? CUSTOMER_PROFILE_HERO_MOCK.primaryContact,
    sinceYear,
    brand: account.brand ?? CUSTOMER_PROFILE_HERO_MOCK.brand,
    licensed: account.licensed ?? CUSTOMER_PROFILE_HERO_MOCK.licensed,
    platinum: account.platinum ?? CUSTOMER_PROFILE_HERO_MOCK.platinum,
    creditHold: account.creditHold ?? CUSTOMER_PROFILE_HERO_MOCK.creditHold,
  };
}

export interface AccountForecast {
  value: number;
  basisKey: 'goal' | 'estimate';
}

export function accountForecast(account: Account): AccountForecast {
  return account.forecastFy !== null
    ? {value: account.forecastFy, basisKey: 'goal'}
    : {value: CUSTOMER_PROFILE_FORECAST_MOCK, basisKey: 'estimate'};
}

export function accountYoyDelta(account: Account): number {
  if (account.yoyGrowth !== null) return account.yoyGrowth;

  const shipped = accountOverview(account).shippedYtd;
  const priorYear = shipped * 0.86;

  return priorYear > 0 ? (shipped - priorYear) / priorYear : 0;
}

export interface AccountHotStats {
  activeDraftOrders: number;
  openOpportunities: number;
  lastOrderDate: string | null;
  netTermDays: number;
}

export function accountHotStats(account: Account): AccountHotStats {
  const orders = accountOrders(account);

  return {
    activeDraftOrders: CUSTOMER_PROFILE_ACTIVE_DRAFT_ORDERS_MOCK,
    openOpportunities: CUSTOMER_PROFILE_OPEN_OPPORTUNITIES_MOCK,
    lastOrderDate: orders[0]?.date ?? null,
    netTermDays: CUSTOMER_PROFILE_NET_TERM_DAYS_MOCK,
  };
}

export type AccountFlightKind = 'opp' | 'quote' | 'case' | 'order';

export interface AccountFlightItem {
  id: string;
  kind: AccountFlightKind;
  label: string;
  amount: number;
}

export function accountCurrentlyInFlight(account: Account): AccountFlightItem[] {
  const orders = accountOrders(account);
  const items: AccountFlightItem[] = [];

  if (orders[0]) {
    items.push({
      id: orders[0].id,
      kind: 'order',
      label: `${orders[0].number} · ${orders[0].status}`,
      amount: orders[0].total,
    });
  }

  items.push(
    {id: 'demo-opp-1', kind: 'opp', label: '2026 Program Renewal', amount: 42_000},
    {id: 'demo-quote-1', kind: 'quote', label: 'QT-04830', amount: 8420},
  );

  return items;
}
