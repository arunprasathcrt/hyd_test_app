export type ProgressStepState = 'done' | 'current' | 'upcoming';

export interface ProgressStep {
  id: string;
  label: string;
  state: ProgressStepState;
}

export interface OrderProgressBarProps {
  steps: ProgressStep[];
  className?: string;
}

/** "Pizza tracker": dots joined by a connecting line, with a label under each. */
export function OrderProgressBar({steps, className}: OrderProgressBarProps) {
  return (
    <div
      className={`flex items-start gap-0 rounded-xl border border-[#EAEAEA] bg-white px-6 py-[22px] ${className ?? ''}`}
    >
      {steps.map((step, index) => (
        <div key={step.id} className="relative flex flex-1 flex-col items-center gap-2">
          {index < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className={`absolute top-[13px] left-[calc(50%+16px)] right-[calc(-50%+16px)] h-[2px] ${
                step.state === 'done' ? 'bg-[#10B981]' : 'bg-[#DDDDDD]'
              }`}
            />
          ) : null}

          <span
            aria-hidden="true"
            className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-semibold ${
              step.state === 'done'
                ? 'border-[#10B981] bg-[#10B981] text-white'
                : step.state === 'current'
                  ? 'border-[#8B5CF6] bg-[#8B5CF6] text-white'
                  : 'border-[#DDDDDD] bg-[#F0F0F0] text-[#8B8B8B]'
            }`}
          >
            {step.state === 'done' ? <ProgressDoneIcon /> : index + 1}
          </span>

          <span
            className={`whitespace-nowrap text-center text-[12px] font-medium ${
              step.state === 'current'
                ? 'font-semibold text-[#0F0F0F]'
                : step.state === 'upcoming'
                  ? 'text-[#8B8B8B]'
                  : 'text-[#0F0F0F]'
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ProgressDoneIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
