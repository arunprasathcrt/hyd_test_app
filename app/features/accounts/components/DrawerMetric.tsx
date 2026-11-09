/**
 * A labeled metric tile, shared by the customer profile and "view as"
 * drawers.
 */
export interface DrawerMetricProps {
  label: string;
  value: string;
}

export function DrawerMetric({label, value}: DrawerMetricProps) {
  return (
    <div className="rounded-[10px] border border-[#ECECEE] bg-[#FAFAFA] p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8B8B8B]">
        {label}
      </p>
      <p className="mt-1 text-base font-medium text-[#0F0F0F]">{value}</p>
    </div>
  );
}
