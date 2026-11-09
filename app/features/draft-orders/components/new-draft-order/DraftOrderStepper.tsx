import {useEffect, useId, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {cn} from '~/shared/utils/cn';
import {STEP_ORDER, issueLabel} from '../../lib/new-draft-order';
import {CheckIcon} from '../icons/CheckIcon';
import {ChevronDownIcon} from '../icons/ChevronDownIcon';
import {Tooltip, TooltipContent, TooltipTrigger} from '~/shared/components/ui/Tooltip';
import type {
  DraftOrderIssue,
  DraftOrderStep,
  NewDraftOrderValues,
} from '../../types/new-draft-order';

type StepState = 'done' | 'current' | 'upcoming';

interface Props {
  current: DraftOrderStep;
  issues: DraftOrderIssue[];
  productCount: number;
  orderType: NewDraftOrderValues['orderType'];
  /** Ship-to summary for the compact menu, e.g. the first location's name. */
  shipToName: string;
  shipToCount: number;
  onSelect: (step: DraftOrderStep) => void;
}

function stateOf(step: DraftOrderStep, current: DraftOrderStep): StepState {
  const i = STEP_ORDER.indexOf(step);
  const c = STEP_ORDER.indexOf(current);
  if (i === c) return 'current';
  return i < c ? 'done' : 'upcoming';
}

/**
 * Prototype `.do112-stepper` (over 768 px) and `.do112-stepmenu` (768 px and
 * under). Navigation is free: any step can be opened at any time.
 */
export function DraftOrderStepper({
  current,
  issues,
  orderType,
  productCount,
  shipToName,
  shipToCount,
  onSelect,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const total = STEP_ORDER.length;
  const currentIndex = STEP_ORDER.indexOf(current);
  const issuesOf = (step: DraftOrderStep) => issues.filter((issue) => issue.step === step);
  const isCompleted = (step: DraftOrderStep) => {
    const index = STEP_ORDER.indexOf(step);
    return index < currentIndex && issuesOf(step).length === 0;
  };
  const issueText = (step: DraftOrderStep) =>
    issuesOf(step)
      .map((issue) => issueLabel(t, issue))
      .join(', ');

  return (
    <>
      <nav
        aria-label={t('newDraftOrder.stepper.ariaLabel')}
        className="mb-5 min-w-0 max-[768px]:hidden"
      >
        <ol className="m-0 grid list-none grid-cols-5 gap-0 p-0">
          {STEP_ORDER.map((step, index) => {
            const state = stateOf(step, current);
            const prevDone = index > 0 && isCompleted(STEP_ORDER[index - 1]);
            const attentionCount = issuesOf(step).length;
            const count = state === 'upcoming' ? 0 : attentionCount;
            const showAttentionTooltip = state !== 'upcoming' && attentionCount > 0;
            const completed = isCompleted(step);
            const label = t(`newDraftOrder.steps.${step}.label`);
            const ariaParts = [
              t('newDraftOrder.stepper.stepAriaLabel', {n: index + 1, total, label}),
              state === 'current' ? t('newDraftOrder.stepper.currentStep') : null,
              completed ? t('newDraftOrder.stepper.completedStep') : null,
              attentionCount
                ? t('newDraftOrder.stepper.attention', {
                    count: attentionCount,
                    items: issueText(step),
                  })
                : null,
            ].filter(Boolean);

            return (
              <li
                key={step}
                className={cn(
                  'relative min-w-0',
                  index > 0 &&
                    "before:absolute before:top-5 before:right-[calc(50%+22px)] before:left-[calc(-50%+22px)] before:h-px before:content-['']",
                  index > 0 &&
                    (prevDone ? 'before:bg-[#111113]' : 'before:bg-[#D7D7DA]'),
                )}
              >
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-current={state === 'current' ? 'step' : undefined}
                        aria-label={ariaParts.join(', ')}
                        onClick={() => onSelect(step)}
                        className={cn(
                          'flex min-h-10 w-full cursor-pointer flex-col items-center gap-2 rounded-[10px] border-0 bg-transparent px-0.5 py-1 text-center transition-colors duration-[120ms] hover:text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]',
                          state === 'current' ? 'text-[#111113]' : 'text-[#5C5C61]',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'relative box-border inline-flex size-8 items-center justify-center rounded-full text-[13px] font-semibold tabular-nums',
                            state === 'current' &&
                              'border-2 border-[#111113] bg-[#F7F7F8] text-[#111113]',
                            state === 'done' &&
                              'border border-[#111113] bg-[#111113] text-white',
                            state === 'upcoming' &&
                              'border border-[#D7D7DA] bg-white text-[#5C5C61]',
                          )}
                        >
                          {completed ? <CheckIcon size={14} strokeWidth={2.6} /> : index + 1}
                          {count ? (
                            <i className="absolute -top-[7px] -right-[9px] box-border inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#6B4A0B] px-1 text-xs leading-none font-semibold text-white not-italic tabular-nums shadow-[0_0_0_2px_#FFFFFF]">
                              {count}
                            </i>
                          ) : null}
                        </span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            'max-w-full text-[12.5px] leading-[1.35] [overflow-wrap:anywhere]',
                            state === 'current' ? 'font-semibold' : 'font-medium',
                          )}
                        >
                          {label}
                        </span>
                      </button>
                    }
                  />
                  {showAttentionTooltip ? (
                    <TooltipContent className="flex-col items-start gap-1.5">
                      <strong className="font-semibold">
                        {t('newDraftOrder.stepper.tooltip.needsAttention')}
                      </strong>
                      <span>
                        {t('newDraftOrder.stepper.attention', {
                          count: attentionCount,
                          items: issueText(step),
                        })}
                      </span>
                    </TooltipContent>
                  ) : null}
                </Tooltip>
              </li>
            );
          })}
        </ol>
      </nav>

      <CompactStepMenu
        current={current}
        issues={issues}
        summaryOf={(step) => {
          if (step === 'customer') {
            const count = issuesOf(step).length;
            return count
              ? t('newDraftOrder.stepMenu.attention', {
                  count,
                  items: issueText(step),
                })
              : '';
          }
          if (step === 'type') {
            return orderType
              ? t(`newDraftOrder.orderType.options.${orderType}.title`)
              : t('newDraftOrder.stepMenu.notChosen');
          }
          if (step === 'products')
            return productCount
              ? t('newDraftOrder.products.productCount', {count: productCount})
              : t('newDraftOrder.stepMenu.noProducts');
          if (step === 'ship')
            return t('newDraftOrder.stepMenu.shipSummary', {
              name: shipToName,
              count: shipToCount,
            });
          return t('newDraftOrder.stepMenu.notStarted');
        }}
        onSelect={onSelect}
      />
    </>
  );
}

