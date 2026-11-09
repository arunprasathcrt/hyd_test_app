import {useTranslation} from 'react-i18next';
import {Form} from '~/shared/components/ui/Form';
import {ROUTES} from '~/shared/constants/routes';
import {cn} from '~/shared/utils/cn';
import {STEP_ORDER} from '../lib/new-draft-order';
import type {NewDraftOrderFieldErrors, NewDraftOrderView} from '../types/new-draft-order';
import {DraftOrderFooter} from './new-draft-order/DraftOrderFooter';
import {DraftOrderOverview} from './new-draft-order/DraftOrderOverview';
import {DraftOrderStepper} from './new-draft-order/DraftOrderStepper';
import {DraftOrderSummaryBar} from './new-draft-order/DraftOrderSummaryBar';
import {DraftOrderIssuesBanner} from './new-draft-order/DraftOrderIssuesBanner';
import {DraftOrderStepContent} from './new-draft-order/DraftOrderStepContent';
import {NewDraftOrderHeader} from './new-draft-order/NewDraftOrderHeader';
import type {DraftProduct} from '../schemas/draft-product.schema';
import {useNewDraftOrderController} from './new-draft-order/useNewDraftOrderController';

/**
 * The new draft order builder: prototype `#do112.do112-shell`.
 *
 * The step is URL state (`?step=`), so a step can be linked and the browser's
 * back button walks the steps. The form stays mounted across steps, so values
 * typed on one step survive moving to another.
 *
 * All form/store orchestration lives in `useNewDraftOrderController` — this
 * component only renders.
 */
