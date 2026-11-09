import {useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {Input} from '~/shared/components/ui/Input';
import {cn} from '~/shared/utils/cn';
import type {NewDraftOrderCustomer} from '../../../types/new-draft-order';
import {CheckIcon} from '../../icons/CheckIcon';
import {CloseIcon} from '../../icons/CloseIcon';
import {SearchIcon} from '../../icons/SearchIcon';
import {SelectChevronIcon} from '../../icons/SelectChevronIcon';
import {Tooltip, TooltipContent, TooltipTrigger} from '~/shared/components/ui/Tooltip';

interface Props {
  customers: NewDraftOrderCustomer[];
  value: string;
  onChange: (customerId: string) => void;
  inputId: string;
  labelId: string;
  describedBy: string;
  invalid?: boolean;
}

export function CustomerCombobox({customers, value, onChange, inputId, labelId, describedBy, invalid}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const optionLabel = useCallback(
    (customer: NewDraftOrderCustomer) =>
      t('newDraftOrder.customer.fields.customer.option', {
        name: customer.name,
        segment: t(`newDraftOrder.customer.segments.${customer.segment}`),
      }),
    [t],
  );

  const optionMeta = (customer: NewDraftOrderCustomer) =>
    t('newDraftOrder.customer.fields.customer.optionMeta', {
      code: customer.code,
      segment: t(`newDraftOrder.customer.segments.${customer.segment}`),
      tier: customer.tier ?? t('newDraftOrder.overview.notSet'),
    });

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(q) || customer.code.toLowerCase().includes(q),
    );
  }, [customers, query]);

  useEffect(() => {
    const selected = customers.find((customer) => customer.id === value);
    if (!selected) {
      if (query) setQuery('');
      return;
    }
    const selectedLabel = optionLabel(selected);
    if (!open && query !== selectedLabel) {
      setQuery(selectedLabel);
    }
  }, [customers, open, optionLabel, query, value]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const choose = (customer: NewDraftOrderCustomer) => {
    onChange(customer.id);
    setQuery(optionLabel(customer));
    setOpen(false);
  };

  const openList = () => {
    const selected = matches.findIndex((customer) => customer.id === value);
    setActive(selected >= 0 ? selected : 0);
    setOpen(true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((index) => (matches.length ? (index + step + matches.length) % matches.length : 0));
    } else if (event.key === 'Enter' && open && matches[active]) {
      event.preventDefault();
      choose(matches[active]);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const activeId = open && matches[active] ? `${listId}-${matches[active].id}` : undefined;
  const hasValue = Boolean(value);
  const iconButtonClass =
    'inline-flex size-7 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[#6B6B70] hover:bg-[#F7F7F8] hover:text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0E6E6E]';

  return (
    <div ref={rootRef} className="relative min-w-0">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 text-[#8E8E93]"
      >
        <SearchIcon />
      </span>

      <Input
        ref={inputRef}
        id={inputId}
        data-k={inputId}
        type="search"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-required="true"
        aria-invalid={invalid || undefined}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeId}
        placeholder={t('newDraftOrder.customer.fields.customer.placeholder')}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        //added search
        onFocus={() => {
          setQuery('');
          setActive(0);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className={cn(
          'pr-17 pl-9.5 [&::-webkit-search-cancel-button]:hidden',
          hasValue && !open && 'text-transparent',
          open && 'border-[#0E6E6E] shadow-[0_0_0_3px_rgba(14,110,110,.18)]',
        )}
      />

      {hasValue && !open ? (
        <span className="pointer-events-none absolute top-1/2 left-9.5 max-w-[calc(100%-104px)] -translate-y-1/2 truncate rounded-md bg-[#F2F2F3] px-2 py-0.5 text-[13.5px] leading-[1.3] text-[#111113]">
          {query}
        </span>
      ) : null}

      <span className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-0.5">
        {query || hasValue ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label={t('newDraftOrder.customer.fields.customer.clear')}
                  onClick={() => {
                    setQuery('');
                    setActive(0);
                    setOpen(true);
                    inputRef.current?.focus();
                  }}
                  className={iconButtonClass}
                >
                  <CloseIcon size={14} />
                </button>
              }
            />
            <TooltipContent className="flex-col items-start gap-1">
              <strong className="font-semibold">
                {t('newDraftOrder.customer.fields.customer.clearTooltipTitle')}
              </strong>
              <span>
                {t('newDraftOrder.customer.fields.customer.clearTooltipDescription')}
              </span>
            </TooltipContent>
          </Tooltip>
        ) : null}
        <button
          type="button"
          tabIndex={-1}
          aria-label={t('newDraftOrder.customer.fields.customer.showAll')}
          aria-expanded={open}
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              setQuery('');
              openList();
              inputRef.current?.focus();
            }
          }}
          className={iconButtonClass}
        >
          <SelectChevronIcon className={cn('transition-transform', open && 'rotate-180')} />
        </button>
      </span>

      <div
        hidden={!open}
        className="absolute top-[calc(100%+8px)] right-0 left-0 z-140 flex max-h-80 flex-col overflow-hidden rounded-3xl border border-[#ECECEE] bg-white shadow-[0_28px_70px_-22px_rgba(15,15,15,.28),0_2px_8px_rgba(15,15,15,.06)] [[hidden]]:hidden"
      >
        <ul
          id={listId}
          role="listbox"
          aria-label={t('newDraftOrder.customer.fields.customer.listLabel')}
          className="m-0 flex min-h-0 flex-1 list-none flex-col overflow-y-auto p-0"
        >
        {matches.length ? (
          <>
            <li role="presentation" className="px-6 pt-4 pb-2.5 text-[11px] leading-normal font-semibold tracking-[0.08em] text-[#6B6B70] uppercase">
              {t('newDraftOrder.customer.fields.customer.recentAndOpenDrafts')}
            </li>
            {matches.map((customer, index) => {
              const selected = customer.id === value;
              return (
                // Options never take focus: keyboard focus stays in the combobox input, which handles arrows/Enter.
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                <li
                  key={customer.id}
                  id={`${listId}-${customer.id}`}
                  role="option"
                  aria-selected={selected}
                  aria-label={optionLabel(customer)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(customer)}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    'mx-3 flex cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2 text-[#111113] transition-[background] duration-150',
                    (index === active || selected) && 'bg-[#F7F7F8]',
                  )}
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex min-w-0 items-center gap-2">
                      <b className="truncate text-[13.5px] leading-[1.3] font-medium text-[#1B1B1D]">
                        {customer.name}
                      </b>
                      {customer.vip ? (
                        <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[#EFF0F3] px-2 text-[11px] leading-none font-medium text-[#5C5C61]">
                          {t('newDraftOrder.customer.vip')}
                        </span>
                      ) : null}
                    </span>
                    <span className="wrap-anywhere text-[11px] leading-normal text-[#6B6B70]">
                      {optionMeta(customer)}
                    </span>
                  </span>
                  {selected ? (
                    <span aria-hidden="true" className="shrink-0 text-[#111113]">
                      <CheckIcon strokeWidth={2} />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </>
        ) : (
          <li role="presentation" className="px-6 py-4 text-[13px] text-[#6B6B70]">
            {t('newDraftOrder.customer.fields.customer.noMatch', {query: query.trim()})}
          </li>
        )}
        </ul>
        {matches.length ? (
          <div className="shrink-0 border-t border-[#ECECEE] bg-white px-6 py-2.5 text-[11px] leading-normal text-[#6B6B70]">
            {t('newDraftOrder.customer.fields.customer.count', {count: matches.length})}
          </div>
        ) : null}
      </div>
    </div>
  );
}
