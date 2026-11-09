import {useEffect, useRef, useState} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm, type UseFormRegister} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useFetcher} from 'react-router';
import type {z} from 'zod';
import {Dialog} from '@base-ui/react/dialog';
import {Check, X} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {Input} from '~/shared/components/ui/Input';
import {deliveryCountryCodeSchema, deliveryLocationEntrySchema} from '../../../schemas/new-draft-order.schema';
import type {CreateDeliveryLocationActionResult} from '../../../schemas/delivery-location-admin.schema';
import {locationInitials} from '../../../lib/new-draft-order';
import type {NewDraftOrderCustomer, NewDraftOrderLocation} from '../../../types/new-draft-order';
import {useLocationText} from './LocationFields';

type DialogView = 'locations' | 'add';
export type ShipBillDialogMode = 'ship' | 'bill';

const ADD_LOCATION_FIELDS = [
  {
    field: 'name',
    label: 'newDraftOrder.ship.addresses.dialog.add.fields.title.label',
    placeholder: 'newDraftOrder.ship.addresses.dialog.add.fields.title.placeholder',
    autoComplete: 'off',
    required: true,
  },
  {
    field: 'address1',
    label: 'newDraftOrder.ship.addresses.dialog.add.fields.address1.label',
    placeholder: 'newDraftOrder.ship.addresses.dialog.add.fields.address1.placeholder',
    autoComplete: 'address-line1',
    required: true,
  },
  {
    field: 'address2',
    label: 'newDraftOrder.ship.addresses.dialog.add.fields.address2.label',
    placeholder: 'newDraftOrder.ship.addresses.dialog.add.fields.address2.placeholder',
    autoComplete: 'address-line2',
    optional: true,
  },
  {
    field: 'city',
    label: 'newDraftOrder.ship.addresses.dialog.add.fields.city.label',
    placeholder: 'newDraftOrder.ship.addresses.dialog.add.fields.city.placeholder',
    autoComplete: 'address-level2',
    required: true,
  },
] as const;

type DeliveryLocationAddressValues = z.infer<typeof deliveryLocationEntrySchema>;

function AddLocationField({
  field,
  label,
  placeholder,
  autoComplete,
  required = false,
  optional = false,
  maxLength,
  countryCode,
  register,
}: {
  field: keyof DeliveryLocationAddressValues;
  label: string;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
  optional?: boolean;
  maxLength?: number;
  countryCode?: DeliveryLocationAddressValues['countryCode'];
  register: UseFormRegister<DeliveryLocationAddressValues>;
}) {
  const {t} = useTranslation('newDraftOrder');
  const registration = register(field);

  return (
    <label className={[
      'flex min-w-0 flex-col gap-1 text-[12px] leading-[1.2] font-medium tracking-[0.04em] text-[#6B6B70] uppercase',
    ].join(' ')}>
      <span>
        {t(label)}{' '}
        {required ? (
          <span aria-hidden="true" className="text-[#A02020]">{t('newDraftOrder.ship.addresses.dialog.add.required')}</span>
        ) : optional ? (
          <span className="font-normal normal-case tracking-normal">{t('newDraftOrder.ship.addresses.dialog.add.optional')}</span>
        ) : null}
      </span>
      <Input
        className="min-h-10 border-[#D7D7DA] focus:border-[#0E6E6E]"
        autoComplete={autoComplete}
        inputMode={field === 'zip' && countryCode !== 'CA' ? 'numeric' : undefined}
        maxLength={maxLength ?? (field === 'zip' ? countryCode === 'CA' ? 7 : countryCode === 'US' ? 10 : 6 : undefined)}
        required={required}
        placeholder={t(placeholder)}
        {...registration}
        onChange={field === 'zip' ? (event) => {
          const value = event.currentTarget.value;
          event.currentTarget.value = countryCode === 'CA'
            ? value.replace(/[^A-Za-z0-9 ]/g, '').toUpperCase().slice(0, 7)
            : countryCode === 'US'
              ? value.replace(/[^0-9-]/g, '').slice(0, 10)
              : value.replace(/\D/g, '').slice(0, 6);
          void registration.onChange(event);
        } : registration.onChange}
      />
    </label>
  );
}

