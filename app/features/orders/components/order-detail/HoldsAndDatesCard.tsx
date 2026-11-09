import {useTranslation} from 'react-i18next';
import {Check} from 'lucide-react';
import {Badge} from '~/shared/components/ui/Badge';
import {Card, CardHeader, CardTitle} from '~/shared/components/ui/Card';
import type {OrderDetail} from '../../types/order-detail';

/** Prototype `.od113-muted`. */
const MUTED = 'text-[12px] leading-[1.5] text-[#6B6B70]';

export function HoldsAndDatesCard({order}: {order: OrderDetail}) {
  const {t} = useTranslation('orders');

  const dates = [
    {key: 'requestedInHands', value: t('detail.format.date', {value: order.dates.requestedInHands})},
    {key: 'confirmedShip', value: t('detail.format.date', {value: order.dates.confirmedShip})},
    {key: 'cancelBy', value: t('detail.format.date', {value: order.dates.cancelBy})},
    {key: 'event', value: t('detail.holds.dates.event.value')},
  ] as const;

  return (
    <Card size="compact">
      <CardHeader className="mb-3.5">
        <CardTitle className="leading-[1.5] text-[#111113]">{t('detail.holds.title')}</CardTitle>
      </CardHeader>

      <p className="mb-3 flex items-center gap-1.5 text-[13px] font-medium text-[#1F7A4D]">
        <Check aria-hidden="true" size={14} strokeWidth={1.8} />
        <span>{t('detail.holds.none')}</span>
      </p>

      <p
        data-internal="true"
        className="mb-3.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12.5px] text-[#5C5C61]"
      >
        <Badge variant="soft" size="tag">
          {t('detail.repOnly')}
        </Badge>
        <span>{t('detail.holds.terms', {terms: order.terms})}</span>
      </p>

      <dl className="mb-4 grid grid-cols-4 gap-3 rounded-[12px] bg-[#F7F7F8] p-3.5 max-[1023px]:grid-cols-2 max-[599.98px]:grid-cols-1">
        {dates.map(({key, value}) => (
          <div key={key} className="min-w-0">
            <dt className="text-[12px] font-medium uppercase leading-[1.5] tracking-[0.06em] text-[#6B6B70]">
              {t(`detail.holds.dates.${key}.label`)}
            </dt>
            <dd className="mt-0.5 text-[14px] font-semibold text-[#111113]">{value}</dd>
            <dd className={`mt-0.5 text-[#111113] ${MUTED} font-medium`}>{t(`detail.holds.dates.${key}.hint`)}</dd>
          </div>
        ))}
      </dl>

      <div>
        <h3 className="text-[14px] font-semibold leading-[1.5] text-[#111113]">{t('detail.holds.notices.title')}</h3>
        <p className={`mt-1.5 font-medium ${MUTED}`}>{t('detail.holds.notices.none')}</p>
      </div>
    </Card>
  );
}
