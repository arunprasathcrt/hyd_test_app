import {useCallback, useEffect, useRef, useState} from 'react';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useFetcher} from 'react-router';
import type {z} from 'zod';
import {Dialog} from '@base-ui/react/dialog';
import {Pencil, X} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {FormField} from '~/shared/components/ui/Form';
import {Input} from '~/shared/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/components/ui/Select';
import {
  availableDeliveryUnits,
  findLocation,
  saveDeliveryAllocations,
  SHIP_METHOD_LABEL_KEYS,
} from '../../../lib/new-draft-order';
import {
  deliveryCountryCodeSchema,
  deliveryDrawerSchema,
  deliveryLocationAddressSchema,
  SHIP_INDICATORS,
  SHIP_METHOD_OPTIONS,
} from '../../../schemas/new-draft-order.schema';
import type {DeleteDeliveryLocationActionResult} from '../../../schemas/delivery-location-admin.schema';
import type {
  DraftOrderDelivery,
  NewDraftOrderLocation,
  NewDraftOrderValues,
} from '../../../types/new-draft-order';
import type {DraftProduct} from '../../../schemas/draft-product.schema';
import {FieldLabel} from '../BuilderFields';
import {LocationSelect} from './LocationFields';
import {BuilderDateField} from './BuilderDateField';

const NEW_LOCATION_FIELDS = [
  {name: 'name', label: 'newDraftOrder.ship.delivery.dialog.newLocation.name', placeholder: 'newDraftOrder.ship.delivery.dialog.newLocation.namePlaceholder', required: true, optional: false},
  {name: 'address1', label: 'newDraftOrder.ship.delivery.dialog.newLocation.address1', placeholder: 'newDraftOrder.ship.delivery.dialog.newLocation.address1Placeholder', required: true, optional: false},
  {name: 'city', label: 'newDraftOrder.ship.delivery.dialog.newLocation.city', placeholder: 'newDraftOrder.ship.delivery.dialog.newLocation.cityPlaceholder', required: true, optional: false},
  {name: 'state', label: 'newDraftOrder.ship.delivery.dialog.newLocation.state', placeholder: 'newDraftOrder.ship.delivery.dialog.newLocation.statePlaceholder', required: true, optional: false},
  {name: 'zip', label: 'newDraftOrder.ship.delivery.dialog.newLocation.zip', placeholder: 'newDraftOrder.ship.delivery.dialog.newLocation.zipPlaceholder', required: true, optional: false},
] as const;

type DeliveryLocationAddressValues = z.infer<typeof deliveryLocationAddressSchema>;
type DeliveryDrawerValues = z.infer<typeof deliveryDrawerSchema>;

const EMPTY_DELIVERY_ADDRESS: DeliveryLocationAddressValues = {
  name: '',
  address1: '',
  address2: '',
  city: '',
  countryCode: 'US',
  state: '',
  zip: '',
};

const DELIVERY_DIALOG_FIELDS = [
  {name: 'deliveryFrom', label: 'newDraftOrder.ship.delivery.dialog.fields.deliveryFrom', date: true, optional: true, placeholder: '', help: ''},
  {name: 'deliveryTo', label: 'newDraftOrder.ship.delivery.dialog.fields.deliveryTo', date: true, optional: true, placeholder: '', help: 'newDraftOrder.ship.delivery.dialog.fields.deliveryToHelp'},
  {name: 'po', label: 'newDraftOrder.ship.delivery.dialog.fields.po', date: false, optional: true, placeholder: 'newDraftOrder.ship.delivery.dialog.fields.poPlaceholder', help: ''},
  {name: 'discountCode', label: 'newDraftOrder.ship.delivery.dialog.fields.discountCode', date: false, optional: true, placeholder: 'newDraftOrder.ship.delivery.dialog.fields.discountCodePlaceholder', help: ''},
  {name: 'shipCode', label: 'newDraftOrder.ship.delivery.dialog.fields.shipCode', date: false, optional: true, placeholder: 'newDraftOrder.ship.delivery.dialog.fields.shipCodePlaceholder', help: ''},
] as const;

const ROUTING_FIELDS = [
  {name: 'carrier', label: 'newDraftOrder.ship.delivery.dialog.routing.carrier', placeholder: 'newDraftOrder.ship.delivery.dialog.routing.carrierPlaceholder'},
  {name: 'serviceLevel', label: 'newDraftOrder.ship.delivery.dialog.routing.serviceLevel', placeholder: 'newDraftOrder.ship.delivery.dialog.routing.serviceLevelPlaceholder'},
  {name: 'account', label: 'newDraftOrder.ship.delivery.dialog.routing.account', placeholder: 'newDraftOrder.ship.delivery.dialog.routing.accountPlaceholder'},
] as const;

