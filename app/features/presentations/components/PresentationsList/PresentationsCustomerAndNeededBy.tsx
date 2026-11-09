import { Input } from "~/shared/components/ui/Input";
import type { PresentationCustomer } from "../../types/presentations";
import { useTranslation } from 'react-i18next';

interface PresentationsCustomerAndNeededByProps {
  customer: string;
  customers: PresentationCustomer[];
  selectedCustomer?: PresentationCustomer;
  segmentLabel: string;
  neededBy: string;
  onCustomerChange: (customerId: string) => void;
  onNeededByChange: (value: string) => void;
}

export const PresentationsCustomerAndNeededBy = ({
  customer,
  customers,
  selectedCustomer,
  segmentLabel,
  neededBy,
  onCustomerChange,
  onNeededByChange,
}: PresentationsCustomerAndNeededByProps) => {
  const { t } = useTranslation('presentations');
  const minDate = new Date().toISOString().split('T')[0];
  return (
    <div className="mt-[18px] grid grid-cols-[1.4fr_1fr] gap-x-3 max-md:grid-cols-1 max-md:gap-y-3">
      <div>
        <label className="mb-[6px] block text-[12px] font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
          {t('modal.customer')}
        </label>
        <select
          value={customer}
          onChange={(event) => {
            onCustomerChange(event.target.value);
          }}
          className="h-10 w-full rounded-[10px] border border-[#D7D7DA] bg-white px-3 text-[13.5px] text-[#111113] outline-none transition-colors hover:border-[#C4C4C8] focus:border-[#6B6B70]"
        >
          {customers.map((customer) => (
            <option
              key={customer.id}
              value={customer.id}
            >
              {customer.name}
            </option>
          ))}
        </select>
        {selectedCustomer && (
          <p className="mt-1.5 text-[12px] text-[#6B6B70]">
            {t('modal.customerMeta', {
              tier: selectedCustomer.tier,
              segment: segmentLabel,
              contact: selectedCustomer.contact,
            })}
          </p>
        )}
      </div>

      <div>
        <label className="mb-[6px] block text-[12px] font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
          {t('modal.neededBy')}
        </label>
        <Input
          type="date"
          min={minDate}
          value={neededBy}
          onChange={(event) =>
            onNeededByChange(event.target.value)
          }
        />
      </div>
    </div>
  )
};