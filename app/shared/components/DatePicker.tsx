import {useCallback, useMemo, useState, type ReactElement} from 'react';
import {useTranslation} from 'react-i18next';
import type {Matcher, Modifiers} from 'react-day-picker';

import {
  addDays,
  formatWeekdayShortDate,
  getCalendarDayClass,
  getDateHintValues,
  isSameDay,
  SIX_WEEKS_IN_DAYS,
} from '~/features/artDesign/lib/artDesign';

import {
  DATE_PICKER_LEGENDS,
  QUICK_PICKS,
} from 'mocks/artDesign';

import {Button} from '~/shared/components/ui/Button';
import {Calendar} from '~/shared/components/ui/Calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/shared/components/ui/Popover';

type DatePickerVariant = 'artDesign' | 'basic';

interface DatePickerProps {
  selectedDate: Date | null;
  today: Date;
  onDateChange: (date: Date) => void;
  trigger: ReactElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: DatePickerVariant;
  minDate?: Date;
  dialogLabel?: string;
  previousMonthLabel?: string;
  nextMonthLabel?: string;
}

export function DatePicker({
  selectedDate,
  today,
  onDateChange,
  trigger,
  open,
  onOpenChange,
  variant = 'artDesign',
  minDate,
  dialogLabel,
  previousMonthLabel,
  nextMonthLabel,
}: DatePickerProps) {
  const {t} = useTranslation('artDesign');

  const startDate = minDate ?? today;
  const isArtDesign = variant === 'artDesign';

  const [visibleMonth, setVisibleMonth] = useState<Date>(
    selectedDate ?? startDate,
  );

  const [hoveredDate, setHoveredDate] = useState<Date | null>(
    null,
  );

  const hintDate = hoveredDate ?? selectedDate ?? today;

  const {daysOut: hintDaysOut, insideSixWeeks: hintInsideSixWeeks} =
    getDateHintValues(hintDate, today);

  const calendarModifiers = useMemo(
    () => ({
      past: {before: startDate},
      insideSixWeeks: {
        from: startDate,
        to: addDays(startDate, SIX_WEEKS_IN_DAYS - 1),
      },
      boundary: addDays(startDate, SIX_WEEKS_IN_DAYS),
    }),
    [startDate],
  );

  const disabledDays = useMemo<Matcher[]>(
    () => [{before: startDate}],
    [startDate],
  );

  const getDayClassName = useCallback(
    (dayModifiers: Modifiers, date: Date) => {
      const {daysOut, insideSixWeeks} = getDateHintValues(date, today);

      return getCalendarDayClass({
        selected: Boolean(dayModifiers.selected),
        isInsideSixWeeks: insideSixWeeks,
        isPast: Boolean(dayModifiers.past),
        isCurrentMonth: !dayModifiers.outside,
        isBoundary: daysOut === SIX_WEEKS_IN_DAYS,
      });
    },
    [today],
  );

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    onDateChange(date);
    setVisibleMonth(date);
    setHoveredDate(null);
    onOpenChange(false);
  };

  const handleDayHover = (
    date: Date,
    dayModifiers: {disabled?: boolean},
  ) => {
    if (!dayModifiers.disabled) {
      setHoveredDate(date);
    }
  };

  const clearHover = () => {
    setHoveredDate(null);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setVisibleMonth(selectedDate ?? startDate);
          setHoveredDate(null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <PopoverTrigger render={trigger} />

      <PopoverContent
        aria-label={dialogLabel ?? t('datePicker.dialogLabel')}
        side="bottom"
        align="start"
        sideOffset={10}
        className="w-[352px] max-w-[calc(100vw-32px)] px-4 pb-3 pt-4"
      >
        <Calendar
          mode="single"
          required
          selected={selectedDate ?? undefined}
          onSelect={handleSelect}
          month={visibleMonth}
          onMonthChange={setVisibleMonth}
          startMonth={startDate}
          today={today}
          disabled={disabledDays}
          modifiers={isArtDesign ? calendarModifiers : undefined}
          getDayClassName={isArtDesign ? getDayClassName : undefined}
          fixedWeeks
          labels={{
            labelPrevious: () => previousMonthLabel ?? t('datePicker.previousMonth'),
            labelNext: () => nextMonthLabel ?? t('datePicker.nextMonth'),
          }}
          onDayMouseEnter={handleDayHover}
          onDayMouseLeave={clearHover}
          onDayFocus={handleDayHover}
          onDayBlur={clearHover}
          captionAddon={isArtDesign ? (
            <div className="mt-3 flex gap-[5px]">
              {QUICK_PICKS.map((pick) => {
                const date = addDays(today, pick.days);

                const active =
                  selectedDate !== null &&
                  isSameDay(date, selectedDate);

                const quickPickColor =
                  pick.days < SIX_WEEKS_IN_DAYS
                    ? 'bg-[#B26A00]'
                    : 'bg-[#1F7A4D]';

                return (
                  <Button
                    key={pick.days}
                    type="button"
                    variant={
                      active ? 'default' : 'outline'
                    }
                    size="xs"
                    shape="pill"
                    aria-pressed={active}
                    onClick={() => handleSelect(date)}
                    className={`min-h-0 flex-1 cursor-pointer gap-1.5 whitespace-nowrap px-2 py-[5px] text-xs font-medium ${
                      active
                        ? ''
                        : 'border-[#D7D7DA] hover:border-[#111113]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`size-[7px] shrink-0 rounded-full ${
                        active
                          ? 'bg-white'
                          : quickPickColor
                      }`}
                    />

                    {t(pick.labelKey)}
                  </Button>
                );
              })}
            </div>
          ) : undefined}
          className="p-0"
        />

        {isArtDesign ? (
          <>
            <div className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5 px-1 text-xs leading-[1.4] text-[#6B6B70]">
              {DATE_PICKER_LEGENDS.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1.5"
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block size-[10px] shrink-0 rounded-full ${item.indicatorClass}`}
                  />

                  {t(item.labelKey)}
                </span>
              ))}
            </div>

            <div className="mt-2.5x border-t border-[#ECECEE] px-1 pb-0.5 pt-2.5 text-xs">
              <div className=" text-[#6B6B70]">
                <b className="font-semibold text-[#111113]">
                  {formatWeekdayShortDate(hintDate)}
                </b>

                {' · '}

                {t('datePicker.daysOut', {
                  count: hintDaysOut,
                })}

                {' · '}

                {hintInsideSixWeeks
                  ? t('datePicker.spectrumLane')
                  : t('datePicker.aiRecommended')}



              </div>
                          <Button
                type="button"
                variant="link"
                size="xs"
                shape="md"
                onClick={() => handleSelect(today)}
                className="min-h-0 cursor-pointer px-1 py-0.5 text-xs font-medium underline underline-offset-[3px]"
              >
                {t('datePicker.today')}
              </Button> 
            </div>
          </>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}