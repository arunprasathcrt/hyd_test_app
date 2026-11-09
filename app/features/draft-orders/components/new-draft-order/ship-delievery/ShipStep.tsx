import {useMemo, useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {FormField} from '~/shared/components/ui/Form';
import {Input} from '~/shared/components/ui/Input';
import {daysBetween, isoDayToDate, shipSchedule, SHIP_METHOD_LABEL_KEYS} from '../../../lib/new-draft-order';
import {getDraftCards, getProductQuantity, getProductSubtotal} from '../../../lib/draft-products';
import {useNewDraftOrderProductsStore} from '../../../store/new-draft-order-products.store';
import type {
  NewDraftOrderCustomer,
  NewDraftOrderLocation,
  NewDraftOrderFieldErrors,
  NewDraftOrderValues,
  LeadTimeConfig,
  ShipTiming,
} from '../../../types/new-draft-order';
import {BuilderDateField} from './BuilderDateField';
import {
  BuilderCard,
  BuilderCardTitle,
  BuilderSubHeading,
  BuilderTag,
  FieldError,
  FieldHelp,
  FieldLabel,
  ReadOnlyValue,
} from '../BuilderFields';
import {InHandsDateField} from '../InHandsDateField';
import {DeliveryLocationsCard} from './DeliveryLocationsCard';
import {ShipBillCard} from './ShipBillCard';

interface Props {
  customer: NewDraftOrderCustomer | undefined;
  today: string;
  shipTiming: ShipTiming;
  leadTime: LeadTimeConfig;
  selectedMethods: string[];
  selectedFlags: string[];
  orderType: string;
  hasProducts: boolean;
  dateAdjusted: boolean;
  onDateAdjustedChange: (adjusted: boolean) => void;
  serverErrors?: NewDraftOrderFieldErrors;
}

const fieldClass = 'flex min-w-0 flex-col gap-1.5';
const gridClass = 'grid min-w-0 grid-cols-2 gap-x-5 gap-y-4 max-[759.98px]:grid-cols-1';

export function ShipStep({
  customer,
  today,
  shipTiming,
  leadTime,
  selectedMethods,
  selectedFlags,
  orderType,
  hasProducts,
  dateAdjusted,
  onDateAdjustedChange,
  serverErrors,
}: Props) {
  const {t, i18n} = useTranslation('newDraftOrder');
  const {
    control,
    register,
    setValue,
    trigger,
    formState: {errors},
  } = useFormContext<NewDraftOrderValues>();
  const [createdLocationsByCompany, setCreatedLocationsByCompany] = useState<Record<string, NewDraftOrderLocation[]>>({});
  const [primaryLocationByCompany, setPrimaryLocationByCompany] = useState<Record<string, string>>({});
  const [inHandsDate, eventDate, firstMethod, poNumber] = useWatch({
    control,
    name: ['inHandsDate', 'eventDate', 'deliveries.0.method', 'poNumber'],
  });
  const products = useNewDraftOrderProductsStore((state) => state.products);
  const createdLocations = customer ? createdLocationsByCompany[customer.id] ?? [] : [];
  const allCustomerLocationMap = new Map((customer?.locations ?? []).map((location) => [location.id, location]));
  createdLocations.forEach((location) => allCustomerLocationMap.set(location.id, location));
  const allCustomerLocations = [...allCustomerLocationMap.values()];
  const preferredPrimaryId = customer ? primaryLocationByCompany[customer.id] : undefined;
  const preferredPrimary = allCustomerLocations.find((location) => location.id === preferredPrimaryId);
  const customerWithCreatedLocations = customer ? {
    ...customer,
    locations: preferredPrimary
      ? [preferredPrimary, ...allCustomerLocations.filter((location) => location.id !== preferredPrimary.id)]
      : allCustomerLocations,
  } : undefined;
  const handleSavedLocationCreated = (location: NewDraftOrderLocation, setPrimary: boolean) => {
    if (!customer) return;
    setCreatedLocationsByCompany((current) => ({
      ...current,
      [customer.id]: [...(current[customer.id] ?? []).filter((item) => item.id !== location.id), location],
    }));
    if (setPrimary) {
      setPrimaryLocationByCompany((current) => ({...current, [customer.id]: location.id}));
      setValue('deliveries.0.locationId', location.id, {shouldDirty: true, shouldTouch: true});
      setValue('billToLocationId', location.id, {shouldDirty: true, shouldTouch: true});
    }
  };
  const handlePrimaryLocationChanged = (locationId: string) => {
    if (!customer) return;
    setPrimaryLocationByCompany((current) => ({...current, [customer.id]: locationId}));
    setValue('billToLocationId', locationId, {shouldDirty: true, shouldTouch: true});
  };
  const handleSavedLocationDeleted = (locationId: string) => {
    if (!customer) return;
    setCreatedLocationsByCompany((current) => ({
      ...current,
      [customer.id]: (current[customer.id] ?? []).filter((location) => location.id !== locationId),
    }));
    setPrimaryLocationByCompany((current) => {
      if (current[customer.id] !== locationId) return current;
      const next = {...current};
      delete next[customer.id];
      return next;
    });
  };
  // Prototype `cardPlan`: one order per card, brands in first-seen order, then by line.
  const splitOrders = useMemo(() => {
    const brandRank = new Map<string, number>();
    return getDraftCards(products)
      .map((card, index) => {
        const lead = card.products[0];
        if (!brandRank.has(lead.brand)) brandRank.set(lead.brand, brandRank.size);
        return {
          id: card.id,
          card: index + 1,
          brand: lead.brand,
          garments: card.products.length,
          units: card.products.reduce((sum, product) => sum + getProductQuantity(product), 0),
          total: Math.round(card.products.reduce((sum, product) => sum + getProductSubtotal(product) * 100, 0)) / 100,
          po: lead.po.trim() || (poNumber ?? '').trim(),
          shipDate: lead.shipDate || inHandsDate || '',
        };
      })
      .sort((a, b) => (brandRank.get(a.brand) ?? 0) - (brandRank.get(b.brand) ?? 0) || a.card - b.card)
      .map((order, index) => ({...order, n: index + 1}));
  }, [products, poNumber, inHandsDate]);
  const schedule = shipSchedule(
    today,
    inHandsDate,
    shipTiming,
    leadTime,
    selectedMethods,
    selectedFlags,
    orderType,
    hasProducts,
  );
  const selectedMethodLabels = selectedMethods
    .map((code) => leadTime.methods.find((method) => method.code === code)?.label)
    .filter((label): label is string => Boolean(label))
    .map((label) => label.toLocaleLowerCase(i18n.language));
  const firstShipHelp = selectedMethodLabels.length
    ? t('newDraftOrder.ship.neededBy.firstShip.help', {
        methods: new Intl.ListFormat(i18n.language, {style: 'long', type: 'unit'}).format(selectedMethodLabels),
      })
    : t('newDraftOrder.leadTime.summary.defaultHint');
  const date = (day: string) => t('newDraftOrder.overview.date', {date: isoDayToDate(day)});
  const shortDate = (day: string) => t('newDraftOrder.ship.dateShort', {date: isoDayToDate(day)});
  const range = (from: string, to: string) =>
    t('newDraftOrder.ship.neededBy.phases.range', {from: shortDate(from), to: shortDate(to)});

  const errorKey = (field: keyof NewDraftOrderValues) =>
    errors[field]?.message ?? serverErrors?.[field];
  const fieldError = (field: keyof NewDraftOrderValues, id: string) => {
    const key = errorKey(field);
    return key ? <FieldError id={id}>{t(key)}</FieldError> : null;
  };

  const eventNameRequired = Boolean(eventDate);
  const phaseLabel = (key: string, label?: string) => {
    if (label) return label;
    switch (key) {
      case 'artProduction': return t('newDraftOrder.ship.neededBy.phases.artProduction');
      case 'accountSetup': return t('newDraftOrder.ship.neededBy.phases.accountSetup');
      case 'licensing': return t('newDraftOrder.ship.neededBy.phases.licensing');
      case 'procurement': return t('newDraftOrder.ship.neededBy.phases.procurement');
      case 'production': return t('newDraftOrder.ship.neededBy.phases.production');
      case 'shipping': return t('newDraftOrder.ship.neededBy.phases.shipping');
      default: return t('newDraftOrder.ship.neededBy.phases.receiving');
    }
  };
  const roadSignMethod = [...selectedMethods]
    .map((code) => leadTime.methods.find((method) => method.code === code))
    .filter((method): method is (typeof leadTime.methods)[number] => Boolean(method))
    .sort((a, b) => b.days - a.days)[0]?.label ?? phaseLabel('production');
  const roadSignModifiers = selectedFlags
    .map((code) => leadTime.flags.find((flag) => flag.code === code)?.label)
    .filter((label): label is string => Boolean(label));
  const roadSignWork = roadSignModifiers.length
    ? t('newDraftOrder.ship.neededBy.roadSigns.workWithModifiers', {
        method: roadSignMethod,
        modifiers: roadSignModifiers.join(t('newDraftOrder.ship.neededBy.roadSigns.separator')),
      })
    : roadSignMethod;

  return (
    <div className="mb-4 flex max-w-full flex-col gap-4">
      <BuilderCard aria-label={t('newDraftOrder.ship.neededBy.title')}>
        <header className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2.5">
          <div className="min-w-0 flex-[1_1_280px]">
            <BuilderCardTitle title={t('newDraftOrder.ship.neededBy.title')} sub={t('newDraftOrder.ship.neededBy.sub')} />
          </div>
          <BuilderTag tone={schedule.late ? 'bad' : schedule.atRisk ? 'warn' : 'ok'}>
            {schedule.late
              ? t('newDraftOrder.ship.pace.late', {count: Math.abs(schedule.daysToSpare)})
              : schedule.atRisk
                ? t('newDraftOrder.ship.pace.atRiskSoonest', {count: schedule.daysToSpare})
                : t('newDraftOrder.ship.pace.onTrack', {count: schedule.daysToSpare})}
          </BuilderTag>
        </header>

        <div className="grid min-w-0 grid-cols-3 gap-x-5 gap-y-4 max-[759.98px]:grid-cols-1">
          <div className={fieldClass}>
            <FieldLabel htmlFor="do112bIh4" required>{t('newDraftOrder.customer.fields.inHands.label')}</FieldLabel>
            <FormField
              control={control}
              name="inHandsDate"
              render={({field}) => (
                <InHandsDateField
                  id="do112bIh4"
                  value={field.value ?? ''}
                  today={today}
                  soonest={schedule.earliestInHands}
                  onChange={(day) => {
                    onDateAdjustedChange(false);
                    setValue('inHandsDateManual', true, {shouldDirty: true});
                    field.onChange(day);
                  }}
                  describedBy="do112bIh4-h"
                  invalid={Boolean(errorKey('inHandsDate'))}
                />
              )}
            />
            {fieldError('inHandsDate', 'do112bIh4-e')}
            {dateAdjusted ? (
              <p role="status" className="m-0 text-xs leading-normal text-[#6B4A0B]">
                {t('newDraftOrder.ship.neededBy.dateAdjusted', {date: date(schedule.earliestInHands)})}
              </p>
            ) : null}
            <FieldHelp id="do112bIh4-h">{t('newDraftOrder.ship.neededBy.inHandsHelp')}</FieldHelp>
          </div>

          <div className={fieldClass}>
            <FieldLabel as="span">{t('newDraftOrder.ship.neededBy.daysOut.label')}</FieldLabel>
            <ReadOnlyValue>{t('newDraftOrder.ship.days', {count: schedule.daysOut})}</ReadOnlyValue>
            <FieldHelp>{t('newDraftOrder.ship.neededBy.daysOut.help')}</FieldHelp>
          </div>

          <div className={fieldClass}>
            <FieldLabel as="span">{t('newDraftOrder.ship.neededBy.startBy.label')}</FieldLabel>
            <ReadOnlyValue>{date(schedule.productionStart)}</ReadOnlyValue>
            <FieldHelp>{t('newDraftOrder.ship.neededBy.startBy.help', {date: date(schedule.productionStart)})}</FieldHelp>
          </div>
        </div>

        <div role="status" className="mt-4 flex min-w-0 flex-wrap items-start justify-between gap-4 rounded-[10px] border border-[#ECECEE] bg-[#F7F7F8] p-3">
          <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-0.5">
            <FieldLabel as="span">{t('newDraftOrder.ship.neededBy.firstShip.label')}</FieldLabel>
            <b className="text-[15px] leading-normal font-semibold text-[#111113] tabular-nums">{date(schedule.firstAvailableShip)}</b>
            <FieldHelp>{firstShipHelp}</FieldHelp>
          </div>
          <div className="flex flex-col gap-0.5 text-right max-[759.98px]:text-left">
            <FieldLabel as="span">{t('newDraftOrder.ship.neededBy.shipOutIn')}</FieldLabel>
            <b className="text-[15px] leading-normal font-semibold text-[#111113] tabular-nums">
              {t('newDraftOrder.ship.days', {count: schedule.shipOutIn})}
            </b>
          </div>
        </div>

        <BuilderSubHeading>{t('newDraftOrder.ship.neededBy.phases.title')}</BuilderSubHeading>
        <ol aria-label={t('newDraftOrder.ship.neededBy.phases.ariaLabel')} className="m-0 grid min-w-0 list-none grid-cols-4 gap-2 p-0 max-[759.98px]:grid-cols-2">
          {schedule.phases.map((phase) => (
            <li key={phase.key} className="relative flex min-w-0 flex-col gap-0.5 overflow-hidden rounded-[10px] border border-[#ECECEE] bg-white px-3 pt-3.5 pb-3">
              <span className="text-xs leading-normal text-[#6B6B70] tabular-nums">{t('newDraftOrder.ship.days', {count: phase.days})}</span>
              <b className="text-[13px] leading-normal font-semibold text-[#111113]">{phaseLabel(phase.key, phase.label)}</b>
              <span className="text-xs leading-normal text-[#5C5C61] tabular-nums">{range(phase.start, phase.end)}</span>
            </li>
          ))}
          <li className="relative flex min-w-0 flex-col gap-0.5 overflow-hidden rounded-[10px] border border-[#111113] bg-white px-3 pt-3.5 pb-3">
            <span className="text-xs leading-normal text-[#6B6B70]">{t('newDraftOrder.ship.neededBy.phases.inHands')}</span>
            <b className="text-[13px] leading-normal font-semibold text-[#111113] tabular-nums">{shortDate(inHandsDate)}</b>
            <span className="text-xs leading-normal text-[#5C5C61] tabular-nums">{date(inHandsDate)}</span>
          </li>
        </ol>
        <BuilderSubHeading>{t('newDraftOrder.ship.neededBy.roadSigns.title')}</BuilderSubHeading>
        {products.length ? (
          <ul
            aria-label={t('newDraftOrder.ship.neededBy.roadSigns.ariaLabel', {count: products.length})}
            className="m-0 flex list-none flex-col p-0"
          >
            {products.map((product, index) => {
              const atRisk = schedule.daysToSpare < 0;
              const lineName = t('newDraftOrder.products.lineTitle', {
                number: product.lineNumber ?? index + 1,
                name: [product.name, product.variants[0]?.color].filter(Boolean).join(', '),
              });
              const detail = atRisk
                ? t('newDraftOrder.ship.neededBy.roadSigns.atRiskDetail', {
                    work: roadSignWork,
                    days: t('newDraftOrder.ship.days', {count: Math.abs(schedule.daysToSpare)}),
                    date: date(schedule.minimumInHands),
                    lateBy: t('newDraftOrder.ship.days', {count: Math.abs(schedule.daysToSpare)}),
                  })
                : t('newDraftOrder.ship.neededBy.roadSigns.onTrackDetail', {
                    work: roadSignWork,
                    date: date(schedule.minimumInHands),
                    days: t('newDraftOrder.ship.days', {count: schedule.daysToSpare}),
                  });

              return (
                <li key={product.id} className="flex min-w-0 items-start gap-3 border-b border-[#ECECEE] py-3 last:border-b-0">
                  <BuilderTag tone={atRisk ? 'warn' : 'ok'}>
                    {t(atRisk
                      ? 'newDraftOrder.ship.neededBy.roadSigns.atRisk'
                      : 'newDraftOrder.ship.neededBy.roadSigns.onTrack')}
                  </BuilderTag>
                  <div className="flex min-w-0 flex-col gap-1">
                    <b className="text-[13px] leading-normal font-medium text-[#111113]">{lineName}</b>
                    <FieldHelp>{detail}</FieldHelp>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="pb-3">
            <FieldHelp>{t('newDraftOrder.ship.neededBy.roadSigns.description')}</FieldHelp>
          </div>
        )}
      </BuilderCard>

      <BuilderCard aria-label={t('newDraftOrder.ship.cancel.title')}>
        <header className="mb-4"><BuilderCardTitle title={t('newDraftOrder.ship.cancel.title')} sub={t('newDraftOrder.ship.cancel.sub')} /></header>
        <div className={gridClass}>
          <div className={fieldClass}>
            <FieldLabel htmlFor="v135bCx">{t('newDraftOrder.ship.cancel.label')}</FieldLabel>
            <FormField
              control={control}
              name="cancelDate"
              render={({field}) => (
                <BuilderDateField
                  id="v135bCx"
                  value={field.value ?? ''}
                  min={inHandsDate}
                  onChange={field.onChange}
                  fieldLabel={t('newDraftOrder.ship.cancel.label')}
                  describedBy="v135bCx-h"
                  invalid={Boolean(errorKey('cancelDate'))}
                />
              )}
            />
            {fieldError('cancelDate', 'v135bCx-e')}
          </div>
        </div>
        <FieldHelp id="v135bCx-h">{t('newDraftOrder.ship.cancel.help')}</FieldHelp>
      </BuilderCard>

      <BuilderCard aria-label={t('newDraftOrder.ship.event.title')}>
        <header className="mb-4"><BuilderCardTitle title={t('newDraftOrder.ship.event.title')} sub={t('newDraftOrder.ship.event.sub')} /></header>
        <div className={gridClass}>
          <div className={fieldClass}>
            <FieldLabel htmlFor="do112bEvD-ship" optional={t('newDraftOrder.ship.optional')}>{t('newDraftOrder.ship.event.date.label')}</FieldLabel>
            <FormField
              control={control}
              name="eventDate"
              render={({field}) => (
                <BuilderDateField
                  id="do112bEvD-ship"
                  value={field.value ?? ''}
                  min={today}
                  onChange={(day) => {
                    field.onChange(day);
                    // The name rule depends on the date, so revalidate it as soon as the date changes.
                    void trigger('eventName');
                  }}
                  fieldLabel={t('newDraftOrder.ship.event.date.label')}
                  describedBy="do112bEvD-ship-h"
                  invalid={Boolean(errorKey('eventDate'))}
                />
              )}
            />
            {fieldError('eventDate', 'do112bEvD-ship-e')}
            <FieldHelp id="do112bEvD-ship-h">
              {eventDate
                ? t('newDraftOrder.ship.event.date.daysOut', {count: daysBetween(today, eventDate)})
                : t('newDraftOrder.ship.event.date.help')}
            </FieldHelp>
          </div>

          <div className={fieldClass}>
            <FieldLabel
              htmlFor="do112bEvN-ship"
              required={eventNameRequired}
              optional={eventNameRequired ? undefined : t('newDraftOrder.ship.optional')}
            >
              {t('newDraftOrder.ship.event.name.label')}
            </FieldLabel>
            <Input
              id="do112bEvN-ship"
              type="text"
              autoComplete="off"
              aria-required={eventNameRequired || undefined}
              aria-describedby={errorKey('eventName') ? 'do112bEvN-ship-e do112bEvN-ship-h' : 'do112bEvN-ship-h'}
              aria-invalid={Boolean(errorKey('eventName')) || undefined}
              placeholder={t('newDraftOrder.ship.event.name.placeholder')}
              {...register('eventName')}
            />
            {fieldError('eventName', 'do112bEvN-ship-e')}
            <FieldHelp id="do112bEvN-ship-h">{t('newDraftOrder.ship.event.name.help')}</FieldHelp>
          </div>
        </div>
      </BuilderCard>

      <ShipBillCard
        customer={customerWithCreatedLocations}
        onLocationCreated={handleSavedLocationCreated}
        onPrimaryLocationChanged={handlePrimaryLocationChanged}
      />

      <BuilderCard aria-label={t('newDraftOrder.ship.details.title')}>
        <header className="mb-4"><BuilderCardTitle title={t('newDraftOrder.ship.details.title')} sub={t('newDraftOrder.ship.details.sub')} /></header>
        <div className={gridClass}>
          <div className={fieldClass}>
            <FieldLabel htmlFor="do112bPo" optional={t('newDraftOrder.ship.optional')}>{t('newDraftOrder.ship.details.po.label')}</FieldLabel>
            <Input
              id="do112bPo"
              type="text"
              autoComplete="off"
              aria-describedby="do112bPo-h"
              aria-invalid={Boolean(errorKey('poNumber')) || undefined}
              placeholder={t('newDraftOrder.ship.details.po.placeholder')}
              {...register('poNumber')}
            />
            {fieldError('poNumber', 'do112bPo-e')}
            <FieldHelp id="do112bPo-h">{t('newDraftOrder.ship.details.po.help')}</FieldHelp>
          </div>

          <div className={fieldClass}>
            <FieldLabel htmlFor="do112bShc" optional={t('newDraftOrder.ship.optional')}>{t('newDraftOrder.ship.details.shipCode.label')}</FieldLabel>
            <Input
              id="do112bShc"
              type="text"
              autoComplete="off"
              aria-describedby="do112bShc-h"
              aria-invalid={Boolean(errorKey('shipCode')) || undefined}
              placeholder={t('newDraftOrder.ship.details.shipCode.placeholder')}
              {...register('shipCode')}
            />
            {fieldError('shipCode', 'do112bShc-e')}
            <FieldHelp id="do112bShc-h">{t('newDraftOrder.ship.details.shipCode.help')}</FieldHelp>
          </div>

          <div className={fieldClass}>
            <FieldLabel as="span">{t('newDraftOrder.ship.details.leavesPlant.label')}</FieldLabel>
            <ReadOnlyValue>{date(schedule.leavesPlant)}</ReadOnlyValue>
            <FieldHelp>{t('newDraftOrder.ship.details.leavesPlant.help')}</FieldHelp>
          </div>

          <div className={fieldClass}>
            <FieldLabel as="span">{t('newDraftOrder.ship.details.shipVia.label')}</FieldLabel>
            <ReadOnlyValue>{firstMethod ? t(SHIP_METHOD_LABEL_KEYS[firstMethod]) : ''}</ReadOnlyValue>
            <FieldHelp>{t('newDraftOrder.ship.details.shipVia.help')}</FieldHelp>
          </div>
        </div>
        <BuilderSubHeading>{t('newDraftOrder.ship.details.split.title')}</BuilderSubHeading>
        <div role="status">
          {splitOrders.length ? (
            <>
              <ul aria-label={t('newDraftOrder.ship.details.split.listAria')} className="m-0 flex list-none flex-col gap-1.5 p-0">
                {splitOrders.map((order) => (
                  <li key={order.id} className="flex flex-col gap-0.5 rounded-[10px] border border-[#ECECEE] px-3 py-2.5">
                    <b className="text-[13px] leading-normal font-semibold wrap-anywhere text-[#111113]">
                      {t('newDraftOrder.ship.details.split.row', {
                        order: order.n,
                        card: order.card,
                        title: t('newDraftOrder.ship.details.split.artNotChosen'),
                        brand: order.brand,
                      })}
                    </b>
                    <span className="text-xs leading-normal wrap-anywhere text-[#6B6B70] tabular-nums">
                      {[
                        t('newDraftOrder.ship.details.split.garments', {count: order.garments}),
                        t('newDraftOrder.ship.details.split.units', {count: order.units}),
                        t('newDraftOrder.ship.details.split.beforeTax', {value: order.total}),
                        order.po
                          ? t('newDraftOrder.ship.details.split.po', {po: order.po})
                          : t('newDraftOrder.ship.details.split.noPo'),
                        order.shipDate
                          ? t('newDraftOrder.ship.details.split.due', {date: isoDayToDate(order.shipDate)})
                          : '',
                      ]
                        .filter(Boolean)
                        .join(t('newDraftOrder.ship.details.split.separator'))}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-1.5">
                <FieldHelp>{t('newDraftOrder.ship.details.split.note', {count: splitOrders.length})}</FieldHelp>
              </div>
            </>
          ) : (
            <FieldHelp>{t('newDraftOrder.ship.details.split.empty')}</FieldHelp>
          )}
        </div>
      </BuilderCard>

      <DeliveryLocationsCard
        customer={customerWithCreatedLocations}
        inHandsDate={inHandsDate}
        today={today}
        onLocationDeleted={handleSavedLocationDeleted}
      />
    </div>
  );
}