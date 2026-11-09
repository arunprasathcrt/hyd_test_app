import type { OrderBrand } from 'app/features/orders/types/order';

export interface BrandPillProps {
  brand: OrderBrand;
  label: string;
}

export function BrandPill({ brand, label }: BrandPillProps) {
  const classes =
    brand === 'underArmour'
      ? {
          border:
            'border-[color-mix(in_srgb,#8B5CF6_34%,transparent)]',
          background:
            'bg-[color-mix(in_srgb,#8B5CF6_12%,#fff)]',
          text: 'text-[color-mix(in_srgb,#8B5CF6_72%,#1A1A1A)]',
          dot: 'bg-[#8B5CF6]',
        }
      : brand === 'champion'
        ? {
            border:
              'border-[color-mix(in_srgb,#3B82F6_34%,transparent)]',
            background:
              'bg-[color-mix(in_srgb,#3B82F6_12%,#fff)]',
            text: 'text-[color-mix(in_srgb,#3B82F6_72%,#1A1A1A)]',
            dot: 'bg-[#3B82F6]',
          }
        : {
            border:
              'border-[color-mix(in_srgb,#5C5F62_34%,transparent)]',
            background:
              'bg-[color-mix(in_srgb,#5C5F62_12%,#fff)]',
            text: 'text-[color-mix(in_srgb,#5C5F62_72%,#1A1A1A)]',
            dot: 'bg-[#5C5F62]',
          };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-[5px]
        whitespace-nowrap
        rounded-full
        border
        px-[10px]
        py-[5px]
        font-sans
        text-[11px]
        font-semibold
        leading-none
        tracking-[0.02em]
        ${classes.border}
        ${classes.background}
        ${classes.text}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          h-[6px]
          w-[6px]
          shrink-0
          rounded-full
          ${classes.dot}
        `}
      />

      {label}
    </span>
  );
}
