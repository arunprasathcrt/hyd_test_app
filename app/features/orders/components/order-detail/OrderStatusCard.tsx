import {useTranslation} from 'react-i18next';
import {Badge, type BadgeVariant} from '~/shared/components/ui/Badge';
import {Card, CardActions, CardHeader, CardTitle} from '~/shared/components/ui/Card';
import {Stepper, StepperItem, StepperIndicator, StepperLabel, StepperDescription} from '~/shared/components/ui/Stepper';
import type {CriticalPathState, OrderDetail} from '../../types/order-detail';

const MUTED = 'text-[12px] leading-[1.5] text-[#6B6B70]';

const CP_TAGS: Record<CriticalPathState, BadgeVariant> = {done: 'ok', active: 'ring', waiting: 'soft'};

export function OrderStatusCard({order}: {order: OrderDetail}) {
  const {t} = useTranslation('orders');

  const stepDate = (state: string, date: string) =>
    state === 'done'
      ? t('detail.format.day', {value: date})
      : t(state === 'current' ? 'detail.steps.since' : 'detail.steps.expected', {date: t('detail.format.day', {value: date})});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="leading-[1.5] text-[#111113]">{t('detail.track.title')}</CardTitle>
        <CardActions>
          {!order.invoiced ? <Badge variant="soft" className="text-[12px] font-medium leading-none">{t('detail.track.notInvoiced')}</Badge> : null}
          <span className={MUTED}>{t('detail.updatesDaily')}</span>
        </CardActions>
      </CardHeader>
      <Stepper aria-label={t('detail.track.title')} className="grid grid-cols-5">
        {order.steps.map((step, index) => (
          <StepperItem key={step.key} state={step.state} className="gap-0.5">
            <StepperIndicator>{index + 1}</StepperIndicator>
            <StepperLabel className="whitespace-nowrap">{t(`detail.steps.labels.${step.key}`)}</StepperLabel>
            <StepperDescription className="whitespace-nowrap mt-0.5">{stepDate(step.state, step.date)}</StepperDescription>
          </StepperItem>
        ))}
      </Stepper>

      <div data-internal="true" className="border-t border-[#ECECEE] pt-4">
        <div className="mb-2.5 flex items-center gap-2">
          <h3 className="text-[14px] font-semibold leading-[1.5] text-[#111113]">{t('detail.criticalPath.title')}</h3>
          <Badge variant="soft" size="tag">{t('detail.repOnly')}</Badge>
        </div>
        <div
          role="note"
          className="mb-1 rounded-[10px] bg-[#EEF6F1] px-2.5 py-2 text-[12px] font-semibold leading-[1.5] text-[#1F7A4D]"
        >
          {t('detail.criticalPath.onTrack', {date: t('detail.format.date', {value: order.onTrackDate})})}
        </div>
        <ul className="mt-2.5 overflow-hidden rounded-[12px] border border-[#ECECEE]">
          {order.criticalPath.map((stage) => (
            <li
              key={stage.key}
              data-cp={stage.key}
              className="grid grid-cols-[minmax(0,1.5fr)_auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-1 px-3.5 py-2.5 [&+&]:border-t [&+&]:border-[#ECECEE] max-[599.98px]:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="flex min-w-0 flex-col">
                <b className="text-[13px] font-semibold text-[#111113]">
                  {t(`detail.criticalPath.stages.${stage.key}.label`)}
                </b>
                <span className="text-[12px] font-medium text-[#6B6B70]">
                  {stage.owner
                    ? t('detail.criticalPath.teamOwner', {team: t(`detail.criticalPath.stages.${stage.key}.team`), owner: stage.owner})
                    : t(`detail.criticalPath.stages.${stage.key}.team`)}
                </span>
              </div>
              <Badge variant={CP_TAGS[stage.state]} size="tag">
                {t(`detail.criticalPath.state.${stage.state}`)}
              </Badge>
              <div className="text-right max-[599.98px]:col-span-full max-[599.98px]:text-left">
                <span className="text-[12px] font-medium text-[#6B6B70]">
                  {stage.state === 'done' ? t('detail.format.day', {value: stage.date}) : t('detail.steps.expected', {date: t('detail.format.day', {value: stage.date})})}
                </span>
              </div>
              <p className="col-span-full font-medium text-[12px] text-[#5C5C61]">
                {t(`detail.criticalPath.stages.${stage.key}.note`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
