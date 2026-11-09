import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {FormField} from '~/shared/components/ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/components/ui/Select';
import type {
  InterfaceMode,
  NewDraftOrderValues,
  OrderClassification,
} from '../../../types/new-draft-order';
import {
  BuilderCard,
  BuilderCardTitle,
  FieldError,
  FieldHelp,
  FieldLabel,
} from '../BuilderFields';

interface Props {
  orderClassifications: OrderClassification[];
  interfaceModes: InterfaceMode[];
}

export function OrderClassificationCard({orderClassifications, interfaceModes}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const {
    control,
    formState: {errors},
  } = useFormContext<NewDraftOrderValues>();

  return (
    <BuilderCard aria-label={t('newDraftOrder.classification.card.title')}>
      <header className="mb-4">
        <BuilderCardTitle
          title={t('newDraftOrder.classification.card.title')}
          sub={t('newDraftOrder.classification.card.sub')}
        />
      </header>

      <div className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-4 max-[759.98px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel htmlFor="do112bCls" required>
            {t('newDraftOrder.classification.fields.classification.label')}
          </FieldLabel>
          <FormField
            control={control}
            name="orderClass"
            render={({field}) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="do112bCls" aria-required="true" aria-describedby="do112bCls-h">
                  <SelectValue placeholder={t('newDraftOrder.classification.fields.placeholder')}>
                    {(value: string) =>
                      orderClassifications.find((option) => option.id === value)?.label ?? ''
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {orderClassifications.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.id}
                      disabled={
                        option.label.trim().toUpperCase() !== 'ATO' &&
                        option.handle.trim().toUpperCase() !== 'ATO'
                      }
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldHelp id="do112bCls-h">{t('newDraftOrder.classification.fields.classification.help')}</FieldHelp>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <FieldLabel htmlFor="do112bIf" required>
            {t('newDraftOrder.classification.fields.interface.label')}
          </FieldLabel>
          <FormField
            control={control}
            name="interfaceMode"
            render={({field}) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  ref={field.ref}
                  onBlur={field.onBlur}
                  id="do112bIf"
                  aria-required="true"
                  aria-invalid={Boolean(errors.interfaceMode) || undefined}
                  aria-describedby={errors.interfaceMode ? 'do112bIfc-e do112bIfc-h' : 'do112bIfc-h'}
                >
                  <SelectValue placeholder={t('newDraftOrder.classification.fields.interface.placeholder')}>
                    {(value: string | null) =>
                      (value
                        ? interfaceModes.find((option) => option.id === value)?.label
                        : undefined) ?? t('newDraftOrder.classification.fields.interface.placeholder')
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {interfaceModes.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.interfaceMode?.message ? (
            <FieldError id="do112bIfc-e">{t(errors.interfaceMode.message)}</FieldError>
          ) : null}
          <FieldHelp id="do112bIfc-h">{t('newDraftOrder.classification.fields.interface.help')}</FieldHelp>
        </div>
      </div>
    </BuilderCard>
  );
}