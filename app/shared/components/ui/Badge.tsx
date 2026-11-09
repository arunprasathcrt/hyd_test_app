import {forwardRef} from 'react';
import {useRender} from '@base-ui/react/use-render';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '~/shared/utils/cn';

/** Returns shared badge classes for other pill-like elements. */
export const badgeVariants = cva(
  'inline-flex shrink-0 items-center whitespace-nowrap rounded-full',
  {
    variants: {
      /** Tone of the badge. */
      variant: {
        neutral: 'bg-utds-action-soft text-utds-secondary',
        muted: 'border border-utds-border-subtle bg-utds-action-soft text-utds-secondary',
        success: 'bg-[#EAF1ED] text-utds-action-success-fg',
        warning: 'bg-[#FBF6E5] text-[#7A5B16]',
        ink: 'bg-utds-ink text-utds-inverse',
        /** Prototype `.od113-status`: white with a hairline border, for order states. */
        outline: 'border border-utds-border-subtle bg-utds-raised text-utds-ink',
        /** Prototype `.od113-erp`: grey chip for reference numbers. */
        chip: 'bg-[#F2F2F3] text-utds-secondary',
        /** Prototype `.od113-tag.neutral`: pale tag, such as the order channel. */
        soft: 'bg-[#F7F7F8] text-utds-secondary',
        /** Prototype `.od113-note .od113-tag`: white tag on a grey panel. */
        plain: 'bg-utds-raised text-utds-secondary',
        /** Prototype `.od113-tag.ok`: pale green, for done states. */
        ok: 'bg-[#EEF6F1] text-[#1F7A4D]',
        /** Prototype `.od113-tag.ink`: white with an inset ring, for in-progress states. */
        ring: 'bg-utds-raised text-utds-ink shadow-[inset_0_0_0_1px_#D7D7DA]',
      },
      /** Height, padding and text size. */
      size: {
        default: 'px-2.5 py-[3px] text-[10.5px]',
        sm: 'px-[8px] py-[4px] text-[10px]',
        /** 24px tall, 12px medium text — status pills and reference chips. */
        md: 'h-6 px-[9px] text-[12px] font-medium leading-none',
        /** 22px tall, 12px medium text — small tags. */
        tag: 'h-[22px] px-2 text-[12px] font-medium leading-none',
      },
      /** Adds the gap for a leading dot. Set through the `dot` prop. */
      dotted: {
        true: 'gap-[7px]',
        false: '',
      },
    },
    compoundVariants: [
      // Prototype status pill pads 8px before the dot and 9px after the label.
      {dotted: true, size: 'md', class: 'pl-2'},
    ],
    defaultVariants: {
      variant: 'neutral',
      size: 'default',
      dotted: false,
    },
  },
);

/** Color of the leading dot. `current` follows the text color. */
export const badgeDotVariants = cva('size-1.5 shrink-0 rounded-full', {
  variants: {
    tone: {
      current: 'bg-current',
      ink: 'bg-utds-ink',
      secondary: 'bg-utds-secondary',
      muted: 'bg-utds-muted',
      success: 'bg-[#1F7A4D]',
      warning: 'bg-[#B26A00]',
    },
  },
  defaultVariants: {tone: 'current'},
});

type BadgeStyleOptions = VariantProps<typeof badgeVariants>;

export type BadgeVariant = NonNullable<BadgeStyleOptions['variant']>;
export type BadgeSize = NonNullable<BadgeStyleOptions['size']>;
export type BadgeDotTone = NonNullable<VariantProps<typeof badgeDotVariants>['tone']>;

export interface BadgeProps
  extends Omit<useRender.ComponentProps<'span'>, 'ref'>,
    Omit<BadgeStyleOptions, 'dotted'> {
  /** Shows a leading dot: `true` for the text color, or a tone such as `success`. */
  dot?: boolean | BadgeDotTone;
}

/**
 * Reusable status/tone badge — role tags, approvals, finance and order pills, spec chips.
 * Renders a `<span>` through Base UI's `useRender`.
 *
 * Pass:
 * - `variant` for the tone: `neutral`, `muted` (neutral with a border), `success`, `warning`, `ink` (dark, for the active step),
 *   `outline` (white with a border, for order states), `chip` (reference numbers), `soft` (pale tags) or `plain` (white, on grey panels).
 * - `size` for height and text size: `default`, `sm`, `md` (24px) or `tag` (22px).
 * - `dot` for a leading dot: `true` uses the text color; a tone (`ink`, `secondary`, `muted`, `success`, `warning`) sets its own.
 * - `title` for an optional translated tooltip, such as a hold reason.
 * - `render` to use a different element, such as `render={<li />}`.
 *
 * Use `className` for layout only, such as margin or gap.
 * Do not use it to replace the shared color or size styles.
 *
 * @example
 * <Badge>{roleLabel}</Badge>
 *
 * @example
 * <Badge variant="muted" size="sm">{t('agv.locationSizes.large')}</Badge>
 *
 * @example
 * <Badge variant="outline" size="md" dot={STATUS_DOTS[order.status]}>
 *   {t(`detail.status.${order.status}`)}
 * </Badge>
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({children, className, dot, render, size, variant, ...props}, ref) =>
    useRender({
      defaultTagName: 'span',
      render,
      ref,
      props: {
        ...props,
        className: cn(badgeVariants({dotted: Boolean(dot), size, variant}), className),
        children: dot ? (
          <>
            <i
              aria-hidden="true"
              className={badgeDotVariants({tone: dot === true ? 'current' : dot})}
            />
            {children}
          </>
        ) : (
          children
        ),
      },
    }),
);
Badge.displayName = 'Badge';

export {Badge};
