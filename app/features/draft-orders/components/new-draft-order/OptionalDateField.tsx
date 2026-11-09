import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {DatePicker} from '~/shared/components/DatePicker';
import {cn} from '~/shared/utils/cn';
import {dateToIsoDay, isoDayToDate} from '../../lib/new-draft-order';
import {builderInputClass} from './BuilderFields';

interface Props {
  id: string;
  value: string;
  /** Names the calendar for assistive tech. */
  label: string;
  onChange: (isoDay: string) => void;
  describedBy?: string;
}

function toLocalDay(isoDay: string): Date {
  const [y, m, d] = isoDay.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fromLocalDay(date: Date): string {
  return dateToIsoDay(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
  );
}

/**
 * Prototype `.do112b-date`: the whole field opens the shared calendar. Unlike the
 * in-hands field it can be empty, which reads "Choose a date" (the header applies).
 */
export function OptionalDateField({id, value, label, onChange, describedBy}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const [open, setOpen] = useState(false);
  const today = new Date();
  return (
    <DatePicker
      selectedDate={value ? toLocalDay(value) : today}
      today={today}
      minDate={today}
      onDateChange={(date) => onChange(fromLocalDay(date))}
      open={open}
      onOpenChange={setOpen}
      variant="artDesign"
      dialogLabel={label}
      previousMonthLabel={t('newDraftOrder.customer.fields.inHands.previousMonth')}
      nextMonthLabel={t('newDraftOrder.customer.fields.inHands.nextMonth')}
      trigger={
        <button
          id={id}
          type="button"
          aria-label={t('newDraftOrder.products.opt.openCalendar', {label})}
          aria-haspopup="dialog"
          aria-describedby={describedBy}
          className={cn(
            builderInputClass,
            'flex cursor-pointer items-center justify-between gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0E6E6E]',
          )}
        >
          <span className={cn('truncate', !value && 'text-[#6B6B70]')}>
            {value
              ? t('newDraftOrder.customer.fields.inHands.value', {
                  date: isoDayToDate(value),
                })
              : t('newDraftOrder.products.opt.chooseDate')}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className="shrink-0 text-[#5C5C61]"
          >
            <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
            <path d="M16 3v3M8 3v3M3 9.5h18" />
          </svg>
        </button>
      }
    />
  );
}
