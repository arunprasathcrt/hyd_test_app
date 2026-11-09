import type {
  CurrencyCode,
  MoneyV2,
} from '@shopify/hydrogen/storefront-api-types';

export const getCurrencyData = (
  amount: number | string | null | undefined,
  currencyCode: CurrencyCode = 'USD',
): Pick<MoneyV2, 'amount' | 'currencyCode'> => ({
  amount: String(amount ?? ''),
  currencyCode,
});

export const formatShortDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });