import * as React from 'react';
import {Select as SelectPrimitive} from '@base-ui/react/select';
import {CheckIcon, ChevronDownIcon, ChevronUpIcon} from 'lucide-react';
import {cn} from '~/shared/utils/cn';

const Select = SelectPrimitive.Root;

function SelectGroup({className, ...props}: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      className={cn('scroll-my-1 p-1', className)}
      {...props}
    />
  );
}

function SelectValue({className, ...props}: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      className={cn('flex flex-1 text-left', className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'box-border flex min-h-10 w-full min-w-0 items-center justify-between gap-2 rounded-[10px] border border-[#D7D7DA] bg-white px-3 text-[13.5px] leading-[1.3] text-[#111113] transition-[border-color,box-shadow] duration-150 outline-none hover:border-[#C4C4C8] focus:border-[#6B6B70] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0E6E6E] disabled:cursor-not-allowed disabled:bg-[#F7F7F8] disabled:text-[#5C5C61] aria-invalid:border-[#A02020] data-popup-open:border-[#6B6B70] [&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={<ChevronDownIcon className="size-4 text-[#5C5C61]" />}
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  footer,
  side = 'bottom',
  sideOffset = 8,
  align = 'start',
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
    > & {footer?: React.ReactNode}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-1300"
      >
        <SelectPrimitive.Popup
          className={cn(
            'relative isolate flex max-h-80 min-w-40 flex-col overflow-hidden rounded-2xl border border-[#ECECEE] bg-white text-[#111113] shadow-[0_28px_70px_-22px_rgba(15,15,15,.28),0_2px_8px_rgba(15,15,15,.06)]',
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="m-0 flex list-none flex-col gap-0.5 overflow-y-auto p-1.5">
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
          {footer ? <div className="shrink-0 border-t border-[#ECECEE] p-1.5">{footer}</div> : null}
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      className={cn('px-2 py-1 text-xs text-[#6B6B70]', className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex min-h-10 w-full cursor-default items-center gap-2 rounded-[10px] py-1 pr-8 pl-3 text-[13.5px] text-[#111113] outline-none select-none focus:bg-[#F7F7F8] data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex min-w-0 flex-1 items-center gap-2 wrap-anywhere">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center text-[#111113]">
            <CheckIcon className="size-4" />
          </span>
        }
      />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      className={cn('pointer-events-none -mx-1 my-1 h-px bg-[#ECECEE]', className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      className={cn(
        'top-0 z-10 flex w-full cursor-default items-center justify-center bg-white py-1 text-[#5C5C61]',
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      className={cn(
        'bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-white py-1 text-[#5C5C61]',
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};