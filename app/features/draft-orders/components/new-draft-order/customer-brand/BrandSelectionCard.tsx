import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {BrandLogo} from '~/shared/components/product/BrandLogo';
import {Tooltip, TooltipContent, TooltipTrigger} from '~/shared/components/ui/Tooltip';
import {toast} from '~/shared/components/ui/Toast';
import {FormField} from '~/shared/components/ui/Form';
import {cn} from '~/shared/utils/cn';
import type {
  BrandCode,
  NewDraftOrderFieldErrors,
  NewDraftOrderValues,
} from '../../../types/new-draft-order';
import {BuilderCard, BuilderCardTitle, FieldError} from '../BuilderFields';
import {CheckIcon} from '../../icons/CheckIcon';
import {useNewDraftOrderProductsStore} from '../../../store/new-draft-order-products.store';

interface Props {
  availableBrands: BrandCode[];
  serverErrors?: NewDraftOrderFieldErrors;
}

/**
 * Step 1's brand notices: a rust toast, wide enough for the two-line message,
 * centered over the viewport, with lighter (antialiased) white text.
 */
const BRAND_TOAST_CLASS =
  'right-auto left-1/2 w-[min(480px,calc(100vw-2rem))] ml-[calc(min(480px,calc(100vw-2rem))/-2)] bg-[#6B2A0A] antialiased';

export function BrandSelectionCard({availableBrands, serverErrors}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const {
    control,
    formState: {errors},
  } = useFormContext<NewDraftOrderValues>();
  const errorKey = errors.brands?.message ?? serverErrors?.brands;
  // The products store is what Step 3 renders; the form's copy can lag behind a restore.
  const products = useNewDraftOrderProductsStore((state) => state.products);

  return (
    <BuilderCard aria-label={t('newDraftOrder.brands.title')}>
      <FormField
        control={control}
        name="brands"
        render={({field}) => {
          const selectedBrands = field.value;

          return (
            <>
              <header className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2.5">
                <div className="min-w-0 flex-[1_1_280px]">
                  <BuilderCardTitle
                    id="do112bBrandsH"
                    title={t('newDraftOrder.brands.title')}
                    sub={t('newDraftOrder.brands.sub')}
                  />
                </div>
                <span className="flex h-6 items-center rounded-full bg-[#F2F2F3] px-2.5 text-xs leading-normal font-medium whitespace-nowrap text-[#5C5C61]">
                  {t('newDraftOrder.brands.selected', {count: selectedBrands.length})}
                </span>
              </header>

              <div role="group" aria-labelledby="do112bBrandsH" className="flex flex-wrap gap-2.5 p-0.5">
                {availableBrands.map((code) => {
                  const selected = selectedBrands.includes(code);

                  return (
                    <Tooltip key={code}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            aria-pressed={selected}
                            aria-label={t(
                              selected ? 'newDraftOrder.brands.inScope' : 'newDraftOrder.brands.notInScope',
                              {brand: code},
                            )}
                            onClick={() => {
                              if (selected && selectedBrands.length === 1) {
                                toast.add({
                                  title: t('newDraftOrder.brands.keepOneOnDraftOrder'),
                                  type: 'warning',
                                  data: {className: BRAND_TOAST_CLASS},
                                });
                                return;
                              }

                              // A brand with lines on the draft stays until those lines are removed.
                              // Vendors are matched like Step 1 lists them: trimmed, any case.
                              const brandKey = code.trim().toLowerCase();
                              const brandLines = selected
                                ? products.filter(
                                    (product) => product.brand?.trim().toLowerCase() === brandKey,
                                  ).length
                                : 0;
                              if (brandLines) {
                                toast.add({
                                  title: t('newDraftOrder.brands.hasProducts', {
                                    count: brandLines,
                                    brand: code,
                                  }),
                                  type: 'warning',
                                  data: {className: BRAND_TOAST_CLASS},
                                });
                                return;
                              }

                              field.onChange(
                                selected
                                  ? selectedBrands.filter((item) => item !== code)
                                  : [...selectedBrands, code],
                              );
                            }}
                            className={cn(
                              'relative box-border inline-flex min-h-22 min-w-37 cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border bg-white px-4 pt-6 pb-2.5 text-[#111113] transition-[border-color] duration-120 ease-[cubic-bezier(.22,1,.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E] max-[759.98px]:min-w-0 max-[759.98px]:flex-[1_1_calc(50%-5px)]',
                              selected
                                ? 'border-[#111113] shadow-[inset_0_0_0_.5px_#111113]'
                                : 'border-[#ECECEE] hover:border-[#D7D7DA]',
                            )}
                          />
                        }
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute top-2 right-2 box-border inline-flex size-4.5 items-center justify-center rounded-full border text-white',
                            selected ? 'border-[#111113] bg-[#111113]' : 'border-[#D7D7DA] bg-white',
                          )}
                        >
                          {selected ? <CheckIcon size={12} strokeWidth={1.8} /> : null}
                        </span>
                        <BrandLogo
                          name={code}
                          className="flex h-6.5 items-center justify-center [&_svg]:block [&_svg]:h-5.5 [&_svg]:w-auto [&_svg]:max-w-25"
                        />
                        <span
                          className={cn(
                            'text-[12.5px] leading-[1.2] font-medium',
                            selected ? 'text-[#111113]' : 'text-[#5C5C61]',
                          )}
                        >
                          {code}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-60 flex-col items-start gap-1.5">
                        <b className="font-semibold">{code}</b>
                        <span>
                          {t(
                            selected
                              ? 'newDraftOrder.brands.removeTip'
                              : 'newDraftOrder.brands.addTip',
                          )}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
              {errorKey ? <FieldError id="do112bBrands-e">{t(errorKey)}</FieldError> : null}
              <p className="m-0 mt-3 text-xs leading-normal text-[#6B6B70]">
                {t('newDraftOrder.brands.help', {count: selectedBrands.length})}
              </p>
            </>
          );
        }}
      />
    </BuilderCard>
  );
}