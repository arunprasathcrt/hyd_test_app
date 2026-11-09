import {useRef, type KeyboardEvent} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {FormField} from '~/shared/components/ui/Form';
import {cn} from '~/shared/utils/cn';
import type {NewDraftOrderValues, OrderType} from '../../../types/new-draft-order';
import {BuilderCard, BuilderCardTitle} from '../BuilderFields';
import {OrderTypeNewIcon} from '../../icons/OrderTypeNewIcon';
import {OrderTypeReorderIcon} from '../../icons/OrderTypeReorderIcon';

interface Props {
  orderTypes: OrderType[];
  defaultOrderClassification: string;
  onSelectNewOrder: () => void;
}

export function OrderTypeSelector({orderTypes, defaultOrderClassification, onSelectNewOrder}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const {control, setValue} = useFormContext<NewDraftOrderValues>();
  const radioRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const orderType = useWatch({control, name: 'orderType'});

  const selectOrderType = (type: OrderType, onChange: (next: OrderType) => void) => {
    onChange(type);
    if (type === 'new') {
      setValue('orderClass', defaultOrderClassification, {shouldDirty: true, shouldValidate: true});
      onSelectNewOrder();
    }
  };

  return (
    <BuilderCard aria-label={t('newDraftOrder.orderType.card.title')}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <BuilderCardTitle
            id="do112bOtH"
            title={t('newDraftOrder.orderType.card.title')}
            sub={t('newDraftOrder.orderType.card.sub')}
          />
        </div>
        {orderType ? (
          <button
            type="button"
            onClick={() => {
              setValue('orderType', '', {shouldDirty: true, shouldValidate: true});
              setValue('orderClass', defaultOrderClassification, {shouldDirty: true, shouldValidate: true});
            }}
            className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[13px] text-[#6B6B70] underline underline-offset-2 hover:text-[#111113]"
          >
            {t('newDraftOrder.orderType.clear')}
          </button>
        ) : null}
      </header>

      <FormField
        control={control}
        name="orderType"
        render={({field}) => {
          const focusIndex = Math.max(0, orderTypes.indexOf(field.value as OrderType));
          const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
            const delta = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[event.key];
            if (!delta) return;
            event.preventDefault();
            const next = (index + delta + orderTypes.length) % orderTypes.length;
            selectOrderType(orderTypes[next], field.onChange);
            radioRefs.current[next]?.focus();
          };

          return (
            <div
              role="radiogroup"
              aria-labelledby="do112bOtH"
              className="grid min-w-0 grid-cols-2 gap-3 max-[759.98px]:grid-cols-1"
            >
              {orderTypes.map((type, index) => {
                const checked = field.value === type;
                return (
                  <button
                    key={type}
                    ref={(node) => {
                      radioRefs.current[index] = node;
                    }}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    tabIndex={index === focusIndex ? 0 : -1}
                    onClick={() => selectOrderType(type, field.onChange)}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    className={cn(
                      'flex min-h-22 min-w-0 cursor-pointer items-start gap-3 rounded-[10px] border bg-white px-4 py-3.5 text-left text-[#111113] transition-[border-color] duration-120 ease-[cubic-bezier(.22,1,.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]',
                      checked
                        ? 'border-[#111113] shadow-[inset_0_0_0_.5px_#111113]'
                        : 'border-[#ECECEE] hover:border-[#D7D7DA]',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'mt-0.5 box-border inline-flex size-4.5 shrink-0 items-center justify-center rounded-full border bg-white',
                        checked ? 'border-[#111113]' : 'border-[#D7D7DA]',
                      )}
                    >
                      {checked ? <span className="size-2 rounded-full bg-[#111113]" /> : null}
                    </span>
                    <span
                      aria-hidden="true"
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F7F7F8] text-[#5C5C61]"
                    >
                      {type === 'new' ? <OrderTypeNewIcon /> : <OrderTypeReorderIcon />}
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <b className="text-[13.5px] leading-[1.35] font-semibold">
                        {t(`newDraftOrder.orderType.options.${type}.title`)}
                      </b>
                      <span className="text-xs leading-normal text-[#5C5C61]">
                        {t(`newDraftOrder.orderType.options.${type}.description`)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          );
        }}
      />
    </BuilderCard>
  );
}