import {useTranslation} from 'react-i18next';
import type {ProductCardTabId} from '../types';

type WorkflowStatusType = 'cleared' | 'current' | 'pending';

interface WorkflowStep {
  id: ProductCardTabId;
  number: string;
  labelKey: string;
  status: WorkflowStatusType;
}

interface ProductWorkflowStatusProps {
  onSelectTab: (tabId: ProductCardTabId) => void;
}

const workflowSteps: WorkflowStep[] = [
  {id: 'approvals', number: '01', labelKey: 'customerArtQuotes', status: 'cleared'},
  {id: 'production', number: '02', labelKey: 'artProduction', status: 'current'},
  {id: 'licensing', number: '03', labelKey: 'license', status: 'pending'},
  {id: 'approvals', number: '04', labelKey: 'salesProduction', status: 'pending'},
  {id: 'inventory', number: '05', labelKey: 'inventory', status: 'pending'},
  {id: 'approvals', number: '06', labelKey: 'capacity', status: 'pending'},
  {id: 'overview', number: '07', labelKey: 'pricing', status: 'pending'},
  {id: 'approvals', number: '08', labelKey: 'financial', status: 'pending'},
];

export function ProductWorkflowStatus({onSelectTab}: ProductWorkflowStatusProps) {
  const {t} = useTranslation('productCardDrawer');
  const currentStep = t('workflow.steps.artProduction');
  return (
    <div className="hidden flex-1 rounded-lg border border-[#ECECEE] bg-[#fcfcfb] p-3 lg:block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#8E8E93]">
          {t('workflow.title')}
        </span>
        <span className="text-[10px] font-bold text-[#7A5B16]">
          {t('workflow.currentStep', {number: '2', label: currentStep})}
        </span>
        <span className="text-[10px] text-[#8E8E93]">{t('workflow.clearedCount', {count: 1, total: workflowSteps.length})}</span>
      </div>

      <div className="flex min-w-[650px]">
        {workflowSteps.map((step, index) => {
          const isCleared = step.status === 'cleared';
          const isCurrent = step.status === 'current';

          return (
            <button
              key={`${step.number}-${step.labelKey}`}
              type="button"
              title={`${step.number}. ${t(`workflow.steps.${step.labelKey}`)} · ${t(`workflow.status.${step.status}`)}`}
              onClick={() => onSelectTab(step.id)}
              className="group relative min-w-0 flex-1 cursor-pointer border-0 bg-transparent px-0 text-center"
            >
              {index > 0 ? (
                <span className={`absolute left-0.5 right-1/2 top-[11px] h-0.5 ${index <= 1 ? 'bg-[#2E5944]' : 'bg-[#ECECEE]'}`} />
              ) : null}
              {index < workflowSteps.length - 1 ? (
                <span className={`absolute left-1/2 right-0.5 top-[11px] h-0.5 ${isCleared ? 'bg-[#2E5944]' : 'bg-[#ECECEE]'}`} />
              ) : null}

              <span className={`relative z-10 mx-auto flex h-[25px] w-[25px] items-center justify-center rounded-full text-[9px] font-medium ${isCleared ? 'bg-[#2E5944] text-white' : isCurrent ? 'bg-[#C99700] text-white' : 'bg-[#F1F1F1] text-[#9AA0A6]'}`}>
                {isCleared ? '✓' : isCurrent ? (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#C99700] opacity-50" />
                    <span className="relative z-10">{step.number}</span>
                  </>
                ) : step.number}
              </span>

              <span className={`mx-auto mt-[5px] block max-w-[105px] truncate text-[8px] leading-[1.15] ${isCurrent ? 'font-bold text-[#7A5B16]' : isCleared ? 'font-medium text-[#111113]' : 'font-medium text-[#9AA0A6]'}`}>
                {t(`workflow.steps.${step.labelKey}`)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
