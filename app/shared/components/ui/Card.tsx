import {createContext, forwardRef, useContext, useId} from 'react';
import {useRender} from '@base-ui/react/use-render';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '~/shared/utils/cn';

/** Returns shared card classes for other card-like elements. */
export const cardVariants = cva(
  'flex flex-col rounded-[14px] border border-[#EAEAEA] bg-white',
  {
    variants: {
      /** Padding and gap between the header and the content. */
      size: {
        default: 'gap-4 p-[22px]',
        sm: 'gap-3 p-4',
        /** Prototype `.od113-card`: 18px top, 20px sides and bottom, no gap — children set their own spacing. */
        compact: 'gap-0 px-5 pt-[18px] pb-5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

type CardStyleOptions = VariantProps<typeof cardVariants>;

export type CardSize = NonNullable<CardStyleOptions['size']>;

const CardTitleIdContext = createContext<string | undefined>(undefined);

export interface CardProps
  extends Omit<useRender.ComponentProps<'section'>, 'ref'>,
    CardStyleOptions {}

export type CardHeaderProps = Omit<useRender.ComponentProps<'div'>, 'ref'>;
export type CardTitleProps = Omit<useRender.ComponentProps<'h2'>, 'ref'>;
export type CardActionsProps = Omit<useRender.ComponentProps<'div'>, 'ref'>;

/**
 * Reusable white panel for a titled region of a page.
 * Renders a `<section>` through Base UI's `useRender`, labelled by its `CardTitle`.
 *
 * Pass:
 * - `size` for padding and spacing: `default`, `sm`, or `compact` (prototype side panels; no gap between children).
 * - `render` to use a different element, such as `render={<aside />}`.
 * - `aria-label` instead of a `CardTitle` when the card has no visible heading.
 *
 * Compose with:
 * - `CardHeader` for the top row; it spaces the title and any trailing content apart.
 * - `CardTitle` for the heading. Use `render={<h3 />}` to change the heading level.
 * - `CardActions` for trailing badges, meta text or buttons in the header.
 *
 * Use `className` for layout only, such as margin or width.
 * Do not use it to replace the shared color, size or shape styles.
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>{t('detail.shipments.title')}</CardTitle>
 *     <CardActions>
 *       <span>{t('detail.updatesDaily')}</span>
 *     </CardActions>
 *   </CardHeader>
 *   <p>{t('detail.shipments.none')}</p>
 * </Card>
 */
const Card = forwardRef<HTMLElement, CardProps>(({className, render, size, ...props}, ref) => {
  const titleId = useId();
  const labelled = props['aria-label'] != null || props['aria-labelledby'] != null;
  const element = useRender({
    defaultTagName: 'section',
    render,
    ref,
    props: {
      'aria-labelledby': labelled ? undefined : titleId,
      ...props,
      className: cn(cardVariants({size}), className),
    },
  });
  return <CardTitleIdContext.Provider value={titleId}>{element}</CardTitleIdContext.Provider>;
});
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({className, render, ...props}, ref) =>
  useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {...props, className: cn('flex flex-wrap items-center justify-between gap-3', className)},
  }),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({className, render, ...props}, ref) => {
  const titleId = useContext(CardTitleIdContext);
  return useRender({
    defaultTagName: 'h2',
    render,
    ref,
    props: {
      id: titleId,
      ...props,
      className: cn('text-[16px] font-semibold tracking-[-0.01em] text-[#0F0F0F]', className),
    },
  });
});
CardTitle.displayName = 'CardTitle';

const CardActions = forwardRef<HTMLDivElement, CardActionsProps>(({className, render, ...props}, ref) =>
  useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {...props, className: cn('flex flex-wrap items-center gap-2', className)},
  }),
);
CardActions.displayName = 'CardActions';

export {Card, CardHeader, CardTitle, CardActions};
