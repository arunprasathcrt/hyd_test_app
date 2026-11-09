import {useFormContext, useWatch} from 'react-hook-form';
import type {
  InterfaceMode,
  LeadTimeConfig,
  NewDraftOrderValues,
  OrderClassification,
  OrderType,
  ShipTiming,
} from '../../../types/new-draft-order';
import {LeadTimeCard} from './LeadTimeCard';
import {OrderClassificationCard} from './OrderClassificationCard';
import {OrderTypeSelector} from './OrderTypeSelector';

interface Props {
  today: string;
  leadTime: LeadTimeConfig;
  timing: ShipTiming;
  orderTypes: OrderType[];
  orderClassifications: OrderClassification[];
  interfaceModes: InterfaceMode[];
  defaultOrderClassification: string;
  leadTimeLoading: boolean;
  onSelectNewOrder: () => void;
}

export function OrderTypeStep({
  today,
  leadTime,
  timing,
  orderTypes,
  orderClassifications,
  interfaceModes,
  defaultOrderClassification,
  leadTimeLoading,
  onSelectNewOrder,
}: Props) {
  const {control} = useFormContext<NewDraftOrderValues>();
  const orderType = useWatch({control, name: 'orderType'});

  return (
    <div className="mb-4 flex max-w-full flex-col gap-4">
      <OrderTypeSelector
        orderTypes={orderTypes}
        defaultOrderClassification={defaultOrderClassification}
        onSelectNewOrder={onSelectNewOrder}
      />
      <OrderClassificationCard
        orderClassifications={orderClassifications}
        interfaceModes={interfaceModes}
      />
      {orderType === 'new' ? (
        <LeadTimeCard today={today} leadTime={leadTime} timing={timing} loading={leadTimeLoading} />
      ) : null}
    </div>
  );
}
