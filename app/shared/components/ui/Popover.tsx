import {forwardRef} from 'react';
import {Popover as BasePopover} from '@base-ui/react/popover';
import {cn} from '~/shared/utils/cn';

/** Popover state owner. Use `open` + `onOpenChange` to control it. */
const Popover = BasePopover.Root;

/** Element that toggles the popover. Use `render` to render a shared `Button`. */
const PopoverTrigger = BasePopover.Trigger;

export interface PopoverContentProps extends Omit<BasePopover.Popup.Props, 'className'> {
  /** Extra layout classes, such as width or padding. */
  className?: string;
  /** Side of the trigger the popover opens on. */
  side?: BasePopover.Positioner.Props['side'];
  /** Alignment against the trigger. */
  align?: BasePopover.Positioner.Props['align'];
  /** Gap between trigger and popover, in px. */
  sideOffset?: number;
  /** Shift along the alignment axis, in px. */
  alignOffset?: number;
}

/**
 * Reusable popover panel. shadcn/ui Popover pattern on the Base UI Popover
 * primitive: portal, positioner, outside-click and Escape dismissal included.
 *
 * Pass a translated `aria-label` when the panel has no visible title.
 *
 * @example
 * <Popover open={open} onOpenChange={setOpen}>
 *   <PopoverTrigger render={<Button variant="outline" />}>{label}</PopoverTrigger>
 *   <PopoverContent aria-label={t('datePicker.dialogLabel')}>…</PopoverContent>
 * </Popover>
 */
const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {className, side = 'bottom', align = 'start', sideOffset = 10, alignOffset = 0, ...props},
    ref,
  ) => (
    <BasePopover.Portal>
      <BasePopover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionAvoidance={{
          side: 'none',
          align: 'shift',
          fallbackAxisSide: 'none',
        }}
        className="z-1300 outline-none"
      >
        <BasePopover.Popup
          ref={ref}
          className={cn(
            'rounded-2xl border border-utds-border-subtle bg-utds-raised text-utds-ink shadow-[0_28px_70px_-22px_rgba(15,15,15,0.28),0_2px_8px_rgba(15,15,15,0.06)] outline-none',
            className,
          )}
          {...props}
        />
      </BasePopover.Positioner>
    </BasePopover.Portal>
  ),
);
PopoverContent.displayName = 'PopoverContent';

export {Popover, PopoverTrigger, PopoverContent};
