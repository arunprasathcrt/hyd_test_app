import type {FetcherWithComponents} from 'react-router';
import {CustomerStep} from './customer-brand/CustomerStep';
import {OrderTypeStep} from './order-type/OrderTypeStep';
import {ProductsStep} from './ProductsStep';
import {ReviewSubmitStep} from './ReviewSubmitStep';
import {ShipStep} from './ship-delievery/ShipStep';
import type {
  DraftOrderStep, DraftOrderIssue,
  NewDraftOrderCustomer,
  NewDraftOrderFieldErrors,
  NewDraftOrderView,
  OrderTypeConfig,
  ShopifyStaffMembersData,
  WorkflowStage,
} from '../../types/new-draft-order';

interface Props {
  step: DraftOrderStep;
  issues: DraftOrderIssue[];
  onIssue: (issue: DraftOrderIssue) => void;
  view: NewDraftOrderView;
  workflow: WorkflowStage[];
  onLock: (kind: 'art' | 'quantity', locked: boolean) => void;
  onSubmitArtProduction: () => void;
  staffMembersData?: ShopifyStaffMembersData;
  staffMembersLoading: boolean;
  onLoadStaffMembers: () => void;
  onRetryStaffMembers: () => void;
  draftReady: boolean;
  serverErrors?: NewDraftOrderFieldErrors;
  leadTimeMethod: string;
  leadTimeMethods: string[];
  leadTimeFlags: string[];
  orderType: string;
  hasProducts: boolean;
  inHandsDate: string;
  soonestInHands: string;
  dateAdjusted: boolean;
  onDateAdjustedChange: (adjusted: boolean) => void;
  customer: NewDraftOrderCustomer | undefined;
  shipToName: string;
  productFocus: {productId: string; nonce: number} | null;
  onPickProducts: () => void;
  orderTypeConfig: FetcherWithComponents<OrderTypeConfig>;
  onSelectNewOrder: () => void;
  onSave: () => void;
  orderId?: string;
}

/** Swaps in the current builder step's panel (prototype `#do112.do112-body`). */
export function DraftOrderStepContent({
  step,
  issues,
  onIssue,
  view,
  workflow,
  onLock,
  onSubmitArtProduction,
  staffMembersData,
  staffMembersLoading,
  onLoadStaffMembers,
  onRetryStaffMembers,
  draftReady,
  serverErrors,
  leadTimeMethod,
  leadTimeMethods,
  leadTimeFlags,
  orderType,
  hasProducts,
  inHandsDate,
  soonestInHands,
  dateAdjusted,
  onDateAdjustedChange,
  customer,
  shipToName,
  productFocus,
  onPickProducts,
  orderTypeConfig,
  onSelectNewOrder,
  onSave,
  orderId,
}: Props) {
  if (step === 'customer') {
    return (
      <CustomerStep
        customers={view.customers}
        availableBrands={view.availableBrands}
        programCodes={view.programCodes}
        programCodes2={view.programCodes2}
        today={view.today}
        soonestInHands={soonestInHands}
        onInHandsDateChange={() => onDateAdjustedChange(false)}
        serverErrors={serverErrors}
      />
    );
  }

  if (step === 'type') {
    return (
      <OrderTypeStep
        today={view.today}
        leadTime={orderTypeConfig.data?.leadTime ?? view.leadTimeDefaults}
        timing={view.shipTiming}
        orderTypes={view.orderTypes}
        orderClassifications={view.orderClassifications}
        interfaceModes={view.interfaceModes}
        defaultOrderClassification={view.orderClassifications[0]?.id ?? ''}
        leadTimeLoading={orderTypeConfig.state === 'loading'}
        onSelectNewOrder={onSelectNewOrder}
      />
    );
  }

  if (step === 'products') {
    if (!draftReady) return null;
    return (
      <ProductsStep
        onPickProducts={onPickProducts}
        workflow={workflow}
        method={leadTimeMethod}
        headerInHands={inHandsDate}
        soonestInHands={soonestInHands}
        shipToName={shipToName}
        focusRequest={productFocus}
      />
    );
  }

  if (step === 'review') {
    return (
      <ReviewSubmitStep
        issues={issues}
        onIssue={onIssue}
        taxRate={view.taxRate}
        workflow={workflow}
        onLock={onLock}
        onSubmitArtProduction={onSubmitArtProduction}
        staffMembersData={staffMembersData}
        staffMembersLoading={staffMembersLoading}
        onLoadStaffMembers={onLoadStaffMembers}
        onRetryStaffMembers={onRetryStaffMembers}
        sentEmails={view.sentEmails}
        customer={customer}
        orderId={orderId}
        onSave={onSave}
        soonestInHands={soonestInHands}
        today={view.today}
        validUntil={view.validUntil}
        version={view.version}
      />
    );
  }

  if (step === 'ship') {
    return (
      <ShipStep
        customer={customer}
        today={view.today}
        shipTiming={view.shipTiming}
        leadTime={orderTypeConfig.data?.leadTime ?? view.leadTimeDefaults}
        selectedMethods={leadTimeMethods}
        selectedFlags={leadTimeFlags}
        orderType={orderType}
        hasProducts={hasProducts}
        dateAdjusted={dateAdjusted}
        onDateAdjustedChange={onDateAdjustedChange}
        serverErrors={serverErrors}
      />
    );
  }

  return null;
}
