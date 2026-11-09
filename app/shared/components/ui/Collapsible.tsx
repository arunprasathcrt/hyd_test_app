import {forwardRef} from 'react';
import {Collapsible as BaseCollapsible} from '@base-ui/react/collapsible';
import {ChevronDown} from 'lucide-react';
import {cn} from '~/shared/utils/cn';
import {buttonVariants, type ButtonShape, type ButtonSize, type ButtonVariant} from './Button';

export interface CollapsibleProps extends Omit<BaseCollapsible.Root.Props, 'className'> {
  /** Layout classes, such as margin. */
  className?: string;
}

export interface CollapsibleTriggerProps extends Omit<BaseCollapsible.Trigger.Props, 'className'> {
  /** Button style of the trigger. Defaults to `ghost`. */
  variant?: ButtonVariant | null;
  /** Button size of the trigger. Defaults to `xs`. */
  size?: ButtonSize | null;
  /** Button corners of the trigger. */
  shape?: ButtonShape | null;
  /** Shows a chevron before the label that flips when the panel opens. Defaults to `true`. */
  chevron?: boolean;
  /** Extra layout classes, such as width or margin. */
  className?: string;
}

export interface CollapsiblePanelProps extends Omit<BaseCollapsible.Panel.Props, 'className'> {
  /** Layout classes, such as margin. */
  className?: string;
}

/**
 * Reusable show/hide section, such as an internal breakdown under a card.
 * Built on the Base UI Collapsible primitive, so `aria-expanded` and `aria-controls` are wired for you.
 *
 * Pass:
 * - `defaultOpen` for an uncontrolled section, or `open` with `onOpenChange` to control it.
 *
 * Compose with:
 * - `CollapsibleTrigger` for the toggle. It is styled as a shared `Button`; pass `variant`, `size`
 *   and `shape` as you would to `Button`, and `chevron={false}` to hide the chevron.
 * - `CollapsiblePanel` for the hidden content.
 *
 * Use `className` for layout only, such as margin or width.
 * Do not use it to replace the shared color, size or shape styles.
 *
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger>
 *     <span>{t('detail.breakdown.toggle')}</span>
 *     <Badge>{t('detail.repOnly')}</Badge>
 *   </CollapsibleTrigger>
 *   <CollapsiblePanel className="mt-2.5">{children}</CollapsiblePanel>
 * </Collapsible>
 */
const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(({className, ...props}, ref) => (
  <BaseCollapsible.Root ref={ref} className={className} {...props} />
));
Collapsible.displayName = 'Collapsible';

const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  (
    {chevron = true, children, className, shape, size = 'xs', variant = 'ghost', ...props},
    ref,
  ) => (
    <BaseCollapsible.Trigger
      ref={ref}
      className={cn('group', buttonVariants({shape, size, variant}), className)}
      {...props}
    >
      {chevron && (
        <ChevronDown
          aria-hidden="true"
          size={14}
          strokeWidth={1.8}
          className="transition-transform group-data-panel-open:rotate-180"
        />
      )}
      {children}
    </BaseCollapsible.Trigger>
  ),
);
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsiblePanel = forwardRef<HTMLDivElement, CollapsiblePanelProps>(
  ({className, ...props}, ref) => (
    <BaseCollapsible.Panel ref={ref} className={className} {...props} />
  ),
);
CollapsiblePanel.displayName = 'CollapsiblePanel';

export {Collapsible, CollapsibleTrigger, CollapsiblePanel};