export function DeliveryLocationDialog({
  index,
  locationNumber,
  companyId,
  locationId,
  onLocationDeleted,
  locations,
  products,
  today,
  primaryId,
  onRemove,
  onDeliveriesChange,
  open: controlledOpen,
  openMode,
  initialAddressMode,
  onOpenChange,
}: {
  index: number;
  locationNumber: number;
  companyId?: string;
  locationId?: string;
  onLocationDeleted?: (locationId: string) => void;
  locations: NewDraftOrderLocation[];
  products: DraftProduct[];
  today: string;
  primaryId: string | undefined;
  onRemove?: () => void;
  onDeliveriesChange: (deliveries: DraftOrderDelivery[]) => void;
  open?: boolean;
  openMode?: 'edit' | 'add';
  initialAddressMode?: 'choose' | 'add';
  onOpenChange?: (open: boolean) => void;
}) {
  const {t} = useTranslation('newDraftOrder');
  const deleteLocationFetcher = useFetcher<DeleteDeliveryLocationActionResult>();
  const {control, getValues} = useFormContext<NewDraftOrderValues>();
  const deliveryForm = useForm<DeliveryDrawerValues>({
    resolver: zodResolver(deliveryDrawerSchema),
    defaultValues: {
      locationId: '',
      method: 'ground',
      indicator: 'sip',
      customRouting: false,
      customAddress: EMPTY_DELIVERY_ADDRESS,
    },
  });
  const {errors} = deliveryForm.formState;
  const {reset, setError, clearErrors} = deliveryForm;
  const [internalOpen, setInternalOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [deleteErrorKey, setDeleteErrorKey] = useState<string | null>(null);
  const pendingDeleteLocationId = useRef<string | null>(null);
  const open = controlledOpen ?? internalOpen;
  const deliveryCount = getValues('deliveries')?.length ?? 0;
  const [mode, setMode] = useState<'choose' | 'add'>('choose');
  const [pendingDelivery, setPendingDelivery] = useState<DraftOrderDelivery | null>(null);
  const [allocations, setAllocations] = useState<DraftOrderDelivery['allocations']>({});
  const allocatedUnitCount = products.reduce(
    (productTotal, product) => productTotal + product.variants.reduce(
      (variantTotal, variant) => variantTotal + (
        deliveryCount === 1
          ? variant.quantity
          : allocations?.[product.id]?.[variant.id] ?? 0
      ),
      0,
    ),
    0,
  );
  const savedDelivery = useRef(false);
  const isPersistedLocation = Boolean(locationId);
  const selectedLocation = locations.find((location) => location.id === (pendingDelivery?.locationId || primaryId));
  const defaultCountryCode = deliveryCountryCodeSchema.catch('US').parse(
    selectedLocation?.shipping?.countryCode ||
    selectedLocation?.billing?.countryCode ||
    locations.find((location) => location.shipping?.countryCode)?.shipping?.countryCode ||
    locations.find((location) => location.billing?.countryCode)?.billing?.countryCode,
  );

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(nextOpen);
    if (nextOpen) {
      const delivery = getValues(`deliveries.${index}`);
      setPendingDelivery(delivery ? {...delivery} : null);
      setAllocations(delivery?.allocations ?? {});
      reset(delivery ? {...delivery, customAddress: {...EMPTY_DELIVERY_ADDRESS, countryCode: defaultCountryCode, ...delivery.customAddress}} : undefined);
      setMode(initialAddressMode ?? (openMode === 'add' || !delivery?.locationId ? 'add' : 'choose'));
      savedDelivery.current = false;
    } else {
      if (openMode === 'add' && !savedDelivery.current) onRemove?.();
      savedDelivery.current = false;
      setMode('choose');
      setPendingDelivery(null);
      setAllocations({});
      reset({
        locationId: '',
        method: 'ground',
        indicator: 'sip',
        customRouting: false,
        customAddress: {...EMPTY_DELIVERY_ADDRESS, countryCode: defaultCountryCode},
      });
    }
    onOpenChange?.(nextOpen);
  }, [controlledOpen, defaultCountryCode, getValues, index, initialAddressMode, onOpenChange, onRemove, openMode, reset]);

  useEffect(() => {
    if (!controlledOpen) return;
    const delivery = getValues(`deliveries.${index}`);
    setPendingDelivery(delivery ? {...delivery} : null);
    setAllocations(delivery?.allocations ?? {});
    reset(delivery ? {...delivery, customAddress: {...EMPTY_DELIVERY_ADDRESS, countryCode: defaultCountryCode, ...delivery.customAddress}} : undefined);
    setMode(initialAddressMode ?? (openMode === 'add' || !delivery?.locationId ? 'add' : 'choose'));
    savedDelivery.current = false;
  }, [controlledOpen, defaultCountryCode, getValues, index, initialAddressMode, openMode, reset]);

  const saveDelivery = (formValues: DeliveryDrawerValues) => {
    const baseDelivery = pendingDelivery ?? getValues(`deliveries.${index}`) ?? null;
    if (baseDelivery) {
      const {addressMode: _addressMode, customAddress: draftAddress, ...fields} = formValues;
      const {customAddress: _previousAddress, ...base} = baseDelivery;
      const delivery: DraftOrderDelivery = mode === 'add'
        // deliveryDrawerSchema validated the address against deliveryLocationEntrySchema.
        ? {...base, ...fields, allocations, locationId: '', customAddress: draftAddress as DeliveryLocationAddressValues}
        : {...base, ...fields, allocations, locationId: fields.locationId || base.locationId};

      const currentDeliveries = getValues('deliveries') ?? [];
      onDeliveriesChange(saveDeliveryAllocations(products, currentDeliveries, index, delivery));
    }
    savedDelivery.current = true;
    handleOpenChange(false);
  };

  const handleSave = () => {
    deliveryForm.setValue('addressMode', mode);
    void deliveryForm.handleSubmit(saveDelivery)();
  };

  useEffect(() => {
    const result = deleteLocationFetcher.data;
    const requestedLocationId = pendingDeleteLocationId.current;
    if (deleteLocationFetcher.state !== 'idle' || !result || !requestedLocationId) return;
    pendingDeleteLocationId.current = null;
    if (result.ok && result.deletedLocationId === requestedLocationId) {
      setConfirmRemoveOpen(false);
      onLocationDeleted?.(requestedLocationId);
      onRemove?.();
      return;
    }
    setDeleteErrorKey(result.ok ? 'newDraftOrder.errors.companyLocationDeleteFailed' : result.errorKey);
  }, [deleteLocationFetcher.data, deleteLocationFetcher.state, onLocationDeleted, onRemove]);

  const confirmRemove = () => {
    setDeleteErrorKey(null);
    if (!isPersistedLocation) {
      setConfirmRemoveOpen(false);
      onRemove?.();
      return;
    }
    if (!companyId || !locationId) {
      setDeleteErrorKey('newDraftOrder.errors.companyLocationDeleteNotAllowed');
      return;
    }
    const referencedByAnotherDelivery = (getValues('deliveries') ?? []).some(
      (delivery, deliveryIndex) => deliveryIndex !== index && delivery.locationId === locationId,
    );
    if (referencedByAnotherDelivery || getValues('billToLocationId') === locationId) {
      setDeleteErrorKey('newDraftOrder.errors.companyLocationDeleteInUse');
      return;
    }
    const formData = new FormData();
    formData.set('intent', 'deleteDeliveryLocation');
    formData.set('companyId', companyId);
    formData.set('locationId', locationId);
    pendingDeleteLocationId.current = locationId;
    deleteLocationFetcher.submit(formData, {method: 'post'});
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={handleOpenChange}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Dialog.Trigger
          className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md border border-[#D7D7DA] bg-white px-2.5 py-1 text-[11.5px] font-medium text-[#111113] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
          aria-label={t('newDraftOrder.ship.delivery.location.editAria', {n: locationNumber})}
        >
          <Pencil aria-hidden="true" size={14} strokeWidth={1.8} />
          <span>{t('newDraftOrder.ship.delivery.location.edit')}</span>
        </Dialog.Trigger>
        {onRemove ? (
          <Button type="button" variant="outline" size="xs" shape="md" className="cursor-pointer border-[#E8C6C6] font-medium text-[#A02020] hover:border-[#E8C6C6] hover:bg-[#FBF0F0]" aria-label={t('newDraftOrder.ship.delivery.location.removeAria', {n: locationNumber})} onClick={() => setConfirmRemoveOpen(true)}>
            {t('newDraftOrder.ship.delivery.location.remove')}
          </Button>
        ) : null}
      </div>

      <Dialog.Root open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-1210 bg-[rgba(17,17,19,.42)] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Popup className="fixed inset-0 z-1210 m-auto flex h-fit w-[min(440px,calc(100%-32px))] flex-col gap-4 rounded-xl border border-[#E7E7E9] bg-white p-6 shadow-[0_24px_64px_rgba(17,17,19,.22)]">
            <div>
              <Dialog.Title className="m-0 text-[17px] leading-[1.35] font-semibold text-[#111113]">
                {t(isPersistedLocation ? 'newDraftOrder.ship.delivery.location.deleteConfirmTitle' : 'newDraftOrder.ship.delivery.location.removeConfirmTitle', {n: locationNumber})}
              </Dialog.Title>
              <Dialog.Description className="mt-2 mb-0 text-[13px] leading-[1.5] text-[#5C5C61]">
                {t(isPersistedLocation ? 'newDraftOrder.ship.delivery.location.deleteConfirmDescription' : 'newDraftOrder.ship.delivery.location.removeConfirmDescription')}
              </Dialog.Description>
              {deleteErrorKey ? <p role="alert" className="mt-3 mb-0 text-[13px] text-[#A02020]">{t(deleteErrorKey)}</p> : null}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="control" shape="md" disabled={deleteLocationFetcher.state !== 'idle'} onClick={() => setConfirmRemoveOpen(false)}>
                {t('newDraftOrder.ship.delivery.location.removeCancel')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="control"
                shape="md"
                className="border-[#E8C6C6] font-medium text-[#A02020] hover:border-[#E8C6C6] hover:bg-[#FBF0F0]"
                disabled={deleteLocationFetcher.state !== 'idle'}
                onClick={confirmRemove}
              >
                {deleteLocationFetcher.state !== 'idle'
                  ? t('newDraftOrder.ship.delivery.location.deleteWorking')
                  : t(isPersistedLocation ? 'newDraftOrder.ship.delivery.location.deleteConfirmAction' : 'newDraftOrder.ship.delivery.location.removeConfirmAction')}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-1200 bg-[rgba(17,17,19,.42)] transition-opacity duration-220 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-1200 m-0 flex h-dvh w-[min(680px,100%)] translate-x-0 flex-col overflow-hidden rounded-l-2xl border-y-0 border-r-0 border-l border-[#E7E7E9] bg-white shadow-[-24px_0_64px_rgba(17,17,19,.18)] transition-transform duration-300 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full max-[720px]:w-full max-[720px]:rounded-none">
          <header className="flex items-start justify-between gap-4 border-b border-[#ECECEE] px-8 pt-6 pb-5 max-[720px]:px-4 max-[720px]:pt-5">
            <div className="min-w-0">
              <p className="m-0 flex items-center gap-2 text-[12px] leading-normal font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[#111113]" />
                {t(
                  mode === 'add' || locationNumber !== 1
                    ? 'newDraftOrder.ship.delivery.dialog.eyebrow'
                    : 'newDraftOrder.ship.delivery.dialog.eyebrowPrimary',
                  {n: locationNumber},
                )}
              </p>
              <Dialog.Title className="mt-3 mb-1 text-[20px] leading-[1.3] font-semibold text-[#111113]">
                {t(openMode === 'add' ? 'newDraftOrder.ship.delivery.dialog.addTitle' : 'newDraftOrder.ship.delivery.dialog.title')}
              </Dialog.Title>
              <Dialog.Description className="m-0 text-[13px] leading-[1.45] text-[#5C5C61]">
                {t(openMode === 'add' ? 'newDraftOrder.ship.delivery.dialog.addSub' : 'newDraftOrder.ship.delivery.dialog.sub')}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={t('newDraftOrder.ship.delivery.dialog.close')}
              className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6B6B70] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.8} />
            </Dialog.Close>
          </header>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-8 py-5 max-[720px]:px-4">
            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-3 text-[15px] leading-normal font-semibold text-[#111113]">
                {t('newDraftOrder.ship.delivery.dialog.where')}
              </legend>
              <div className="mb-4 inline-flex rounded-lg border border-[#ECECEE] bg-[#F7F7F8] p-1" role="group" aria-label={t('newDraftOrder.ship.delivery.dialog.locationMode')}>
                <button type="button" aria-pressed={mode === 'choose'} onClick={() => {
                  clearErrors(['locationId', 'customAddress']);
                  if (!pendingDelivery?.locationId) {
                    const fallbackId = primaryId ?? locations[0]?.id ?? '';
                    setPendingDelivery((current) => current ? {...current, locationId: fallbackId} : current);
                    deliveryForm.setValue('locationId', fallbackId, {shouldDirty: true});
                  }
                  setMode('choose');
                }} className={`min-h-9 cursor-pointer rounded-md px-3 text-[12px] font-medium transition-colors ${mode === 'choose' ? 'bg-white text-[#111113] shadow-sm' : 'text-[#6B6B70] hover:text-[#111113]'}`}>
                  {t('newDraftOrder.ship.delivery.dialog.chooseLocation')}
                </button>
                <button type="button" aria-pressed={mode === 'add'} onClick={() => { clearErrors(['locationId', 'customAddress']); setMode('add'); }} className={`min-h-9 cursor-pointer rounded-md px-3 text-[12px] font-medium transition-colors ${mode === 'add' ? 'bg-white text-[#111113] shadow-sm' : 'text-[#6B6B70] hover:text-[#111113]'}`}>
                  {t('newDraftOrder.ship.delivery.dialog.addLocation')}
                </button>
              </div>

              {mode === 'choose' ? (
                <div className="flex min-w-0 flex-col gap-1.5">
                  <FieldLabel required>{t('newDraftOrder.ship.delivery.dialog.shipTo')}</FieldLabel>
                  <LocationSelect
                    name={`deliveries.${index}.locationId`}
                    locations={locations}
                    primaryId={primaryId}
                    ariaLabel={t('newDraftOrder.ship.delivery.dialog.shipTo')}
                    inlineOptions
                    value={pendingDelivery?.locationId ?? deliveryForm.watch('locationId')}
                    onValueChange={(value) => {
                      setPendingDelivery((current) => current ? {...current, locationId: value} : current);
                      deliveryForm.setValue('locationId', value, {shouldDirty: true});
                    }}
                  />
                  {errors.locationId?.message ? <span className="text-xs text-[#A02020]">{t(errors.locationId.message)}</span> : null}
                  <p className="m-0 mb-6 text-xs leading-normal text-[#6B6B70]">
                    {t(locationNumber === 1
                      ? 'newDraftOrder.ship.delivery.dialog.primaryLocationHelp'
                      : 'newDraftOrder.ship.delivery.dialog.locationHelp', locationNumber === 1
                        ? {n: locationNumber}
                        : {name: selectedLocation?.name ?? locations[0]?.name ?? ''})}
                  </p>
                </div>
              ) : (
                <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 max-[520px]:grid-cols-1">
                  {NEW_LOCATION_FIELDS.map((field) => {
                    const error = errors.customAddress?.[field.name]?.message;
                    const registration = deliveryForm.register(`customAddress.${field.name}`);
                    const postalCountry = deliveryForm.watch('customAddress.countryCode') ?? defaultCountryCode;
                    return (
                      <div key={field.name} className="flex min-w-0 flex-col gap-1 text-[11px] font-medium tracking-[0.04em] text-[#6B6B70] uppercase">
                        <span className="flex items-center gap-1.5">
                          {t(field.label)}
                          {field.required ? <span aria-hidden="true" className="text-[#A02020]">*</span> : null}
                          {field.optional ? <span className="normal-case tracking-normal text-[#85858A]">{t('newDraftOrder.ship.delivery.dialog.optional')}</span> : null}
                        </span>
                        <Input
                          aria-label={t(field.label)}
                          aria-invalid={Boolean(error)}
                          autoComplete="off"
                          inputMode={field.name === 'zip' && postalCountry !== 'CA' ? 'numeric' : undefined}
                          pattern={field.name === 'zip' ? postalCountry === 'CA' ? '[A-Za-z0-9 ]*' : '[0-9-]*' : undefined}
                          maxLength={field.name === 'zip' ? postalCountry === 'CA' ? 7 : postalCountry === 'US' ? 10 : 6 : undefined}
                          placeholder={t(field.placeholder)}
                          {...registration}
                          onChange={field.name === 'zip' ? (event) => {
                            const value = event.currentTarget.value;
                            event.currentTarget.value = postalCountry === 'CA'
                              ? value.replace(/[^A-Za-z0-9 ]/g, '').toUpperCase().slice(0, 7)
                              : postalCountry === 'US'
                                ? value.replace(/[^0-9-]/g, '').slice(0, 10)
                                : value.replace(/\D/g, '').slice(0, 6);
                            void registration.onChange(event);
                          } : registration.onChange}
                        />
                        {error ? <span className="text-xs leading-normal font-normal normal-case tracking-normal text-[#A02020]">{t(error)}</span> : null}
                      </div>
                    );
                  })}
                  <p className="col-span-full m-0 mb-4 text-xs leading-normal text-[#6B6B70]">
                    {t('newDraftOrder.ship.delivery.dialog.addLocationNote')}
                  </p>
                </div>
              )}
            </fieldset>

            <fieldset className="m-0 min-w-0 border-0  border-[#ECECEE] p-0">
              <legend className="mb-2 text-[13px] leading-normal font-semibold text-[#111113]">
                {t('newDraftOrder.ship.delivery.dialog.how')}
              </legend>
              <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 max-[520px]:grid-cols-1">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <FieldLabel as="span">{t('newDraftOrder.ship.delivery.dialog.shipVia')}</FieldLabel>
                  <FormField
                    control={control}
                    name={`deliveries.${index}.method`}
                    render={({field}) => (
                      <Select
                        value={pendingDelivery?.method ?? field.value}
                        onValueChange={(value) => {
                          if (value !== null) {
                            setPendingDelivery((current) => current ? {...current, method: value} : current);
                            deliveryForm.setValue('method', value as DeliveryDrawerValues['method'], {shouldDirty: true});
                          }
                        }}
                      >
                        <SelectTrigger className="cursor-pointer" aria-label={t('newDraftOrder.ship.delivery.method')}>
                          <SelectValue>{(value: keyof typeof SHIP_METHOD_LABEL_KEYS) => t(SHIP_METHOD_LABEL_KEYS[value])}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {SHIP_METHOD_OPTIONS.map((code) => <SelectItem key={code} value={code} className="cursor-pointer">{t(SHIP_METHOD_LABEL_KEYS[code])}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="m-0 text-xs leading-normal text-[#6B6B70]">{t('newDraftOrder.ship.delivery.dialog.shipViaHelp')}</p>
                </div>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <FieldLabel as="span">{t('newDraftOrder.ship.delivery.indicator')}</FieldLabel>
                  <FormField
                    control={control}
                    name={`deliveries.${index}.indicator`}
                    render={({field}) => (
                      <Select
                        value={pendingDelivery?.indicator ?? field.value}
                        onValueChange={(value) => {
                          if (value !== null) {
                            setPendingDelivery((current) => current ? {...current, indicator: value} : current);
                            deliveryForm.setValue('indicator', value as DeliveryDrawerValues['indicator'], {shouldDirty: true});
                          }
                        }}
                      >
                        <SelectTrigger className="cursor-pointer" aria-label={t('newDraftOrder.ship.delivery.indicator')}>
                          <SelectValue>{(value: string) => t(`newDraftOrder.ship.delivery.indicators.${value}`)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {SHIP_INDICATORS.map((code) => <SelectItem key={code} value={code} className="cursor-pointer">{t(`newDraftOrder.ship.delivery.indicators.${code}`)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {deliveryForm.watch('indicator') === 'n_before' ? (
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <FieldLabel required>{t('newDraftOrder.ship.delivery.dialog.fields.notBefore')}</FieldLabel>
                    <BuilderDateField
                      id={`delivery-${index}-notBefore`}
                      value={deliveryForm.watch('notBefore') ?? ''}
                      min={today}
                      onChange={(day) => deliveryForm.setValue('notBefore', day, {shouldDirty: true, shouldValidate: true})}
                      fieldLabel={t('newDraftOrder.ship.delivery.dialog.fields.notBefore')}
                      describedBy=""
                      invalid={Boolean(errors.notBefore)}
                    />
                    {errors.notBefore?.message ? <span className="text-xs text-[#A02020]">{t(errors.notBefore.message)}</span> : null}
                  </div>
                ) : null}
                {DELIVERY_DIALOG_FIELDS.map((field) => (
                  <div key={field.name} className="flex min-w-0 flex-col gap-1 text-[11px] font-medium tracking-[0.04em] text-[#6B6B70] uppercase">
                    <span className="flex items-center gap-1.5">
                      {t(field.label)}
                      {field.optional ? <span className="normal-case tracking-normal text-[#85858A]">{t('newDraftOrder.ship.delivery.dialog.optional')}</span> : null}
                    </span>
                    {field.date ? (
                      <BuilderDateField
                        id={`delivery-${index}-${field.name}`}
                        value={deliveryForm.watch(field.name) ?? ''}
                        min={field.name === 'deliveryTo' ? deliveryForm.watch('deliveryFrom') || today : today}
                        onChange={(day) => deliveryForm.setValue(field.name, day, {shouldDirty: true, shouldValidate: true})}
                        fieldLabel={t(field.label)}
                        describedBy=""
                        invalid={Boolean(errors[field.name])}
                      />
                    ) : (
                      <Input
                        aria-label={t(field.label)}
                        type="text"
                        placeholder={field.placeholder ? t(field.placeholder) : undefined}
                        autoComplete="off"
                        {...deliveryForm.register(field.name)}
                      />
                    )}
                    {(field.name === 'deliveryFrom' || field.name === 'deliveryTo') && errors[field.name]?.message ? (
                      <span role="alert" className="text-xs leading-normal font-normal normal-case tracking-normal text-[#A02020]">{t(errors[field.name]!.message!)}</span>
                    ) : field.help ? <span className="text-xs leading-normal font-normal normal-case tracking-normal">{t(field.help)}</span> : null}
                  </div>
                ))}
                <div className="col-span-full flex min-h-16 items-start gap-3 rounded-xl border border-[#ECECEE] p-4 text-[13px] leading-normal text-[#111113]">
                  <input
                    type="checkbox"
                    aria-label={t('newDraftOrder.ship.delivery.dialog.routingOverrideTitle')}
                    className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#111113]"
                    {...deliveryForm.register('customRouting')}
                    onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      deliveryForm.setValue('customRouting', checked, {shouldDirty: true});
                      setPendingDelivery((current) => current ? {...current, customRouting: checked} : current);
                    }}
                  />
                  <span className="flex min-w-0 flex-col gap-1 text-[#5C5C61]">
                    <b className="font-semibold text-[#111113]">{t('newDraftOrder.ship.delivery.dialog.routingOverrideTitle')}</b>
                    <span>{t('newDraftOrder.ship.delivery.dialog.routingOverrideHelp')}</span>
                  </span>
                </div>
                {deliveryForm.watch('customRouting') ? (
                  <div className="col-span-full grid min-w-0 grid-cols-3 gap-3 max-[520px]:grid-cols-1">
                    {ROUTING_FIELDS.map((field) => (
                    <div key={field.name} className="flex min-w-0 flex-col gap-1 text-[11px] font-medium tracking-[0.04em] text-[#6B6B70] uppercase">
                      <span>{t(field.label)}</span>
                      <Input aria-label={t(field.label)} placeholder={t(field.placeholder)} {...deliveryForm.register(`routing.${field.name}`)} />
                    </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </fieldset>

            <section className=" border-[#ECECEE] pt-5" aria-label={t('newDraftOrder.ship.delivery.dialog.unitsTitle')}>
              <h3 className="m-0 text-[15px] leading-normal font-semibold text-[#111113]">{t('newDraftOrder.ship.delivery.dialog.unitsTitle')}</h3>
              {getValues('deliveries')?.length === 1 ? (
                <p className="mt-1 mb-3 text-[12px] text-[#6B6B70]">{t('newDraftOrder.ship.delivery.dialog.unitsSingle')}</p>
              ) : (
                <>
                  <p className="mt-1 mb-3 text-[12px] text-[#6B6B70]">{t(index === 0 ? 'newDraftOrder.ship.delivery.dialog.unitsPrimaryHelp' : 'newDraftOrder.ship.delivery.dialog.unitsOtherHelp')}</p>
                  {products.filter((product) => product.variants.some((variant) => variant.quantity > 0)).map((product, productIndex) => {
                    const assignedUnits = product.variants.reduce(
                      (total, variant) => total + (allocations?.[product.id]?.[variant.id] ?? 0),
                      0,
                    );
                    const totalUnits = product.variants.reduce((total, variant) => total + variant.quantity, 0);

                    return (
                      <fieldset key={product.id} className="mb-4 min-w-0 rounded-[14px] border border-[#ECECEE] p-4">
                        <legend className="sr-only">
                          {t('newDraftOrder.ship.delivery.dialog.lineProduct', {
                            lineNumber: product.lineNumber ?? productIndex + 1,
                            product: product.name,
                          })}
                        </legend>
                        <div className="mb-3 flex w-full min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[13px] font-semibold text-[#111113]">
                          <span className="min-w-0 flex-1">
                            {t('newDraftOrder.ship.delivery.dialog.lineProduct', {
                              lineNumber: product.lineNumber ?? productIndex + 1,
                              product: product.name,
                            })}
                          </span>
                          <span className="flex shrink-0 items-center gap-3 font-normal text-[#6B6B70]">
                            <span className="text-xs">
                              {t('newDraftOrder.ship.delivery.dialog.allocationCount', {assigned: assignedUnits, total: totalUnits})}
                            </span>
                            <button
                              type="button"
                              className="cursor-pointer text-xs font-medium text-[#5C5C61] underline underline-offset-2 hover:text-[#111113]"
                              onClick={() => {
                                const currentDeliveries = getValues('deliveries') ?? [];
                                const productAllocations = Object.fromEntries(product.variants.map((variant) => [
                                  variant.id,
                                  availableDeliveryUnits(currentDeliveries, index, product.id, variant),
                                ]));
                                setAllocations((current) => ({...current, [product.id]: productAllocations}));
                              }}
                            >
                              {t('newDraftOrder.ship.delivery.dialog.assignAllAvailable')}
                            </button>
                          </span>
                        </div>
                        <div className="flex flex-wrap justify-start gap-x-3 gap-y-4">
                          {product.variants.filter((variant) => variant.quantity > 0).map((variant) => {
                            const available = availableDeliveryUnits(getValues('deliveries') ?? [], index, product.id, variant);

                            return (
                              <label key={variant.id} className="flex w-[75px] max-w-full min-w-0 flex-col items-center gap-2 text-xs text-[#5C5C61]">
                                <span>{variant.size}</span>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  max={available}
                                  step={1}
                                  aria-label={t('newDraftOrder.ship.delivery.dialog.allocationLabel', {product: product.name, size: variant.size})}
                                  value={allocations?.[product.id]?.[variant.id] ?? 0}
                                  onChange={(event) => {
                                    const value = event.currentTarget.value;
                                    const parsed = Number(value) || 0;
                                    if (!Number.isInteger(parsed)) return;
                                    const quantity = Math.min(available, Math.max(0, parsed));
                                    setAllocations((current) => ({
                                      ...current,
                                      [product.id]: {...(current?.[product.id] ?? {}), [variant.id]: quantity},
                                    }));
                                  }}
                                  className="h-10 w-full rounded-[14px] px-2 text-center"
                                />
                                <span>{t('newDraftOrder.ship.delivery.dialog.unitsOfAvailable', {count: available})}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    );
                  })}
                  {!products.some((product) => product.variants.some((variant) => variant.quantity > 0)) ? (
                    <p className="m-0 text-xs text-[#6B6B70]">{t('newDraftOrder.ship.delivery.dialog.noProducts')}</p>
                  ) : null}
                </>
              )}
            </section>
          </div>

          <footer className="flex flex-wrap items-center gap-3 border-t border-[#ECECEE] px-6 py-3.5 max-[720px]:px-4">
            <span className="text-xs text-[#6B6B70]">
              {t('newDraftOrder.ship.delivery.dialog.allocatedUnits', {count: allocatedUnitCount})}
            </span>
            <span className="flex-1" />
            <Dialog.Close className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[#D7D7DA] bg-white px-4 text-[13px] font-medium text-[#111113] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]">
              {t('newDraftOrder.ship.delivery.dialog.cancel')}
            </Dialog.Close>
            <button type="button" onClick={handleSave} className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-[#1A1A1A] bg-[#1A1A1A] px-4 text-[13px] font-medium text-white hover:bg-[#303030] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E] disabled:cursor-not-allowed disabled:opacity-60">
              {t('newDraftOrder.ship.delivery.dialog.save')}
            </button>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function textForLocation(
  locations: NewDraftOrderLocation[],
  id: string,
  primaryId: string | undefined,
  t: ReturnType<typeof useTranslation>['t'],
) {
  const location = findLocation(locations, id);
  if (!location) return '';
  const address = location.shipping;
  if (!address?.city) {
    return location.id === primaryId
      ? t('newDraftOrder.ship.location.namePrimary', {name: location.name})
      : location.name;
  }
  return t(location.id === primaryId ? 'newDraftOrder.ship.location.optionPrimary' : 'newDraftOrder.ship.location.option', {
    name: location.name,
    city: address.city,
    zone: address.zoneCode,
  });
}