function CompactStepMenu({
  current,
  issues,
  summaryOf,
  onSelect,
}: {
  current: DraftOrderStep;
  issues: DraftOrderIssue[];
  summaryOf: (step: DraftOrderStep) => string;
  onSelect: (step: DraftOrderStep) => void;
}) {
  const {t} = useTranslation('newDraftOrder');
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const total = STEP_ORDER.length;
  const currentIndex = STEP_ORDER.indexOf(current);
  const issuesOf = (step: DraftOrderStep) => issues.filter((issue) => issue.step === step);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (
        event instanceof KeyboardEvent
          ? event.key === 'Escape'
          : !rootRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative mb-4 hidden max-[768px]:block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-[#D7D7DA] bg-white px-4 text-[13px] leading-[1.2] font-medium whitespace-nowrap text-[#111113] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
      >
        <span>
          {t('newDraftOrder.stepMenu.trigger', {
            n: currentIndex + 1,
            total,
            label: t(`newDraftOrder.steps.${current}.label`),
          })}
        </span>
        <ChevronDownIcon />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-label={t('newDraftOrder.stepMenu.ariaLabel')}
        hidden={!open}
        className="absolute top-[calc(100%+8px)] right-0 left-0 z-[140] flex flex-col gap-0.5 rounded-2xl border border-[#ECECEE] bg-white p-1.5 shadow-[0_28px_70px_-22px_rgba(15,15,15,.28),0_2px_8px_rgba(15,15,15,.06)] [&[hidden]]:hidden"
      >
        {STEP_ORDER.map((step, index) => {
          const checked = step === current;
          const done = index < currentIndex;
          const completed = done && issuesOf(step).length === 0;
          const summary = summaryOf(step);
          return (
            <button
              key={step}
              type="button"
              role="menuitemradio"
              aria-checked={checked}
              onClick={() => {
                setOpen(false);
                onSelect(step);
              }}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[10px] border-0 bg-transparent px-2.5 py-1.5 text-left text-[#111113] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0E6E6E] aria-checked:bg-[#F7F7F8]"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative inline-flex h-8 flex-[0_0_32px] items-center justify-center rounded-[10px] text-[13px] font-semibold',
                  done ? 'bg-[#111113] text-white' : 'bg-[#F7F7F8] text-[#5C5C61]',
                )}
              >
                {completed ? <CheckIcon size={14} strokeWidth={2.6} /> : index + 1}
              </span>
              <span className="flex min-w-0 flex-col">
                <b className="text-[13.5px] font-medium">
                  {t(`newDraftOrder.steps.${step}.label`)}
                </b>
                {summary ? (
                  <span className="text-xs text-[#5C5C61] [overflow-wrap:anywhere]">
                    {summary}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

