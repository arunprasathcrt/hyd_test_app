import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {useTranslation} from 'react-i18next';
import {Printer, X} from 'lucide-react';
import {Dialog} from '@base-ui/react/dialog';
import {Button} from '~/shared/components/ui/Button';
import {printOnlyDocument} from '~/shared/utils/print';
import type {getDraftTotals} from '../../../lib/draft-products';
import type {BrandCode, DraftOrderReviewLine, NewDraftOrderCustomer, NewDraftOrderValues} from '../../../types/new-draft-order';
import {OrderConfirmationPrintCopy} from './OrderConfirmationPrintCopy';
import {ProposedOrderPrintCopy, type PrintShipTo} from './ProposedOrderPrintCopy';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: NewDraftOrderCustomer | undefined;
  orderName: string;
  description: string;
  brands: BrandCode[];
  orderType: NewDraftOrderValues['orderType'];
  today: string;
  inHandsDate: string;
  validUntil: string;
  version: number;
  taxRate: number;
  lines: DraftOrderReviewLine[];
  totals: ReturnType<typeof getDraftTotals>;
  draftOrderNumber?: string;
  shipTo?: PrintShipTo[];
  rep?: string;
  /** Adds the Order confirmation tab; without it only the proposed order shows. */
  confirmation?: {
    orderId: string;
    reference: string;
    promiseDate: string;
    approvedOn?: Record<string, string>;
  };
}

type DocumentKind = 'confirmation' | 'summary';

export function PrintPreviewModal({
  open,
  onOpenChange,
  customer,
  orderName,
  description,
  brands,
  orderType,
  today,
  inHandsDate,
  validUntil,
  version,
  taxRate,
  lines,
  totals,
  draftOrderNumber,
  shipTo,
  rep,
  confirmation,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const [mounted, setMounted] = useState(false);
  const [kind, setKind] = useState<DocumentKind>('summary');

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) setKind('summary');
  }, [open]);

  const showConfirmation = Boolean(confirmation) && kind === 'confirmation';

  const document_ = showConfirmation && confirmation ? (
    <OrderConfirmationPrintCopy
      customer={customer}
      orderId={confirmation.orderId}
      reference={confirmation.reference}
      today={today}
      inHandsDate={inHandsDate}
      promiseDate={confirmation.promiseDate}
      taxRate={taxRate}
      lines={lines}
      totals={totals}
      approvedOn={confirmation.approvedOn}
      rep={rep ?? customer?.rep}
    />
  ) : (
    <ProposedOrderPrintCopy
      customer={customer}
      orderName={orderName}
      description={description}
      brands={brands}
      orderType={orderType}
      today={today}
      inHandsDate={inHandsDate}
      validUntil={validUntil}
      version={version}
      taxRate={taxRate}
      lines={lines}
      totals={totals}
      draftOrderNumber={draftOrderNumber}
      shipTo={shipTo}
      rep={rep ?? customer?.rep}
    />
  );

  return (
    <>
    {mounted && open
      ? createPortal(<div data-print-only="">{document_}</div>, document.body)
      : null}
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1200] bg-[rgba(17,17,19,.42)] transition-opacity duration-[220ms] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-0 z-[1200] m-auto flex h-[calc(100dvh-32px)] w-[min(1080px,calc(100%-32px))] flex-col overflow-hidden rounded-[20px] bg-white font-sans text-[13px] leading-[1.5] text-[#111113] shadow-[0_30px_80px_rgba(17,17,19,.28)] transition-[opacity,translate] duration-[220ms] ease-[cubic-bezier(.22,1,.36,1)] data-[ending-style]:translate-y-2 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0 max-[720px]:h-dvh max-[720px]:w-full max-[720px]:rounded-none">
          {/* Header */}
          <header className="flex items-start justify-between gap-3 border-b border-[#ECECEE] pt-5 pr-4 pb-3 pl-6 max-[720px]:px-4 print:hidden">
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium uppercase leading-[1.5] tracking-[0.06em] text-[#6B6B70]">
                {t('newDraftOrder.review.actions.previewTitle')}
              </div>
              <Dialog.Title className="my-0.5 text-[20px] font-semibold leading-[1.3] tracking-[-0.015em]">
                {t(
                  showConfirmation
                    ? 'newDraftOrder.review.confirmation.title'
                    : 'newDraftOrder.review.print.title',
                )}
              </Dialog.Title>
              <Dialog.Description className="text-[13px] leading-[1.5] text-[#5C5C61]">
                {customer?.name ?? ''} · {draftOrderNumber ?? ''} · {t('newDraftOrder.review.actions.customerNote')}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={t('newDraftOrder.sheet.close')}
              title={t('newDraftOrder.sheet.close')}
              className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6B6B70] hover:bg-[#F7F7F8] hover:text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.8} />
            </Dialog.Close>
          </header>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-4 border-b border-[#ECECEE] px-6 py-3 max-[720px]:px-4 print:hidden">
            {confirmation ? (
              <div
                role="group"
                aria-label={t('newDraftOrder.review.documents.ariaLabel')}
                className="box-border inline-flex max-w-full gap-0.5 overflow-x-auto rounded-xl bg-[#F7F7F8] p-0.75"
              >
                {(['confirmation', 'summary'] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={kind === value}
                    onClick={() => setKind(value)}
                    className="inline-flex min-h-9 cursor-pointer items-center whitespace-nowrap rounded-[9px] border-0 bg-transparent px-3.5 text-[13px] font-medium text-[#5C5C61] transition-[background] duration-150 hover:text-[#111113] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0E6E6E] aria-pressed:bg-white aria-pressed:text-[#111113] aria-pressed:shadow-[0_1px_3px_rgba(17,17,19,.1)]"
                  >
                    {t(`newDraftOrder.review.documents.${value}`)}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm text-[#6B6B70]">
                {t('newDraftOrder.review.print.title')} {draftOrderNumber}.pdf
              </span>
            )}
            <Button
              type="button"
              variant="default"
              size="control"
              shape="md"
              onClick={printOnlyDocument}
              className="shrink-0 cursor-pointer"
            >
              <Printer size={16} aria-hidden="true" strokeWidth={1.8} />
              {t('newDraftOrder.review.actions.print')}
              <span aria-hidden="true" className="inline-flex items-center text-white ml-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-6">{document_}</div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
    </>
  );
}
