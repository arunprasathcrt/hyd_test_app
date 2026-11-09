import {useTranslation} from 'react-i18next';
import type {AtpTable} from '../schemas/atp.schema';

const headClass = 'px-3 py-2.5 text-right align-bottom text-[13px] font-normal';
const stickyClass = 'sticky left-0 z-[1] border-r-2 border-[#D7D7DA] bg-white';
// Dates are calendar days, so format them in UTC to keep the day the store holds.
const dateFormat = {date: {month: 'short', day: 'numeric', timeZone: 'UTC'}};

const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);

/**
 * The quick view's ATP block: units available now by size and, per incoming
 * purchase order, its expected date, PO number and each size's units on it.
 * Served via: native variant inventory and the variant's `custom.atp_size_info`
 * metaobject records.
 */
export function ProductAtpTable({table}: {table: AtpTable}) {
  const {t} = useTranslation('products');
  const {purchaseOrders, rows} = table;
  const incomingOf = (row: AtpTable['rows'][number]) =>
    sum(Object.values(row.incoming));
  const availableTotal = sum(rows.map((row) => row.available));
  const incomingTotal = sum(rows.map(incomingOf));
  const allSizesTotal = availableTotal + incomingTotal;

  return (
    <div className="mt-2.5 overflow-x-auto rounded-xl border border-[#ECECEE] bg-white">
      <table className="w-full min-w-max border-collapse text-[14px] text-[#111113]">
        <thead>
          <tr className="border-b-2 border-[#D7D7DA]">
            <th
              scope="col"
              className={`${stickyClass} px-3 py-2.5 text-left align-bottom text-[13px] font-normal text-[#6B6B70]`}
            >
              {t('detail.atpSize')}
            </th>
            <th scope="col" className={`${headClass} font-semibold`}>
              {t('detail.atpAvailableNow')}
            </th>
            {purchaseOrders.map((order) => (
              <th key={order.key} scope="col" className={headClass}>
                {order.date && (
                  <span className="block font-semibold text-[#111113]">
                    {t('detail.atpDate', {
                      date: new Date(order.date),
                      formatParams: dateFormat,
                    })}
                  </span>
                )}
                <span
                  className={
                    order.date
                      ? 'block text-xs text-[#6B6B70]'
                      : 'block font-semibold text-[#111113]'
                  }
                >
                  {order.po}
                </span>
              </th>
            ))}
            <th scope="col" className={`${headClass} font-semibold`}>
              {t('detail.atpTotal')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.size} className="border-t border-[#ECECEE]">
              <th
                scope="row"
                className={`${stickyClass} px-3 py-2 text-left font-normal`}
              >
                {row.size}
              </th>
              <td className="px-3 py-2 text-right tabular-nums">
                {row.available > 0 ? (
                  row.available
                ) : (
                  <>
                    <b className="block font-semibold text-[#8E2B2B]">0</b>
                    <span className="block text-xs font-medium text-[#8E2B2B]">
                      {t('detail.atpOut')}
                    </span>
                  </>
                )}
              </td>
              {purchaseOrders.map((order) => {
                const units = row.incoming[order.key];
                return (
                  <td
                    key={order.key}
                    className={`px-3 py-2 text-right tabular-nums ${units ? 'text-[#3B7A57]' : 'text-[#6B6B70]'}`}
                  >
                    {units ? `+${units}` : t('detail.emptyValue')}
                  </td>
                );
              })}
              <td className="px-3 py-2 text-right tabular-nums text-[#5C5C61]">
                {row.available + incomingOf(row)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[#D7D7DA]">
            <th
              scope="row"
              className={`${stickyClass} px-3 py-3 text-left font-normal`}
            >
              {t('detail.atpAllSizes')}
            </th>
            <td className="px-3 py-3 text-right font-medium tabular-nums">
              {availableTotal}
            </td>
            {purchaseOrders.map((order) => {
              const units = sum(rows.map((row) => row.incoming[order.key] ?? 0));
              return (
                <td
                  key={order.key}
                  className="px-3 py-3 text-right tabular-nums text-[#3B7A57]"
                >
                  {units ? `+${units}` : t('detail.emptyValue')}
                </td>
              );
            })}
            <td className="px-3 py-3 text-right font-semibold tabular-nums">
              {allSizesTotal}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
