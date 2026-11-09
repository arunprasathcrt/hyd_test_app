import {useMemo} from 'react';
import {useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {getDraftTotals} from '../../lib/draft-products';
import {toReviewLines} from '../../lib/review-lines';
import {useNewDraftOrderProductsStore} from '../../store/new-draft-order-products.store';
import type {
  DraftOrderSentEmail, DraftOrderIssue,
  NewDraftOrderCustomer,
  ShopifyStaffMember,
  ShopifyStaffMembersData,
  NewDraftOrderValues,
  WorkflowStage,
} from '../../types/new-draft-order';
import {
  ReviewAuditLog,
  ReviewCommentsCard,
  ReviewLocksCard,
  ReviewNotesCard,
  ReviewSplitCard,
  ReviewSummaryCard,
  ReviewTotalsCard,
  ReviewWorkflowCard,
} from './review';

interface Props {
  taxRate: number;
  issues: DraftOrderIssue[];
  onIssue: (issue: DraftOrderIssue) => void;
  workflow: WorkflowStage[];
  onLock: (kind: 'art' | 'quantity', locked: boolean) => void;
  onSubmitArtProduction: () => void;
  staffMembers: ShopifyStaffMember[];
  staffMembersData?: ShopifyStaffMembersData;
  staffMembersLoading: boolean;
  onLoadStaffMembers: () => void;
  onRetryStaffMembers: () => void;
  sentEmails: DraftOrderSentEmail[];
  customer: NewDraftOrderCustomer | undefined;
  today: string;
  soonestInHands: string;
  validUntil: string;
  version: number;
  onSave: () => void;
  orderId?: string;
}

export function ReviewSubmitStep({
  taxRate,
  issues,
  onIssue,
  workflow,
  onLock,
  onSubmitArtProduction,
  staffMembers,
  staffMembersData,
  staffMembersLoading,
  onLoadStaffMembers,
  onRetryStaffMembers,
  sentEmails,
  customer,
  today,
  soonestInHands,
  validUntil,
  version,
  onSave,
  orderId,
}: Props) {
  const {control} = useFormContext<NewDraftOrderValues>();
   const {t, i18n} = useTranslation('newDraftOrder');
  const [orderName, description, brands, orderType, watchedInHandsDate, leadTimeMethods, finalArtLocked, quantitiesLocked] = useWatch({
    control,
    name: ['orderName', 'description', 'brands', 'orderType', 'inHandsDate', 'leadTimeMethods', 'finalArtLocked', 'quantitiesLocked'],
  });
  const products = useNewDraftOrderProductsStore((state) => state.products);
  const deliveries = useWatch({control, name: 'deliveries'});
  const decorationMethod = leadTimeMethods[0];
  const lines = useMemo(
    () => toReviewLines(products, {
      decoration: decorationMethod,
      deliveries: deliveries ?? [],
      locations: customer?.locations ?? [],
      locale: i18n.language,
      cityLine: (address) => t('newDraftOrder.ship.location.cityLine', address),
    }),
    [products, decorationMethod, deliveries, customer?.locations, i18n.language, t],
  );
  const totals = useMemo(() => getDraftTotals(products, taxRate), [products, taxRate]);

  return (
    <div className="mb-4 flex max-w-full flex-col gap-4">
      <ReviewSummaryCard
        issues={issues}
        onIssue={onIssue}
        lines={lines}
        totals={totals}
        customer={customer}
        orderType={orderType}
        today={today}
        inHandsDate={watchedInHandsDate}
        validUntil={validUntil}
        version={version}
        taxRate={taxRate}
        onSave={onSave}
        draftOrderNumber={orderId}
      />
      <ReviewSplitCard />
      <ReviewTotalsCard taxRate={taxRate} totals={totals} />
      <ReviewLocksCard
        onLock={onLock}
        onSubmitArtProduction={onSubmitArtProduction}
        staffMembersData={staffMembersData}
        staffMembersLoading={staffMembersLoading}
        onLoadStaffMembers={onLoadStaffMembers}
        onRetryStaffMembers={onRetryStaffMembers}
        customerName={customer?.name}
        previewImage={lines[0]?.image}
      />
      <ReviewWorkflowCard
        workflow={workflow}
        lines={lines}
        customer={customer}
        orderId={orderId}
        inHandsDate={watchedInHandsDate}
        soonestInHands={soonestInHands}
        orderTotal={totals.total}
        discountCodes={[...new Set(products.map((product) => product.discountCode.trim()).filter(Boolean))]}
        version={version}
        finalArtLocked={Boolean(finalArtLocked)}
        quantitiesLocked={Boolean(quantitiesLocked)}
        onLock={onLock}
      />
      <ReviewAuditLog />
      <ReviewCommentsCard />
      <ReviewNotesCard />
    </div>
  );
}
