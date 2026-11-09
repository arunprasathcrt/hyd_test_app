import {useState} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Plus} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {
  assignUnallocatedToPrimary,
  findLocation,
  getDeliveryAllocationSummary,
  initializeDeliveryAllocations,
  isoDayToDate,
  locationInitials,
  pendingDeliveryLocation,
  removeDeliveryAndReturnAllocations,
  SHIP_METHOD_LABEL_KEYS,
  splitDeliveryAllocationsEvenly,
  trimDeliveryAllocations,
} from '../../../lib/new-draft-order';
import type {DraftOrderDelivery, NewDraftOrderCustomer, NewDraftOrderLocation, NewDraftOrderValues} from '../../../types/new-draft-order';
import {BuilderCard, BuilderCardTitle, FieldHelp} from '../BuilderFields';
import {DeliveryTruckIcon} from '../../icons/DeliveryTruckIcon';
import {DeliveryLocationDialog} from './DeliveryLocationDialog';
import {LocationSelect, useLocationText} from './LocationFields';
import {useNewDraftOrderProductsStore} from '../../../store/new-draft-order-products.store';

const boxClass = 'flex min-w-0 flex-col gap-2 rounded-[12px] border border-[#ECECEE] bg-white p-4';
const lineClass = 'm-0 text-[13px] leading-normal text-[#5C5C61]';

function nextDelivery(locations: NewDraftOrderLocation[], used: DraftOrderDelivery[]): DraftOrderDelivery {
  const free = locations.find((location) => !used.some((delivery) => delivery.locationId === location.id));
  return {
    locationId: (free ?? locations[0])?.id ?? '',
    method: 'ground',
    indicator: 'sip',
    customRouting: false,
  };
}

