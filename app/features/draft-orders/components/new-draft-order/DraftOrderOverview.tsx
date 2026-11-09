import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {cn} from '~/shared/utils/cn';
import {isInHandsAtRisk, isoDayToDate, issueLabel} from '../../lib/new-draft-order';
import type {
  BrandCode,
  DraftOrderIssue,
  NewDraftOrderCustomer,
  NewDraftOrderValues,
  WorkflowStage,
} from '../../types/new-draft-order';
import {BuilderTag} from './BuilderFields';
import {ChevronRightIcon} from '../icons/ChevronRightIcon';
import {CloseIcon} from '../icons/CloseIcon';

interface Props {
  id: string;
  open: boolean;
  onClose: () => void;
  /** Set when an existing draft is open; otherwise the draft is new and unnumbered. */
  orderId?: string;
  version: number;
  saved: ReactNode;
  validUntil: string;
  customer: NewDraftOrderCustomer | undefined;
  brands: BrandCode[];
  orderType: NewDraftOrderValues['orderType'];
  orderClass: NewDraftOrderValues['orderClass'];
  orderClassifications: Array<{id: string; label: string}>;
  interfaceMode: NewDraftOrderValues['interfaceMode'];
  interfaceModes: Array<{id: string; label: string}>;
  inHandsDate: string;
  soonestInHands: string;
  taxRate: number;
  productCount: number;
  totals: {
    units: number;
    garments: number;
    decoration: number;
    art: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  issues: DraftOrderIssue[];
  workflow: WorkflowStage[];
  onIssue: (issue: DraftOrderIssue) => void;
}

const sectionClass =
  'border-t border-[#ECECEE] mt-3.5 pt-3.5 first-of-type:mt-0 first-of-type:border-t-0 first-of-type:pt-0';
const eyebrowClass =
  'mb-2 text-xs leading-[1.5] font-medium tracking-[0.06em] text-[#6B6B70] uppercase';

function Kv({
  label,
  children,
  money,
}: {
  label: string;
  children: ReactNode;
  money?: boolean;
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1">
      <dt className="text-xs leading-[1.5] text-[#6B6B70]">{label}</dt>
      <dd
        className={cn(
          'm-0 min-w-0 text-right text-[13px] leading-normal text-[#111113] tabular-nums [overflow-wrap:anywhere]',
          money && 'font-medium',
        )}
      >
        {children}
      </dd>
    </div>
  );
}

/**
 * Prototype `aside#do112Ov.do112-ov`: the sticky Overview rail (1200 px and
 * up) that becomes a bottom sheet under 1200 px.
 *
 * until the Products step exists.
 */
export function DraftOrderOverview({
  id,
  open,
  onClose,
  orderId,
  version,
  saved,
  validUntil,
  customer,
  brands,
  orderType,
  orderClass,
  orderClassifications,
  interfaceMode,
  interfaceModes,
  inHandsDate,
  soonestInHands,
  taxRate,
  productCount,
  totals,
  issues,
  workflow,
  onIssue,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const blocking = issues.filter((issue) => issue.severity === 'block').length;
  const cleared = workflow.filter((stage) => stage.state === 'passed').length;
  const money = (value: number) => t('newDraftOrder.overview.money', {value});
  const next = issues[0];

  return (
    <aside
      id={id}
      aria-label={t('newDraftOrder.sumbar.title')}
      className={cn(
        'box-border overflow-auto overscroll-contain rounded-[14px] border border-[#ECECEE] bg-white px-[18px] pt-[18px] pb-5 [scrollbar-width:thin]',
        'min-[1200px]:sticky min-[1200px]:top-0 min-[1200px]:max-h-[calc(100vh-88px)] min-[1200px]:self-start',
        'max-[1199.98px]:fixed max-[1199.98px]:inset-x-0 max-[1199.98px]:top-auto max-[1199.98px]:bottom-0 max-[1199.98px]:z-[190] max-[1199.98px]:mx-auto max-[1199.98px]:max-h-[min(82vh,760px)] max-[1199.98px]:w-[min(640px,100vw)] max-[1199.98px]:rounded-t-[18px] max-[1199.98px]:rounded-b-none max-[1199.98px]:border-b-0 max-[1199.98px]:pb-[calc(20px+env(safe-area-inset-bottom,0px))] max-[1199.98px]:shadow-[0_-10px_30px_rgba(17,17,19,.1)] max-[1199.98px]:transition-[transform,visibility] max-[1199.98px]:duration-[220ms] max-[1199.98px]:ease-[cubic-bezier(.22,1,.36,1)]',
        open
          ? 'max-[1199.98px]:visible max-[1199.98px]:translate-y-0'
          : 'max-[1199.98px]:invisible max-[1199.98px]:translate-y-[104%]',
      )}
    >
      <div className="-mt-1.5 -mr-1.5 mb-2.5 hidden items-center justify-between gap-3 max-[1199.98px]:flex">
        <b className="text-base font-semibold">
          {t('newDraftOrder.sumbar.title')}
        </b>
        <button
          type="button"
          aria-label={t('newDraftOrder.sheet.close')}
          onClick={onClose}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#6B6B70] hover:bg-[#F7F7F8] hover:text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
        >
          <CloseIcon strokeWidth={1.8} />
        </button>
      </div>

      <section className={sectionClass}>
        <div className={eyebrowClass}>
          {t('newDraftOrder.overview.eyebrow')}
        </div>
        <div className="mb-2 flex items-center gap-1.5">
          <span className="text-[20px] leading-normal font-semibold tracking-[-0.01em] text-[#111113] tabular-nums">
            {orderId ?? t('newDraftOrder.overview.newDraft')}
          </span>
        </div>
        <dl className="m-0 flex flex-col gap-1.5">
          <Kv label={t('newDraftOrder.overview.version')}>
            {t('newDraftOrder.page.subtitle.version', {version})}
          </Kv>
          <Kv label={t('newDraftOrder.overview.saved')}>{saved}</Kv>
          <Kv label={t('newDraftOrder.overview.validUntil')}>
            {t('newDraftOrder.overview.date', {date: isoDayToDate(validUntil)})}
          </Kv>
        </dl>
        {orderId ? null : (
          <p className="m-0 mt-2 text-xs leading-[1.5] text-[#6B6B70]">
            {t('newDraftOrder.overview.numberHint')}
          </p>
        )}
      </section>

      <section className={sectionClass}>
        <dl className="m-0 flex flex-col gap-1.5">
          <Kv label={t('newDraftOrder.overview.customer')}>{customer?.name}</Kv>
          <Kv label={t('newDraftOrder.overview.orderType')}>
            {orderType ? (
              <>
                {t(`newDraftOrder.orderType.options.${orderType}.title`)}
                {orderClass ? (
                  <> · {orderClassifications.find((option) => option.id === orderClass)?.label}</>
                ) : null}
              </>
            ) : (
              <span className="text-[#6B6B70]">
                {t('newDraftOrder.overview.notSet')}
              </span>
            )}
          </Kv>
          <Kv label={t('newDraftOrder.overview.interface')}>
            {interfaceMode ? (
              interfaceModes.find((option) => option.id === interfaceMode)?.label
            ) : (
              <span className="text-[#6B6B70]">
                {t('newDraftOrder.overview.notSet')}
              </span>
            )}
          </Kv>
          <Kv label={t('newDraftOrder.overview.brands')}>
            {brands.join(', ') || (
              <span className="text-[#6B6B70]">{t('newDraftOrder.overview.notSet')}</span>
            )}
          </Kv>
          <Kv label={t('newDraftOrder.overview.targetDelivery')}>
            {t('newDraftOrder.overview.date', {
              date: isoDayToDate(inHandsDate),
            })}
            {isInHandsAtRisk(inHandsDate, soonestInHands) ? (
              <>
                {' '}
                <BuilderTag tone="warn">
                  {t('newDraftOrder.customer.fields.inHands.atRisk')}
                </BuilderTag>
              </>
            ) : null}
          </Kv>
          <Kv label={t('newDraftOrder.overview.status')}>
            <BuilderTag tone="neutral">
              {t('newDraftOrder.status.draft')}
            </BuilderTag>
          </Kv>
          <Kv label={t('newDraftOrder.overview.products')}>
            {t('newDraftOrder.overview.productsValue', {
              bundles: t('newDraftOrder.products.productCount', {
                count: productCount,
              }),
              units: t('newDraftOrder.overview.units', {count: totals.units}),
            })}
          </Kv>
          <Kv label={t('newDraftOrder.overview.shipTo')}>
            {t('newDraftOrder.overview.addresses', {
              count: customer?.shipTo.length ?? 0,
            })}
            {customer?.shipTo[0] ? (
              <span className="block text-xs leading-[1.5] text-[#6B6B70]">
                {customer.shipTo[0]}
              </span>
            ) : null}
          </Kv>
        </dl>
      </section>

      {next ? (
        <section className={sectionClass}>
          <div className={eyebrowClass}>
            {t('newDraftOrder.overview.nextBestAction')}
          </div>
          <button
            type="button"
            onClick={() => onIssue(next)}
            className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-[10px] border border-[#D7D7DA] bg-white px-3 py-2 text-left text-[13px] font-medium text-[#111113] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
          >
            <span>{t(`newDraftOrder.overview.nextActions.${next.key}`)}</span>
            <ChevronRightIcon className="shrink-0" />
          </button>
        </section>
      ) : null}

      {issues.length ? (
        <section className={sectionClass}>
          <div
            className={cn(
              eyebrowClass,
              'flex items-center justify-between gap-2',
            )}
          >
            <span>{t('newDraftOrder.overview.needsAttention')}</span>
            <span className="box-border inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#111113] px-[5px] text-xs font-semibold tracking-normal text-white tabular-nums">
              {issues.length}
            </span>
          </div>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {issues.map((issue) => {
              const step = t(`newDraftOrder.steps.${issue.step}.label`);
              return (
                <li key={issue.id}>
                  <button
                    type="button"
                    onClick={() => onIssue(issue)}
                    className="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-2 py-1.5 text-left text-[#111113] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
                  >
                    <i
                      aria-hidden="true"
                      className={cn(
                        'size-1.5 flex-[0_0_6px] rounded-full',
                        issue.severity === 'block'
                          ? 'bg-[#A02020]'
                          : 'bg-[#B26A00]',
                      )}
                    />
                    <span className="flex min-w-0 flex-auto flex-col">
                      <b className="text-[13px] leading-[1.35] font-medium [overflow-wrap:anywhere]">
                        {issueLabel(t, issue)}
                      </b>
                      <span className="text-xs text-[#6B6B70]">
                        {issue.severity === 'warn'
                          ? t('newDraftOrder.issues.doesNotBlock', {step})
                          : step}
                      </span>
                    </span>
                    <span className="text-[#8E8E93]">
                      <ChevronRightIcon size={14} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {blocking ? (
            <p className="m-0 mt-2 text-xs leading-[1.5] text-[#6B6B70]">
              {t('newDraftOrder.overview.blockSending', {count: blocking})}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className={sectionClass}>
        <div className={eyebrowClass}>
          {t('newDraftOrder.overview.estimate')}
        </div>
        <dl className="m-0 flex flex-col gap-1.5">
          <Kv money label={t('newDraftOrder.overview.garments')}>
            {money(totals.garments)}
          </Kv>
          <Kv money label={t('newDraftOrder.overview.decoration')}>
            {money(totals.decoration)}
          </Kv>
          <Kv money label={t('newDraftOrder.overview.artLicense')}>
            {money(totals.art)}
          </Kv>
          <Kv money label={t('newDraftOrder.overview.subtotal')}>
            {money(totals.subtotal)}
          </Kv>
          <Kv money label={t('newDraftOrder.overview.tax', {rate: taxRate})}>
            {money(totals.tax)}
          </Kv>
        </dl>
        <div className="mt-2.5 flex items-baseline justify-between gap-3 border-t border-[#ECECEE] pt-2.5">
          <span className="text-[13px] font-semibold">
            {t('newDraftOrder.overview.total')}
          </span>
          <b className="text-base font-semibold tabular-nums">
            {money(totals.total)}
          </b>
        </div>
        {customer?.royaltyRate ? (
          <p className="m-0 mt-2 text-xs leading-[1.5] text-[#6B6B70]">
            {t('newDraftOrder.overview.royaltyIncluded', {
              rate: customer.royaltyRate,
            })}
          </p>
        ) : null}
      </section>

      <section className={sectionClass}>
        <div
          className={cn(
            eyebrowClass,
            'flex items-center justify-between gap-2',
          )}
        >
          <span>{t('newDraftOrder.overview.workflow')}</span>
          <span className="text-xs leading-[1.5] tracking-normal text-[#6B6B70] normal-case">
            {t('newDraftOrder.overview.cleared', {
              cleared,
              total: workflow.length,
            })}
          </span>
        </div>
        <ol className="m-0 flex list-none flex-col p-0">
          {workflow.map((stage, index) => (
            <li
              key={stage.code}
              className={cn(
                'relative',
                index > 0 &&
                  "before:absolute before:-top-2 before:left-[19px] before:h-4 before:w-px before:content-['']",
                index > 0 &&
                  (workflow[index - 1].state === 'passed'
                    ? 'before:bg-[#111113]'
                    : 'before:bg-[#D7D7DA]'),
              )}
            >
              <div
                aria-disabled="true"
                className="flex min-h-10 w-full items-center gap-2.5 rounded-[10px] px-2 py-1 text-left text-[#111113]"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'box-border inline-flex size-[22px] flex-[0_0_22px] items-center justify-center rounded-full border bg-white text-white',
                    stage.state === 'passed' && 'border-[#111113] bg-[#111113]',
                    stage.state === 'active' && 'border-2 border-[#111113]',
                    stage.state === 'blocked' && 'border-2 border-[#A02020]',
                    stage.state === 'na' && 'border-dashed border-[#D7D7DA]',
                    stage.state === 'queued' && 'border-[#D7D7DA]',
                  )}
                />
                <span className="flex min-w-0 flex-col">
                  <b
                    className={cn(
                      'text-[13px] leading-[1.35] font-medium',
                      stage.state === 'na' && 'text-[#5C5C61]',
                    )}
                  >
                    {t(`newDraftOrder.overview.stages.${stage.code}`)}
                  </b>
                  <span className="text-xs text-[#6B6B70]">
                    {t('newDraftOrder.overview.stage', {
                      n: index + 1,
                      state: t(
                        `newDraftOrder.overview.stageStates.${stage.state}`,
                      ),
                    })}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
