import {forwardRef} from 'react';
import {Button as BaseButton} from '@base-ui/react/button';
import {cva, type VariantProps} from 'class-variance-authority';
import {LoaderCircle} from 'lucide-react';
import {cn} from '~/shared/utils/cn';

/** Returns shared button classes for links or other button-like elements. */
export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 border text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-utds-charcoal data-disabled:pointer-events-none data-disabled:opacity-50',
  {
    variants: {
      /** Visual style of the button. */
      variant: {
        default:
          'border-utds-ink bg-utds-ink text-utds-inverse hover:bg-utds-action-primary-hover',
        secondary:
          'border-utds-border-subtle bg-utds-action-soft text-utds-ink hover:bg-utds-action-soft-hover',
        destructive:
          'border-utds-action-danger bg-utds-action-danger text-utds-inverse hover:bg-utds-action-danger-hover',
        success:
          'border-utds-action-success-border bg-utds-action-success-bg text-utds-action-success-fg hover:bg-utds-action-success-border',
        outline:
          'border-utds-border-subtle bg-utds-raised text-utds-ink hover:border-utds-muted',
        ghost:
          'border-transparent bg-transparent text-utds-secondary hover:bg-utds-action-soft hover:text-utds-ink',
        /** On/off chip; pass `aria-pressed` and the selected state shows as a dark border. */
        toggle:
          'cursor-pointer border-[#ECECEE] bg-utds-raised font-normal text-utds-ink hover:border-[#D7D7DA] aria-pressed:border-utds-ink aria-pressed:hover:border-utds-ink',
        tab: 'cursor-pointer rounded-utds-pill border-0 bg-transparent text-[11px] font-medium text-utds-secondary hover:bg-utds-action-soft hover:text-utds-ink aria-selected:bg-utds-ink aria-selected:text-utds-inverse aria-selected:hover:bg-utds-ink aria-selected:hover:text-utds-inverse data-disabled:cursor-not-allowed data-disabled:bg-transparent data-disabled:text-utds-disabled data-disabled:opacity-60',
        link: 'border-transparent bg-transparent p-0 text-utds-ink underline-offset-4 hover:underline',
        tabUnderline: 'shrink-0 cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-3.5 py-3 text-xs text-[#8E8E93] hover:bg-transparent aria-selected:border-[#111113] aria-selected:text-[#111113] aria-selected:font-medium data-disabled:opacity-100',
        productCard:'justify-start border-utds-border-subtle bg-white text-left font-sans hover:border-[#D7D7DA]',
        iconClose:'size-9 shrink-0 rounded-full border-[#ECECEE] bg-transparent p-0 text-lg font-normal leading-none text-[#5C5C61] hover:border-[#D7D7DA] hover:bg-transparent hover:text-[#111113]',
        actionRail: 'w-full items-start justify-start gap-[11px] border-[#1A1A1A] bg-[#1A1A1A] px-3 py-[11px] text-left text-white transition-[border-color,background,transform] duration-[160ms] hover:-translate-y-px hover:border-black hover:bg-black',
        dockControl:
          'min-h-8 rounded-lg border-transparent bg-transparent px-1.5 text-[#111113] hover:bg-[#F7F7F8] hover:text-[#111113]',
        dockClear:
          'min-h-7 rounded-lg border-transparent bg-transparent px-1.5 font-normal text-[#5C5C61] underline underline-offset-2 hover:bg-transparent hover:text-[#111113]',
        dockCard:
          'grid w-full grid-cols-[20px_minmax(0,1fr)] grid-rows-[auto_auto] content-start gap-x-[7px] gap-y-[3px] rounded-xl border-[#ECECEE] bg-white text-left text-[#111113] transition-colors hover:border-[#D7D7DA] hover:bg-white data-disabled:cursor-not-allowed data-disabled:opacity-100',
        dockMuted:
          'grid w-full grid-cols-[20px_minmax(0,1fr)] grid-rows-[auto_auto] content-start gap-x-[7px] gap-y-[3px] rounded-xl border-[#ECECEE] bg-[#F7F7F8] text-left text-[#5C5C61] data-disabled:cursor-not-allowed data-disabled:opacity-100',
        dockPrimary:
          'grid w-full grid-cols-[20px_minmax(0,1fr)] grid-rows-[auto_auto] content-start gap-x-[7px] gap-y-[3px] rounded-xl border-[#1A1A1A] bg-[#1A1A1A] text-left text-white transition-colors hover:border-[#303030] hover:bg-[#303030] data-disabled:cursor-not-allowed data-disabled:opacity-100',
      },
      /** Button height and padding. Use `icon` for icon-only buttons. */
      size: {
        xs: 'min-h-8 px-2.5 py-1 text-[11.5px]',
        default: 'min-h-10 px-4 py-2',
        small: 'min-h-9 px-3 py-1.5 text-xs max-sm:min-h-11',
        lg: 'min-h-12 px-5.5 py-3 text-sm',
        icon: 'size-9 p-0 max-sm:size-11',
        dock: 'min-h-[68px] min-w-0 px-2 py-2 text-left',
        /** Prototype `.od113-btn`: 40px tall, 13px medium text, 8px icon gap. Pair with `shape="md"`. */
        control: 'min-h-10 gap-2 px-4 py-0 text-[13px] font-medium leading-[1.2] active:scale-[.98]',
      },
      /** Corner style, from the UTDS radius scale. */
      shape: {
        md: 'rounded-utds-md',
        pill: 'rounded-utds-pill',
        lg: 'rounded-utds-lg',
        square: 'rounded-none',
      },
    },
    compoundVariants: [
      // Keeps tab padding from being overridden by the default size.
      {variant: 'tab', size: 'default', class: 'min-h-0 px-3 py-1.75'},
      // Prototype `.od113-btn` and `.od113-btn.primary` colors.
      {
        variant: 'outline',
        size: 'control',
        class: 'border-[#D7D7DA] bg-utds-raised text-utds-ink hover:border-[#D7D7DA] hover:bg-[#F7F7F8]',
      },
      {
        variant: 'outline',
        size: 'small',
        class: 'gap-[6px] whitespace-nowrap rounded-md border-[#DDDDDD] bg-white px-[14px] py-2 font-sans text-[13px] font-medium leading-[1.35] text-[#525252]',
      },
      {
        variant: 'link',
        size: 'xs',
        class: 'w-full gap-1 font-sans text-[10.5px] font-medium uppercase tracking-[0.08em] text-[#8B8B8B]',
      },
      {
        variant: 'default',
        size: 'control',
        class: 'border-[#1A1A1A] bg-[#1A1A1A] px-[18px] text-[13.5px] hover:border-[#303030] hover:bg-[#303030]',
      },
      {
        variant: 'productCard',
        size: 'default',
        class: 'min-h-0 gap-3 p-3',
      },
      {
        variant: 'productCard',
        size: 'icon',
        class: 'size-[104px] overflow-hidden rounded-[12px] bg-[#F5F5F6] p-0'
      },

      {
        variant: 'iconClose',
        size: 'default',
        class: 'min-h-0 size-9 p-0',
      },
      {
        variant: 'iconClose',
        size: 'small',
        class: 'rounded-lg border-0 bg-transparent px-2 py-1 text-xl',
      },
      { variant: 'actionRail', 
        size: 'default', 
        class: 'mb-2 min-h-0', 
      },
      {
      variant: 'actionRail',
      size: 'small',
      class: 'min-w-0 flex-col gap-[3px] rounded-[14px] px-3 py-[11px]'},
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'pill',
    },
  },
);

