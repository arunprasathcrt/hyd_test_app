import {useState} from 'react';
import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Check, ChevronRight, Pencil, Truck} from 'lucide-react';
import {Badge} from '~/shared/components/ui/Badge';
import {Button} from '~/shared/components/ui/Button';
import {Card, CardActions, CardHeader, CardTitle} from '~/shared/components/ui/Card';
import {Table, TableBody, TableCell, TableRow} from '~/shared/components/ui/Table';
import {orderDetailPath} from '~/shared/constants/routes';
import {STATUS_DOTS} from '../../lib/order-detail';
import type {OrderDetail} from '../../types/order-detail';

const MUTED = 'text-[12px] leading-[1.5] text-[#6B6B70]';

export function ShipmentsCard({order}: {order: OrderDetail}) {
  const {t} = useTranslation('orders');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-[1.5] text-[#111113]">{t('detail.shipments.title')}</CardTitle>
        <CardActions>
          <span className={MUTED}>{t('detail.updatesDaily')}</span>
        </CardActions>
      </CardHeader>
      <div className="flex items-start gap-3 rounded-xl">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F7F7F8] text-[#5C5C61]">
          <Truck aria-hidden="true" size={18} strokeWidth={1.8} />
        </span>
        <div>
          <b className="text-[13px] font-semibold text-[#111113]">{t('detail.shipments.none')}</b>
          <p className="mt-0.5 text-[12px] font-medium text-[#6B6B70]">
            {t('detail.shipments.noneBody', {date: t('detail.format.date', {value: order.dates.confirmedShip}), shipTo: order.shipTo.name})}
          </p>
        </div>
      </div>
    </Card>
  );
}

/** Rows shown at first, and added by each "Load more". */
const OTHER_ORDERS_PAGE_SIZE = 3;

export function OtherOrdersCard({order}: {order: OrderDetail}) {
  const {t} = useTranslation('orders');
  // Resets per order: OrderDetailPage remounts on `key={order.id}`.
  const [shownCount, setShownCount] = useState(OTHER_ORDERS_PAGE_SIZE);

  const total = order.otherOrders.length;
  if (total === 0) return null;

  const visibleOrders = order.otherOrders.slice(0, shownCount);
  const canLoadMore = shownCount < total;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-[1.5] text-[#111113]">{t('detail.others.title')}</CardTitle>
        <CardActions>
          <span className={MUTED}>{t('detail.others.count', {count: total})}</span>
        </CardActions>
      </CardHeader>
      <Table variant="outline" size="sm">
        <caption className="sr-only">{t('detail.others.title')}</caption>
        <TableBody>
          {visibleOrders.map((other) => {
            const status = t(`detail.status.${other.status}`);
            const total = t('detail.format.money', {value: other.total});
            return (
              <TableRow key={other.id} className="relative text-[13px] hover:bg-[#F3F3F4] [&>td]:py-3.5">
                <TableCell className="font-semibold tabular-nums slashed-zero">
                  <Link
                    to={orderDetailPath(other.id)}
                    aria-label={t('detail.others.open', {id: other.id, status, total})}
                    className="after:absolute after:inset-0"
                  >
                    {other.id}
                  </Link>
                </TableCell>
                <TableCell className="text-[#5C5C61]">{t('detail.format.date', {value: other.placed})}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    size="md"
                    dot={STATUS_DOTS[other.status]}
                    data-status={other.status}
                    title={other.holdReason ? t('detail.others.holdTip', {reason: other.holdReason}) : undefined}
                  >
                    {status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{total}</TableCell>
                <TableCell className="w-4">
                  <ChevronRight aria-hidden="true" size={16} strokeWidth={1.8} className="text-[#8E8E93]" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between gap-3">
        <span className={MUTED} aria-live="polite">
          {canLoadMore
            ? t('detail.others.showing', {shown: visibleOrders.length, total})
            : t('detail.others.showingAll', {total})}
        </span>
        {canLoadMore && (
          <Button
            type="button"
            size="xs"
            variant="outline"
            className="cursor-pointer border-[#D7D7DA] text-[12.5px] font-medium leading-[1.2] hover:border-[#D7D7DA] hover:bg-[#F7F7F8]"
            onClick={() => setShownCount((count) => count + OTHER_ORDERS_PAGE_SIZE)}
          >
            {t('detail.others.loadMore')}
          </Button>
        )}
      </div>
    </Card>
  );
}

export function ActivityCard({order}: {order: OrderDetail}) {
  const {t} = useTranslation('orders');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-[1.5] text-[#111113]">{t('detail.activity.title')}</CardTitle>
        <CardActions>
          <Badge variant="soft" className="text-[12px] font-medium leading-none">{t('detail.activity.internal')}</Badge>
        </CardActions>
      </CardHeader>
      <p className={`${MUTED} font-medium`}>{t('detail.activity.intro')}</p>
      <ol className="flex flex-col gap-3.5">
        {order.activity.map((entry) => (
          <li key={entry.key} className="flex items-start gap-3">
            <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F7F7F8] text-[#5C5C61]">
              <Check aria-hidden="true" size={14} strokeWidth={1.8} />
            </span>
            <div>
              <b className="text-[13px] font-semibold text-[#111113]">{t(`detail.activity.items.${entry.key}.title`, {erp: order.erpId})}</b>
              <p className="text-[12px] font-medium text-[#5C5C61]">{t(`detail.activity.items.${entry.key}.body`, {channel: order.channel})}</p>
              <span className="text-[12px] font-medium text-[#6B6B70]">{t('detail.format.date', {value: entry.date})}</span>
            </div>
          </li>
        ))}
      </ol>
      {/* TODO: "Add a note" stays disabled until the real data integration (activity notes) is built. */}
      <div>
        <Button
          type="button"
          size="xs"
          variant="outline"
          disabled
          // The shared Button sets `pointer-events-none` when disabled, which would hide
          // the not-allowed cursor; re-enable pointer events and keep the resting border on hover.
          // Colors follow prototype `.od113-btn.sm` and `.od113-btn[aria-disabled="true"]`.
          className="border-[#D7D7DA] text-[12.5px] font-medium leading-[1.2] data-disabled:pointer-events-auto data-disabled:cursor-not-allowed data-disabled:bg-[#F7F7F8] data-disabled:text-[#6B6B70] data-disabled:opacity-100 data-disabled:hover:border-[#D7D7DA]"
        >
          <Pencil aria-hidden="true" size={16} strokeWidth={1.8} />
          <span>{t('detail.activity.addNote')}</span>
        </Button>
      </div>
    </Card>
  );
}
