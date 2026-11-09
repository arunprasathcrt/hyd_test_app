import type { OrderStatus } from 'app/features/orders/types/order';

export interface StatusPillProps {
  status: OrderStatus;
  label: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  const classes =
    status === 'shipped' || status === 'delivered'
      ? {
          background: 'bg-[#D1FAE5]',
          text: 'text-[#059669]',
        }
      : status === 'pendingProof' || status === 'inProduction'
        ? {
            background: 'bg-[#FEF9C3]',
            text: 'text-[#854D0E]',
          }
        : {
            background: 'bg-[#F3F4F6]',
            text: 'text-[#4B5563]',
          };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-[5px]
        whitespace-nowrap
        rounded-full
        px-[9px]
        py-[3px]
        font-sans
        text-[11px]
        font-medium
        leading-[1.35]
        ${classes.background}
        ${classes.text}
      `}
    >
      <span
        aria-hidden="true"
        className="
          h-[6px]
          w-[6px]
          shrink-0
          rounded-full
          bg-current
        "
      />

      {label}
    </span>
  );
}