type ButtonStyleOptions = VariantProps<typeof buttonVariants>;

export type ButtonVariant = NonNullable<ButtonStyleOptions['variant']>;
export type ButtonSize = NonNullable<ButtonStyleOptions['size']>;
export type ButtonShape = NonNullable<ButtonStyleOptions['shape']>;

export interface ButtonProps
  extends Omit<BaseButton.Props, 'className'>,
    ButtonStyleOptions {
  /** Extra layout classes, such as width, margin or flex placement. */
  className?: string;
  /** Shows a spinner and disables the button while an action is pending. */
  loading?: boolean;
}

/**
 * Reusable button for actions, forms, links, tabs and icon buttons.
 * Built on the Base UI Button primitive.
 *
 * Pass:
 * - `variant` for the visual style: `default`, `secondary`, `destructive`, `success`, `outline`, `ghost`, `link` or `tab`.
 * - `size` for sizing: `xs`, `small`, `default`, `lg`, `icon`, or `control` (prototype page-header actions, with `shape="md"`).
 * - `shape` for corners: `md` (10px), `pill`, `lg` (12px) or `square`.
 * - `type="button"` for normal actions, or `type="submit"` inside a form.
 * - translated children and a translated `aria-label` for icon-only buttons.
 * - `loading` while an action is pending, or `disabled` when the action is unavailable.
 * - `render` when a link should look like a button, together with `nativeButton={false}`.
 *
 * Use `className` for layout only, such as width, margin or flex placement.
 * Do not use it to replace the shared color, size or shape styles.
 *
 * @example
 * <Button type="button" variant="outline" onClick={handleCancel}>
 *   {t('common.cancel')}
 * </Button>
 *
 * @example
 * <Button type="submit" loading={isSaving}>
 *   {t('common.save')}
 * </Button>
 *
 * @example
 * <Button type="button" size="icon" aria-label={t('common.close')}>
 *   <X aria-hidden="true" />
 * </Button>
 *
 * @example
 * <Button variant="link" nativeButton={false} render={<Link to={ROUTES.orders} />}>
 *   {t('common.viewOrders')}
 * </Button>
 */
const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    {children, className, disabled, loading = false, shape, size, variant, ...props},
    ref,
  ) => (
    <BaseButton
      ref={ref}
      aria-busy={loading || undefined}
      disabled={loading || disabled}
      className={cn(buttonVariants({shape, size, variant}), className)}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
      {children}
    </BaseButton>
  ),
);

Button.displayName = 'Button';

export {Button};
