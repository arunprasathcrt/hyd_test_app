import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {DatePicker} from '~/shared/components/DatePicker';
import {cn} from '~/shared/utils/cn';
import {dateToIsoDay, isoDayToDate} from '../../lib/new-draft-order';
import {builderInputClass} from './BuilderFields';
import {CalendarIcon} from '../icons/CalendarIcon';

interface Props {
  id: string;
  value: string;
  today: string;
  soonest: string;
  onChange: (isoDay: string) => void;
  describedBy: string;
  invalid?: boolean;
}

/** UTC midnight → the same calendar day at local midnight, for the day grid. */
function toLocalDay(isoDay: string): Date {
  const [y, m, d] = isoDay.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fromLocalDay(date: Date): string {
  return dateToIsoDay(new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())));
}

export function InHandsDateField({id, value, today, soonest, onChange, describedBy, invalid}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const [open, setOpen] = useState(false);
  const selected = toLocalDay(value);
  const todayDay = toLocalDay(today);
  const soonestDay = toLocalDay(soonest);

  return (
    <DatePicker
      selectedDate={selected}
      today={todayDay}
      minDate={soonestDay}
      onDateChange={(date) => onChange(fromLocalDay(date))}
      open={open}
      onOpenChange={setOpen}
      variant="artDesign"
      dialogLabel={t('newDraftOrder.customer.fields.inHands.dialogLabel')}
      previousMonthLabel={t('newDraftOrder.customer.fields.inHands.previousMonth')}
      nextMonthLabel={t('newDraftOrder.customer.fields.inHands.nextMonth')}
      trigger={
        <button
          id={id}
          type="button"
          aria-label={t('newDraftOrder.customer.fields.inHands.openCalendar', {date: isoDayToDate(value)})}
          aria-haspopup="dialog"
          aria-describedby={invalid ? `${id}-e ${describedBy}` : describedBy}
          className={cn(
            builderInputClass,
            invalid && 'border-[#A02020] hover:border-[#A02020] focus:border-[#A02020]',
            'flex cursor-pointer items-center justify-between gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0E6E6E]',
          )}
        >
          <span className="truncate">
            {t('newDraftOrder.customer.fields.inHands.value', {date: isoDayToDate(value)})}
          </span>
          <CalendarIcon className="shrink-0 text-[#5C5C61]" />
        </button>
      }
    />
  );
}
