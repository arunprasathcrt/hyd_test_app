import {Check, Minus, TriangleAlert} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';
import type {WorkflowStageCode} from '../../../types/new-draft-order';
import {Fold, linkButtonClass, metaClass, STAGE_GO, STAGE_OWNER, STAGE_WHERE, type StageMark} from './shared';

export interface WorkflowFoldStage {
  code: WorkflowStageCode;
  n: number;
  state: 'passed' | 'na' | 'open';
  mark: StageMark;
}

interface Props {
  stages: WorkflowFoldStage[];
  cleared: number;
  quantity: number;
  minimum: number;
  remaining: number;
  short: boolean;
  open: boolean;
  onToggle: () => void;
  foldId: string;
  text: (key: string, options?: Record<string, unknown>) => string;
  stageName: (code: WorkflowStageCode) => string;
  markLabel: (mark: StageMark) => string;
}

/** The card's "Workflow status" fold — the nine stages rolled up for this card. */
export function ProductWorkflowFold({
  stages,
  cleared,
  quantity,
  minimum,
  remaining,
  short,
  open,
  onToggle,
  foldId,
  text,
  stageName,
  markLabel,
}: Props) {
  return (
    <Fold
      id={foldId}
      title={text('workflowTitle')}
      summary={text('workflowSummary', {cleared, total: stages.length})}
      open={open}
      onToggle={onToggle}
    >
      <ol className="m-0 flex list-none flex-col p-0">
        {stages.map((stage, order) => {
          const where = STAGE_WHERE[stage.code];
          const owner = STAGE_OWNER[stage.code];
          const note =
            stage.code === 'quantity' && short
              ? text('stageShort', {
                  total: quantity,
                  moq: minimum,
                  remaining,
                  source: text('moqSourceProgram'),
                })
              : stage.state === 'na'
                ? text('stageNa')
                : '';
          return (
            <li
              key={stage.code}
              className={cn(
                'grid grid-cols-[24px_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2.5 border-t border-[#ECECEE] py-2.5 max-[599.98px]:grid-cols-[24px_minmax(0,1fr)]',
                order === 0 && 'border-t-0 pt-1',
              )}
            >
              <span
                role="img"
                aria-label={markLabel(stage.mark)}
                className={cn(
                  'inline-flex size-[22px] items-center justify-center rounded-full',
                  stage.mark === 'done' && 'bg-[#EEF6F1] text-[#1F7A4D]',
                  stage.mark === 'flag' && 'bg-[#FFF6E5] text-[#B26A00]',
                  (stage.mark === 'prog' || stage.mark === 'na') &&
                    'bg-[#F7F7F8] text-[#6B6B70]',
                )}
              >
                {stage.mark === 'done' ? (
                  <Check size={14} aria-hidden="true" />
                ) : stage.mark === 'na' ? (
                  <Minus size={14} aria-hidden="true" />
                ) : stage.mark === 'flag' ? (
                  <TriangleAlert size={14} aria-hidden="true" />
                ) : (
                  <i className="block size-2 rounded-full bg-[#6B6B70]" />
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5 text-xs font-normal leading-normal">
                <b
                  className={cn(
                    'text-[13px]',
                    stage.mark === 'na'
                      ? 'font-medium text-[#5C5C61]'
                      : 'font-semibold text-[#111113]',
                  )}
                >
                  {text('stageTitle', {n: stage.n, name: stageName(stage.code)})}
                </b>
                {stage.code === 'final_approval' && (
                  <span className="text-[#6B6B70]">
                    {text('stageSubFinalApproval')}
                  </span>
                )}
                {note && <span className="break-words text-[#5C5C61]">{note}</span>}
                {stage.state === 'passed' && (
                  <span className="text-[#6B6B70]">{text('stageChecked')}</span>
                )}
                {stage.state === 'open' && (
                  <span className="text-[#6B6B70]">
                    {where === owner
                      ? text('stageWorkedIn', {where: text(`where.${where}`)})
                      : text('stageWorkedInOwner', {
                          where: text(`where.${where}`),
                          owner: text(`owner.${owner}`),
                        })}
                  </span>
                )}
              </div>
              {/* ❓ TO CONFIRM — the stage drawers and queues are not built yet */}
              <div className="flex flex-col items-end gap-0.5 max-[599.98px]:col-start-2 max-[599.98px]:flex-row max-[599.98px]:flex-wrap max-[599.98px]:items-start max-[599.98px]:gap-x-3">
                <Button type="button" variant="ghost" shape="square" disabled className={linkButtonClass}>
                  {text('stageOpen')}
                </Button>
                {STAGE_GO[stage.code] && (
                  <Button type="button" variant="ghost" shape="square" disabled className={linkButtonClass}>
                    {text('stageGoTo', {where: text(`where.${where}`)})}
                  </Button>
                )}
                {stage.code === 'inventory' && (
                  <Button type="button" variant="ghost" shape="square" disabled className={linkButtonClass}>
                    {text('stageViewAvailability')}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className={metaClass}>{text('workflowNote')}</p>
    </Fold>
  );
}
