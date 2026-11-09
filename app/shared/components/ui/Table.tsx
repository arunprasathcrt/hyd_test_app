import {createContext, forwardRef, useContext, type ComponentPropsWithoutRef} from 'react';
import {cn} from '~/shared/utils/cn';

const WRAPPER_VARIANTS = {
  default: '',
  outline: 'rounded-utds-lg border border-[#ECECEE]',
} as const;

const HEAD_SIZES = {
  default: 'px-4 py-3 text-xs',
  sm: 'px-[14px] py-[9px] text-[10px]',
} as const;

const CELL_SIZES = {
  default: 'px-4 py-3',
  sm: 'px-[14px] py-[9px]',
} as const;

const BODY_ROW_SIZES = {
  default: 'text-sm',
  sm: 'text-[11px]',
} as const;

export type TableVariant = keyof typeof WRAPPER_VARIANTS;
export type TableSize = keyof typeof HEAD_SIZES;

type TableSection = 'header' | 'body';

const TableSizeContext = createContext<TableSize>('default');
const TableSectionContext = createContext<TableSection>('body');

export interface TableProps extends ComponentPropsWithoutRef<'table'> {
  /** Border around the table: `default` (none) or `outline`. */
  variant?: TableVariant | null;
  /** Cell padding and text size. */
  size?: TableSize | null;
  /** Layout classes for the scroll wrapper, such as margin. */
  wrapperClassName?: string;
}

/**
 * Reusable data table. Scrolls horizontally when the table is wider than its container.
 *
 * Pass:
 * - `variant` for the border around the table: `default` or `outline`.
 * - `size` for cell padding and text size: `default` or `sm`.
 * - `wrapperClassName` for layout on the scroll wrapper, such as margin.
 * - `className` for layout on the table itself, such as a minimum width.
 *
 * Compose with `TableHeader`, `TableBody`, `TableRow`, `TableHead` and `TableCell`.
 * Rows and cells pick up the size from the parent `Table`, and rows style themselves
 * for the header or body section they sit in.
 *
 * Do not use `className` to replace the shared color, size or border styles.
 *
 * @example
 * <Table variant="outline" size="sm" wrapperClassName="mb-3" className="min-w-[700px]">
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>{t('agv.table.headers.color')}</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>{t('agv.table.rows.navy.label')}</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */
const Table = forwardRef<HTMLTableElement, TableProps>(
  ({className, size, variant, wrapperClassName, ...props}, ref) => (
    <TableSizeContext.Provider value={size ?? 'default'}>
      <div
        className={cn(
          'overflow-x-auto',
          WRAPPER_VARIANTS[variant ?? 'default'],
          wrapperClassName,
        )}
      >
        <table ref={ref} className={cn('w-full border-collapse', className)} {...props} />
      </div>
    </TableSizeContext.Provider>
  ),
);
Table.displayName = 'Table';

const TableHeader = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'thead'>>(
  (props, ref) => (
    <TableSectionContext.Provider value="header">
      <thead ref={ref} {...props} />
    </TableSectionContext.Provider>
  ),
);
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tbody'>>(
  (props, ref) => (
    <TableSectionContext.Provider value="body">
      <tbody ref={ref} {...props} />
    </TableSectionContext.Provider>
  ),
);
TableBody.displayName = 'TableBody';

const TableRow = forwardRef<HTMLTableRowElement, ComponentPropsWithoutRef<'tr'>>(
  ({className, ...props}, ref) => {
    const size = useContext(TableSizeContext);
    const section = useContext(TableSectionContext);
    return (
      <tr
        ref={ref}
        className={cn(
          section === 'body' && 'border-t border-[#ECECEE] text-[#111113]',
          section === 'body' && BODY_ROW_SIZES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
TableRow.displayName = 'TableRow';

const TableHead = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<'th'>>(
  ({className, ...props}, ref) => {
    const size = useContext(TableSizeContext);
    return (
      <th
        ref={ref}
        className={cn(
          'bg-[#FAFAFA] text-left font-semibold text-[#8E8E93]',
          HEAD_SIZES[size],
          className,
        )}
        {...props}
      />
    );
  },
);
TableHead.displayName = 'TableHead';

const TableCell = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<'td'>>(
  ({className, ...props}, ref) => {
    const size = useContext(TableSizeContext);
    return <td ref={ref} className={cn(CELL_SIZES[size], className)} {...props} />;
  },
);
TableCell.displayName = 'TableCell';

export {Table, TableHeader, TableBody, TableRow, TableHead, TableCell};
