import {forwardRef, type ComponentPropsWithoutRef, type ReactNode} from 'react';
import {Slot} from '@radix-ui/react-slot';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import {cva, type VariantProps} from 'class-variance-authority';
import {clsx} from 'clsx';
import {extendTailwindMerge} from 'tailwind-merge';
import {Check, X} from 'lucide-react';
import {useTranslation} from 'react-i18next';

export {BrandLogo} from './BrandLogo';

/**
 * Stock `tailwind-merge` only knows Tailwind's built-in scale (`rounded-full`,
 * `bg-red-500`, ...). Our `mf-*` tokens (`tailwind.css`'s `@theme` block) are
 * outside that scale, so without this, `cn('rounded-mf-pill', 'rounded-mf-md')`
 * keeps BOTH classes instead of the second one winning — which is exactly why
 * an "active" tile (solid fill makes the corner radius obvious) could render
 * pill-shaped even though the component passed `rounded-mf-md` last.
 */
const MF_COLOR_TOKENS = [
  'mf-bg',
  'mf-surface',
  'mf-surface-2',
  'mf-border',
  'mf-border-2',
  'mf-line',
  'mf-ink',
  'mf-ink-2',
  'mf-ink-3',
  'mf-ink-4',
  'mf-gold',
  'mf-gold-deep',
  'mf-gold-soft',
  'mf-gold-line',
  'mf-teal',
  'mf-teal-soft',
  'mf-terra',
  'mf-green',
  'mf-lead',
  'mf-primary',
  'mf-primary-dark',
];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      rounded: [{rounded: ['mf-sm', 'mf-md', 'mf-lg', 'mf-pill']}],
      'bg-color': [{bg: MF_COLOR_TOKENS}],
      'text-color': [{text: MF_COLOR_TOKENS}],
      'border-color': [{border: MF_COLOR_TOKENS}],
      shadow: [{shadow: ['mf-1', 'mf-2', 'mf-3']}],
    },
  },
});

export function cn(...inputs: Parameters<typeof clsx>) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-mf-pill border text-[13px] font-semibold transition-colors cursor-pointer disabled:cursor-default disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mf-primary',
  {
    variants: {
      variant: {
        default: 'border-mf-primary bg-mf-primary text-white hover:bg-mf-ink',
        outline:
          'border-mf-border-2 bg-mf-surface text-mf-ink hover:border-mf-ink-3',
        ghost:
          'border-transparent bg-transparent text-mf-ink-2 hover:bg-mf-surface-2',
      },
      size: {
        default: 'min-h-10 px-4 py-2',
        small: 'min-h-9 px-3 py-1.5 max-sm:min-h-11',
        icon: 'size-9 p-0 max-sm:size-11',
      },
    },
    defaultVariants: {variant: 'default', size: 'default'},
  },
);

export const Button = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'> &
    VariantProps<typeof buttonVariants> & {asChild?: boolean}
>(({className, variant, size, asChild = false, ...props}, ref) => {
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      ref={ref}
      className={cn(buttonVariants({variant, size}), className)}
      {...props}
    />
  );
});

export function Checkbox(
  props: ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
) {
  return (
    <CheckboxPrimitive.Root
      {...props}
      className={cn(
        'grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-mf-border-2 bg-mf-surface text-white data-[state=checked]:border-mf-primary data-[state=checked]:bg-mf-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mf-primary',
        props.className,
      )}
    >
      <CheckboxPrimitive.Indicator>
        <Check size={13} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export function Dialog({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  sheet = false,
  contentClassName,
  titleClassName,
  bodyClassName,
  overlayClassName,
  closeClassName,
  hideHeader = false,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  sheet?: boolean;
  contentClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
  overlayClassName?: string;
  closeClassName?: string;
  hideHeader?: boolean;
  footer?: ReactNode;
}) {
  const {t} = useTranslation('products');
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'fixed inset-0 z-[180] bg-mf-ink/40',
            sheet && 'bg-[rgba(20,19,15,.38)]',
            overlayClassName,
          )}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed z-[190] flex flex-col overflow-hidden bg-mf-surface font-catalog text-mf-ink shadow-mf-3',
            sheet
              ? 'inset-y-0 right-0 w-full max-w-[440px] shadow-[-12px_0_32px_rgba(20,19,15,.18)]'
              : 'left-1/2 top-1/2 max-h-[90dvh] w-[calc(100%-24px)] max-w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-mf-lg',
            contentClassName,
          )}
        >
          {hideHeader ? (
            <>
              <DialogPrimitive.Title className="sr-only">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className={cn(
                    'absolute right-3 top-3 z-20 size-9 rounded-full border-mf-line bg-white',
                    closeClassName,
                  )}
                  aria-label={t('card.close')}
                >
                  <X size={18} />
                </Button>
              </DialogPrimitive.Close>
            </>
          ) : (
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-mf-line px-[18px] py-4">
              <div className="min-w-0">
                <DialogPrimitive.Title
                  className={cn('text-[15px] font-bold', titleClassName)}
                >
                  {title}
                </DialogPrimitive.Title>
                {subtitle && (
                  <p className="mt-1 text-[13px] text-mf-ink-3">{subtitle}</p>
                )}
              </div>
              <DialogPrimitive.Close asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className={
                    sheet ? 'size-9 rounded-full max-sm:size-9' : undefined
                  }
                  aria-label={t(sheet ? 'filters.close' : 'card.close')}
                >
                  <X size={18} />
                </Button>
              </DialogPrimitive.Close>
            </div>
          )}
          <div
            className={cn(
              'min-h-0 overflow-y-auto overscroll-contain p-[18px]',
              sheet && 'flex-1 px-[18px] pb-3 pt-1',
              bodyClassName,
            )}
          >
            {children}
          </div>
          {footer && (
            <div className="flex shrink-0 items-center justify-between border-t border-mf-line px-[18px] py-3">
              {footer}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function Popover({
  label,
  trigger,
  children,
}: {
  label: string;
  trigger: ReactNode;
  children: ReactNode;
}) {
  const {t} = useTranslation('products');
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          aria-label={label}
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className="z-[160] flex max-h-[min(64dvh,560px)] w-[340px] max-w-[calc(100vw-24px)] flex-col rounded-[14px] border border-mf-border-2 bg-mf-surface font-catalog text-mf-ink shadow-mf-3"
        >
          <div className="px-3.5 pb-1.5 pt-3 text-[13px] font-bold">
            {label}
          </div>
          <div className="min-h-0 overflow-y-auto p-2">{children}</div>
          <div className="flex justify-end border-t border-mf-line p-3">
            <PopoverPrimitive.Close asChild>
              <Button size="small">{t('filters.done')}</Button>
            </PopoverPrimitive.Close>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
