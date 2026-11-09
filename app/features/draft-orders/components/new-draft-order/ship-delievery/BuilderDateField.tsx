import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {CalendarDays} from 'lucide-react';
import {DatePicker} from '~/shared/components/DatePicker';
import {cn} from '~/shared/utils/cn';
import {dateToIsoDay, isoDayToDate} from '../../../lib/new-draft-order';
import {builderInputClass} from '../BuilderFields';

interface Props {
  id: string;
  value: string;
  min: string;
  onChange: (isoDay: string) => void;
  fieldLabel: string;
  describedBy: string;
  invalid?: boolean;
}

function toLocalDay(isoDay: string): Date {
  const [year, month, day] = isoDay.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function fromLocalDay(date: Date): string {
  return dateToIsoDay(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
}

export function BuilderDateField({
  id,
  value,
  min,
  onChange,
  fieldLabel,
  describedBy,
  invalid,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const [open, setOpen] = useState(false);
  const minDay = toLocalDay(min);

  return (
    <DatePicker
      selectedDate={value ? toLocalDay(value) : null}
      today={minDay}
      minDate={minDay}
      onDateChange={(date) => onChange(fromLocalDay(date))}
      open={open}
      onOpenChange={setOpen}
      variant="artDesign"
      dialogLabel={t('newDraftOrder.dateField.dialogLabel', {field: fieldLabel})}
      previousMonthLabel={t('newDraftOrder.customer.fields.inHands.previousMonth')}
      nextMonthLabel={t('newDraftOrder.customer.fields.inHands.nextMonth')}
      trigger={
        <button
          id={id}
          type="button"
          aria-label={
            value
              ? t('newDraftOrder.dateField.openCalendar', {field: fieldLabel, date: isoDayToDate(value)})
              : t('newDraftOrder.dateField.openCalendarEmpty', {field: fieldLabel})
          }
          aria-haspopup="dialog"
          aria-describedby={describedBy}
          className={cn(
            builderInputClass,
            'flex cursor-pointer items-center justify-between gap-2 text-left',
            invalid && 'border-[#A02020]',
          )}
        >
          <span className={cn('truncate', !value && 'text-[#6B6B70]')}>
            {value
              ? t('newDraftOrder.customer.fields.inHands.value', {date: isoDayToDate(value)})
              : t('newDraftOrder.dateField.placeholder')}
          </span>
          <CalendarDays aria-hidden="true" size={16} strokeWidth={1.8} className="shrink-0 text-[#5C5C61]" />
        </button>
      }
    />
  );
}
