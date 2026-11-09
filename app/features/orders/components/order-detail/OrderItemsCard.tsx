import {useTranslation} from 'react-i18next';
import {Image} from 'lucide-react';
import {Badge} from '~/shared/components/ui/Badge';
import {
  Card,
  CardActions,
  CardHeader,
  CardTitle,
} from '~/shared/components/ui/Card';
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from '~/shared/components/ui/Collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/shared/components/ui/Table';
import {cn} from '~/shared/utils/cn';
import {lineQty, lineUnit} from '../../lib/order-detail';
import type {
  DecorationMethod,
  OrderDetail,
  OrderLine,
} from '../../types/order-detail';
import {Button} from '~/shared/components/ui/Button';

/** Prototype `.od113-muted`. */
const MUTED = 'text-[12px] leading-[1.5] text-[#6B6B70]';

const BREAKDOWN_HEAD =
  'bg-transparent px-2 py-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[#6B6B70]';
const BREAKDOWN_CELL = 'px-2 py-2';

const COLOR_KIND: Record<DecorationMethod, 'threads' | 'inks'> = {
  embroidery: 'threads',
  screen_print: 'inks',
};

export function OrderItemsCard({
  order,
  units,
}: {
  order: OrderDetail;
  units: number;
}) {
  const {t} = useTranslation('orders');

  return (
    <Card size="compact">
      <CardHeader className="mb-3.5 gap-x-3 gap-y-2">
        <CardTitle className="leading-[1.5] text-[#111113]">
          {t('detail.items.title')}
        </CardTitle>
        <CardActions>
          <span className={`${MUTED} font-medium`}>
            {t('detail.items.meta', {
              count: order.lines.length,
              units: t('detail.format.count', {value: units}),
            })}
          </span>
        </CardActions>
      </CardHeader>
      <ul className="flex flex-col">
        {order.lines.map((line) => (
          <OrderLineItem key={line.sku} line={line} order={order} />
        ))}
      </ul>
    </Card>
  );
}

