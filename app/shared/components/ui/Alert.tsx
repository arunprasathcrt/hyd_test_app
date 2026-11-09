import {createContext, forwardRef, useContext} from 'react';
import {useRender} from '@base-ui/react/use-render';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '~/shared/utils/cn';

/** Returns shared alert classes for other alert-like elements. */
export const alertVariants = cva(
  'relative w-full border [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:h-4 [&>svg]:w-4',
  {
    variants: {
      /** Color scheme of the alert. */
      variant: {
        default: 'border-utds-border-default bg-utds-raised text-utds-body',
        info: 'border-utds-callout-info-border bg-utds-callout-info-bg text-utds-callout-info-fg',
        warning:
          'border-utds-callout-warning-border bg-utds-callout-warning-bg text-utds-callout-warning-fg',
        success:
          'border-utds-callout-success-border bg-utds-callout-success-bg text-utds-callout-success-fg',
      },
      /** Padding and text size. */
      size: {
        default: 'px-4 py-3 text-sm',
        md: 'px-[14px] py-[11px] text-[11px]',
        sm: 'px-[12px] py-[8px] text-[11px]',
        xs: 'px-[12px] py-[9px] text-[10.5px]',
      },
      /** Corner radius. */
      shape: {
        md: 'rounded-utds-md',
        lg: 'rounded-utds-lg',
      },
      /**
       * How the title and description are arranged.
       * - `stack`: separate lines.
       * - `inline`: one run of text.
       * - `row`: side by side in a centered row.
       */
      layout: {
        stack: '',
        inline: '',
        row: 'flex items-center gap-[8px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      shape: 'md',
      layout: 'stack',
    },
  },
);

const alertTitleVariants = cva('', {
  variants: {
    variant: {
      default: 'font-semibold text-utds-ink',
      info: 'font-bold text-inherit',
      warning: 'font-bold text-inherit',
      success: 'font-bold text-inherit',
    },
    layout: {
      stack: 'mb-1',
      inline: 'mb-0 inline',
      row: 'mb-0',
    },
  },
});

const alertDescriptionVariants = cva('[&_p]:leading-relaxed', {
  variants: {
    size: {
      default: 'text-sm',
      md: 'text-[11px]',
      sm: 'text-[11px]',
      xs: 'text-[10.5px]',
    },
    layout: {
      stack: '',
      inline: 'inline',
      row: '',
    },
  },
});

type AlertStyleOptions = VariantProps<typeof alertVariants>;

export type AlertVariant = NonNullable<AlertStyleOptions['variant']>;
export type AlertSize = NonNullable<AlertStyleOptions['size']>;
export type AlertShape = NonNullable<AlertStyleOptions['shape']>;
export type AlertLayout = NonNullable<AlertStyleOptions['layout']>;

interface ResolvedAlertStyle {
  variant: AlertVariant;
  size: AlertSize;
  layout: AlertLayout;
}

const AlertStyleContext = createContext<ResolvedAlertStyle>({
  variant: 'default',
  size: 'default',
  layout: 'stack',
});

export interface AlertProps
  extends Omit<useRender.ComponentProps<'div'>, 'ref'>,
    AlertStyleOptions {}

export type AlertTitleProps = Omit<useRender.ComponentProps<'h5'>, 'ref'>;
export type AlertDescriptionProps = Omit<useRender.ComponentProps<'div'>, 'ref'>;

/**
 * Reusable callout for banners, notes and status messages.
 * Renders a `<div>` through Base UI's `useRender`.
 *
 * Pass:
 * - `variant` for the color scheme: `default`, `info`, `warning` or `success`.
 * - `size` for padding and text size: `default`, `md`, `sm` or `xs`.
 * - `shape` for corners: `md` (10px) or `lg` (12px).
 * - `layout` for how the title and description are arranged: `stack`, `inline` or `row`.
 * - `role="note"` for static information; the default `role="alert"` is for messages that need attention.
 * - `render` to use a different element, such as `render={<section />}`.
 *
 * `AlertTitle` and `AlertDescription` pick up the variant, size and layout from the parent `Alert`.
 *
 * Use `className` for layout only, such as margin or width.
 * Do not use it to replace the shared color, size or shape styles.
 *
 * @example
 * <Alert variant="info" size="md" shape="lg" layout="inline" role="note" className="mb-4">
 *   <AlertTitle>{t('agv.bannerTitle')}</AlertTitle>{' '}
 *   <AlertDescription>{t('agv.bannerBody')}</AlertDescription>
 * </Alert>
 */
const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({className, layout, render, shape, size, variant, ...props}, ref) => {
    const element = useRender({
      defaultTagName: 'div',
      render,
      ref,
      props: {
        role: 'alert',
        ...props,
        className: cn(alertVariants({layout, shape, size, variant}), className),
      },
    });
    return (
      <AlertStyleContext.Provider
        value={{
          variant: variant ?? 'default',
          size: size ?? 'default',
          layout: layout ?? 'stack',
        }}
      >
        {element}
      </AlertStyleContext.Provider>
    );
  },
);
Alert.displayName = 'Alert';

const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({className, render, ...props}, ref) => {
    const {variant, layout} = useContext(AlertStyleContext);
    return useRender({
      defaultTagName: 'h5',
      render,
      ref,
      props: {...props, className: cn(alertTitleVariants({variant, layout}), className)},
    });
  },
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({className, render, ...props}, ref) => {
    const {size, layout} = useContext(AlertStyleContext);
    return useRender({
      defaultTagName: 'div',
      render,
      ref,
      props: {...props, className: cn(alertDescriptionVariants({size, layout}), className)},
    });
  },
);
AlertDescription.displayName = 'AlertDescription';

export {Alert, AlertTitle, AlertDescription};
