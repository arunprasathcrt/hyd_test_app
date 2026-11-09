import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type ReactNode,
} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {
  DayPicker,
  getDefaultClassNames,
  type ChevronProps,
  type DayButtonProps,
  type Modifiers,
  type MonthCaptionProps,
} from 'react-day-picker';
import {useTranslation} from 'react-i18next';
import {Button, buttonVariants, type ButtonVariant} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';

export type CalendarProps = ComponentProps<typeof DayPicker> & {
  /** Visual style of the previous / next month buttons. */
  buttonVariant?: ButtonVariant;
  /** Content rendered under the month title, for example quick-pick buttons. */
  captionAddon?: ReactNode;
  /** Extra classes for a day button, derived from its modifiers (built-in and custom). */
  getDayClassName?: (modifiers: Modifiers, date: Date) => string | undefined;
};

interface CalendarContextValue {
  captionAddon?: ReactNode;
  getDayClassName?: (modifiers: Modifiers, date: Date) => string | undefined;
}

/**
 * Carries per-instance render options to the module-level slot components, so
 * their identity stays stable and day buttons are not remounted on re-render.
 */
const CalendarContext = createContext<CalendarContextValue>({});

/** Navigation chevron, drawn with the same lucide icons as the rest of the app. */
const CalendarChevron = ({orientation, className}: ChevronProps) => {
  const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
  return <Icon aria-hidden="true" size={15} className={className} />;
};

/** Month title (bold month, muted year) with the optional caption add-on under it. */
const CalendarMonthCaption = ({
  calendarMonth,
  displayIndex: _displayIndex,
  children: _children,
  ...props
}: MonthCaptionProps) => {
  const {t} = useTranslation('common');
  const {captionAddon} = useContext(CalendarContext);

  return (
    <div {...props}>
      <div className="flex h-8 items-center justify-center px-9 max-sm:h-11">
        <div role="status" aria-live="polite" className="flex items-baseline gap-1.5 text-[15px]">
          <strong className="font-semibold text-utds-ink">
            {t('calendar.month', {value: calendarMonth.date})}
          </strong>
          <span className="text-[#6B6B70]">
            {t('calendar.year', {value: calendarMonth.date})}
          </span>
        </div>
      </div>
      {captionAddon}
    </div>
  );
};

/**
 * Day cell button. Built on the shared `Button`, so it follows the UTDS ghost
 * pill style, with a dot under today. Use the calendar's `getDayClassName` for
 * feature-specific day colours.
 */
const CalendarDayButton = ({className, day, modifiers, children, ...props}: DayButtonProps) => {
  const ref = useRef<HTMLElement>(null);
  const {getDayClassName} = useContext(CalendarContext);

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      shape="pill"
      data-day={day.isoDate}
      data-selected={modifiers.selected || undefined}
      data-today={modifiers.today || undefined}
      data-outside={modifiers.outside || undefined}
      className={cn(
        'relative aspect-square h-auto w-full min-h-9 min-w-0 shrink cursor-pointer rounded-full border-0 p-0 text-[13.5px] font-medium transition',
        'data-selected:bg-utds-ink data-selected:text-utds-inverse data-selected:hover:bg-utds-ink data-selected:hover:text-utds-inverse',
        'data-outside:opacity-40',
        className,
        getDayClassName?.(modifiers, day.date),
      )}
      {...props}
    >
      <span>{children}</span>
      {modifiers.today && (
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-current"
        />
      )}
    </Button>
  );
};

/**
 * Reusable calendar for date picking. shadcn/ui Calendar pattern on
 * `react-day-picker`, styled to UTDS. All ARIA labels, captions and weekday
 * names come from the `common` namespace and the Intl date formatter.
 *
 * Pass:
 * - `mode`, `selected` and `onSelect` for selection (`single`, `multiple`, `range`).
 * - `month` + `onMonthChange` to control the visible month.
 * - `startMonth` / `endMonth` to bound navigation, and `disabled` matchers to block days.
 * - `modifiers` + `getDayClassName` for feature-specific day states and colours.
 * - `captionAddon` to add content under the month title (for example quick picks).
 *
 * Use `className` / `classNames` for layout only.
 *
 * @example
 * <Calendar mode="single" selected={date} onSelect={setDate} disabled={{before: today}} />
 */
const Calendar = ({
  className,
  classNames,
  showOutsideDays = true,
  buttonVariant = 'ghost',
  captionAddon,
  getDayClassName,
  formatters,
  labels,
  components,
  ...props
}: CalendarProps) => {
  const {t} = useTranslation('common');
  const defaultClassNames = getDefaultClassNames();
  const navButtonClass = cn(
    buttonVariants({variant: buttonVariant, size: 'icon', shape: 'pill'}),
    'size-8 min-h-0 cursor-pointer p-0 aria-disabled:pointer-events-none aria-disabled:cursor-default aria-disabled:opacity-30',
  );
  const contextValue = useMemo(
    () => ({captionAddon, getDayClassName}),
    [captionAddon, getDayClassName],
  );

  return (
    <CalendarContext.Provider value={contextValue}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn('w-full bg-utds-raised p-3', className)}
        formatters={{
          formatCaption: (month) => t('calendar.caption', {value: month}),
          formatWeekdayName: (weekday) => t('calendar.weekdayShort', {value: weekday}),
          ...formatters,
        }}
        labels={{
          labelNav: () => t('calendar.navigation'),
          labelPrevious: () => t('calendar.previousMonth'),
          labelNext: () => t('calendar.nextMonth'),
          labelGrid: (month) => t('calendar.caption', {value: month}),
          labelWeekday: (weekday) => t('calendar.weekday', {value: weekday}),
          labelDayButton: (date, modifiers) => {
            if (modifiers.today && modifiers.selected) {
              return t('calendar.day.todaySelected', {value: date});
            }
            if (modifiers.today) return t('calendar.day.today', {value: date});
            if (modifiers.selected) return t('calendar.day.selected', {value: date});
            return t('calendar.day.default', {value: date});
          },
          ...labels,
        }}
        classNames={{
          root: cn('w-full', defaultClassNames.root),
          months: cn('relative flex flex-col', defaultClassNames.months),
          month: cn('flex w-full flex-col', defaultClassNames.month),
          nav: cn(
            'absolute inset-x-0 top-0 flex h-8 items-center justify-between max-sm:h-11',
            defaultClassNames.nav,
          ),
          button_previous: cn(navButtonClass, defaultClassNames.button_previous),
          button_next: cn(navButtonClass, defaultClassNames.button_next),
          month_caption: cn('mb-3', defaultClassNames.month_caption),
          caption_label: cn(
            'select-none text-[15px] font-semibold text-utds-ink',
            defaultClassNames.caption_label,
          ),
          month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
          weekdays: cn('grid grid-cols-7 gap-1 pb-1', defaultClassNames.weekdays),
          weekday: cn(
            'select-none text-center text-xs font-medium text-[#6B6B70]',
            defaultClassNames.weekday,
          ),
          weeks: cn('grid gap-1', defaultClassNames.weeks),
          week: cn('grid grid-cols-7 gap-1', defaultClassNames.week),
          day: cn('relative p-0 text-center select-none', defaultClassNames.day),
          today: defaultClassNames.today,
          outside: defaultClassNames.outside,
          disabled: defaultClassNames.disabled,
          hidden: cn('invisible', defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Chevron: CalendarChevron,
          MonthCaption: CalendarMonthCaption,
          DayButton: CalendarDayButton,
          ...components,
        }}
        {...props}
      />
    </CalendarContext.Provider>
  );
};

export {Calendar, CalendarDayButton};
