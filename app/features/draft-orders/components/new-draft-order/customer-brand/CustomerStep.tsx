import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {FormField} from '~/shared/components/ui/Form';
import {Input} from '~/shared/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/components/ui/Select';
import {daysBetween, isInHandsAtRisk, isoDayToDate} from '../../../lib/new-draft-order';
import type {
  BrandCode,
  NewDraftOrderCustomer,
  NewDraftOrderFieldErrors,
  NewDraftOrderValues,
  ProgramCode,
} from '../../../types/new-draft-order';
import {
  BuilderCard,
  BuilderCardTitle,
  BuilderTag,
  FieldError,
  FieldHelp,
  FieldLabel,
} from '../BuilderFields';
import {CustomerCombobox} from './CustomerCombobox';
import {InHandsDateField} from '../InHandsDateField';
import {BrandSelectionCard} from './BrandSelectionCard';

interface Props {
  customers: NewDraftOrderCustomer[];
  availableBrands: BrandCode[];
  programCodes: ProgramCode[];
  programCodes2: ProgramCode[];
  today: string;
  soonestInHands: string;
  onInHandsDateChange: () => void;
  /** Errors returned by the save action (message keys). */
  serverErrors?: NewDraftOrderFieldErrors;
}

/** Step 1 · Brands & customer: prototype `.do112b-customer`. */
export function CustomerStep({
  customers,
  availableBrands,
  programCodes,
  programCodes2,
  today,
  soonestInHands,
  onInHandsDateChange,
  serverErrors,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const {
    control,
    register,
    setValue,
    formState: {errors},
  } = useFormContext<NewDraftOrderValues>();
  const [customerId, inHandsDate] = useWatch({
    control,
    name: ['customerId', 'inHandsDate'],
  });
  const customer = customers.find((item) => item.id === customerId);

  const errorKey = (field: keyof NewDraftOrderValues) =>
    errors[field]?.message ?? serverErrors?.[field];
  const fieldError = (field: keyof NewDraftOrderValues, id: string) => {
    const key = errorKey(field);
    return key ? <FieldError id={id}>{t(key)}</FieldError> : null;
  };

  const daysOut = daysBetween(today, inHandsDate);
  const atRisk = isInHandsAtRisk(inHandsDate, soonestInHands);
  const isSoonest = inHandsDate === soonestInHands;

  return (
    <div className="mb-4 flex max-w-full flex-col gap-4">
      <BuilderCard aria-label={t('newDraftOrder.customer.card.title')}>
        <header className="mb-4">
          <BuilderCardTitle
            title={t('newDraftOrder.customer.card.title')}
            sub={t('newDraftOrder.customer.card.sub')}
          />
        </header>

        <div className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-4 max-[759.98px]:grid-cols-1">
          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="do112bCustSearch" id="do112bCust-lbl" required>
              {t('newDraftOrder.customer.fields.customer.label')}
            </FieldLabel>
            <FormField
              control={control}
              name="customerId"
              render={({field}) => (
                <CustomerCombobox
                  customers={customers}
                  value={field.value}
                  onChange={field.onChange}
                  inputId="do112bCustSearch"
                  labelId="do112bCust-lbl"
                  describedBy="do112bCust-h"
                  invalid={Boolean(errorKey('customerId'))}
                />
              )}
            />
            {fieldError('customerId', 'do112bCust-e')}
            <FieldHelp id="do112bCust-h">
              {customer ? (
                <>
                  {t('newDraftOrder.customer.account', {
                    code: customer.code,
                    segment: t(`newDraftOrder.customer.segments.${customer.segment}`),
                    tier: customer.tier ?? t('newDraftOrder.overview.notSet'),
                    terms: customer.terms ?? t('newDraftOrder.overview.notSet'),
                    royalty: customer.royaltyRate,
                  })}{' '}
                  {customer.vip ? (
                    <BuilderTag tone="neutral" className="ml-1">
                      {t('newDraftOrder.customer.vip')}
                    </BuilderTag>
                  ) : null}
                </>
              ) : null}
              <span className="block">
                {t('newDraftOrder.customer.fields.customer.count', {count: customers.length})}
              </span>
            </FieldHelp>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="do112bIh1" required>
              {t('newDraftOrder.customer.fields.inHands.label')}
            </FieldLabel>
            <FormField
              control={control}
              name="inHandsDate"
              render={({field}) => (
                <InHandsDateField
                  id="do112bIh1"
                  value={field.value}
                  today={today}
                  soonest={soonestInHands}
                  onChange={(day) => {
                    onInHandsDateChange();
                    setValue('inHandsDateManual', true, {shouldDirty: true});
                    field.onChange(day);
                  }}
                  describedBy="do112bIh1-h"
                  invalid={Boolean(errorKey('inHandsDate'))}
                />
              )}
            />
            {fieldError('inHandsDate', 'do112bIh1-e')}
            <FieldHelp id="do112bIh1-h">
              {t('newDraftOrder.customer.fields.inHands.daysOut', {
                count: daysOut,
                date: isoDayToDate(soonestInHands),
              })}{' '}
              <BuilderTag tone={atRisk ? 'warn' : 'ok'} className="ml-1">
                {t(
                  atRisk
                    ? 'newDraftOrder.customer.fields.inHands.atRisk'
                    : 'newDraftOrder.customer.fields.inHands.onTrack',
                )}
              </BuilderTag>
              {isSoonest ? (
                <span className="block">{t('newDraftOrder.customer.fields.inHands.soonestHint')}</span>
              ) : null}
            </FieldHelp>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="do112bName" required>
              {t('newDraftOrder.customer.fields.orderName.label')}
            </FieldLabel>
            <Input
              id="do112bName"
              type="text"
              autoComplete="off"
              aria-required="true"
              aria-invalid={Boolean(errorKey('orderName')) || undefined}
              aria-describedby={errorKey('orderName') ? 'do112bName-h do112bName-e' : 'do112bName-h'}
              placeholder={t('newDraftOrder.customer.fields.orderName.placeholder')}
              {...register('orderName')}
            />
            {fieldError('orderName', 'do112bName-e')}
            <FieldHelp id="do112bName-h">{t('newDraftOrder.customer.fields.orderName.help')}</FieldHelp>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel htmlFor="do112bDesc">
              {t('newDraftOrder.customer.fields.description.label')}
            </FieldLabel>
            <Input
              id="do112bDesc"
              type="text"
              autoComplete="off"
              aria-invalid={Boolean(errorKey('description')) || undefined}
              aria-describedby={errorKey('description') ? 'do112bDesc-h do112bDesc-e' : 'do112bDesc-h'}
              placeholder={t('newDraftOrder.customer.fields.description.placeholder')}
              {...register('description')}
            />
            {fieldError('description', 'do112bDesc-e')}
            <FieldHelp id="do112bDesc-h">{t('newDraftOrder.customer.fields.description.help')}</FieldHelp>
          </div>

          <div className="col-span-full flex min-w-0 flex-col gap-1.5">
            <FieldLabel as="span" id="do112bPc-l">
              {t('newDraftOrder.customer.fields.programCode.label')}
            </FieldLabel>
            <div role="group" aria-labelledby="do112bPc-l" className="grid min-w-0 grid-cols-2 gap-3">
              {(['programCode', 'programCode2'] as const).map((name) => (
                <FormField
                  key={name}
                  control={control}
                  name={name}
                  render={({field}) => {
                    const options = name === 'programCode' ? programCodes : programCodes2;
                    const selectedCode = options.find((option) => option.id === field.value)?.code;

                    return (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          aria-label={t(
                            name === 'programCode'
                              ? 'newDraftOrder.customer.fields.programCode.first'
                              : 'newDraftOrder.customer.fields.programCode.second',
                          )}
                          aria-describedby="do112bPc-h"
                        >
                          <SelectValue
                            placeholder={t(
                              name === 'programCode'
                                ? 'newDraftOrder.customer.fields.programCode.none'
                                : 'newDraftOrder.customer.fields.programCode.noSecond',
                            )}
                          >
                            {selectedCode}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {options.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    );
                  }}
                />
              ))}
            </div>
            <FieldHelp id="do112bPc-h">{t('newDraftOrder.customer.fields.programCode.help')}</FieldHelp>
          </div>
        </div>
      </BuilderCard>

      <BrandSelectionCard availableBrands={availableBrands} serverErrors={serverErrors} />
    </div>
  );
}
