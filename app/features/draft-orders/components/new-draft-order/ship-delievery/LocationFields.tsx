import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import {Plus} from 'lucide-react';
import {FormField} from '~/shared/components/ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/shared/components/ui/Select';
import {findLocation} from '../../../lib/new-draft-order';
import type {NewDraftOrderLocation, NewDraftOrderValues} from '../../../types/new-draft-order';

export function useLocationText() {
  const {t} = useTranslation('newDraftOrder');
  return {
    option: (location: NewDraftOrderLocation | undefined, primary: boolean) => {
      if (!location) return '';
      const address = location.shipping;
      if (!address?.city) {
        return primary ? t('newDraftOrder.ship.location.namePrimary', {name: location.name}) : location.name;
      }
      return t(primary ? 'newDraftOrder.ship.location.optionPrimary' : 'newDraftOrder.ship.location.option', {
        name: location.name,
        city: address.city,
        zone: address.zoneCode,
      });
    },
    cityLine: (address: NewDraftOrderLocation['shipping']) =>
      address ? t('newDraftOrder.ship.location.cityLine', {city: address.city, zone: address.zoneCode, zip: address.zip}) : '',
    optionCity: (location: NewDraftOrderLocation) => {
      const address = location.shipping;
      return address?.city
        ? t('newDraftOrder.ship.location.optionCity', {city: address.city, zone: address.zoneCode})
        : '';
    },
    optionAddress: (location: NewDraftOrderLocation, primary: boolean) => {
      const address = location.shipping;
      if (!address?.city) {
        return primary ? t('newDraftOrder.ship.location.primaryLabel') : '';
      }
      return t(primary ? 'newDraftOrder.ship.location.cityLinePrimary' : 'newDraftOrder.ship.location.cityLine', {
        city: address.city,
        zone: address.zoneCode,
        zip: address.zip,
      });
    },
    oneLine: (location: NewDraftOrderLocation | undefined) => {
      const address = location?.shipping;
      if (!address?.address1) return location?.name ?? '';
      return t('newDraftOrder.ship.location.oneLine', {
        address1: [address.address1, address.address2].filter(Boolean).join(', '),
        city: address.city,
        zone: address.zoneCode,
        zip: address.zip,
      });
    },
  };
}

export function LocationSelect({
  name,
  locations,
  primaryId,
  ariaLabel,
  inlineOptions = false,
  onAddLocation,
  open,
  onOpenChange,
  value,
  onValueChange,
}: {
  name: 'billToLocationId' | `deliveries.${number}.locationId`;
  locations: NewDraftOrderLocation[];
  primaryId: string | undefined;
  ariaLabel: string;
  inlineOptions?: boolean;
  onAddLocation?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  const {control} = useFormContext<NewDraftOrderValues>();
  const text = useLocationText();
  const {t} = useTranslation('newDraftOrder');
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const handleOpenChange = (nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({field}) => {
        const current = value ?? (field.value as string);
        return (
        <Select
          value={current}
          onValueChange={(next) => {
            if (next === null) return;
            if (onValueChange) onValueChange(next);
            else field.onChange(next);
          }}
          open={isOpen}
          onOpenChange={handleOpenChange}
        >
          <SelectTrigger className="cursor-pointer disabled:cursor-not-allowed" aria-label={ariaLabel}>
            <SelectValue className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {(value: string) => text.option(findLocation(locations, value), value === primaryId)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            alignItemWithTrigger={false}
            className="w-(--anchor-width)"
            footer={inlineOptions && onAddLocation ? (
              <button
                type="button"
                className="flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-[10px] px-2.5 text-left text-[13px] leading-normal text-[#6B6B70] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0E6E6E]"
                onClick={() => {
                  handleOpenChange(false);
                  onAddLocation();
                }}
              >
                <Plus aria-hidden="true" size={16} strokeWidth={1.8} />
                <span>{t('newDraftOrder.ship.addresses.dialog.addLocation')}</span>
              </button>
            ) : null}
          >
            {locations.map((location) => {
              const addressLine = text.optionAddress(location, location.id === primaryId);
              const city = text.optionCity(location);
              const selected = location.id === current;

              return (
                <SelectItem
                  key={location.id}
                  value={location.id}
                  className={inlineOptions
                    ? 'min-h-10 cursor-pointer items-center rounded-[10px] py-1 aria-selected:bg-[#F7F7F8]'
                    : 'min-h-12 cursor-pointer items-center rounded-2xl py-2.5 aria-selected:bg-[#F7F7F8]'}
                >
                  {inlineOptions ? (
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <span className={`truncate text-xs leading-normal text-[#111113] ${selected ? 'font-semibold' : ''}`}>
                        {location.name}
                      </span>
                      {city ? <span className="truncate text-[11px] leading-normal text-[#6B6B70]">{city}</span> : null}
                    </span>
                  ) : (
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-xs leading-normal text-[#111113]">{location.name}</span>
                      {addressLine ? (
                        <span className="truncate text-[11px] leading-normal text-[#6B6B70]">
                          {addressLine}
                        </span>
                      ) : null}
                    </span>
                  )}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        );
      }}
    />
  );
}