export function DeliveryLocationsCard({
  customer,
  inHandsDate,
  today,
  onLocationDeleted,
}: {
  customer: NewDraftOrderCustomer | undefined;
  inHandsDate: string;
  today: string;
  onLocationDeleted?: (locationId: string) => void;
}) {
  const {t} = useTranslation('newDraftOrder');
  const text = useLocationText();
  const {control, getValues, setValue} = useFormContext<NewDraftOrderValues>();
  const products = useNewDraftOrderProductsStore((state) => state.products);
  const {fields, append, replace} = useFieldArray({control, name: 'deliveries'});
  const deliveries = useWatch({control, name: 'deliveries'}) ?? [];
  const [openDelivery, setOpenDelivery] = useState<{
    index: number;
    mode: 'edit' | 'add';
    addressMode?: 'choose' | 'add';
  } | null>(null);

  const locations = customer?.locations ?? [];
  const primaryId = locations[0]?.id;
  const deliverBy = t('newDraftOrder.ship.dateShort', {date: isoDayToDate(inHandsDate)});
  const shortDate = (day: string) => t('newDraftOrder.ship.dateShort', {date: isoDayToDate(day)});
  const allocation = getDeliveryAllocationSummary(products, deliveries);

  const updateDeliveries = (next: DraftOrderDelivery[]) => {
    replace(next);
  };

  return (
    <BuilderCard aria-label={t('newDraftOrder.ship.delivery.title')}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2.5">
        <div className="min-w-0 flex-[1_1_280px]">
          <BuilderCardTitle id="do112bLocH" title={t('newDraftOrder.ship.delivery.title')} sub={t('newDraftOrder.ship.delivery.sub')} />
        </div>
        <span className="flex h-6 items-center rounded-full bg-[#F2F2F3] px-2.5 text-xs leading-normal font-medium whitespace-nowrap text-[#5C5C61]">
          {t('newDraftOrder.ship.delivery.count', {count: fields.length})}
        </span>
      </header>

      <ul aria-labelledby="do112bLocH" className="m-0 flex list-none flex-col gap-3 p-0">
        {fields.map((item, index) => {
          const delivery = deliveries[index] ?? item;
          const location = findLocation(locations, delivery.locationId);
          const locationNumber = index + 1;
          const address = delivery.customAddress;
          const pendingLocation = pendingDeliveryLocation(delivery, index);
          const addressSummary = location
            ? text.oneLine(location)
            : address
              ? t('newDraftOrder.ship.delivery.location.customAddress', {
                  name: address.name,
                  address1: address.address1,
                  address2Part: address.address2?.trim()
                    ? t('newDraftOrder.ship.delivery.location.customAddress2', {address2: address.address2.trim()})
                    : '',
                  city: address.city,
                  state: address.state,
                  zip: address.zip,
                })
              : t('newDraftOrder.ship.delivery.location.noAddress');
          const deliveryWindow = delivery.deliveryFrom || delivery.deliveryTo
            ? t('newDraftOrder.ship.delivery.location.windowRange', {
                from: delivery.deliveryFrom ? shortDate(delivery.deliveryFrom) : t('newDraftOrder.ship.delivery.location.anyDay'),
                to: delivery.deliveryTo ? shortDate(delivery.deliveryTo) : t('newDraftOrder.ship.delivery.location.inHandsDate', {date: deliverBy}),
              })
            : t('newDraftOrder.ship.delivery.location.deliveryBy', {date: deliverBy});
          const deliveryFacts = [
            t(SHIP_METHOD_LABEL_KEYS[delivery.method]),
            delivery.indicator === 'n_before' && delivery.notBefore
              ? t('newDraftOrder.ship.delivery.location.notBefore', {date: shortDate(delivery.notBefore)})
              : t(`newDraftOrder.ship.delivery.indicatorsShort.${delivery.indicator}`),
            deliveryWindow,
            delivery.po?.trim() ? t('newDraftOrder.ship.delivery.location.po', {po: delivery.po.trim()}) : '',
            delivery.customRouting
              ? delivery.routing?.carrier?.trim()
                ? t('newDraftOrder.ship.delivery.location.routingCarrier', {carrier: delivery.routing.carrier.trim()})
                : t('newDraftOrder.ship.delivery.location.routing')
              : '',
          ].filter(Boolean).join(' · ');

          return (
            <li key={item.id} className={boxClass}>
              <div className="flex min-w-0 items-center gap-3">
                <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F2F2F3] text-xs font-semibold text-[#5C5C61]">
                  {locationInitials(location?.name ?? address?.name ?? '')}
                </span>
                <span className="flex min-w-0 flex-col">
                  <b className="text-[13.5px] leading-normal font-semibold text-[#111113]">
                    {index === 0 ? t('newDraftOrder.ship.delivery.location.primaryTitle', {n: locationNumber}) : t('newDraftOrder.ship.delivery.location.title', {n: locationNumber})}
                  </b>
                  <span className="text-xs leading-normal text-[#5C5C61] wrap-anywhere">{addressSummary}</span>
                </span>
              </div>

              <LocationSelect
                name={`deliveries.${index}.locationId`}
                locations={pendingLocation ? [...locations, pendingLocation] : locations}
                primaryId={primaryId}
                ariaLabel={t('newDraftOrder.ship.delivery.location.addressAria', {n: locationNumber})}
                inlineOptions
                value={pendingLocation?.id ?? delivery.locationId}
                onValueChange={(value) => {
                  if (value === pendingLocation?.id) return;
                  setValue(`deliveries.${index}.locationId`, value, {shouldDirty: true});
                  setValue(`deliveries.${index}.customAddress`, undefined, {shouldDirty: true});
                }}
                onAddLocation={() => setOpenDelivery({index, mode: 'edit', addressMode: 'add'})}
              />

              <p className={lineClass}>
                {deliveryFacts}
              </p>
              <p className="m-0 flex items-center gap-1.5 text-xs leading-medium  font-semibold text-[#111113]">
                <DeliveryTruckIcon />
                {fields.length === 1
                  ? t('newDraftOrder.ship.delivery.location.unitsAll', {units: t('newDraftOrder.overview.units', {count: allocation.total})})
                  : t('newDraftOrder.ship.delivery.location.unitsSplit', {
                      products: t('newDraftOrder.ship.delivery.productCount', {count: allocation.perLocation[index]?.products ?? 0}),
                      units: t('newDraftOrder.overview.units', {count: allocation.perLocation[index]?.units ?? 0}),
                    })}
              </p>

              <DeliveryLocationDialog
                index={index}
                locationNumber={locationNumber}
                companyId={customer?.id}
                locationId={delivery.locationId.startsWith('gid://shopify/CompanyLocation/') ? delivery.locationId : undefined}
                onLocationDeleted={onLocationDeleted}
                locations={locations}
                products={products}
                today={today}
                primaryId={primaryId}
                onRemove={index > 0 ? () => updateDeliveries(removeDeliveryAndReturnAllocations(products, getValues('deliveries') ?? [], index)) : undefined}
                onDeliveriesChange={updateDeliveries}
                open={openDelivery?.index === index}
                openMode={openDelivery?.index === index ? openDelivery.mode : undefined}
                initialAddressMode={openDelivery?.index === index ? openDelivery.addressMode : undefined}
                onOpenChange={(open) => {
                  if (open) {
                    setOpenDelivery((current) => current?.index === index ? current : {index, mode: 'edit'});
                  } else {
                    setOpenDelivery(null);
                  }
                }}
              />
            </li>
          );
        })}
      </ul>

      {allocation.split ? (
        <div className="mt-4 flex flex-col gap-3" role="status">
          <div className="flex items-center gap-3">
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#ECECEE]" aria-hidden="true">
              <div className="h-full rounded-full bg-[#111113]" style={{width: `${allocation.total ? Math.min(100, allocation.assigned / allocation.total * 100) : 100}%`}} />
            </div>
            <span className="shrink-0 text-xs text-[#5C5C61]">
              {t('newDraftOrder.ship.delivery.allocationProgress', {assigned: allocation.assigned, total: allocation.total})}
            </span>
          </div>
          {allocation.unassigned > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E8C6C6] bg-[#FBF0F0] px-3 py-2 text-xs text-[#7A2020]" role="alert">
              <span>{t('newDraftOrder.ship.delivery.unassigned', {count: allocation.unassigned})}</span>
              <Button type="button" variant="outline" size="xs" shape="md" className="cursor-pointer" onClick={() => updateDeliveries(assignUnallocatedToPrimary(products, deliveries))}>
                {t('newDraftOrder.ship.delivery.assignToPrimary')}
              </Button>
            </div>
          ) : null}
          {allocation.over > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E8C6C6] bg-[#FBF0F0] px-3 py-2 text-xs text-[#7A2020]" role="alert">
              <span>{t('newDraftOrder.ship.delivery.overAllocated', {count: allocation.over})}</span>
              <Button type="button" variant="outline" size="xs" shape="md" className="cursor-pointer" onClick={() => updateDeliveries(trimDeliveryAllocations(products, deliveries))}>
                {t('newDraftOrder.ship.delivery.trimExtra')}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="control"
          shape="md"
          className="cursor-pointer"
          onClick={() => {
            const newIndex = fields.length;
            if (newIndex === 1) {
              setValue('deliveries.0.allocations', initializeDeliveryAllocations(products), {shouldDirty: true});
            }
            append(nextDelivery(locations, getValues('deliveries') ?? deliveries));
            setOpenDelivery({index: newIndex, mode: 'add', addressMode: 'choose'});
          }}
        >
          <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
          <span>{t('newDraftOrder.ship.delivery.add')}</span>
        </Button>
        {fields.length > 1 ? (
          <Button type="button" variant="outline" size="control" shape="md" className="cursor-pointer" onClick={() => updateDeliveries(splitDeliveryAllocationsEvenly(products, deliveries))}>
            {t('newDraftOrder.ship.delivery.splitEvenly')}
          </Button>
        ) : null}
        <FieldHelp>
          {fields.length === 1 ? t('newDraftOrder.ship.delivery.helpSingle') : t('newDraftOrder.ship.delivery.helpSplit', {count: fields.length})}
        </FieldHelp>
      </div>
    </BuilderCard>
  );
}