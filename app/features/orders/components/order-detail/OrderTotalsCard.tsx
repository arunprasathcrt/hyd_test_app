import {useTranslation} from 'react-i18next';
import {Badge} from '~/shared/components/ui/Badge';
import {Card, CardHeader, CardTitle} from '~/shared/components/ui/Card';
import {Collapsible, CollapsiblePanel, CollapsibleTrigger} from '~/shared/components/ui/Collapsible';
import {Table, TableBody, TableCell, TableRow} from '~/shared/components/ui/Table';
import {Tooltip, TooltipContent, TooltipTrigger} from '~/shared/components/ui/Tooltip';
import {cn} from '~/shared/utils/cn';
import type {OrderTotals} from '../../lib/order-detail';
import type {OrderDetail} from '../../types/order-detail';

const MUTED = 'text-[12px] leading-[1.5] text-[#6B6B70]';

/** Internal breakdown rows — same look as the line-item breakdown in `OrderItemsCard`. */
const BREAKDOWN_CELL = 'px-2 py-2';

export function OrderTotalsCard({order, totals}: {order: OrderDetail; totals: OrderTotals}) {
  const {t} = useTranslation('orders');

  const rows = [
    {key: 'subtotal', label: t('detail.totals.subtotal', {count: order.lines.length}), value: totals.subtotal},
    {key: 'discount', label: t('detail.totals.discount'), value: order.discount},
    {
      key: 'tax',
      label: (
        <Tooltip>
          <TooltipTrigger
            delay={200}
            render={<button type="button" className="cursor-help underline decoration-dotted underline-offset-2" />}
          >
            {t('detail.totals.tax')}
          </TooltipTrigger>
          <TooltipContent>{t('detail.totals.taxTip')}</TooltipContent>
        </Tooltip>
      ),
      value: order.tax,
    },
    {key: 'total', label: t('detail.totals.total'), value: totals.total},
  ];
  const breakdown = [
    {key: 'garments', value: t('detail.format.money', {value: totals.garments})},
    {key: 'artLicense', value: t('detail.format.money', {value: totals.art})},
    {key: 'decoration', value: t('detail.format.money', {value: totals.decoration})},
    {key: 'margin', value: t('detail.format.money', {value: totals.margin}), rate: order.internal.marginRate},
    {key: 'cogs', value: t('detail.format.money', {value: totals.cogs})},
    {key: 'commission', value: t('detail.format.money', {value: totals.commission}), rate: order.internal.commissionRate},
    {key: 'royalty', value: t('detail.format.percent', {value: order.internal.royaltyRate})},
    {key: 'tierTerms', value: t('detail.breakdown.order.tierTermsValue', {tier: order.internal.tier, terms: order.terms})},
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-[1.5] text-[#111113]">{t('detail.totals.title')}</CardTitle>
      </CardHeader>
      <dl className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.key}
            className={cn(
              'ml-32 flex items-baseline font-medium justify-between gap-4 py-1 text-[13px] text-[#5C5C61]',
              row.key === 'total' && 'mt-1.5 border-t border-[#ECECEE] pt-3 text-[16px] font-semibold text-[#111113]',
            )}
          >
            <dt>{row.label}</dt>
            <dd className={cn('tabular-nums font-medium  text-[#111113]', row.key === 'total' ? 'font-semibold' : 'font-medium')}>
              {t('detail.format.money', {value: row.value})}
            </dd>
          </div>
        ))}
      </dl>
      <p className={`text-right ${MUTED}`}>{t('detail.totals.freightNote')}</p>
      <Collapsible>
        <CollapsibleTrigger className="cursor-pointer text-[12.5px] font-medium hover:bg-[#F7F7F8]">
          <span>{t('detail.breakdown.toggle')}</span>
          <Badge variant="soft" className="text-[12px] font-medium leading-none">{t('detail.repOnly')}</Badge>
        </CollapsibleTrigger>
        <CollapsiblePanel className="mt-1">
          <Table>
            <caption className="sr-only">{t('detail.breakdown.orderCaption')}</caption>
            <TableBody>
              {breakdown.map((row) => (
                <TableRow key={row.key} className="text-[13px] last:border-b last:border-[#ECECEE]">
                  <TableCell className={cn(BREAKDOWN_CELL, 'text-[#5C5C61]')}>
                    {t(`detail.breakdown.order.${row.key}`, row.rate != null ? {rate: t('detail.format.percent', {value: row.rate})} : undefined)}
                  </TableCell>
                  <TableCell className={cn(BREAKDOWN_CELL, 'text-right font-semibold tabular-nums')}>{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CollapsiblePanel>
      </Collapsible>
    </Card>
  );
}