export function NewDraftOrderPage({
  view,
  selectedProducts = [],
  productError = null,
}: {
  view: NewDraftOrderView;
  selectedProducts?: DraftProduct[];
  productError?: string | null;
}) {
  const {t} = useTranslation('newDraftOrder');
  const {
    form,
    navigate,
    step,
    stepIndex,
    isLast,
    nextStep,
    goTo,
    titleRef,
    overviewId,
    overviewOpen,
    setOverviewOpen,
    products,
    totals,
    issues,
    stepIssues,
    hardStop,
    openIssue,
    productFocus,
    customer,
    shipToName,
    deliveries,
    brands,
    orderClass,
    orderType,
    interfaceMode,
    inHandsDate,
    leadTimeMethods,
    leadTimeFlags,
    soonestInHands,
    leadTimeDateAdjusted,
    setLeadTimeDateAdjusted,
    draftReady,
    storageError,
    saving,
    savedOnce,
    existingDraft,
    draftDisplayId,
    result,
    serverErrors,
    save,
    lock,
    submitArtProduction,
    staffMembersData,
    staffMembersLoading,
    loadStaffMembers,
    retryStaffMembers,
    workflow,
    pickProducts,
    orderTypeConfig,
    loadNewOrderConfig,
  } = useNewDraftOrderController({view, selectedProducts, productError});

  const savedLabel = saving
    ? t('newDraftOrder.foot.saving')
    : savedOnce
      ? t('newDraftOrder.foot.saved')
      : t('newDraftOrder.foot.notSaved');

  return (
    <Form {...form}>
      <div className="max-w-[1600px]">
        <div className="grid items-start gap-6 min-[1200px]:grid-cols-[minmax(0,1fr)_320px] max-[1199.98px]:grid-cols-[minmax(0,1fr)] max-[1199.98px]:gap-0">
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
            className="flex min-w-0 flex-col pb-8 max-[768px]:pb-6"
          >
            <NewDraftOrderHeader
              customerName={customer?.name ?? ''}
              orderId={existingDraft?.id}
              status={existingDraft?.status}
              version={existingDraft?.version ?? view.version}
              validUntil={view.validUntil}
            />

            <DraftOrderSummaryBar
              overviewId={overviewId}
              overviewOpen={overviewOpen}
              onOpen={() => setOverviewOpen(true)}
              totalUnits={totals.units}
              totalMoney={totals.total}
              issues={issues}
            />

            <DraftOrderStepper
              current={step}
              issues={issues}
              orderType={orderType}
              productCount={products.length}
              shipToName={shipToName}
              shipToCount={deliveries.length}
              onSelect={goTo}
            />

            <div className="mb-3.5 min-w-0">
              <span className="inline-flex h-6 items-center rounded-full bg-[#F2F2F3] px-2.5 text-xs font-medium text-[#5C5C61] tabular-nums">
                {t('newDraftOrder.stepHead.chip', {
                  n: stepIndex + 1,
                  total: STEP_ORDER.length,
                })}
              </span>
              <h2
                ref={titleRef}
                tabIndex={-1}
                className="mx-0 mt-2 mb-0.5 text-[20px] leading-[1.3] font-semibold tracking-[-0.015em] text-[#111113] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
              >
                {t(`newDraftOrder.steps.${step}.title`)}
              </h2>
              <p className="m-0 text-[13px] leading-normal text-[#5C5C61]">
                {t(`newDraftOrder.steps.${step}.sub`)}
              </p>
            </div>

            <DraftOrderIssuesBanner
              stepIssues={stepIssues}
              hardStop={hardStop}
              onIssue={openIssue}
            />

            <section
              aria-labelledby={undefined}
              className="flex min-w-0 flex-col"
            >
              <DraftOrderStepContent
                issues={issues}
                onIssue={openIssue}
                onLock={lock}
                onSubmitArtProduction={submitArtProduction}
                staffMembersData={staffMembersData}
                staffMembersLoading={staffMembersLoading}
                onLoadStaffMembers={loadStaffMembers}
                onRetryStaffMembers={retryStaffMembers}
                workflow={workflow}
                step={step}
                view={view}
                draftReady={draftReady}
                serverErrors={serverErrors as NewDraftOrderFieldErrors | undefined}
                leadTimeMethod={leadTimeMethods[0] ?? 'screen_print'}
                leadTimeMethods={leadTimeMethods}
                leadTimeFlags={leadTimeFlags}
                orderType={orderType}
                hasProducts={products.length > 0}
                inHandsDate={inHandsDate}
                soonestInHands={soonestInHands}
                dateAdjusted={leadTimeDateAdjusted}
                onDateAdjustedChange={setLeadTimeDateAdjusted}
                customer={customer}
                shipToName={shipToName}
                productFocus={productFocus}
                onPickProducts={pickProducts}
                orderTypeConfig={orderTypeConfig}
                onSelectNewOrder={loadNewOrderConfig}
                onSave={() => void save()}
                orderId={draftDisplayId ?? existingDraft?.id}
              />
            </section>

            {(storageError || productError) && (
              <p role="alert" className="my-3 text-sm text-[#A02020]">
                {t(
                  storageError
                    ? 'newDraftOrder.products.storageError'
                    : productError!,
                )}
              </p>
            )}
            {result && !result.ok && result.formError ? (
              <p
                role="alert"
                className="m-0 text-xs leading-[1.5] text-[#A02020]"
              >
                {t(result.formError)}
              </p>
            ) : null}
            {result?.ok && result.warnings?.map((warning) => (
              <p
                key={warning}
                role="status"
                className="m-0 text-xs leading-[1.5] text-[#6B4A0B]"
              >
                {t(warning)}
              </p>
            ))}

            <DraftOrderFooter
              saved={savedLabel}
              saving={saving}
              backTooltip={t('newDraftOrder.foot.backTooltip', {
                step:
                  stepIndex === 0
                    ? t('newDraftOrder.page.eyebrow')
                    : t(`newDraftOrder.steps.${STEP_ORDER[stepIndex - 1]}.title`),
              })}
              primaryTooltip={
                isLast
                  ? undefined
                  : t('newDraftOrder.foot.nextTooltip', {
                      step: t(`newDraftOrder.steps.${nextStep}.title`),
                    })
              }
              primaryLabel={
                isLast
                  ? t('newDraftOrder.foot.send')
                  : t('newDraftOrder.foot.next', {
                      step: t(`newDraftOrder.steps.${nextStep}.label`),
                    })
              }
              primaryKind={isLast ? 'send' : 'next'}
              primaryDisabled={!draftReady || isLast}
              onBack={() => {
                if (stepIndex === 0) void navigate(ROUTES.draftOrders);
                else void goTo(STEP_ORDER[stepIndex - 1]);
              }}
              onSave={() => void save()}
              onPrimary={() => {
                if (!isLast) void goTo(nextStep);
              }}
            />
          </form>

          <DraftOrderOverview
            id={overviewId}
            open={overviewOpen}
            onClose={() => setOverviewOpen(false)}
            orderId={existingDraft?.id}
            version={existingDraft?.version ?? view.version}
            saved={savedLabel}
            validUntil={view.validUntil}
            customer={customer}
            brands={brands}
            orderType={orderType}
            orderClass={orderClass}
            orderClassifications={view.orderClassifications}
            interfaceMode={interfaceMode}
            interfaceModes={view.interfaceModes}
            inHandsDate={inHandsDate}
            soonestInHands={soonestInHands}
            taxRate={view.taxRate}
            totals={totals}
            productCount={products.length}
            issues={issues}
            workflow={workflow}
            onIssue={openIssue}
          />

          <div
            aria-hidden="true"
            onClick={() => setOverviewOpen(false)}
            className={cn(
              'fixed inset-0 z-[180] hidden bg-[rgba(17,17,19,.32)] transition-[opacity,visibility] duration-200 max-[1199.98px]:block',
              overviewOpen ? 'visible opacity-100' : 'invisible opacity-0',
            )}
          />
        </div>
      </div>
    </Form>
  );
}