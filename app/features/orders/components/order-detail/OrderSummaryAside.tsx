import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {Ban, Copy, PenLine, RefreshCw, type LucideIcon} from 'lucide-react';
import {Badge} from '~/shared/components/ui/Badge';
import {Button} from '~/shared/components/ui/Button';
import {Card, CardTitle} from '~/shared/components/ui/Card';
import {toast} from '~/shared/components/ui/Toast';
import {Tooltip, TooltipContent, TooltipTrigger} from '~/shared/components/ui/Tooltip';
import {STATUS_DOTS} from '../../lib/order-detail';
import type {OrderDetail} from '../../types/order-detail';

const CHANGE_ACTIONS: {key: 'change' | 'cancel' | 'reorder'; icon: LucideIcon}[] = [
  {key: 'change', icon: PenLine},
  {key: 'cancel', icon: Ban},
  {key: 'reorder', icon: RefreshCw},
];

const EYEBROW = 'text-[12px] font-medium uppercase leading-[1.5] tracking-[0.06em] text-[#6B6B70]';
const MUTED = 'text-[12px] leading-[1.5] text-[#6B6B70]';
const COPIED_TOAST_MS = 1500;

export function OrderSummaryAside({order, total}: {order: OrderDetail; total: number}) {
  const {t} = useTranslation('orders');

  const copyOrderId = async () => {
    await navigator.clipboard.writeText(order.id);
    toast.add({
      title: t('detail.summary.copied', {id: order.id}),
      timeout: COPIED_TOAST_MS,
    });
  };

  const rows: {key: string; value: ReactNode}[] = [
    {key: 'erp', value: order.erpId},
    {
      key: 'status',
      value: (
        <Badge variant="outline" size="md" dot={STATUS_DOTS[order.status]} data-status={order.status}>
          {t(`detail.status.${order.status}`)}
        </Badge>
      ),
    },
    {key: 'placed', value: t('detail.format.date', {value: order.placed})},
    {key: 'customer', value: order.account},
    {key: 'contact', value: order.contact},
    {key: 'po', value: order.po},
    {key: 'brand', value: order.brands},
    {key: 'channel', value: order.channel},
    {key: 'rep', value: order.rep},
    {key: 'shipTo', value: t('detail.summary.shipToValue', {name: order.shipTo.name, city: order.shipTo.city})},
    {key: 'payment', value: t('detail.summary.paymentValue', {terms: order.terms})},
    {key: 'total', value: t('detail.format.money', {value: total})},
  ];

  return (
    <aside aria-label={t('detail.summary.label')} className="flex min-w-0 flex-col gap-4 min-[1100px]:sticky min-[1100px]:top-4">
      <Card size="compact" aria-labelledby="order-summary-heading">
        <div className={EYEBROW}>{t('detail.summary.eyebrow')}</div>
        <div className="mt-0.5 mb-2.5 flex items-center gap-1.5">
          <h2
            id="order-summary-heading"
            className="text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-[#111113] tabular-nums slashed-zero"
          >
            {order.id}
          </h2>
          {/* Hover shows the copy hint; a click copies and confirms in a bottom-center toast. */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  shape="lg"
                  variant="ghost"
                  className="cursor-pointer text-[#6B6B70] hover:bg-[#F7F7F8]"
                  aria-label={t('detail.summary.copyLabel', {id: order.id})}
                  onClick={() => void copyOrderId()}
                />
              }
            >
              <Copy aria-hidden="true" size={16} strokeWidth={1.8} />
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              {t('detail.summary.copyTip')}
            </TooltipContent>
          </Tooltip>
        </div>
        <dl className="flex flex-col">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-3 border-t border-[#ECECEE] py-1.5 text-[13px] first:border-t-0"
            >
              <dt className="shrink-0 font-medium text-[#6B6B70]">{t(`detail.summary.rows.${row.key}`)}</dt>
              <dd className="min-w-0 text-right font-medium text-[#111113] tabular-nums wrap-anywhere">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card size="compact">
        <CardTitle className="leading-[1.5] text-[#111113]">{t('detail.change.title')}</CardTitle>
        <p className={`mt-1 mb-3 ${MUTED} font-medium`}>{t('detail.change.body', {channel: order.channel})}</p>
        {/* TODO: "Ask for a change", "Request a cancel" and "Reorder" stay disabled until the
            real data integration (change/cancel requests, reorder into a new draft order) is built. */}
        <div className="grid grid-cols-1 gap-2">
          {CHANGE_ACTIONS.map(({key, icon: Icon}) => (
            <Button
              key={key}
              type="button"
              size="control"
              shape="md"
              variant="outline"
              disabled
              // The shared Button sets `pointer-events-none` when disabled, which would hide
              // the not-allowed cursor; re-enable pointer events and keep the resting border on hover.
              className="justify-start data-disabled:pointer-events-auto data-disabled:cursor-not-allowed data-disabled:bg-[#F7F7F8] data-disabled:text-[#6B6B70] data-disabled:opacity-100 data-disabled:hover:border-[#D7D7DA] data-disabled:hover:bg-[#F7F7F8]"
              title={key === 'reorder' ? t('detail.change.reorderTip') : undefined}
            >
              <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
              <span>{t(`detail.change.actions.${key}`)}</span>
            </Button>
          ))}
        </div>
        <p className={`mt-3 ${MUTED} font-medium`}>{t('detail.change.returns')}</p>
      </Card>
    </aside>
  );
}
