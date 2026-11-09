import {createContext, forwardRef, useContext, type ComponentPropsWithoutRef} from 'react';
import {cn} from '~/shared/utils/cn';

const BASE = 'rounded-utds-lg border';

const VARIANTS = {
  default: 'border-transparent',
  outline: 'border-[#ECECEE]',
} as const;

const SIZES = {
  default: 'px-4 py-3',
  sm: 'px-[13px] py-[10px]',
} as const;

const TITLE_SIZES = {
  default: 'text-sm',
  sm: 'text-[12px]',
} as const;

const DESCRIPTION_SIZES = {
  default: 'mt-1.5 text-xs',
  sm: 'mt-[5px] text-[10.5px]',
} as const;

export type ItemVariant = keyof typeof VARIANTS;
export type ItemSize = keyof typeof SIZES;

interface ItemStyleOptions {
  /** Border style of the item. */
  variant?: ItemVariant | null;
  /** Padding and text size. */
  size?: ItemSize | null;
}

const ItemSizeContext = createContext<ItemSize>('default');

/** Returns shared item classes for other item-like elements. */
export function itemVariants({variant, size}: ItemStyleOptions = {}) {
  return cn(BASE, VARIANTS[variant ?? 'default'], SIZES[size ?? 'default']);
}

export interface ItemProps extends ComponentPropsWithoutRef<'div'>, ItemStyleOptions {}

/**
 * Reusable list row with a title, optional trailing content and a description.
 *
 * Pass:
 * - `variant` for the border: `default` (no border) or `outline`.
 * - `size` for padding and text size: `default` or `sm`.
 *
 * Compose with:
 * - `ItemHeader` for the top row; it spaces the title and any trailing content, such as a `Badge`, apart.
 * - `ItemTitle` for the heading text.
 * - `ItemDescription` for the supporting text below the header.
 *
 * `ItemTitle` and `ItemDescription` pick up the size from the parent `Item`.
 *
 * Use `className` for layout only, such as margin or width.
 * Do not use it to replace the shared color, size or shape styles.
 *
 * @example
 * <Item variant="outline" size="sm" className="mb-2">
 *   <ItemHeader>
 *     <ItemTitle>{t('agv.locations.fullBack.title')}</ItemTitle>
 *     <Badge variant="muted" size="sm">{t('agv.locationSizes.large')}</Badge>
 *   </ItemHeader>
 *   <ItemDescription>{t('agv.locations.fullBack.description')}</ItemDescription>
 * </Item>
 */
const Item = forwardRef<HTMLDivElement, ItemProps>(
  ({className, size, variant, ...props}, ref) => (
    <ItemSizeContext.Provider value={size ?? 'default'}>
      <div ref={ref} className={cn(itemVariants({size, variant}), className)} {...props} />
    </ItemSizeContext.Provider>
  ),
);
Item.displayName = 'Item';

const ItemHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({className, ...props}, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between gap-2', className)}
      {...props}
    />
  ),
);
ItemHeader.displayName = 'ItemHeader';

const ItemTitle = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({className, ...props}, ref) => {
    const size = useContext(ItemSizeContext);
    return (
      <div
        ref={ref}
        className={cn('font-semibold text-[#111113]', TITLE_SIZES[size], className)}
        {...props}
      />
    );
  },
);
ItemTitle.displayName = 'ItemTitle';

const ItemDescription = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({className, ...props}, ref) => {
    const size = useContext(ItemSizeContext);
    return (
      <div
        ref={ref}
        className={cn('text-[#5C5C61]', DESCRIPTION_SIZES[size], className)}
        {...props}
      />
    );
  },
);
ItemDescription.displayName = 'ItemDescription';

export {Item, ItemHeader, ItemTitle, ItemDescription};
