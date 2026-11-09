import {useTranslation} from 'react-i18next';
import type {Account} from '../../../accounts/types/account';
import {initialsFor} from '~/features/accounts/lib/company';
import {SIZE_COLUMNS} from '~/features/accounts/lib/company-orders';
import {Button} from '~/shared/components/ui/Button';

const MONEY_2DP = {
  formatParams: {value: {minimumFractionDigits: 2, maximumFractionDigits: 2}},
};

export interface OrdersTabProps {
  account: Account;
}

export function OrdersTab({account}: OrdersTabProps) {
  const {t} = useTranslation('accounts');
  const {t: tCommon} = useTranslation('common');

  // Populated by the same Admin fetch that loads the Accounts list — see
  // `COMPANY_ORDERS` in `queries/companies.ts` and `toAccount` in `lib/company.ts`.
  const rows = account.orderRows ?? [];

  const totalQty = rows.reduce((sum, row) => sum + row.qty, 0);
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="mb-[22px] overflow-hidden rounded-2xl border border-[#ECECEE] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#ECECEE] px-4 py-3.5">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold tracking-[-0.01em] text-[#111113]">
            {t('drawer.panels.orders.history.heading')}
          </div>
          <div className="mt-0.5 text-[11px] font-normal text-[#8E8E93]">
            {t('drawer.panels.orders.history.subheading', {
              name: account.name,
            })}
          </div>
        </div>

        <Button type="button" variant="outline" size="small" disabled>
          <span aria-hidden="true" className="text-[13px] leading-none">
            ⎙
          </span>
          <span>{t('drawer.panels.orders.history.printExport')}</span>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center text-[12px] text-[#8E8E93]">
          {t('drawer.panels.orders.history.empty')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1140px] border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-[#ECECEE] bg-white">
                <th className="whitespace-nowrap px-2.5 py-2 text-left text-[10px] font-semibold tracking-[0.04em] text-[#8E8E93]">
                  {t('drawer.panels.orders.history.columns.garment')}
                </th>
                <th className="whitespace-nowrap px-2.5 py-2 text-left text-[10px] font-semibold tracking-[0.04em] text-[#8E8E93]">
                  {t('drawer.panels.orders.history.columns.styleColorLocation')}
                </th>
                <th className="whitespace-nowrap px-2.5 py-2 text-left text-[10px] font-semibold tracking-[0.04em] text-[#8E8E93]">
                  {t('drawer.panels.orders.history.columns.ship')}
                </th>
                {SIZE_COLUMNS.map((size) => (
                  <th
                    key={size}
                    className="w-10 whitespace-nowrap px-1 py-2 text-center text-[10px] font-semibold tracking-[0.04em] text-[#8E8E93]"
                  >
                    {size}
                  </th>
                ))}
                <th className="whitespace-nowrap px-2.5 py-2 text-right text-[10px] font-semibold tracking-[0.04em] text-[#8E8E93]">
                  {t('drawer.panels.orders.history.columns.qty')}
                </th>
                <th className="whitespace-nowrap px-2.5 py-2 text-right text-[10px] font-semibold tracking-[0.04em] text-[#8E8E93]">
                  {t('drawer.panels.orders.history.columns.unit')}
                </th>
                <th className="whitespace-nowrap px-2.5 py-2 text-right text-[10px] font-semibold tracking-[0.04em] text-[#8E8E93]">
                  {t('drawer.panels.orders.history.columns.amount')}
                </th>
                <th className="w-12 px-2.5 py-2" />
              </tr>
            </thead>

            <tbody>
              <tr className="bg-[#FAFAFA]">
                <td colSpan={7 + SIZE_COLUMNS.length} className="px-2.5 py-[9px]">
                  <div className="inline-flex items-center gap-2">
                    <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#0F4C4C] to-[#2E5944] text-[9px] font-semibold text-white">
                      {initialsFor(account.name)}
                    </span>
                    <span className="text-[12px] font-semibold text-[#111113]">
                      {t('drawer.panels.orders.history.groupHeading')}
                    </span>
                  </div>
                </td>
              </tr>

              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[#F0F0F1]">
                  <td className="px-2.5 py-2">
                  <div className="inline-flex items-center gap-[7px]">
                    <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#0F4C4C] to-[#2E5944] text-[11px] font-semibold text-white">
                      {initialsFor(row.po)}
                    </span>
                    <span className="h-[18px] w-[18px] shrink-0 rounded-full border border-black/20 bg-[#8E8E93]" />
                    <span className="shrink-0 rounded-md bg-black/[0.05] px-[7px] py-[3px] text-[11px] font-semibold text-[#3A3A3E]">
                      —
                    </span>
                  </div>
                  </td>

                  <td className="px-2.5 py-2">
                    <div className="text-[12.5px] font-medium text-[#111113]">
                      {t('drawer.panels.orders.history.orderLabel', {
                        po: row.po,
                      })}
                    </div>
                    {row.fulfillmentStatus || row.financialStatus ? (
                      <div className="mt-px text-[11px] text-[#8E8E93]">
                        {[row.financialStatus, row.fulfillmentStatus]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    ) : null}
                  </td>

                  <td className="whitespace-nowrap px-2.5 py-2 text-[12px] text-[#3A3A3E]">
                    {tCommon('format.date', {
                      value: new Date(row.createdAt),
                      formatParams: {value: {month: 'short', day: 'numeric'}},
                    })}
                  </td>

                  {SIZE_COLUMNS.map((size) => {
                    const value = row.sizes[size] ?? 0;
                    return (
                      <td
                        key={size}
                        className={`px-1 py-[7px] text-center tabular-nums ${
                          value ? 'text-[#111113]' : 'text-[#C7C7CC]'
                        }`}
                      >
                        {value || '·'}
                      </td>
                    );
                  })}

                  <td className="px-2.5 py-2 text-right font-semibold tabular-nums text-[#111113]">
                    {row.qty}
                  </td>
                  <td className="px-2.5 py-2 text-right tabular-nums text-[#5C5C61]">
                    {tCommon('format.money', {value: row.unit, ...MONEY_2DP})}
                  </td>
                  <td className="px-2.5 py-2 text-right font-semibold tabular-nums text-[#111113]">
                    {tCommon('format.money', {value: row.amount, ...MONEY_2DP})}
                  </td>

                <td className="px-2.5 py-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t(
                      'drawer.panels.orders.history.reorderAction',
                      {
                        po: row.po,
                      },
                    )}
                    title={t('drawer.panels.orders.history.reorderTitle')}
                  >
                    ↻
                  </Button>
                </td>
                </tr>
              ))}

              <tr className="border-t border-[#ECECEE]">
                <td
                  colSpan={3 + SIZE_COLUMNS.length}
                  className="px-2.5 py-1.5 text-right text-[11px] text-[#8E8E93]"
                >
                  {t('drawer.panels.orders.history.subtotal')}
                </td>
                <td className="px-2.5 py-1.5 text-right font-semibold tabular-nums text-[#111113]">
                  {totalQty}
                </td>
                <td />
                <td className="px-2.5 py-1.5 text-right font-semibold tabular-nums text-[#111113]">
                  {tCommon('format.money', {value: totalAmount, ...MONEY_2DP})}
                </td>
                <td />
              </tr>
            </tbody>

            <tfoot>
              <tr className="border-t-2 border-[#111113] bg-[#FAFAFA]">
                <td
                  colSpan={3 + SIZE_COLUMNS.length}
                  className="px-2.5 py-2.5 text-right text-[12px] font-semibold text-[#111113]"
                >
                  {t('drawer.panels.orders.history.total')}
                </td>
                <td className="px-2.5 py-2.5 text-right font-bold tabular-nums text-[#111113]">
                  {totalQty}
                </td>
                <td />
                <td className="px-2.5 py-2.5 text-right font-bold tabular-nums text-[#111113]">
                  {tCommon('format.money', {value: totalAmount, ...MONEY_2DP})}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

