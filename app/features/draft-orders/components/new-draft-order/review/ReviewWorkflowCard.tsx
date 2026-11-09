import {useTranslation} from 'react-i18next';
import {useRevalidator} from 'react-router';
import {useState} from 'react';
import {WorkflowStageDrawer} from './WorkflowStageDrawer';
import {Button} from '~/shared/components/ui/Button';
import {Tooltip, TooltipContent, TooltipTrigger} from '~/shared/components/ui/Tooltip';
import type {
  DraftOrderReviewLine,
  NewDraftOrderCustomer,
  WorkflowStage,
} from '../../../types/new-draft-order';
import {BuilderCard, BuilderCardTitle, BuilderTag} from '../BuilderFields';

interface ReviewWorkflowCardProps {
  workflow: WorkflowStage[];
  lines: DraftOrderReviewLine[];
  customer?: NewDraftOrderCustomer;
  orderId?: string;
  inHandsDate: string;
  soonestInHands: string;
  orderTotal: number;
  discountCodes: string[];
  version: number;
  finalArtLocked: boolean;
  quantitiesLocked: boolean;
  onLock: (kind: 'art' | 'quantity', locked: boolean) => void;
}

export function ReviewWorkflowCard({
  workflow,
  lines,
  customer,
  orderId,
  inHandsDate,
  soonestInHands,
  orderTotal,
  discountCodes,
  version,
  finalArtLocked,
  quantitiesLocked,
  onLock,
}: ReviewWorkflowCardProps) {
  const {t} = useTranslation('newDraftOrder');
  const revalidator = useRevalidator();
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [licenseReopened, setLicenseReopened] = useState(false);
  const [approvedFinalLineIds, setApprovedFinalLineIds] = useState<string[]>([]);
  const displayWorkflow = workflow.map((stage) => {
    if (stage.code !== 'final_approval') return stage;
    if (lines.length > 0 && approvedFinalLineIds.length === lines.length) {
      return {...stage, state: 'passed' as const};
    }
    if (licenseReopened || approvedFinalLineIds.length > 0) {
      return {...stage, state: 'active' as const};
    }
    return stage;
  });
  const activeStage = activeStageIndex === null ? null : displayWorkflow[activeStageIndex] ?? null;
  const cleared = displayWorkflow.filter((stage) => stage.state === 'passed').length;
  const nextStage = displayWorkflow.find((stage) => stage.state !== 'passed');

  return (
    <BuilderCard aria-label={t('newDraftOrder.review.workflow.title')}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <BuilderCardTitle
            title={t('newDraftOrder.review.workflow.title')}
            sub={
              nextStage
                ? t('newDraftOrder.review.workflow.progress', {
                    cleared,
                    total: workflow.length,
                    stage: t(`newDraftOrder.overview.stages.${nextStage.code}`),
                  })
                : t('newDraftOrder.review.workflow.allCleared', {
                    cleared,
                    total: workflow.length,
                  })
            }
          />
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => void revalidator.revalidate()}
                disabled
                className="inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[8px] border border-[#D7D7DA] bg-white px-3 text-xs font-medium text-[#111113] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E] disabled:cursor-wait disabled:opacity-60"
              />
            }
          >
            {t('newDraftOrder.review.workflow.refresh')}
          </TooltipTrigger>
          <TooltipContent side="top" align="center" className="flex-col items-start gap-1.5">
            <strong className="font-semibold text-white">
              {t('newDraftOrder.review.workflow.refresh')}
            </strong>
            <span className="text-[#B6B6BB]">
              {t('newDraftOrder.review.workflow.refreshHelp')}
            </span>
          </TooltipContent>
        </Tooltip>
      </header>
      <ol className="m-0 grid list-none grid-cols-3 gap-2 p-0 max-[1100px]:grid-cols-2 max-[759.98px]:grid-cols-1">
        {displayWorkflow.map((stage, index) => {
          const stageName = t(`newDraftOrder.overview.stages.${stage.code}`);
          const stateLabel = t(`newDraftOrder.overview.stageStates.${stage.state}`);
          const startNote = t(
            index < 2
              ? 'newDraftOrder.review.workflow.startsOnSend'
              : 'newDraftOrder.review.workflow.startsAfterApproval',
          );
          const stageDescription = stage.code === 'final_approval'
            ? t('newDraftOrder.review.workflow.finalApprovalNote')
            : startNote;
          return (
            <li key={stage.code} className="min-w-0">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      shape="md"
                      aria-label={t('newDraftOrder.review.workflow.stageAriaLabel', {
                        n: index + 1,
                        name: stageName,
                        state: stateLabel,
                        note: startNote,
                      })}
                      onClick={() => {
                        if (orderId) setActiveStageIndex(index);
                      }}
                      className="h-full min-h-[170px] w-full cursor-pointer flex-col items-stretch justify-start gap-0 rounded-[8px] px-3 py-2.5 text-left font-normal whitespace-normal transition-[border-color,background-color,box-shadow] duration-150 hover:border-[#D7D7DA] hover:bg-[#F5F5F6] hover:shadow-[0_4px_14px_rgba(17,17,19,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
                    />
                  }
                >
                  <div className="flex w-full items-center justify-start gap-3">
                    <span className="shrink-0 text-xs font-semibold text-[#6B6B70] tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <BuilderTag tone={stage.state === 'blocked' ? 'warn' : 'neutral'}>
                      {stateLabel}
                    </BuilderTag>
                  </div>
                  <b className="mt-2 block w-full text-[13.5px] leading-[1.35] font-semibold text-[#111113]">
                    {stageName}
                  </b>
                  {stage.code === 'final_approval' ? (
                    <p className="mt-1 mb-0 w-full text-left text-xs leading-[1.5] text-[#5C5C61]">
                      {t('newDraftOrder.review.workflow.finalApprovalNote')}
                    </p>
                  ) : null}
                  <p className="mt-1 mb-0 w-full text-left text-xs leading-[1.5] text-[#5C5C61]">
                    {startNote}
                  </p>
                  {stage.owner && stage.team ? (
                    <p className="mt-2 mb-0 w-full text-left text-xs leading-[1.5] text-[#6B6B70]">
                      {t('newDraftOrder.review.workflow.owner', {
                        owner: stage.owner,
                        team: stage.team,
                      })}
                    </p>
                  ) : stage.automatic ? (
                    <p className="mt-2 mb-0 w-full text-left text-xs leading-[1.5] text-[#6B6B70]">
                      {t('newDraftOrder.review.workflow.automatic')}
                    </p>
                  ) : null}
                  <p className="mt-1 mb-0 w-full text-left text-xs leading-[1.5] text-[#6B6B70]">
                    {t('newDraftOrder.review.workflow.predecessor')}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="flex-col items-start gap-1.5">
                  {orderId ? (
                    <>
                      <strong className="font-semibold text-white">
                        {t('newDraftOrder.review.workflow.stepTooltipTitle', {
                          step: index + 1,
                          title: stageName,
                        })}
                      </strong>
                      <span className="line-clamp-2 max-w-xs whitespace-normal text-[#B6B6BB]">
                        {t('newDraftOrder.review.workflow.stageTooltipDescription', {
                          description: stageDescription,
                          opens: t('newDraftOrder.review.workflow.opensStageTooltip'),
                        })}
                      </span>
                    </>
                  ) : (
                    t('newDraftOrder.review.workflow.saveDraftTooltip')
                  )}
                </TooltipContent>
              </Tooltip>
            </li>
          );
        })}
      </ol>
      {activeStage ? <WorkflowStageDrawer
        stage={activeStage}
        index={activeStageIndex ?? 0}
        total={workflow.length}
        lines={lines}
        customer={customer}
        orderId={orderId}
        inHandsDate={inHandsDate}
        soonestInHands={soonestInHands}
        orderTotal={orderTotal}
        discountCodes={discountCodes}
        version={version}
        finalArtLocked={finalArtLocked}
        quantitiesLocked={quantitiesLocked}
        onLock={onLock}
        onLicenseArtChanged={() => {
          setLicenseReopened(true);
          setApprovedFinalLineIds([]);
        }}
        approvedFinalLineIds={approvedFinalLineIds}
        onApproveFinalLine={(lineId) => {
          setApprovedFinalLineIds((current) =>
            current.includes(lineId) ? current : [...current, lineId],
          );
        }}
        onApproveAllFinalLines={() =>
          setApprovedFinalLineIds(lines.map((line) => line.id))
        }
        onClose={() => setActiveStageIndex(null)}
      /> : null}
    </BuilderCard>
  );
}
