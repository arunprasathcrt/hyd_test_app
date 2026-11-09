import {useState} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {Pencil} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {findLocation, pendingDeliveryLocation} from '../../../lib/new-draft-order';
import type {NewDraftOrderCustomer, NewDraftOrderLocation, NewDraftOrderValues} from '../../../types/new-draft-order';
import {BuilderCard, BuilderCardTitle, BuilderTag, FieldHelp, FieldLabel} from '../BuilderFields';
import {BillToIcon} from '../../icons/BillToIcon';
import {ShipToIcon} from '../../icons/ShipToIcon';
import {LocationSelect, useLocationText} from './LocationFields';
import {SavedLocationDialog, type ShipBillDialogMode} from './ShipBillLocationDialog';

const boxClass = 'flex min-w-0 flex-col gap-2 rounded-[12px] border border-[#ECECEE] bg-white p-4';
const nameClass = 'm-0 flex flex-wrap items-center gap-2 text-[13.5px] leading-normal text-[#111113]';
const lineClass = 'm-0 text-[13px] leading-normal text-[#5C5C61]';

export function ShipBillCard({
  customer,
  onLocationCreated,
  onPrimaryLocationChanged,
}: {
  customer: NewDraftOrderCustomer | undefined;
  onLocationCreated: (location: NewDraftOrderLocation, setPrimary: boolean) => void;
  onPrimaryLocationChanged: (locationId: string) => void;
}) {
  const {t} = useTranslation('newDraftOrder');
  const text = useLocationText();
  const {control, setValue} = useFormContext<NewDraftOrderValues>();
  const [shipId, billId, customShipAddress] = useWatch({control, name: ['deliveries.0.locationId', 'billToLocationId', 'deliveries.0.customAddress']});
  const [dialogMode, setDialogMode] = useState<'ship' | 'bill' | null>(null);

  const locations = customer?.locations ?? [];
  const primaryId = locations[0]?.id;
  const ship = findLocation(locations, shipId ?? '');
  const bill = findLocation(locations, billId ?? '') ?? locations[0];
  const billing = bill?.billing;
  const pendingShipLocation = pendingDeliveryLocation({locationId: shipId ?? '', customAddress: customShipAddress}, 0);

  const applyLocation = (mode: 'ship' | 'bill', locationId: string) => {
    if (mode === 'ship') {
      setValue('deliveries.0.locationId', locationId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setValue('deliveries.0.customAddress', undefined, {shouldDirty: true});
    } else {
      setValue('billToLocationId', locationId, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
    setDialogMode(null);
  };

  const changePrimaryShipTo = (locationId: string) => {
    if (locationId === pendingShipLocation?.id) return;
    setValue('deliveries.0.locationId', locationId, {shouldDirty: true, shouldTouch: true, shouldValidate: true});
    setValue('deliveries.0.customAddress', undefined, {shouldDirty: true});
    onPrimaryLocationChanged(locationId);
  };

  return (
    <BuilderCard aria-label={t('newDraftOrder.ship.addresses.title')}>
      <header className="mb-4">
        <BuilderCardTitle title={t('newDraftOrder.ship.addresses.title')} sub={t('newDraftOrder.ship.addresses.sub')} />
      </header>

      <div className="grid min-w-0 grid-cols-2 gap-3 max-[759.98px]:grid-cols-1">
        <div className={boxClass}>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel as="span">
              <ShipToIcon />
              {t('newDraftOrder.ship.addresses.ship.label')}
            </FieldLabel>
            <Button type="button" variant="outline" size="xs" shape="md" className="cursor-pointer" aria-label={t('newDraftOrder.ship.addresses.ship.changeAria')} onClick={() => setDialogMode('ship')}>
              <Pencil aria-hidden="true" size={14} strokeWidth={1.8} />
              <span>{t('newDraftOrder.ship.addresses.change')}</span>
            </Button>
          </div>

          <LocationSelect
            name="deliveries.0.locationId"
            locations={pendingShipLocation ? [...locations, pendingShipLocation] : locations}
            primaryId={primaryId}
            ariaLabel={t('newDraftOrder.ship.addresses.ship.label')}
            value={pendingShipLocation?.id ?? shipId ?? ''}
            onValueChange={changePrimaryShipTo}
          />

          {ship || customShipAddress ? (
            <>
              <p className={nameClass}>
                <b className="font-semibold">{customShipAddress?.name ?? ship?.name}</b>
                {ship?.id === primaryId ? <BuilderTag tone="neutral">{t('newDraftOrder.ship.addresses.ship.primary')}</BuilderTag> : null}
              </p>
              {customShipAddress ? (
                <p className={lineClass}>
                  {customShipAddress.address1}{customShipAddress.address2 ? <><br />{customShipAddress.address2}</> : null}<br />
                  {t('newDraftOrder.ship.location.cityLine', {city: customShipAddress.city, zone: customShipAddress.state, zip: customShipAddress.zip})}
                </p>
              ) : ship?.shipping?.address1 ? <p className={lineClass}>{ship.shipping.address1}{ship.shipping.address2 ? <><br />{ship.shipping.address2}</> : null}<br />{text.cityLine(ship.shipping)}</p> : null}
              {ship?.code ? (
                <p className={lineClass}>
                  {t(ship.licensed ? 'newDraftOrder.ship.addresses.ship.codeLicensed' : 'newDraftOrder.ship.addresses.ship.code', {code: ship.code})}
                </p>
              ) : null}
              {ship?.shipping?.recipient ? (
                <FieldHelp>{t('newDraftOrder.ship.addresses.ship.attention', {name: ship.shipping.recipient, phone: ship.shipping.phone})}</FieldHelp>
              ) : null}
            </>
          ) : null}
        </div>

        <div className={boxClass}>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel as="span">
              <BillToIcon />
              {t('newDraftOrder.ship.addresses.bill.label')}
            </FieldLabel>
            <Button type="button" variant="outline" size="xs" shape="md" className="cursor-pointer" aria-label={t('newDraftOrder.ship.addresses.bill.changeAria')} onClick={() => setDialogMode('bill')}>
              <Pencil aria-hidden="true" size={14} strokeWidth={1.8} />
              <span>{t('newDraftOrder.ship.addresses.change')}</span>
            </Button>
          </div>

          <p className={nameClass}>
            <b className="font-semibold">{billing?.recipient || bill?.name || customer?.name}</b>
            <BuilderTag tone="neutral">{t('newDraftOrder.ship.addresses.bill.setBy')}</BuilderTag>
          </p>
          {billing?.address1 ? (
            <p className={lineClass}>
              {billing.company || customer?.name}<br />
              {billing.address1}<br />
              {text.cityLine(billing)}
            </p>
          ) : null}
          {customer ? <FieldHelp>{t('newDraftOrder.ship.addresses.bill.account', {code: customer.code, terms: customer.terms ?? t('newDraftOrder.overview.notSet')})}</FieldHelp> : null}
        </div>
      </div>

      {dialogMode ? (
        <SavedLocationDialog
          key={dialogMode}
          mode={dialogMode}
          customer={customer}
          locations={locations}
          primaryId={primaryId}
          shipId={shipId}
          billId={billId}
          onOpenChange={(open) => !open && setDialogMode(null)}
          onApply={applyLocation}
          onLocationCreated={onLocationCreated}
        />
      ) : null}
    </BuilderCard>
  );
}