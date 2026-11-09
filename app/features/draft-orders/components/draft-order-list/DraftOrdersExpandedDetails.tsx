import {useTranslation} from 'react-i18next';
import {useEffect, useState, type ComponentProps} from 'react';
import {useFetcher, useNavigate} from 'react-router';
import {Archive, ArchiveRestore, Copy, Download, Eye, Send} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {ROUTES, SEARCH_PARAMS} from '~/shared/constants/routes';
import {downloadTextFile} from '~/shared/services/download';
import {buildDraftOrderCsv} from '../../lib/draft-order-export';
import {buildDraftOrderPreview} from '../../lib/draft-order-preview';
import {STEP_ORDER} from '../../lib/new-draft-order';
import {PrintPreviewModal} from '../new-draft-order/review/PrintPreviewModal';
import {useDraftOrdersListStore} from '../../store/draft-orders-list.store';
import type {DuplicateDraftResult} from '../../lib/draftorders-duplicate.server';
import type {
  DraftOrderLineSendState,
  DraftOrderListItem,
  DraftOrderWorkflowStatus,
} from '../../types/draft-order';

import {toast} from '~/shared/components/ui/Toast';
import {Tooltip, TooltipContent, TooltipTrigger} from '~/shared/components/ui/Tooltip';

type PreviewModel = Omit<ComponentProps<typeof PrintPreviewModal>, 'open' | 'onOpenChange'>;

/** Workflow stage order. Labels: `draftOrders.page.list.details.workflowStages.<key>`. */
const WORKFLOW_STAGE_KEYS = [
  'customerArtApproval',
  'quantityApproval',
  'artProduction',
  'license',
  'salesProductionApproval',
  'inventory',
  'capacity',
  'pricing',
  'financial',
] as const;

/** How long "Archive? Press again" waits before it reverts. */
const ARCHIVE_CONFIRM_MS = 4000;

const stageDotClasses: Record<DraftOrderWorkflowStatus, string> = {
  passed: 'border-[#111113] bg-[#111113]',
  active: 'border-2 border-[#111113] bg-white',
  blocked: 'border-[#A02020] bg-[#A02020]',
  na: 'border-dashed border-[#D7D7DA] bg-white',
  queued: 'border-[#D7D7DA] bg-white',
};

const sendStateClasses: Record<DraftOrderLineSendState, string> = {
  notSent: 'bg-[#F2F2F3] text-[#5C5C61]',
  sent: 'bg-[#F2F2F3] text-[#5C5C61]',
  approved: 'bg-[#EEF6F1] text-[#1F7A4D]',
};

const eyebrowClasses =
  'm-0 text-xs leading-[1.5] font-medium tracking-[0.06em] text-[#6B6B70] uppercase';

const tagClasses =
  'inline-flex h-[22px] max-w-full items-center overflow-hidden rounded-full px-2.5 text-xs leading-none font-medium text-ellipsis whitespace-nowrap';

