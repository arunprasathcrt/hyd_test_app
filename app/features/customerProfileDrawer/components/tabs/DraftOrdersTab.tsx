import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';
import {DRAFT_ORDERS} from 'mocks/draftOrders';
import {formatShortDate, getCurrencyData} from '~/lib/utils';
import {Money} from '@shopify/hydrogen';

interface DraftOrderRow {
  expires: any;
  sent: any;
  id: string;
  version?: number;
  description?: string;
  sentDate?: string;
  expiryDate: string;
  amount: number;
}
type DraftOrderFilter = 'all' | 'sent' | 'missingDetails';
interface DraftOrdersProps {
  onCloseCustomerProfile?: () => void;
  onNavigate?: (orderId: string) => void;
}

export function DraftOrdersTab({
  onCloseCustomerProfile,
  onNavigate,
}: DraftOrdersProps) {
  const {t} = useTranslation('draftOrders');

  const sortedOrders = [...DRAFT_ORDERS].sort((a, b) => {
    const dateA = a.sentDate ?? a.expiryDate;
    const dateB = b.sentDate ?? b.expiryDate;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-7xl">
        <div className="mb-3.5 text-xs font-medium uppercase tracking-[0.06em] text-zinc-500">
          {t('draftOrders.title')} · {sortedOrders.length}
        </div>
        <div>
          {sortedOrders.map((order, index) => (
            <div
              key={order.id}
              className={twMerge(
                'cursor-pointer flex w-full items-center gap-3.5 py-[11px] text-left transition-opacity hover:opacity-70',
                index !== sortedOrders.length - 1 && 'border-b border-zinc-200',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium tracking-[-0.005em] text-zinc-900">
                  {order.id}
                  {order.version && ` · ${order.version}`}
                </div>

               { order?.description && <div className="mt-0.5 text-xs text-zinc-600">
                  {order?.description || '\u00A0'}
                </div>}

                <div className="mt-0.5 text-xs text-zinc-500">
                  {order.sentDate
                    ? t('draftOrders.sentExpires', {
                        sentDate: formatShortDate(order.sentDate),
                        expiryDate:formatShortDate(order.expiryDate),
                      })
                    : t('draftOrders.expiresOnly', {
                        expiryDate: formatShortDate(order.expiryDate),
                      })}
                </div>
              </div>

              <div className="shrink-0 tabular-nums text-[13px] font-medium text-zinc-900">
                <Money data={getCurrencyData(order.amount)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
