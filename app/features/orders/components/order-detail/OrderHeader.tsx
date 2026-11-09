// import {useMemo, useState} from 'react';
import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Eye, /* FileText, Printer, */ Send, type LucideIcon} from 'lucide-react';
import {Badge} from '~/shared/components/ui/Badge';
import {Button} from '~/shared/components/ui/Button';
import {ROUTES} from '~/shared/constants/routes';
import {/* buildInvoice, */ STATUS_DOTS} from '../../lib/order-detail';
import type {OrderDetail} from '../../types/order-detail';
// import {InvoicePrintCopy, InvoiceViewer, printInvoice} from './InvoiceViewer';

type ActionKey = 'invoice' | 'print' | 'email';

const ACTIONS: {key: ActionKey; icon: LucideIcon; primary?: boolean; disabled?: boolean}[] = [
  // TODO: "View invoice" and "Print or save as PDF" are hidden until the real invoice
  // data integration is in place (invoices are ERP-only — read path ❓ TO CONFIRM).
  // Re-enable these entries, the invoice state/handlers and the InvoiceViewer render below.
  // {key: 'invoice', icon: FileText},
  // {key: 'print', icon: Printer},
  // TODO: "Email customer" stays disabled until the email sheet (prototype `openSend()`)
  // and the real data integration are built.
  {key: 'email', icon: Send, primary: true, disabled: true},
];

/** Prototype `.page-eyebrow[role="button"]` back link, with its CSS chevron. */
const BACK_LINK =
  "mb-1.5 -ml-1.5 inline-flex min-h-8 items-center rounded-[9px] pr-2.5 pl-1.5 text-[12.5px] font-medium text-[#5C5C61] before:mr-2 before:size-1.5 before:rotate-45 before:border-b-2 before:border-l-2 before:border-current before:content-[''] hover:bg-[#F7F7F8] hover:text-[#111113]";

export function OrderHeader({order}: {order: OrderDetail}) {
  const {t} = useTranslation('orders');

  const metaGroups = [
    [order.account, order.program],
    [t('detail.header.po', {po: order.po}), order.contact, t('detail.header.placed', {date: t('detail.format.date', {value: order.placed})})],
  ];
  // TODO: restore with the real invoice data integration (see ACTIONS above).
  // const [invoiceOpen, setInvoiceOpen] = useState(false);
  // const invoice = useMemo(() => buildInvoice(order), [order]);
  //  TO CONFIRM: "Email customer" needs the email sheet (prototype `openSend()`), not built yet.
  const onAction: Partial<Record<ActionKey, () => void>> = {
    // invoice: () => setInvoiceOpen(true),
    // print: printInvoice,
  };

  return (
    <div className="flex flex-col gap-3 pt-0.5 pb-[18px]">
      {/* TODO: restore with the real invoice data integration (see ACTIONS above). */}
      {/* <InvoiceViewer invoice={invoice} account={order.account} open={invoiceOpen} onOpenChange={setInvoiceOpen} /> */}
      {/* <InvoicePrintCopy invoice={invoice} /> */}
      <div className="min-w-0">
        <Link to={ROUTES.orders} className={BACK_LINK}>
          {t('detail.header.back')}
        </Link>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <h1 className="text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-[#111113] tabular-nums slashed-zero">
            {t('detail.header.title', {id: order.id})}
          </h1>
          <Badge variant="chip" size="md" title={t('detail.header.erpTip')} className="tabular-nums slashed-zero">
            {t('detail.header.erp', {id: order.erpId})}
          </Badge>
          <Badge variant="outline" size="md" dot={STATUS_DOTS[order.status]} data-status={order.status}>
            {t(`detail.status.${order.status}`)}
          </Badge>
          <Badge variant="soft" size="tag">
            {order.channel}
          </Badge>
        </div>
        <p className="mt-1 flex flex-wrap items-baseline gap-y-0.5 text-[13px] leading-[1.5] text-[#5C5C61]">
          {metaGroups.map((group, groupIndex) => (
            <span key={group.join()} className="flex min-w-0 max-w-full flex-wrap items-baseline">
              {group.map((item, index) => {
                const last = groupIndex === metaGroups.length - 1 && index === group.length - 1;
                return (
                  <span key={item} className="min-w-0 max-w-full truncate">
                    {item}
                    {last ? null : (
                      <span aria-hidden="true" className="whitespace-pre text-[#6B6B70]">
                        {' · '}
                      </span>
                    )}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5">
        <span className="text-[12px] leading-[1.5] text-[#6B6B70]">
          {t('detail.header.received', {channel: order.channel})}
        </span>
        <div role="group" aria-label={t('detail.header.actionsLabel')} className="flex flex-wrap items-center gap-2">
          {ACTIONS.map(({key, icon: Icon, primary, disabled}) => (
            <Button
              key={key}
              type="button"
              size="control"
              shape="md"
              variant={primary ? 'default' : 'outline'}
              // No hover tip while disabled: it describes an action the button can't do yet.
              title={disabled ? undefined : t(`detail.header.actions.${key}.tip`)}
              disabled={disabled}
              // The shared Button sets `pointer-events-none` when disabled, which would hide
              // the not-allowed cursor; re-enable pointer events and keep the resting colour on hover.
              className={
                disabled
                  ? 'data-disabled:pointer-events-auto data-disabled:cursor-not-allowed data-disabled:hover:bg-utds-ink'
                  : 'cursor-pointer'
              }
              onClick={onAction[key]}
            >
              <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
              <span>{t(`detail.header.actions.${key}.label`)}</span>
              <Eye aria-hidden="true" size={14} strokeWidth={1.8} className="-ml-0.5 opacity-[.72]" />
              <span className="sr-only">{t('detail.customerSees')}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