/** Renders the body of an expanded draft order row: lines, next step, workflow and quick actions. */
export function DraftOrdersExpandedDetails({
  draftOrder,
  isArchived = false,
}: {
  draftOrder: DraftOrderListItem;
  isArchived?: boolean;
}) {
  const {t} = useTranslation('draftOrders');
  const navigate = useNavigate();
  const archiveDraft = useDraftOrdersListStore((state) => state.archive);
  const restoreDraft = useDraftOrdersListStore((state) => state.restore);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const previewFetcher = useFetcher<{preview: PreviewModel | null}>();
  const duplicateFetcher = useFetcher<DuplicateDraftResult>();
  // The fetcher keeps the previous response, and its state flips to 'loading'
  // a render after the click. A response only counts once it differs from the
  // one held when Preview was clicked, or the dialog would open on stale data,
  // close when the reload starts and reopen when it ends.
  const [staleResponse, setStaleResponse] = useState<typeof previewFetcher.data>();
  const previewReady =
    previewFetcher.state === 'idle' &&
    previewFetcher.data !== undefined &&
    previewFetcher.data !== staleResponse;
  const preview = draftOrder.gid
    ? (previewFetcher.data?.preview ?? null)
    : buildDraftOrderPreview(draftOrder);

  useEffect(() => {
    if (!previewOpen || !draftOrder.gid || !previewReady || preview) return;
    setPreviewOpen(false);
    toast.add({title: t('draftOrders.page.list.expanded.actions.previewError'), type: 'error'});
  }, [previewOpen, draftOrder.gid, previewReady, preview, t]);

  const duplicateResult = duplicateFetcher.state === 'idle' ? duplicateFetcher.data : undefined;
  useEffect(() => {
    if (!duplicateResult) return;
    toast.add(
      duplicateResult.ok
        ? {
            title: t('draftOrders.page.list.expanded.actions.duplicateToast', {
              id: draftOrder.id,
              newId: duplicateResult.name,
            }),
            type: 'success',
          }
        : {title: t('draftOrders.page.list.expanded.actions.duplicateError'), type: 'error'},
    );
  }, [duplicateResult, draftOrder.id, t]);

  useEffect(() => {
    if (!confirmingArchive) return;
    const timer = window.setTimeout(() => setConfirmingArchive(false), ARCHIVE_CONFIRM_MS);
    return () => window.clearTimeout(timer);
  }, [confirmingArchive]);
  const openDraft = useDraftOrdersListStore((state) => state.open);
  const duplicateDraft = useDraftOrdersListStore((state) => state.duplicate);
  const lines = draftOrder.lines ?? [];
  const units = lines.reduce((sum, line) => sum + line.units, 0);
  const stages = draftOrder.workflow.slice(0, WORKFLOW_STAGE_KEYS.length);
  const done = stages.filter(
    (stage) => stage.status === 'passed' || stage.status === 'na',
  ).length;
  const money = (value: number) =>
    t('draftOrders.page.list.expanded.money', {value});
  const unitsLabel = (count: number) =>
    t('draftOrders.page.list.expanded.units', {count});

  return (
    <div className=" grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-x-9 gap-y-4 px-3.5 pt-4 pb-5 max-[899.98px]:grid-cols-1 bg-[#F7F7F8]">
      <div className="min-w-0">
        {lines.length ? (
          <>
            <p className={eyebrowClasses}>
              {t('draftOrders.page.list.expanded.summary', {
                configs: t('draftOrders.page.list.expanded.configs', {
                  count: lines.length,
                }),
                units: unitsLabel(units),
              })}
            </p>
            <ul className="m-0 mt-2.5 flex list-none flex-col gap-2 p-0">
              {lines.map((line) => (
                <li
                  key={line.id}
                  className="flex min-w-0 items-center gap-3 rounded-[14px] border border-[#ECECEE] bg-white p-3"
                >
                  {line.image ? (
                    <img
                      src={line.image}
                      alt=""
                      aria-hidden="true"
                      className="size-12 shrink-0 rounded-[10px] object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="inline-flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-[#F2F2F3] text-xs font-semibold text-[#8E8E93]"
                    >
                      {line.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <b className="overflow-hidden text-sm leading-[1.4] font-semibold text-ellipsis whitespace-nowrap text-[#111113]">
                      {line.name}
                    </b>
                    <em className="text-xs leading-[1.5] text-[#6B6B70] not-italic">
                      {line.color
                        ? t('draftOrders.page.list.expanded.lineMeta', {
                            color: line.color,
                            units: unitsLabel(line.units),
                          })
                        : t('draftOrders.page.list.expanded.lineMetaNoColor', {
                            units: unitsLabel(line.units),
                          })}
                    </em>
                  </span>
                  <span className="flex min-w-0 shrink items-center gap-2">
                    <span className={`${tagClasses} ${sendStateClasses[line.sendState]}`}>
                      {t(`draftOrders.page.list.expanded.sendStates.${line.sendState}`)}
                    </span>
                    {line.orderRef ? (
                      <span className={`${tagClasses} bg-[#EEF6F1] text-[#1F7A4D]`}>
                        {t('draftOrders.page.list.expanded.ordered', {
                          order: line.orderRef,
                        })}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-[#111113] tabular-nums">
                    {money(line.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        {draftOrder.nextAction ? (
          <div>
            <p className={eyebrowClasses}>
              {t('draftOrders.page.list.expanded.next')}
            </p>
            <p className="m-0 mt-1.5 text-[13px] leading-[1.5] text-[#111113]">
              {t(`draftOrders.page.list.expanded.nextActions.${draftOrder.nextAction}`)}
            </p>
          </div>
        ) : null}

        <div>
          <p className={eyebrowClasses}>
            {t('draftOrders.page.list.expanded.workflow', {
              done,
              total: WORKFLOW_STAGE_KEYS.length,
            })}
          </p>
          <ol className="m-0 mt-2.5 flex list-none flex-col gap-2 p-0">
            {stages.map((stage, index) => (
              <li
                key={WORKFLOW_STAGE_KEYS[index]}
                className="flex items-center gap-2.5 text-xs leading-[1.5] text-[#111113]"
              >
                <i
                  aria-hidden="true"
                  className={`box-border size-2 shrink-0 rounded-full border ${stageDotClasses[stage.status]}`}
                />
                <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {t('draftOrders.page.list.expanded.stage', {
                    n: index + 1,
                    name: t(
                      `draftOrders.page.list.details.workflowStages.${WORKFLOW_STAGE_KEYS[index]}`,
                    ),
                  })}
                </span>
                <em className="shrink-0 text-[#6B6B70] not-italic">
                  {t(`draftOrders.page.list.expanded.stageStates.${stage.status}`)}
                </em>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ❓ TO CONFIRM: only Open, Duplicate, Preview, Export, Archive and Restore are wired; Send has no handler yet. */}
      <div
        role="group"
        aria-label={t('draftOrders.page.list.expanded.actions.ariaLabel', {
          id: draftOrder.id,
        })}
        className="col-span-full flex flex-wrap gap-2 text-"
      >
        
        <Button
          type="button"
          variant="outline"
          className='cursor-pointer'
          size="small"
          disabled
          shape="md"
          onClick={() => {
            openDraft(draftOrder);
            const params = new URLSearchParams({[SEARCH_PARAMS.step]: STEP_ORDER[0]});
            // Fixtures have no GID; only a real draft can be loaded by id.
            if (draftOrder.gid) {
              params.set(SEARCH_PARAMS.draftId, draftOrder.gid);
            }
            void navigate(`${ROUTES.draftOrdersNew}?${params}`);
          }}
        >
          {t('draftOrders.page.list.expanded.actions.open')}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="small"
          className='cursor-pointer'
          shape="md"
          //disabled={duplicateFetcher.state !== 'idle'}
          disabled
          onClick={() => {
            if (draftOrder.gid) {
              void duplicateFetcher.submit(
                {[SEARCH_PARAMS.draftId]: draftOrder.gid},
                {method: 'post', action: ROUTES.draftOrdersDuplicate},
              );
              return;
            }
            // Fixtures have no GID, so the copy stays in the browser.
            const newId = duplicateDraft(draftOrder.id);
            if (newId) {
              toast.add({
                title: t('draftOrders.page.list.expanded.actions.duplicateToast', {id: draftOrder.id, newId}),
                type: 'success',
              });
            }
          }}
        >
          <Copy size={14} aria-hidden="true" strokeWidth={1.8} />
          {t('draftOrders.page.list.expanded.actions.duplicate')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="small"
          className='cursor-pointer'
          disabled
          shape="md"
          title={t('draftOrders.page.list.expanded.actions.sendTip')}
        >
          <Send size={14} aria-hidden="true" strokeWidth={1.8} />
          {t('draftOrders.page.list.expanded.actions.send')}
          <span
            aria-hidden="true"
            title={t('draftOrders.page.list.expanded.actions.customerSees')}
            className="inline-flex items-center text-[#6B6B70]"
          >
            <Eye size={14} strokeWidth={1.8} />
          </span>
        </Button>
        <Tooltip>
        <TooltipTrigger
          render={
        <Button
          type="button"
          variant="outline"
          size="small"
          shape="md"
          className='cursor-pointer'
          aria-haspopup="dialog"
         // disabled={previewFetcher.state !== 'idle'}
         disabled
          onClick={() => {
            if (draftOrder.gid) {
              setStaleResponse(previewFetcher.data);
              void previewFetcher.load(
                `${ROUTES.draftOrdersPreview}?${SEARCH_PARAMS.draftId}=${encodeURIComponent(draftOrder.gid)}`,
              );
            }
            setPreviewOpen(true);
          }}
        >
          {t('draftOrders.page.list.expanded.actions.preview')}
          <span
            aria-hidden="true"
            title={t('draftOrders.page.list.expanded.actions.customerSees')}
            className="inline-flex items-center text-[#6B6B70]"
          >
            <Eye size={14} strokeWidth={1.8} />
          </span>
        </Button>}/>
        <TooltipContent>
          <div>
            <strong>{t('draftOrders.page.list.expanded.actions.previewTipTitle')}</strong>
            <p>{t('draftOrders.page.list.expanded.actions.previewTipDescription')}</p>
          </div>
        </TooltipContent>
        </Tooltip>
        <Button
          type="button"
          variant="outline"
          size="small"
          className='cursor-pointer'
          shape="md"
          disabled
          onClick={() => {
            downloadTextFile(
              `${draftOrder.id}.csv`,
              buildDraftOrderCsv(draftOrder, t),
              'text/csv;charset=utf-8',
            );
            toast.add({
              title: t('draftOrders.page.list.expanded.actions.exportToolTip', { id: draftOrder.id }),
              type: 'success',
            });
          }}
        >
          <Download size={14} aria-hidden="true" strokeWidth={1.8} />
          <span>
            {t('draftOrders.page.list.expanded.actions.export')}  
          </span>          
        </Button>
        {isArchived ? (
          <Button
            type="button"
            variant="outline"
            size="small"
            className='cursor-pointer'
            disabled
            shape="md"
            onClick={() => {
              restoreDraft(draftOrder.id);
              toast.add({
                title: t('draftOrders.page.list.expanded.actions.restoreToast', { id: draftOrder.id }),
                type: 'success',
              });
              
            }}
          >
            <ArchiveRestore size={14} aria-hidden="true" strokeWidth={1.8} />
            {t('draftOrders.page.list.expanded.actions.restore')}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="small"
            disabled
            shape="md"
            onClick={() => {
              if (confirmingArchive) {
                archiveDraft(draftOrder.id);
                toast.add({
                  title: t('draftOrders.page.list.expanded.actions.archiveToast', { id: draftOrder.id }),
                  type: 'success',
                });
              } else setConfirmingArchive(true);
            }}
            onBlur={() => setConfirmingArchive(false)}
            className={
              confirmingArchive
                ? 'border-[#F0C6C6] cursor-pointer bg-[#FFF7F7] text-[#A02020] hover:border-[#F0C6C6] hover:bg-[#FDECEC] hover:text-[#A02020]'
                : 'cursor-pointer'
            }
          >
            <Archive size={14} aria-hidden="true" strokeWidth={1.8} />
            {t(
              confirmingArchive
                ? 'draftOrders.page.list.expanded.actions.archiveConfirm'
                : 'draftOrders.page.list.expanded.actions.archive',
            )}
          </Button>
        )}
      </div>

      {previewOpen && preview && (!draftOrder.gid || previewReady) ? (
        <PrintPreviewModal open onOpenChange={setPreviewOpen} {...preview} />
      ) : null}
    </div>
  );
}