function OrderLineItem({line, order}: {line: OrderLine; order: OrderDetail}) {
  const {t} = useTranslation('orders');
  const {t: tEnums} = useTranslation('enums');
  const qty = lineQty(line);
  const unit = lineUnit(line);
  const colorKind = COLOR_KIND[line.decoration];

  const facts = [
    {
      key: 'art',
      value: t('detail.items.facts.artValue', {
        art: line.art,
        sketch: line.sketch,
      }),
    },
    {key: 'placement', value: line.placement},
    {
      key: 'decoration',
      value: t('detail.items.facts.decorationValue', {
        method: tEnums(`decorationMethod.${line.decoration}`),
        process: line.process,
      }),
    },
    {
      key: colorKind,
      value: t(`detail.items.facts.${colorKind}Value`, {
        count: line.colors.length,
        list: line.colors.join(', '),
      }),
    },
    {
      key: 'upc',
      value: t('detail.items.facts.upcValue', {
        upc: line.upc,
        sku: line.customerSku,
      }),
    },
    {key: 'finishing', value: line.finishing},
    {key: 'linePo', value: order.po},
    {
      key: 'ships',
      value: t('detail.items.facts.shipsValue', {
        date: t('detail.format.date', {value: order.dates.confirmedShip}),
        carrier: line.carrier,
      }),
    },
  ];
  const parts = [
    {key: 'garment', unit: line.garmentUnit},
    {key: 'art', unit: line.artUnit},
    {key: 'decoration', unit: line.decorationUnit},
  ] as const;

  return (
    <li className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 py-4 first:pt-0 [&+&]:border-t [&+&]:border-[#ECECEE] max-[599.98px]:grid-cols-[minmax(0,1fr)]">
      <div className="relative size-[104px]">
        <Button
          type="button"
          variant="productCard"
          size="icon"
          aria-label={t('detail.items.openProduct', {name: line.name})}
          title={t('detail.items.openProductTip')}
          className="cursor-pointer"
        >
          <img
            src={line.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="relative z-[1] block size-full object-cover"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-[#8E8E93]"
          >
            <Image aria-hidden="true" size={22} strokeWidth={1.8} />
          </span>
        </Button>
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -bottom-1.5 z-[2] flex size-11 items-center justify-center overflow-hidden rounded-[10px] border-2 border-white bg-[#F5F5F6] text-[#8E8E93] shadow-[0_1px_2px_rgba(17,17,19,.06)]"
        >
          <Image aria-hidden="true" size={18} strokeWidth={1.8} />
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <div className="min-w-0">
            <div className="text-[12px] font-medium uppercase leading-[1.5] tracking-[0.06em] text-[#6B6B70]">
              {line.brand}
            </div>
            <h3 className="text-[14px] font-semibold leading-[1.35] tracking-[-0.005em] text-[#111113]">
              {line.name}
            </h3>
            <p className="text-[12px] font-medium text-[#6B6B70] tabular-nums slashed-zero">
              {t('detail.items.skuColor', {sku: line.sku, color: line.color})}
            </p>
          </div>
          <Badge variant="ok" size="tag">
            {t('detail.items.artReady')}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-[18px] gap-y-2 max-[759.98px]:grid-cols-1">
          {facts.map(({key, value}) => (
            <div key={key} className="min-w-0">
              <dt className="text-[12px] font-medium text-[#6B6B70]">
                {t(`detail.items.facts.${key}`)}
              </dt>
              <dd className="text-[13px] text-[#111113] tabular-nums wrap-anywhere">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <ul
          aria-label={t('detail.items.sizeRun')}
          className="flex flex-wrap gap-1.5"
        >
          {[...line.sizes, {size: t('detail.items.units'), qty}].map(
            (size, index) => {
              const sum = index === line.sizes.length;
              const zero = !sum && size.qty === 0;
              return (
                <li
                  key={size.size}
                  className={cn(
                    'inline-flex min-w-11 flex-col items-center justify-center rounded-[9px] border px-2 py-1',
                    sum
                      ? 'border-[#D7D7DA] bg-[#F7F7F8]'
                      : zero
                        ? 'border-[#ECECEE] bg-[#F7F7F8]'
                        : 'border-[#ECECEE] bg-white',
                  )}
                >
                  <span className="text-[12px] font-medium leading-[1.3] text-[#6B6B70]">
                    {size.size}
                  </span>
                  <b
                    className={cn(
                      'text-[13px] leading-[1.3] tabular-nums',
                      zero
                        ? 'font-medium text-[#6B6B70]'
                        : 'font-semibold text-[#111113]',
                    )}
                  >
                    {t('detail.format.count', {value: size.qty})}
                  </b>
                </li>
              );
            },
          )}
        </ul>

        <div className="grid grid-cols-3 gap-3 rounded-[12px] bg-[#F7F7F8] px-3.5 py-2.5 max-[599.98px]:gap-2 max-[599.98px]:p-2.5">
          <Money
            label={t('detail.items.money.qty')}
            value={t('detail.format.count', {value: qty})}
          />
          <Money
            label={t('detail.items.money.unit')}
            value={t('detail.format.money', {value: unit})}
          />
          <Money
            label={t('detail.items.money.line')}
            value={t('detail.format.money', {value: unit * qty})}
            total
          />
        </div>

        <Collapsible>
          <CollapsibleTrigger className="-ml-2 cursor-pointer text-[12.5px] font-medium hover:bg-[#F7F7F8]">
            <span>{t('detail.breakdown.toggle')}</span>
            <Badge
              variant="soft"
              className="text-[12px] font-medium leading-none"
            >
              {t('detail.repOnly')}
            </Badge>
          </CollapsibleTrigger>
          <CollapsiblePanel className="mt-2.5">
            <Table>
              <caption className="sr-only">
                {t('detail.breakdown.lineCaption')}
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className={BREAKDOWN_HEAD}>
                    {t('detail.breakdown.part')}
                  </TableHead>
                  <TableHead
                    scope="col"
                    className={cn(BREAKDOWN_HEAD, 'text-right')}
                  >
                    {t('detail.breakdown.perUnit')}
                  </TableHead>
                  <TableHead
                    scope="col"
                    className={cn(BREAKDOWN_HEAD, 'text-right')}
                  >
                    {t('detail.breakdown.line')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...parts, {key: 'fullyLoaded', unit} as const].map((part) => {
                  const total = part.key === 'fullyLoaded';
                  return (
                    <TableRow
                      key={part.key}
                      className="text-[13px] last:border-b last:border-[#ECECEE]"
                    >
                      <TableCell
                        className={cn(
                          BREAKDOWN_CELL,
                          total
                            ? 'font-semibold text-[#111113]'
                            : 'text-[#5C5C61]',
                        )}
                      >
                        {t(`detail.breakdown.parts.${part.key}`)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          BREAKDOWN_CELL,
                          'text-right font-semibold tabular-nums',
                        )}
                      >
                        {t('detail.format.money', {value: part.unit})}
                      </TableCell>
                      <TableCell
                        className={cn(
                          BREAKDOWN_CELL,
                          'text-right font-semibold tabular-nums',
                        )}
                      >
                        {t('detail.format.money', {value: part.unit * qty})}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CollapsiblePanel>
        </Collapsible>
      </div>
    </li>
  );
}

function Money({
  label,
  value,
  total,
}: {
  label: string;
  value: string;
  total?: boolean;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col', total && 'text-right')}>
      <span className="text-[12px] font-medium text-[#6B6B70]">{label}</span>
      <b className="text-[14px] font-semibold tabular-nums text-[#111113]">
        {value}
      </b>
    </div>
  );
}
