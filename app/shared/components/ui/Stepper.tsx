import {createContext, forwardRef, useContext, type ComponentPropsWithoutRef} from 'react';
import {Check} from 'lucide-react';
import {cn} from '~/shared/utils/cn';

const INDICATOR_STATES = {
  done: 'border-[#111113] bg-[#111113] text-white',
  current: 'border-[#111113] bg-white text-[#111113]',
  next: 'border-[#D7D7DA] bg-white text-[#6B6B70]',
  later: 'border-[#D7D7DA] bg-white text-[#6B6B70]',
} as const;

export type StepperItemState = keyof typeof INDICATOR_STATES;

const StepperItemStateContext = createContext<StepperItemState>('later');

export interface StepperItemProps extends ComponentPropsWithoutRef<'li'> {
  /**
   * Progress of the step.
   * - `done`: finished; the indicator shows a check and the connector is filled.
   * - `current`: in progress; marked with `aria-current="step"`.
   * - `next`: the step after the current one; the label is muted.
   * - `later`: any step after that; the label is muted.
   */
  state: StepperItemState;
}

/**
 * Reusable horizontal progress tracker: numbered circles joined by a connector,
 * with a label and optional caption under each. Renders an `<ol>`; steps share the width equally.
 *
 * Pass:
 * - a translated `aria-label` on `Stepper` naming the process.
 * - `state` on each `StepperItem`.
 *
 * Compose with:
 * - `StepperItem` for each step. The connector to the next step is drawn for you and hidden on the last one.
 * - `StepperIndicator` for the circle; pass the step number as children. Done steps show a check instead.
 * - `StepperLabel` for the step name.
 * - `StepperDescription` for a caption, such as a date.
 *
 * Use `className` for layout only, such as margin or gap.
 * Do not use it to replace the shared color or size styles.
 *
 * @example
 * <Stepper aria-label={t('detail.track.title')}>
 *   {order.steps.map((step, index) => (
 *     <StepperItem key={step.key} state={step.state}>
 *       <StepperIndicator>{index + 1}</StepperIndicator>
 *       <StepperLabel>{t(`detail.steps.labels.${step.key}`)}</StepperLabel>
 *       <StepperDescription>{fmt.day(step.date)}</StepperDescription>
 *     </StepperItem>
 *   ))}
 * </Stepper>
 */
const Stepper = forwardRef<HTMLOListElement, ComponentPropsWithoutRef<'ol'>>(
  ({className, ...props}, ref) => (
    <ol ref={ref} className={cn('flex items-start gap-2', className)} {...props} />
  ),
);
Stepper.displayName = 'Stepper';

const StepperItem = forwardRef<HTMLLIElement, StepperItemProps>(
  ({children, className, state, ...props}, ref) => (
    <StepperItemStateContext.Provider value={state}>
      <li
        ref={ref}
        aria-current={state === 'current' ? 'step' : undefined}
        className={cn('group/step relative flex flex-1 flex-col items-center gap-2 text-center', className)}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-[13px] right-[calc(-50%+12px)] left-[calc(50%+12px)] h-[2px] group-last/step:hidden',
            state === 'done' ? 'bg-[#111113]' : 'bg-[#ECECEE]',
          )}
        />
        {children}
      </li>
    </StepperItemStateContext.Provider>
  ),
);
StepperItem.displayName = 'StepperItem';

const StepperIndicator = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(
  ({children, className, ...props}, ref) => {
    const state = useContext(StepperItemStateContext);
    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={cn(
          'z-10 flex size-7 items-center justify-center rounded-full border-2 text-[12px] font-semibold leading-none',
          INDICATOR_STATES[state],
          className,
        )}
        {...props}
      >
        {state === 'done' ? <Check aria-hidden="true" size={14} strokeWidth={1.8} /> : children}
      </span>
    );
  },
);
StepperIndicator.displayName = 'StepperIndicator';

const StepperLabel = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(
  ({className, ...props}, ref) => {
    const state = useContext(StepperItemStateContext);
    return (
      <span
        ref={ref}
        className={cn(
          'text-[13px] leading-[1.35]',
          state === 'current' ? 'font-semibold' : 'font-medium',
          state === 'next' || state === 'later' ? 'text-[#5C5C61]' : 'text-[#111113]',
          className,
        )}
        {...props}
      />
    );
  },
);
StepperLabel.displayName = 'StepperLabel';

const StepperDescription = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'>>(
  ({className, ...props}, ref) => {
    const state = useContext(StepperItemStateContext);
    return (
      <span
        ref={ref}
        className={cn(
          '-mt-1.5 text-[12px] font-medium',
          state === 'next' ? 'text-[#5C5C61]' : 'text-[#6B6B70]',
          className,
        )}
        {...props}
      />
    );
  },
);
StepperDescription.displayName = 'StepperDescription';

export {Stepper, StepperItem, StepperIndicator, StepperLabel, StepperDescription};
