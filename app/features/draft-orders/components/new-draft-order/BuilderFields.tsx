import type {ComponentPropsWithoutRef, ReactNode} from 'react';
import {cn} from '~/shared/utils/cn';
import {SelectChevronIcon} from '../icons/SelectChevronIcon';

export const builderInputClass =
  'box-border min-h-10 w-full min-w-0 rounded-[10px] border border-[#D7D7DA] bg-white px-3 text-[13.5px] leading-[1.3] text-[#111113] placeholder:text-[#6B6B70] placeholder:opacity-100 hover:border-[#C4C4C8] focus:border-[#6B6B70] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0E6E6E] disabled:cursor-not-allowed disabled:bg-[#F7F7F8] disabled:text-[#5C5C61] aria-invalid:border-[#A02020]';

export function BuilderCard({className, ...props}: ComponentPropsWithoutRef<'section'>) {
  return (
    <section
      className={cn(
        'rounded-[14px] border border-[#ECECEE] bg-white px-[22px] pt-5 pb-[22px] max-[759.98px]:px-4 max-[759.98px]:pt-4 max-[759.98px]:pb-[18px]',
        className,
      )}
      {...props}
    />
  );
}

export function BuilderCardTitle({id, title, sub}: {id?: string; title: string; sub: string}) {
  return (
    <>
      <h3
        id={id}
        className="m-0 flex items-center gap-2 text-base leading-6 font-semibold tracking-[-0.01em] text-[#111113]"
      >
        {title}
      </h3>
      <p className="m-0 mt-0.5 text-[13px] leading-normal text-[#5C5C61]">{sub}</p>
    </>
  );
}

export function FieldLabel({
  htmlFor,
  id,
  required,
  optional,
  children,
  as = 'label',
}: {
  htmlFor?: string;
  id?: string;
  required?: boolean;
  optional?: string;
  children: ReactNode;
  as?: 'label' | 'span';
}) {
  const Tag = as;
  return (
    <Tag
      htmlFor={as === 'label' ? htmlFor : undefined}
      id={id}
      className="flex items-center gap-1.5 text-xs leading-[1.5] font-medium tracking-[0.06em] text-[#6B6B70] uppercase"
    >
      {children}
      {required ? (
        <span aria-hidden="true" className="ml-0.5 text-[#A02020]">
          *
        </span>
      ) : null}
      {optional ? <span className="normal-case tracking-normal">{optional}</span> : null}
    </Tag>
  );
}

export function FieldHelp({id, children}: {id?: string; children: ReactNode}) {
  return (
    <p id={id} className="m-0 text-xs leading-[1.5] text-[#6B6B70]">
      {children}
    </p>
  );
}

/** A field error from Zod or the save action, already translated. */
export function FieldError({id, children}: {id?: string; children: ReactNode}) {
  return (
    <p id={id} role="alert" className="m-0 text-xs leading-[1.5] text-[#A02020]">
      {children}
    </p>
  );
}

export function BuilderTag({
  tone,
  className,
  children,
}: {
  tone: 'neutral' | 'warn' | 'bad' | 'ok';
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center rounded-full px-2 align-middle text-xs font-medium whitespace-nowrap',
        tone === 'neutral' && 'bg-[#F7F7F8] text-[#5C5C61]',
        tone === 'warn' && 'bg-[#FFF6E5] text-[#6B4A0B]',
        tone === 'bad' && 'bg-[#FDECEC] text-[#A02020]',
        tone === 'ok' && 'bg-[#EEF6F1] text-[#1F7A4D]',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SelectChevron() {
  return (
    <SelectChevronIcon className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[#5C5C61]" />
  );
}

export function BuilderSubHeading({children}: {children: ReactNode}) {
  return <h4 className="mt-5 mb-2 text-[13px] leading-normal font-semibold text-[#111113]">{children}</h4>;
}

export function ReadOnlyValue({children}: {children: ReactNode}) {
  return <div className="flex min-h-10 min-w-0 items-center rounded-[10px]  px-3 text-[13.5px] leading-normal text-[#111113]">{children}</div>;
}
