import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {calculateLeadTime} from '../../../lib/lead-time';
import {isoDayToDate} from '../../../lib/new-draft-order';
import {Button} from '~/shared/components/ui/Button';
import {FormField} from '~/shared/components/ui/Form';
import type {LeadTimeConfig, NewDraftOrderValues, ShipTiming} from '../../../types/new-draft-order';
import {BuilderCard, BuilderCardTitle, FieldLabel} from '../BuilderFields';

interface Props {
  today: string;
  leadTime: LeadTimeConfig;
  timing: ShipTiming;
  loading: boolean;
}

export function LeadTimeCard({today, leadTime, timing, loading}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const {control} = useFormContext<NewDraftOrderValues>();
  const [selectedMethods, selectedFlags] = useWatch({
    control,
    name: ['leadTimeMethods', 'leadTimeFlags'],
  });
  const plan = calculateLeadTime({
    today,
    timing,
    leadTime,
    selectedMethods,
    selectedFlags,
    orderType: 'new',
  });

  return (
    <BuilderCard aria-label={t('newDraftOrder.leadTime.card.title')} aria-busy={loading || undefined}>
      <header className="mb-4">
        <BuilderCardTitle
          id="do112bLtH"
          title={t('newDraftOrder.leadTime.card.title')}
          sub={t('newDraftOrder.leadTime.card.sub')}
        />
      </header>

      <div className="flex flex-col gap-3">
        <FieldLabel as="span" id="do112bLtM">
          {t('newDraftOrder.leadTime.methods.label')}
        </FieldLabel>
        <FormField
          control={control}
          name="leadTimeMethods"
          render={({field}) => (
            <div role="group" aria-labelledby="do112bLtM" className="flex min-w-0 flex-wrap gap-2">
              {leadTime.methods.map((method) => (
                <Button
                  key={method.code}
                  type="button"
                  variant="toggle"
                  aria-pressed={field.value.includes(method.code)}
                  aria-label={t('newDraftOrder.leadTime.methods.optionAria', {
                    method: method.label,
                    days: method.days,
                  })}
                  onClick={() => {
                    const next = field.value.includes(method.code)
                      ? field.value.filter((item) => item !== method.code)
                      : [...field.value, method.code];
                    field.onChange(next);
                  }}
                >
                  {method.label}
                  <span className="text-[#6B6B70]">
                    {t('newDraftOrder.leadTime.days', {count: method.days})}
                  </span>
                </Button>
              ))}
            </div>
          )}
        />

        <FieldLabel as="span" id="do112bLtF">
          {t('newDraftOrder.leadTime.flags.label')}
        </FieldLabel>
        <FormField
          control={control}
          name="leadTimeFlags"
          render={({field}) => (
            <div role="group" aria-labelledby="do112bLtF" className="flex min-w-0 flex-wrap gap-2">
              {leadTime.flags.map((flag) => (
                <Button
                  key={flag.code}
                  type="button"
                  variant="toggle"
                  aria-pressed={field.value.includes(flag.code)}
                  aria-label={t('newDraftOrder.leadTime.flags.optionAria', {
                    flag: flag.label,
                    days: flag.days,
                  })}
                  onClick={() => {
                    const next = field.value.includes(flag.code)
                      ? field.value.filter((item) => item !== flag.code)
                      : [...field.value, flag.code];
                    field.onChange(next);
                  }}
                >
                  {flag.label}
                  <span className="text-[#6B6B70]">
                    {t('newDraftOrder.leadTime.plusDays', {count: flag.days})}
                  </span>
                </Button>
              ))}
            </div>
          )}
        />

        <div role="status" className="rounded-[10px] border border-[#ECECEE] bg-[#F7F7F8] p-3">
          <div className="grid min-w-0 grid-cols-[1fr_auto_auto] gap-3 max-[759.98px]:grid-cols-1">
            <div>
              <span className="block text-xs leading-[1.5] font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                {t('newDraftOrder.leadTime.summary.firstAvailableShipDate')}
              </span>
              <b className="text-[15px] leading-normal text-[#111113]">
                {t('newDraftOrder.overview.date', {date: isoDayToDate(plan.firstAvailableShip)})}
              </b>
              <span className="mt-0.5 block text-xs leading-[1.5] text-[#6B6B70]">
                {selectedMethods.length
                  ? t('newDraftOrder.leadTime.summary.selectedHint')
                  : t('newDraftOrder.leadTime.summary.defaultHint')}
              </span>
            </div>
            <div>
              <span className="block text-xs leading-[1.5] font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                {t('newDraftOrder.leadTime.summary.daysOut')}
              </span>
              {/* Full lead time to in hands, as the prototype's qbLeadComputeDays. */}
              <b className="text-[15px] leading-normal text-[#111113]">
                {plan.totalDays}
              </b>
            </div>
            <div>
              <span className="block text-xs leading-[1.5] font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                {t('newDraftOrder.leadTime.summary.inHandsBy')}
              </span>
              <b className="text-[15px] leading-normal text-[#111113]">
                {t('newDraftOrder.overview.date', {date: isoDayToDate(plan.minimumInHands)})}
              </b>
            </div>
          </div>
        </div>
      </div>
    </BuilderCard>
  );
}