export function SavedLocationDialog({
  mode,
  customer,
  locations,
  primaryId,
  shipId,
  billId,
  initialView = 'locations',
  onOpenChange,
  onApply,
  onLocationCreated,
}: {
  mode: ShipBillDialogMode;
  customer: NewDraftOrderCustomer | undefined;
  locations: NewDraftOrderLocation[];
  primaryId: string | undefined;
  shipId: string | undefined;
  billId: string | undefined;
  initialView?: DialogView;
  onOpenChange: (open: boolean) => void;
  onApply: (mode: ShipBillDialogMode, locationId: string) => void;
  onLocationCreated: (location: NewDraftOrderLocation, setPrimary: boolean) => void;
}) {
  const {t} = useTranslation('newDraftOrder');
  const createLocationFetcher = useFetcher<CreateDeliveryLocationActionResult>();
  const text = useLocationText();
  const locationForm = useForm<DeliveryLocationAddressValues>({
    resolver: zodResolver(deliveryLocationEntrySchema),
    defaultValues: {name: '', address1: '', address2: '', city: '', countryCode: 'US', state: '', zip: ''},
  });
  const {register, control, handleSubmit, setValue, formState: {errors}} = locationForm;
  const [view, setView] = useState<DialogView>(initialView);
  const [pendingLocationId, setPendingLocationId] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [companyContextMissing, setCompanyContextMissing] = useState(false);
  const handledCreatedLocationId = useRef<string | null>(null);
  const primaryLocation = locations.find((location) => location.id === primaryId);
  const defaultCountryCode = deliveryCountryCodeSchema
    .catch('US')
    .parse(primaryLocation?.shipping?.countryCode || primaryLocation?.billing?.countryCode);

  useEffect(() => {
    setValue('countryCode', defaultCountryCode);
  }, [defaultCountryCode, setValue]);

  useEffect(() => {
    const result = createLocationFetcher.data;
    if (createLocationFetcher.state !== 'idle' || !result?.ok || handledCreatedLocationId.current === result.location.id) return;
    handledCreatedLocationId.current = result.location.id;
    onLocationCreated(result.location, setAsDefault);
    if (result.warningKey) {
      // The location exists; keep the dialog open so the rep sees the default was not saved.
      setView('locations');
      setPendingLocationId(result.location.id);
      return;
    }
    onApply(mode, result.location.id);
  }, [createLocationFetcher.data, createLocationFetcher.state, mode, onApply, onLocationCreated, setAsDefault]);
  const defaultWarningKey = createLocationFetcher.data?.ok ? createLocationFetcher.data.warningKey : undefined;

  const selectedLocationId = pendingLocationId || (mode === 'ship' ? shipId || primaryId || '' : billId || primaryId || '');

  const applyLocation = () => {
    if (selectedLocationId) onApply(mode, selectedLocationId);
  };

  const submitNewLocation = handleSubmit((values) => {
    if (!customer?.id) {
      setCompanyContextMissing(true);
      return;
    }
    setCompanyContextMissing(false);
    const formData = new FormData();
    formData.set('intent', 'createDeliveryLocation');
    formData.set('companyId', customer?.id ?? '');
    formData.set('name', values.name);
    formData.set('address1', values.address1);
    formData.set('address2', values.address2 ?? '');
    formData.set('city', values.city);
    formData.set('state', values.state);
    formData.set('zip', values.zip);
    formData.set('countryCode', values.countryCode);
    formData.set('setAsDefault', String(setAsDefault));
    void createLocationFetcher.submit(formData, {method: 'post'});
  });

  return (
    <Dialog.Root open onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-1200 bg-[rgba(17,17,19,.42)] transition-opacity duration-220 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className={[
          'fixed inset-0 z-1200 m-auto flex flex-col overflow-hidden rounded-3xl border border-[#E7E7E9] bg-white shadow-[0_30px_80px_rgba(17,17,19,.28)] max-[720px]:h-dvh max-[720px]:w-full max-[720px]:rounded-none',
          view === 'add'
            ? 'h-[min(550px,calc(100dvh-32px))] w-[min(580px,calc(100%-32px))]'
            : 'h-[min(840px,calc(100dvh-32px))] w-[min(580px,calc(100%-32px))]',
        ].join(' ')}>
          <header className={[
            'flex items-start justify-between gap-4 px-6 pt-5 pb-4 max-[720px]:px-4',
            view === 'add' ? 'px-8 pt-7 pb-2 max-[720px]:px-4' : 'border-b border-[#ECECEE]',
          ].join(' ')}>
            <div className="min-w-0">
              <p className="m-0 text-[12px] leading-normal font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                {view === 'add'
                  ? t('newDraftOrder.ship.addresses.dialog.add.eyebrow')
                  : t(
                      mode === 'bill'
                        ? 'newDraftOrder.ship.addresses.dialog.billEyebrow'
                        : 'newDraftOrder.ship.addresses.dialog.eyebrow',
                      {customer: customer?.name ?? ''},
                    )}
              </p>
              <Dialog.Title className="mt-1 mb-1 text-[20px] leading-[1.3] font-semibold text-[#111113]">
                {t(view === 'add' ? 'newDraftOrder.ship.addresses.dialog.add.title' : 'newDraftOrder.ship.addresses.dialog.title')}
              </Dialog.Title>
              <Dialog.Description className={[
                'm-0 text-[13px] text-[#5C5C61]',
                view === 'add' ? 'leading-[1.55]' : 'leading-[1.45]',
              ].join(' ')}>
                {t(
                  view === 'add'
                    ? 'newDraftOrder.ship.addresses.dialog.add.sub'
                    : mode === 'bill'
                      ? 'newDraftOrder.ship.addresses.dialog.billSub'
                      : 'newDraftOrder.ship.addresses.dialog.sub',
                )}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={t('newDraftOrder.ship.addresses.dialog.close')}
              className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6B6B70] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.8} />
            </Dialog.Close>
          </header>

          <div className={[
            'min-h-0 flex-1',
            view === 'add'
              ? 'overflow-y-auto scrollbar-none px-8 pt-2 pb-5 max-[720px]:px-4'
              : 'overflow-y-auto px-6 py-4 max-[720px]:px-4',
          ].join(' ')}>
            {view === 'add' ? (
              <form id="saved-location-form" className="grid min-w-0 grid-cols-2 gap-x-5 gap-y-3 max-[520px]:grid-cols-1" onSubmit={(event) => { event.preventDefault(); void submitNewLocation(); }}>
                {ADD_LOCATION_FIELDS.map((field) => <AddLocationField key={field.field} {...field} register={register} />)}
                <div className="col-span-full grid w-[min(100%,325px)] min-w-0 grid-cols-[1fr_1fr] gap-4 max-[520px]:col-span-1">
                  <AddLocationField
                    field="state"
                    label="newDraftOrder.ship.addresses.dialog.add.fields.state.label"
                    placeholder="newDraftOrder.ship.addresses.dialog.add.fields.state.placeholder"
                    autoComplete="address-level1"
                    maxLength={2}
                    required
                    register={register}
                  />
                  <AddLocationField
                    field="zip"
                    label="newDraftOrder.ship.addresses.dialog.add.fields.zip.label"
                    placeholder="newDraftOrder.ship.addresses.dialog.add.fields.zip.placeholder"
                    autoComplete="postal-code"
                    countryCode={locationForm.watch('countryCode') ?? defaultCountryCode}
                    required
                    register={register}
                  />
                </div>
                <label aria-label={t('newDraftOrder.ship.addresses.dialog.add.defaultTitle')} className="col-span-full flex min-h-20 cursor-pointer items-start gap-3 rounded-2xl border border-[#ECECEE] p-4 max-[520px]:col-span-1">
                  <input type="checkbox" checked={setAsDefault} onChange={(event) => setSetAsDefault(event.currentTarget.checked)} className="mt-0.5 size-4 shrink-0 accent-[#111113]" />
                  <span className="flex min-w-0 flex-col gap-1 text-[13px] leading-[1.4] text-[#5C5C61]">
                    <b className="font-semibold text-[#111113]">{t('newDraftOrder.ship.addresses.dialog.add.defaultTitle')}</b>
                    <span>{t('newDraftOrder.ship.addresses.dialog.add.defaultSub', {customer: customer?.name ?? ''})}</span>
                  </span>
                </label>
              </form>
            ) : (
              <div role="radiogroup" aria-label={t('newDraftOrder.ship.addresses.dialog.savedLocations')} className="flex flex-col gap-2.5">
                {locations.map((location) => {
                  const selected = location.id === selectedLocationId;
                  const address = mode === 'bill' ? location.billing : location.shipping;
                  const isDefault = location.id === (mode === 'bill' ? billId || primaryId : primaryId);
                  const title = mode === 'bill' ? address?.recipient || location.name : location.name;
                  const addressLine = (mode === 'bill'
                    ? [address?.company || customer?.name, address?.address1, address?.address2, address ? text.cityLine(address) : '']
                    : [address?.address1, address?.address2, address ? text.cityLine(address) : '']
                  ).filter(Boolean).join(' · ');

                  return (
                    <button
                      key={location.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setPendingLocationId(location.id)}
                      className={[
                          'flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]',
                        selected ? 'border-[#111113] shadow-[inset_0_0_0_1px_#111113]' : 'border-[#ECECEE] hover:border-[#D7D7DA]',
                      ].join(' ')}
                    >
                      <span aria-hidden="true" className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F2F2F3] text-xs font-semibold text-[#5C5C61]">
                        {locationInitials(location.name)}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex flex-wrap items-center gap-2 text-[14px] leading-[1.35] font-semibold text-[#111113]">
                          {title}
                          {isDefault ? (
                            <span className="rounded-full bg-[#F2F2F3] px-2.5 py-0.5 text-[11px] font-medium text-[#6B6B70]">
                              {t(mode === 'bill' ? 'newDraftOrder.ship.addresses.dialog.default' : 'newDraftOrder.ship.addresses.ship.primary')}
                            </span>
                          ) : null}
                        </span>
                        {addressLine ? (
                          <span className="text-[13px] leading-[1.4] text-[#5C5C61]">
                            {addressLine}
                          </span>
                        ) : null}
                        {mode === 'ship' && location.code ? (
                          <span className="text-[13px] leading-[1.4] text-[#5C5C61]">
                            {t(location.licensed ? 'newDraftOrder.ship.addresses.ship.codeLicensed' : 'newDraftOrder.ship.addresses.ship.code', {code: location.code})}
                          </span>
                        ) : null}
                      </span>
                      <span aria-hidden="true" className={[
                        'inline-flex size-7 shrink-0 items-center justify-center rounded-full border',
                        selected ? 'border-[#111113] bg-[#111113] text-white' : 'border-[#D7D7DA] text-transparent',
                      ].join(' ')}>
                        {selected ? <Check aria-hidden="true" size={14} strokeWidth={1.8} /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <footer className={[
            'flex items-center gap-3 border-t border-[#ECECEE] px-6 py-3.5 max-[720px]:px-4',
            view === 'add' ? 'px-8 py-4 max-[720px]:px-4' : '',
          ].join(' ')}>
            {view === 'add' ? (
              <>
                    <Button type="button" variant="outline" size="control" shape="md" className="cursor-pointer" onClick={() => setView('locations')}>
                  {t('newDraftOrder.ship.addresses.dialog.add.back')}
                </Button>
                <span className="flex-1" />
                {companyContextMissing ? <span role="alert" className="text-xs text-[#A02020]">{t('newDraftOrder.errors.customerRequired')}</span> : null}
                {createLocationFetcher.data?.ok === false ? <span role="alert" className="text-xs text-[#A02020]">{t(createLocationFetcher.data.errorKey)}</span> : null}
                <Button type="submit" form="saved-location-form" variant="default" size="control" shape="md" className="data-disabled:cursor-not-allowed" disabled={createLocationFetcher.state !== 'idle'}>
                  {t('newDraftOrder.ship.addresses.dialog.add.save')}
                </Button>
              </>
            ) : (
              <>
                    <Button type="button" variant="outline" size="control" shape="md" className="cursor-pointer" onClick={() => setView('add')}>
                  <span aria-hidden="true" className="text-lg leading-none">+</span>
                  {t('newDraftOrder.ship.addresses.dialog.addLocation')}
                </Button>
                <span className="flex-1" />
                {defaultWarningKey ? <span role="alert" className="text-xs text-[#A02020]">{t(defaultWarningKey)}</span> : null}
                    <Button type="button" variant="outline" size="control" shape="md" className="cursor-pointer" onClick={() => onOpenChange(false)}>
                  {t('newDraftOrder.ship.addresses.dialog.cancel')}
                </Button>
                <Button type="button" variant="default" size="control" shape="md" className="cursor-pointer data-disabled:cursor-not-allowed" onClick={applyLocation} disabled={!selectedLocationId}>
                  {t('newDraftOrder.ship.addresses.dialog.useLocation')}
                </Button>
              </>
            )}
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}