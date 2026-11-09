import {Tooltip as TooltipPrimitive} from '@base-ui/react/tooltip';
import {cn} from '~/shared/utils/cn';

/**
 * Shares hover delay across tooltips. Optional: a `Tooltip` works without it.
 */
function TooltipProvider({delay = 0, ...props}: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
}

/**
 * Tooltip state owner. Uncontrolled it opens on hover / focus; pass `open` +
 * `onOpenChange` to drive it yourself (for example, on click).
 */
function Tooltip({...props}: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

/**
 * Element that owns the tooltip. Use `render` to keep a shared `Button` or a
 * focusable `<span tabIndex={0} />` as the trigger.
 */
function TooltipTrigger({...props}: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/**
 * Tooltip bubble with arrow. shadcn/ui Tooltip on the Base UI primitive, styled
 * to UTDS: charcoal `#1A1A1A` surface, inverse text. Content must be translated.
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger render={<span tabIndex={0} />}>{t('detail.totals.tax')}</TooltipTrigger>
 *   <TooltipContent>{t('detail.totals.taxTip')}</TooltipContent>
 * </Tooltip>
 */
function TooltipContent({
  className,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-[1300]"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            // Base UI's starting/ending style attributes drive the fade + zoom (no animate plugin in this repo).
            'z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-[#1A1A1A] px-3 py-3 text-xs text-utds-inverse transition-[opacity,scale] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px] bg-[#1A1A1A] fill-[#1A1A1A] data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

export {Tooltip, TooltipTrigger, TooltipContent, TooltipProvider};
