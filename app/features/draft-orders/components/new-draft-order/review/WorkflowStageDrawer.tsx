import {useState} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {Check, X} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Button} from '~/shared/components/ui/Button';
import {toast} from '~/shared/components/ui/Toast';
import type {
  DraftOrderReviewLine,
  NewDraftOrderCustomer,
  WorkflowStage,
} from '../../../types/new-draft-order';

interface WorkflowStageDrawerProps {
  stage: WorkflowStage | null;
  index: number;
  total: number;
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
  onLicenseArtChanged: () => void;
  approvedFinalLineIds: string[];
  onApproveFinalLine: (lineId: string) => void;
  onApproveAllFinalLines: () => void;
  onClose: () => void;
}

export function WorkflowStageDrawer({
  stage,
  index,
  total,
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
  onLicenseArtChanged,
  approvedFinalLineIds,
  onApproveFinalLine,
  onApproveAllFinalLines,
  onClose,
}: WorkflowStageDrawerProps) {
  const {t} = useTranslation('newDraftOrder');
  const isCustomerArt = stage?.code === 'customer_art';
  const isQuantityApproval = stage?.code === 'quantity';
  const isArtProduction = stage?.code === 'art_production';
  const isLicense = stage?.code === 'license';
  const isFinalApproval = stage?.code === 'final_approval';
  const isInventory = stage?.code === 'inventory';
  const isCapacity = stage?.code === 'capacity';
  const isPricing = stage?.code === 'pricing';
  const isFinancial = stage?.code === 'financial';
  const [licenseLineIndex, setLicenseLineIndex] = useState('0');
  const [licenseArtChanged, setLicenseArtChanged] = useState(false);
  const [finalApprovalNote, setFinalApprovalNote] = useState('');
  const [atpLineIndex, setAtpLineIndex] = useState<number | null>(null);
  const approvedCount = 0;
  const finalApprovedCount = approvedFinalLineIds.length;
  const lockedCount = quantitiesLocked ? lines.length : 0;
  const licensingReadyCount = 0;
  const totalUnits = lines.reduce((total, line) => total + line.quantity, 0);
  const stateLabel = stage
    ? t(`newDraftOrder.overview.stageStates.${stage.state}`)
    : '';
  const stageName = stage
    ? t(`newDraftOrder.overview.stages.${stage.code}`)
    : '';
  const timing = t('newDraftOrder.review.workflow.startsAfterPrevious');
  const formatDate = (value: string) =>
    value
      ? t('newDraftOrder.review.workflow.drawer.formattedDate', {
          date: new Date(`${value}T00:00:00`),
          formatParams: {date: {dateStyle: 'medium'}},
        })
      : t('newDraftOrder.overview.notSet');
  const capacityPace = inHandsDate && soonestInHands
    ? t(
        inHandsDate >= soonestInHands
          ? 'newDraftOrder.review.workflow.drawer.onTrack'
          : 'newDraftOrder.review.workflow.drawer.atRisk',
      )
    : t('newDraftOrder.overview.notSet');

  return (
    <Dialog.Root
      open={stage !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1200] bg-[rgba(17,17,19,.42)] transition-opacity duration-[220ms] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        {stage ? (
          <Dialog.Popup
            data-stage={stage.code}
            className={`fixed inset-y-0 right-0 z-[1200] m-0 flex h-dvh ${isArtProduction || isLicense || isInventory || isPricing ? 'w-[min(630px,100%)]' : 'w-[min(780px,100%)]'} translate-x-0 flex-col overflow-hidden border-y-0 border-r-0 border-l border-[#E7E7E9] bg-white font-sans text-[13px] leading-[1.5] text-[#111113] shadow-[-24px_0_64px_rgba(17,17,19,.18)] transition-transform duration-300 ease-out data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full max-[720px]:w-full`}
          >
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#ECECEE] px-7 pt-6 pb-4 max-[720px]:px-4">
              <div className="min-w-0" tabIndex={-1}>
                <div className="text-[12px] leading-[1.5] font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                  {t('newDraftOrder.review.workflow.drawer.stage', {
                    current: index + 1,
                    total,
                  })}
                </div>
                <Dialog.Title className="mt-1 mb-2 text-[22px] leading-[1.3] font-semibold text-[#111113]">
                  {stageName}
                </Dialog.Title>
                <span
                  className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-medium ${
                    stage.state === 'queued'
                      ? 'bg-[#FFF5E5] text-[#8A5A10]'
                      : stage.state === 'passed'
                        ? 'bg-[#EAF5EF] text-[#246B45]'
                        : stage.state === 'blocked'
                          ? 'bg-[#FDEDED] text-[#A02020]'
                          : 'bg-[#F2F2F3] text-[#5C5C61]'
                  }`}
                >
                  {stateLabel}
                </span>
              </div>
              <Dialog.Close
                aria-label={t('newDraftOrder.review.workflow.drawer.close')}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#6B6B70] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
              >
                <X aria-hidden="true" size={18} strokeWidth={1.8} />
              </Dialog.Close>
            </header>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-7 py-5 max-[720px]:px-4">
              <section>
                {isArtProduction ? null : (
                  <p className="m-0 text-[13px] leading-[1.5] text-[#5C5C61]">
                    {t(
                      isCustomerArt
                        ? 'newDraftOrder.review.workflow.drawer.customerArtDescription'
                        : isQuantityApproval
                          ? 'newDraftOrder.review.workflow.drawer.quantityDescription'
                          : isLicense
                            ? 'newDraftOrder.review.workflow.drawer.licenseDescription'
                              : isFinalApproval
                                ? 'newDraftOrder.review.workflow.drawer.finalApprovalDescription'
                                : isInventory
                                  ? 'newDraftOrder.review.workflow.drawer.inventoryDescription'
                                  : isCapacity
                                    ? 'newDraftOrder.review.workflow.drawer.capacityDescription'
                                    : isPricing
                                      ? 'newDraftOrder.review.workflow.drawer.pricingDescription'
                                      : isFinancial
                                        ? 'newDraftOrder.review.workflow.drawer.financialDescription'
                          : 'newDraftOrder.review.workflow.drawer.description',
                    )}
                  </p>
                )}
                <div className="mt-3 flex flex-col gap-1 rounded-xl bg-[#F7F7F8] px-3.5 py-3">
                  <b className="text-[13px] font-semibold text-[#111113]">{stateLabel}</b>
                  <span className="text-[13px] text-[#6B6B70]">
                    {isCustomerArt
                      ? t('newDraftOrder.review.workflow.drawer.approvalCount', {
                          approved: approvedCount,
                          total: lines.length,
                        })
                      : isQuantityApproval
                        ? t('newDraftOrder.review.workflow.drawer.lockedCount', {
                            locked: lockedCount,
                            total: lines.length,
                          })
                        : isLicense
                          ? t('newDraftOrder.review.workflow.drawer.licensingReadyCount', {
                              ready: licensingReadyCount,
                              total: lines.length,
                            })
                          : isFinalApproval
                            ? t('newDraftOrder.review.workflow.drawer.approvalCount', {
                                approved: finalApprovedCount,
                                total: lines.length,
                              })
                            : isInventory
                              ? t('newDraftOrder.review.workflow.startsAfterApproval')
                              : isCapacity
                                ? t('newDraftOrder.review.workflow.startsAfterApproval')
                                : isPricing
                                  ? t('newDraftOrder.review.workflow.startsAfterApproval')
                                  : isFinancial
                                    ? t('newDraftOrder.review.workflow.startsAfterApproval')
                        : isArtProduction
                          ? t('newDraftOrder.review.workflow.startsAfterApproval')
                          : timing}
                  </span>
                </div>
                <dl className="m-0 mt-4 grid grid-cols-2 gap-x-6 gap-y-3 max-[520px]:grid-cols-1">
                  <div className="min-w-0">
                    <dt className="text-[12px] text-[#85858A]">
                      {t('newDraftOrder.review.workflow.drawer.owner')}
                    </dt>
                    <dd className="m-0 text-[13px] text-[#111113]">
                      {stage.owner && stage.team
                        ? t('newDraftOrder.review.workflow.owner', {
                            owner: stage.owner,
                            team: stage.team,
                          })
                        : stage.automatic
                          ? t('newDraftOrder.review.workflow.automatic')
                        : t('newDraftOrder.review.workflow.drawer.ownerUnset')}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[12px] text-[#85858A]">
                      {t('newDraftOrder.review.workflow.drawer.timing')}
                    </dt>
                    <dd className="m-0 text-[13px] text-[#111113]">{timing}</dd>
                  </div>
                  <div className="col-span-full min-w-0">
                    <dt className="text-[12px] text-[#85858A]">
                      {t('newDraftOrder.review.workflow.drawer.draftOrder')}
                    </dt>
                    <dd className="m-0 text-[13px] text-[#111113]">
                      {t('newDraftOrder.review.workflow.drawer.draftOrderValue', {
                        orderId: orderId || t('newDraftOrder.review.workflow.drawer.unsaved'),
                        version,
                        customer: customer?.name ?? t('newDraftOrder.overview.notSet'),
                      })}
                    </dd>
                  </div>
                </dl>
              </section>

              <section>
                <h3 className="m-0 mb-3 text-[12px] font-medium tracking-[0.06em] text-[#85858A] uppercase">
                  {t('newDraftOrder.review.workflow.drawer.stepDetail')}
                </h3>
                {isCustomerArt ? (
                  <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 max-[520px]:grid-cols-1">
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.approvalLink')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t('newDraftOrder.review.workflow.drawer.notSent')}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.customerApprover')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t('newDraftOrder.review.workflow.drawer.approverUnset')}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.finalArt')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t(
                          finalArtLocked
                            ? 'newDraftOrder.review.workflow.drawer.locked'
                            : 'newDraftOrder.review.workflow.drawer.notLocked',
                        )}
                      </dd>
                    </div>
                  </dl>
                ) : isQuantityApproval ? (
                  <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 max-[520px]:grid-cols-1">
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.quantities')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t(
                          quantitiesLocked
                            ? 'newDraftOrder.review.workflow.drawer.locked'
                            : 'newDraftOrder.review.workflow.drawer.notLocked',
                        )}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.total')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t('newDraftOrder.review.workflow.drawer.totalUnits', {
                          units: totalUnits,
                          bundles: lines.length,
                        })}
                      </dd>
                    </div>
                  </dl>
                ) : isArtProduction ? (
                  <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 max-[520px]:grid-cols-1">
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.productionStatus')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">{stateLabel}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.productionOwner')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {stage.owner && stage.team
                          ? t('newDraftOrder.review.workflow.owner', {
                              owner: stage.owner,
                              team: stage.team,
                            })
                          : t('newDraftOrder.review.workflow.drawer.ownerUnset')}
                      </dd>
                    </div>
                  </dl>
                ) : isLicense ? (
                  <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 max-[520px]:grid-cols-1">
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.artsReadyForLicensing')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t('newDraftOrder.review.workflow.drawer.readyTotal', {
                          ready: licensingReadyCount,
                          total: lines.length,
                        })}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.royalty')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t('newDraftOrder.review.workflow.drawer.royaltyValue', {
                          rate: customer?.royaltyRate ?? 0,
                        })}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.turnaround')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t('newDraftOrder.review.workflow.drawer.licensingTurnaround')}
                      </dd>
                    </div>
                  </dl>
                ) : isFinalApproval ? (
                  <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 max-[520px]:grid-cols-1">
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.lines')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t('newDraftOrder.review.workflow.drawer.approvalCount', {
                          approved: finalApprovedCount,
                          total: lines.length,
                        })}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.rule')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t('newDraftOrder.review.workflow.drawer.finalApprovalRule')}
                      </dd>
                    </div>
                  </dl>
                ) : isCapacity ? (
                  <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 max-[520px]:grid-cols-1">
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.customerRequested')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {formatDate(inHandsDate)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.soonestShip')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {formatDate(soonestInHands)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.pace')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">{capacityPace}</dd>
                    </div>
                  </dl>
                ) : isPricing ? (
                  <p className="m-0 text-[13px] leading-[1.5] text-[#5C5C61]">
                    {t('newDraftOrder.review.workflow.drawer.pricingDescription')}
                  </p>
                ) : isFinancial ? (
                  <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-3 max-[520px]:grid-cols-1">
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.terms')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {customer?.terms || t('newDraftOrder.overview.notSet')}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[12px] text-[#85858A]">
                        {t('newDraftOrder.review.workflow.drawer.credit')}
                      </dt>
                      <dd className="m-0 text-[13px] text-[#111113]">
                        {t('newDraftOrder.review.workflow.drawer.creditUnavailable')}
                      </dd>
                    </div>
                  </dl>
                ) : null}

                {isCustomerArt ? (
                  <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
                    {lines.map((line) => (
                      <li
                        key={line.id}
                        className="flex min-w-0 items-start gap-3 rounded-xl border border-[#ECECEE] px-3 py-2.5"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F6] text-xs font-semibold text-[#6B6B70]"
                        >
                          {line.image ? (
                            <img src={line.image} alt="" className="size-full object-cover" />
                          ) : (
                            line.thumbnailFallback
                          )}
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <b className="text-[13px] leading-[1.4] font-semibold text-[#111113] [overflow-wrap:anywhere]">
                            {t('newDraftOrder.review.workflow.drawer.lineTitle', {
                              line: line.lineNumber,
                              name: line.name,
                            })}
                          </b>
                          <span className="text-[13px] text-[#6B6B70]">
                            {[line.sku, line.artworkCode].filter(Boolean).join(' · ') ||
                              t('newDraftOrder.overview.notSet')}
                          </span>
                          <span className="w-fit rounded-full bg-[#F2F2F3] px-2 py-0.5 text-[11px] text-[#6B6B70]">
                            {t('newDraftOrder.review.workflow.drawer.notSent')}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : isQuantityApproval ? (
                  <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
                    {lines.map((line) => (
                      <li
                        key={line.id}
                        className="flex min-w-0 items-start gap-3 rounded-xl border border-[#ECECEE] px-3 py-2.5"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F6] text-xs font-semibold text-[#6B6B70]"
                        >
                          {line.image ? (
                            <img src={line.image} alt="" className="size-full object-cover" />
                          ) : (
                            line.thumbnailFallback
                          )}
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <b className="text-[13px] leading-[1.4] font-semibold text-[#111113] [overflow-wrap:anywhere]">
                            {t('newDraftOrder.review.workflow.drawer.lineTitle', {
                              line: line.lineNumber,
                              name: line.name,
                            })}
                          </b>
                          <span className="text-[13px] text-[#6B6B70]">
                            {line.sizes.length
                              ? line.sizes
                                  .map(({size, quantity}) => `${size} × ${quantity}`)
                                  .join(' · ')
                              : t('newDraftOrder.review.lines.sizesNotSet')}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : isArtProduction ? (
                  <>
                    <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-[#ECECEE] pb-3 text-[11px] text-[#6B6B70]">
                      <b className="text-[#111113]">{orderId || t('newDraftOrder.review.workflow.drawer.unsaved')}</b>
                      <span aria-hidden="true">·</span>
                      <span>{customer?.name ?? t('newDraftOrder.overview.notSet')}</span>
                      {lines.slice(0, 2).map((line) => (
                        <span key={line.id} className="contents">
                          <span aria-hidden="true">·</span>
                          <span>{line.name}</span>
                        </span>
                      ))}
                      <span aria-hidden="true">·</span>
                      <span>
                        {t('newDraftOrder.review.workflow.drawer.bundleCount', {
                          count: lines.length,
                        })}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{t('newDraftOrder.review.workflow.drawer.artFilesUnavailable')}</span>
                    </div>

                    <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
                      {lines.map((line) => (
                        <li
                          key={line.id}
                          className="rounded-xl border border-[#ECECEE] p-3"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="inline-flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F6] text-xs font-semibold text-[#6B6B70]">
                              {line.image ? (
                                <img src={line.image} alt="" className="size-full object-cover" />
                              ) : (
                                line.thumbnailFallback
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <b className="text-[13px] font-semibold text-[#111113]">
                                  {t('newDraftOrder.review.workflow.drawer.productionLine', {
                                    line: line.lineNumber,
                                    sku: line.sku || t('newDraftOrder.overview.notSet'),
                                  })}
                                </b>
                                <span className="text-xs text-[#6B6B70]">
                                  {line.name}
                                  {line.color ? ` · ${line.color}` : ''}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <span className="rounded-full bg-[#F2F2F3] px-2 py-1 text-[10px] font-medium text-[#5C5C61]">
                                  {t('newDraftOrder.review.workflow.drawer.garmentTag', {
                                    sku: line.sku || t('newDraftOrder.overview.notSet'),
                                  })}
                                </span>
                                <span className="rounded-full bg-[#F2F2F3] px-2 py-1 text-[10px] font-medium text-[#5C5C61]">
                                  {t('newDraftOrder.review.workflow.drawer.artTag', {
                                    code: line.artworkCode || t('newDraftOrder.overview.notSet'),
                                  })}
                                </span>
                                <span className="rounded-full bg-[#F2F2F3] px-2 py-1 text-[10px] font-medium text-[#5C5C61]">
                                  {t('newDraftOrder.review.workflow.drawer.decorationTag', {
                                    method: line.decoration
                                      ? t(`newDraftOrder.leadTime.methods.options.${line.decoration}.label`)
                                      : t('newDraftOrder.overview.notSet'),
                                  })}
                                </span>
                              </div>
                              <span className="mt-2 inline-flex rounded-full border border-[#ECECEE] px-2 py-1 text-[10px] text-[#6B6B70]">
                                {t('newDraftOrder.review.workflow.drawer.sourcePlacementUnavailable')}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
                            <label className="flex min-w-0 flex-col gap-1">
                              <span className="text-[10px] font-medium tracking-[0.06em] text-[#85858A] uppercase">
                                {t('newDraftOrder.review.workflow.drawer.decorationMethod')}
                              </span>
                              <input
                                readOnly
                                value={line.decoration
                                  ? t(`newDraftOrder.leadTime.methods.options.${line.decoration}.label`)
                                  : t('newDraftOrder.overview.notSet')}
                                className="h-9 min-w-0 rounded-lg border border-[#D7D7DA] bg-white px-2.5 text-xs text-[#111113]"
                              />
                            </label>
                            <label className="flex min-w-0 flex-col gap-1">
                              <span className="text-[10px] font-medium tracking-[0.06em] text-[#85858A] uppercase">
                                {t('newDraftOrder.review.workflow.drawer.embellishment')}
                              </span>
                              <input
                                readOnly
                                value={t('newDraftOrder.review.workflow.drawer.embellishmentUnavailable')}
                                className="h-9 min-w-0 rounded-lg border border-[#D7D7DA] bg-white px-2.5 text-xs text-[#111113]"
                              />
                            </label>
                          </div>

                          <label className="mt-4 flex flex-col gap-1">
                            <span className="text-[10px] font-medium tracking-[0.06em] text-[#85858A] uppercase">
                              {t('newDraftOrder.review.workflow.drawer.productionFile')}
                            </span>
                            <input
                              readOnly
                              value={t('newDraftOrder.review.workflow.drawer.fileUnavailable')}
                              className="h-9 min-w-0 rounded-lg border border-[#D7D7DA] bg-white px-2.5 text-xs text-[#111113]"
                            />
                          </label>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {(['decorationFeasible', 'artWithinImprint', 'colorsValid', 'vectorFileReady', 'licenseValid'] as const).map((check) => (
                              <label
                                key={check}
                                className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[#D7D7DA] px-2 text-[10px] text-[#6B6B70]"
                              >
                                <input type="checkbox" disabled className="size-3 accent-[#1A1A1A]" />
                                {t(`newDraftOrder.review.workflow.drawer.checks.${check}`)}
                              </label>
                            ))}
                          </div>

                          <details className="mt-3 border-t border-[#ECECEE] pt-3">
                            <summary className="cursor-pointer text-[11px] font-semibold text-[#111113]">
                              {t('newDraftOrder.review.workflow.drawer.detailsFilesHistory')}
                            </summary>
                            <p className="mt-2 mb-0 text-xs text-[#6B6B70]">
                              {t('newDraftOrder.review.workflow.drawer.filesHistoryUnavailable')}
                            </p>
                          </details>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : isLicense ? (
                  <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
                    {lines.map((line) => (
                      <li
                        key={line.id}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-[#ECECEE] px-3 py-2.5"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F6] text-[10px] font-semibold text-[#6B6B70]"
                        >
                          {line.image ? (
                            <img src={line.image} alt="" className="size-full object-cover" />
                          ) : (
                            line.thumbnailFallback
                          )}
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <b className="text-[13px] leading-[1.4] font-semibold text-[#111113] [overflow-wrap:anywhere]">
                            {t('newDraftOrder.review.workflow.drawer.lineTitle', {
                              line: line.lineNumber,
                              name: line.name,
                            })}
                          </b>
                          <span className="text-[12px] text-[#6B6B70]">
                            {line.sku || t('newDraftOrder.overview.notSet')}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : isFinalApproval ? (
                  <>
                    <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
                      {lines.map((line) => {
                        const approved = approvedFinalLineIds.includes(line.id);

                        return (
                          <li
                            key={line.id}
                            className="flex min-w-0 items-start gap-3 rounded-xl border border-[#ECECEE] px-3 py-2.5"
                          >
                            <span
                              aria-hidden="true"
                              className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F6] text-[10px] font-semibold text-[#6B6B70]"
                            >
                              {line.thumbnailFallback}
                            </span>
                            <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                              <b className="text-[13px] leading-[1.4] font-semibold text-[#111113] [overflow-wrap:anywhere]">
                                {t('newDraftOrder.review.workflow.drawer.lineTitle', {
                                  line: line.lineNumber,
                                  name: line.name,
                                })}
                              </b>
                              <span className="text-[12px] text-[#6B6B70]">
                                {approved
                                  ? t('newDraftOrder.review.workflow.drawer.approvedForCustomer')
                                  : t('newDraftOrder.review.workflow.drawer.notSent')}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="small"
                                shape="md"
                                disabled={approved}
                                onClick={() => onApproveFinalLine(line.id)}
                                className="min-h-7 px-2.5 text-[11px] normal-case"
                              >
                                {t('newDraftOrder.review.workflow.drawer.approveForCustomer')}
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <label className="mt-4 flex flex-col gap-1.5">
                      <span className="text-[10px] font-medium tracking-[0.06em] text-[#85858A] uppercase">
                        {t('newDraftOrder.review.workflow.drawer.noteForRecord')}
                      </span>
                      <textarea
                        rows={2}
                        value={finalApprovalNote}
                        onChange={(event) => setFinalApprovalNote(event.target.value)}
                        placeholder={t('newDraftOrder.review.workflow.drawer.noteForRecordPlaceholder')}
                        className="w-full resize-y rounded-lg border border-[#D7D7DA] bg-white px-3 py-2.5 text-[13px] text-[#111113] placeholder:text-[#85858A]"
                      />
                    </label>
                  </>
                ) : isInventory ? (
                  <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
                    {lines.map((line, lineIndex) => (
                      <li
                        key={line.id}
                        className="flex min-w-0 items-start gap-3 rounded-xl border border-[#ECECEE] px-3 py-2.5"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F6] text-[10px] font-semibold text-[#6B6B70]"
                        >
                          {line.thumbnailFallback}
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                          <b className="text-[13px] leading-[1.4] font-semibold text-[#111113] [overflow-wrap:anywhere]">
                            {t('newDraftOrder.review.workflow.drawer.lineTitle', {
                              line: line.lineNumber,
                              name: line.name,
                            })}
                          </b>
                          <span className="text-[12px] text-[#6B6B70]">
                            {t('newDraftOrder.review.workflow.drawer.inventoryDemand', {
                              quantity: line.quantity,
                              sku: line.sku || t('newDraftOrder.overview.notSet'),
                            })}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="small"
                            shape="md"
                            onClick={() => setAtpLineIndex(lineIndex)}
                            className="min-h-7 px-2.5 text-[11px] normal-case"
                          >
                            {t('newDraftOrder.review.workflow.drawer.viewAtp')}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : isCapacity ? (
                  <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
                    {lines.map((line) => (
                      <li
                        key={line.id}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-[#ECECEE] px-3 py-2.5"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F6] text-[10px] font-semibold text-[#6B6B70]"
                        >
                          {line.thumbnailFallback}
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <b className="text-[13px] leading-[1.4] font-semibold text-[#111113] [overflow-wrap:anywhere]">
                            {t('newDraftOrder.review.workflow.drawer.lineTitle', {
                              line: line.lineNumber,
                              name: line.name,
                            })}
                          </b>
                          <span className="text-[12px] text-[#6B6B70]">
                            {t('newDraftOrder.review.workflow.drawer.capacityLineDetail', {
                              method: line.decoration
                                ? t(`newDraftOrder.leadTime.methods.options.${line.decoration}.label`)
                                : t('newDraftOrder.overview.notSet'),
                              units: line.quantity,
                            })}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : isPricing ? (
                  <>
                    <ul className="m-0 flex list-none flex-col gap-2 p-0">
                      {lines.map((line) => {
                        const unitPrice =
                          line.garmentUnitPrice +
                          line.artUnitPrice +
                          line.decorationUnitPrice;

                        return (
                          <li
                            key={line.id}
                            className="flex min-w-0 items-center gap-3 rounded-xl border border-[#ECECEE] px-3 py-2.5"
                          >
                            <span
                              aria-hidden="true"
                              className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F5F5F6] text-[10px] font-semibold text-[#6B6B70]"
                            >
                              {line.thumbnailFallback}
                            </span>
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <b className="text-[13px] leading-[1.4] font-semibold text-[#111113] [overflow-wrap:anywhere]">
                                {t('newDraftOrder.review.workflow.drawer.lineTitle', {
                                  line: line.lineNumber,
                                  name: line.name,
                                })}
                              </b>
                              <span className="text-[12px] text-[#6B6B70]">
                                {t('newDraftOrder.review.workflow.drawer.pricingLineAmounts', {
                                  unit: t('newDraftOrder.overview.money', {value: unitPrice}),
                                  line: t('newDraftOrder.overview.money', {value: line.lineTotal}),
                                })}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <dl className="m-0 mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
                      <div className="min-w-0">
                        <dt className="text-[12px] text-[#85858A]">
                          {t('newDraftOrder.review.workflow.drawer.orderTotal')}
                        </dt>
                        <dd className="m-0 text-[13px] text-[#111113] tabular-nums">
                          {t('newDraftOrder.overview.money', {value: orderTotal})}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-[12px] text-[#85858A]">
                          {t('newDraftOrder.review.workflow.drawer.discounts')}
                        </dt>
                        <dd className="m-0 text-[13px] text-[#111113]">
                          {discountCodes.length
                            ? discountCodes.join(', ')
                            : t('newDraftOrder.review.workflow.drawer.noDiscounts')}
                        </dd>
                      </div>
                    </dl>
                  </>
                ) : null}
              </section>

              <section>
                <h3 className="m-0 mb-2 text-[12px] font-medium tracking-[0.06em] text-[#85858A] uppercase">
                  {t('newDraftOrder.review.workflow.drawer.auditLog')}
                </h3>
                <p className="m-0 text-[13px] leading-[1.5] text-[#6B6B70]">
                  {t('newDraftOrder.review.workflow.drawer.auditEmpty')}
                </p>
              </section>

              {isLicense ? (
                <section className="rounded-xl border border-[#ECECEE] p-4">
                  <h3 className="m-0 text-[13px] font-semibold text-[#111113]">
                    {t('newDraftOrder.review.workflow.drawer.licensingArtChangedTitle')}
                  </h3>
                  <p className="mt-1 mb-3 text-[12px] leading-[1.5] text-[#6B6B70]">
                    {t('newDraftOrder.review.workflow.drawer.licensingArtChangedDescription')}
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-[520px]:grid-cols-1">
                    <label className="flex min-w-0 flex-col gap-1">
                      <span className="text-[11px] font-medium text-[#6B6B70]">
                        {t('newDraftOrder.review.workflow.drawer.line')}
                      </span>
                      <select
                        value={licenseLineIndex}
                        onChange={(event) => setLicenseLineIndex(event.target.value)}
                        className="h-10 min-w-0 rounded-lg border border-[#D7D7DA] bg-white px-2.5 text-xs text-[#111113]"
                      >
                        {lines.map((line, index) => (
                          <option key={line.id} value={index}>
                            {t('newDraftOrder.review.workflow.drawer.lineTitle', {
                              line: line.lineNumber,
                              name: line.name,
                            })}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex min-w-0 flex-col gap-1">
                      <span className="text-[11px] font-medium text-[#6B6B70]">
                        {t('newDraftOrder.review.workflow.drawer.whatChanged')}
                      </span>
                      <input
                        type="text"
                        maxLength={200}
                        placeholder={t('newDraftOrder.review.workflow.drawer.whatChangedPlaceholder')}
                        className="h-10 min-w-0 rounded-lg border border-[#D7D7DA] bg-white px-2.5 text-xs text-[#111113] placeholder:text-[#85858A]"
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="control"
                      shape="md"
                      onClick={() => {
                        setLicenseArtChanged(true);
                        onLicenseArtChanged();
                      }}
                    >
                      {t('newDraftOrder.review.workflow.drawer.artChanged')}
                    </Button>
                    {licenseArtChanged ? (
                      <span role="status" className="text-xs text-[#246B45]">
                        {t('newDraftOrder.review.workflow.drawer.licenseReopened')}
                      </span>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </div>

            {isCustomerArt || isQuantityApproval || isFinalApproval ? (
              <footer className="flex shrink-0 items-center gap-2 border-t border-[#ECECEE] px-7 py-3 max-[720px]:px-4">
                <Button
                  type="button"
                  variant="outline"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.rejectUnavailable')}
                  className="border-[#F0C9C7] text-[#B42320]"
                >
                  {t('newDraftOrder.review.workflow.drawer.reject')}
                </Button>
                <span className="flex-1" />
                <Button
                  type="button"
                  variant="default"
                  size="control"
                  shape="md"
                  disabled={
                    isFinalApproval
                      ? lines.length === 0 || finalApprovedCount === lines.length
                      : isCustomerArt
                        ? finalArtLocked
                        : quantitiesLocked
                  }
                  onClick={() => {
                    if (isFinalApproval) {
                      onApproveAllFinalLines();
                      return;
                    }
                    onLock(isCustomerArt ? 'art' : 'quantity', true);
                    if (isCustomerArt) {
                      toast.add({
                        title: t('newDraftOrder.review.workflow.drawer.artLockedToast'),
                        type: 'success',
                      });
                    } else if (isQuantityApproval) {
                      toast.add({
                        title: t('newDraftOrder.review.workflow.drawer.quantitiesLockedToast'),
                        type: 'success',
                      });
                    }
                    onClose();
                  }}
                >
                  <Check aria-hidden="true" size={16} />
                  {t(
                    isCustomerArt
                      ? finalArtLocked
                        ? 'newDraftOrder.review.workflow.drawer.artLocked'
                        : 'newDraftOrder.review.workflow.drawer.lockFinalArt'
                      : isFinalApproval
                        ? finalApprovedCount === lines.length && lines.length > 0
                          ? 'newDraftOrder.review.workflow.drawer.approvedAllForCustomer'
                          : 'newDraftOrder.review.workflow.drawer.approveAllForCustomer'
                      : quantitiesLocked
                        ? 'newDraftOrder.review.workflow.drawer.quantitiesLocked'
                        : 'newDraftOrder.review.workflow.drawer.lockQuantities',
                  )}
                </Button>
              </footer>
            ) : isArtProduction ? (
              <footer className="flex shrink-0 items-center gap-2 border-t border-[#ECECEE] px-7 py-3 max-[720px]:px-4">
                <Button
                  type="button"
                  variant="outline"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.stageActionsUnavailable')}
                  className="border-[#F0C9C7] text-[#B42320]"
                >
                  {t('newDraftOrder.review.workflow.drawer.kickBack')}
                </Button>
                <span className="flex-1" />
                <Button
                  type="button"
                  variant="default"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.stageActionsUnavailable')}
                >
                  <Check aria-hidden="true" size={16} />
                  {t('newDraftOrder.review.workflow.drawer.approveLicensing')}
                </Button>
              </footer>
            ) : isLicense ? (
              <footer className="flex shrink-0 items-center gap-2 border-t border-[#ECECEE] px-7 py-3 max-[720px]:px-4">
                <Button
                  type="button"
                  variant="outline"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.stageActionsUnavailable')}
                  className="border-[#F0C9C7] text-[#B42320]"
                >
                  {t('newDraftOrder.review.workflow.drawer.reject')}
                </Button>
                <span className="flex-1" />
                <Button
                  type="button"
                  variant="default"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.stageActionsUnavailable')}
                >
                  <Check aria-hidden="true" size={16} />
                  {t('newDraftOrder.review.workflow.drawer.approve')}
                </Button>
              </footer>
            ) : isInventory ? (
              <footer className="flex shrink-0 items-center gap-2 border-t border-[#ECECEE] px-7 py-3 max-[720px]:px-4">
                <Button
                  type="button"
                  variant="outline"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.stageActionsUnavailable')}
                  className="border-[#F0C9C7] text-[#B42320]"
                >
                  {t('newDraftOrder.review.workflow.drawer.reject')}
                </Button>
                <span className="flex-1" />
                <Button
                  type="button"
                  variant="default"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.stageActionsUnavailable')}
                >
                  <Check aria-hidden="true" size={16} />
                  {t('newDraftOrder.review.workflow.drawer.approve')}
                </Button>
              </footer>
            ) : isCapacity ? (
              <footer className="flex shrink-0 items-center gap-2 border-t border-[#ECECEE] px-7 py-3 max-[720px]:px-4">
                <Button
                  type="button"
                  variant="outline"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.stageActionsUnavailable')}
                  className="border-[#F0C9C7] text-[#B42320]"
                >
                  {t('newDraftOrder.review.workflow.drawer.reject')}
                </Button>
                <span className="flex-1" />
                <Button
                  type="button"
                  variant="default"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.stageActionsUnavailable')}
                >
                  <Check aria-hidden="true" size={16} />
                  {t('newDraftOrder.review.workflow.drawer.approve')}
                </Button>
              </footer>
            ) : isPricing || isFinancial ? (
              <footer className="flex shrink-0 items-center gap-2 border-t border-[#ECECEE] px-7 py-3 max-[720px]:px-4">
                <Button
                  type="button"
                  variant="outline"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.stageActionsUnavailable')}
                  className="border-[#F0C9C7] text-[#B42320]"
                >
                  {t('newDraftOrder.review.workflow.drawer.reject')}
                </Button>
                <span className="flex-1" />
                <Button
                  type="button"
                  variant="default"
                  size="control"
                  shape="md"
                  disabled
                  title={t('newDraftOrder.review.workflow.drawer.stageActionsUnavailable')}
                >
                  <Check aria-hidden="true" size={16} />
                  {t('newDraftOrder.review.workflow.drawer.approve')}
                </Button>
              </footer>
            ) : null}
          </Dialog.Popup>
        ) : null}
        <Dialog.Root
          open={atpLineIndex !== null}
          onOpenChange={(open) => {
            if (!open) setAtpLineIndex(null);
          }}
        >
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-[1300] bg-[rgba(17,17,19,.24)]" />
            {atpLineIndex !== null && lines[atpLineIndex] ? (
              <Dialog.Popup className="fixed inset-y-0 right-0 z-[1400] flex h-dvh w-[min(430px,100%)] flex-col border-l border-[#E7E7E9] bg-white shadow-[-18px_0_48px_rgba(17,17,19,.22)]">
                <header className="flex items-start justify-between gap-4 border-b border-[#ECECEE] px-5 py-5">
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                      {t('newDraftOrder.review.workflow.drawer.atpTitle')}
                    </span>
                    <Dialog.Title className="mt-1 text-[18px] leading-[1.3] font-semibold text-[#111113]">
                      {lines[atpLineIndex].name}
                    </Dialog.Title>
                    <p className="m-0 mt-1 text-[12px] text-[#6B6B70]">
                      {lines[atpLineIndex].sku || t('newDraftOrder.overview.notSet')}
                    </p>
                  </div>
                  <Dialog.Close
                    aria-label={t('newDraftOrder.review.workflow.drawer.close')}
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#6B6B70] hover:bg-[#F7F7F8]"
                  >
                    <X aria-hidden="true" size={18} strokeWidth={1.8} />
                  </Dialog.Close>
                </header>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <p className="m-0 rounded-xl bg-[#F7F7F8] px-3.5 py-3 text-[13px] leading-[1.5] text-[#5C5C61]">
                    {t('newDraftOrder.review.workflow.drawer.atpUnavailable')}
                  </p>
                  <h3 className="mt-5 mb-2 text-[11px] font-medium tracking-[0.06em] text-[#85858A] uppercase">
                    {t('newDraftOrder.review.workflow.drawer.requestedSizes')}
                  </h3>
                  {lines[atpLineIndex].sizes.length ? (
                    <ul className="m-0 flex list-none flex-col p-0">
                      {lines[atpLineIndex].sizes.map(({size, quantity}) => (
                        <li
                          key={size}
                          className="flex justify-between border-b border-[#ECECEE] py-2 text-[13px]"
                        >
                          <span>{size}</span>
                          <span className="tabular-nums">
                            {t('newDraftOrder.review.workflow.drawer.requestedQuantity', {
                              quantity,
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="m-0 text-[13px] text-[#6B6B70]">
                      {t('newDraftOrder.review.lines.sizesNotSet')}
                    </p>
                  )}
                </div>
              </Dialog.Popup>
            ) : null}
          </Dialog.Portal>
        </Dialog.Root>
      </Dialog.Portal>
    </Dialog.Root>
  );
}