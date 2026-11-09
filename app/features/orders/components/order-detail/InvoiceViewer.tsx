import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {useTranslation} from 'react-i18next';
import {Dialog} from '@base-ui/react/dialog';
import {Eye, Printer, Send, X} from 'lucide-react';
import {Badge} from '~/shared/components/ui/Badge';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';
import type {OrderInvoice} from '../../types/order-detail';
import {InvoicePaper} from './InvoicePaper';

const PRINTING_CLASS = 'invoice-printing';

/**
 * Prints only the invoice (prototype `printSource()` with a preview): sets
 * `html.invoice-printing`, which the print rules in `app.css` use to hide
 * everything but `InvoicePrintCopy`.
 */
export function printInvoice() {
  const root = document.documentElement;
  const done = () => {
    root.classList.remove(PRINTING_CLASS);
    window.removeEventListener('afterprint', done);
  };
  root.classList.add(PRINTING_CLASS);
  window.addEventListener('afterprint', done);
  window.print();
}

/** Print-only copy of the invoice, kept at the end of `<body>` so it prints on its own. */
export function InvoicePrintCopy({invoice}: {invoice: OrderInvoice}) {
  // Portals need `document`, which only exists after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div data-invoice-print="">
      <InvoicePaper invoice={invoice} />
    </div>,
    document.body,
  );
}

type Zoom = 'fit' | 'actual';

const ZOOMS: Zoom[] = ['fit', 'actual'];

/** Customer-sees marker (prototype `csMark()`). */
function CustomerSees() {
  const {t} = useTranslation('orders');
  return (
    <>
      <Eye aria-hidden="true" size={14} strokeWidth={1.8} className="-ml-0.5 opacity-[.72]" />
      <span className="sr-only">{t('detail.customerSees')}</span>
    </>
  );
}

/**
 * Invoice viewer sheet (prototype `openViewer()` in `#od113L`): header, tools
 * row with the internal note, zoom and actions, then the document on a well.
 */
export function InvoiceViewer({
  invoice,
  account,
  open,
  onOpenChange,
}: {
  invoice: OrderInvoice;
  account: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {t} = useTranslation('orders');
  const [zoom, setZoom] = useState<Zoom>('fit');
  const issued = invoice.issued;
  const kind = invoice.kind;

  const sub = t(`detail.invoice.sub.${kind}`, {
    account,
    id: invoice.orderId,
    erp: invoice.erpId,
    total: t('detail.format.money', {value: invoice.total}),
    date: issued ? t('detail.format.date', {value: issued.issued}) : undefined,
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1200] bg-[rgba(17,17,19,.42)] transition-opacity duration-[220ms] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-0 z-[1200] m-auto flex h-[calc(100dvh-32px)] w-[min(1080px,calc(100%-32px))] flex-col overflow-hidden rounded-[20px] bg-white font-sans text-[13px] leading-[1.5] text-[#111113] shadow-[0_30px_80px_rgba(17,17,19,.28)] transition-[opacity,translate] duration-[220ms] ease-[cubic-bezier(.22,1,.36,1)] data-[ending-style]:translate-y-2 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0 max-[720px]:h-dvh max-[720px]:w-full max-[720px]:rounded-none">
          <header className="flex items-start justify-between gap-3 border-b border-[#ECECEE] pt-5 pr-4 pb-3 pl-6 max-[720px]:px-4">
            <div className="min-w-0">
              <div className="text-[12px] font-medium uppercase leading-[1.5] tracking-[0.06em] text-[#6B6B70]">
                {t('detail.invoice.eyebrow')}
              </div>
              <Dialog.Title className="my-0.5 text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] wrap-anywhere">
                {issued ? t('detail.invoice.title.issued', {number: issued.number}) : t('detail.invoice.title.proForma')}
              </Dialog.Title>
              <Dialog.Description className="text-[13px] leading-[1.5] text-[#5C5C61]">{sub}</Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={t('detail.invoice.close')}
              title={t('detail.invoice.close')}
              className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6B6B70] hover:bg-[#F7F7F8] hover:text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.8} />
            </Dialog.Close>
          </header>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b border-[#ECECEE] px-6 py-3 max-[720px]:px-4">
            <div
              data-internal="true"
              className="flex min-w-0 flex-[1_1_320px] items-start gap-2 rounded-[10px] bg-[#F7F7F8] px-2.5 py-2 text-[12px] leading-[1.5] text-[#5C5C61]"
            >
              <Badge variant="plain" size="tag">
                {t('detail.invoice.internalTag')}
              </Badge>
              <span>{t(`detail.invoice.note.${kind}`)}</span>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2 max-[720px]:ml-0 max-[720px]:w-full">
              <div
                role="group"
                aria-label={t('detail.invoice.zoom.label')}
                className="inline-flex gap-0.5 rounded-[12px] bg-[#F7F7F8] p-[3px]"
              >
                {ZOOMS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={zoom === value}
                    onClick={() => setZoom(value)}
                    className="min-h-[34px] cursor-pointer whitespace-nowrap rounded-[9px] px-3 text-[13px] font-medium text-[#5C5C61] hover:text-[#111113] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0E6E6E] aria-pressed:bg-white aria-pressed:text-[#111113] aria-pressed:shadow-[0_1px_3px_rgba(17,17,19,.1)]"
                  >
                    {t(`detail.invoice.zoom.${value}`)}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                size="control"
                shape="md"
                variant="outline"
                title={t('detail.invoice.print.tip')}
                onClick={printInvoice}
                className="cursor-pointer max-[720px]:flex-auto"
              >
                <Printer aria-hidden="true" size={16} strokeWidth={1.8} />
                <span>{t('detail.invoice.print.label')}</span>
                <CustomerSees />
              </Button>
              {/* TO CONFIRM: the email sheet (prototype `openSend()`) is not built yet. */}
              <Button
                type="button"
                size="control"
                shape="md"
                title={t('detail.invoice.email.tip')}
                disabled
                className="max-[720px]:order-first max-[720px]:basis-full"
              >
                <Send aria-hidden="true" size={16} strokeWidth={1.8} />
                <span>{t('detail.invoice.email.label')}</span>
                <CustomerSees />
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 overflow-auto bg-[#F5F5F6]">
            <div
              className={cn(
                'mx-auto flex flex-col items-center gap-4 p-6 max-[720px]:p-4',
                zoom === 'fit' ? 'w-full min-w-0' : 'min-w-min',
              )}
            >
              <InvoicePaper
                invoice={invoice}
                className={zoom === 'fit' ? 'w-[min(816px,100%)]' : 'w-[816px] shrink-0'}
              />
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
