import {useTranslation} from 'react-i18next';
import type {Invoice} from '~/features/customerProfileDrawer/types/invoice';
import {Button} from '~/shared/components/ui/Button';

type InvoiceActionRailProps = {
  invoice: Invoice;
};

export function InvoiceActionRail({invoice}: InvoiceActionRailProps) {
  const {t} = useTranslation('invoice');
  const isPaid = invoice.status === 'Paid';
  const isOverdue = invoice.status === 'Overdue';

  return (
    <div className="w-[308px] shrink-0 overflow-auto overscroll-contain rounded-[14px] border border-[#ECECEE] bg-white p-[14px] shadow-[0_16px_48px_rgba(17,17,19,0.14)] max-[860px]:order-[-1] max-[860px]:max-h-[30vh] max-[860px]:w-full">
      {/* Actions */}
      <div className=" mx-[2px] mb-[8px] mt-[6px] text-[10.5px] font-medium uppercase tracking-[0.12em] text-[#8E8E93]">
        {t('actionRail.actionsHeading')}
      </div>

      {/* Print invoice */}
      <Button
        type="button"
        variant="actionRail"
        shape="lg"
        onClick={() => window.print()}
      >
        <span
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[rgba(255,255,255,0.14)] text-sm"
          aria-hidden="true"
        >
          {' '}
          🖨{' '}
        </span>
        <span>
          <span className="block text-[12.5px] font-semibold leading-[1.25] tracking-[-0.005em]">
            {' '}
            {t('actionRail.printInvoice.title')}{' '}
          </span>
          <span className="mt-0.5 block text-[11px] font-light leading-[1.35] text-[rgba(255,255,255,0.72)]">
            {' '}
            {t('actionRail.printInvoice.description')}{' '}
          </span>
        </span>
      </Button>

      {/* Save as PDF */}
      <Button
        type="button"
        variant="productCard"
        shape="lg"
        className="mb-2 w-full"
        onClick={() => window.print()}
      >
        <span
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#F3F3F4] text-[14px]"
          aria-hidden="true"
        >
          ⬇
        </span>

        <span>
          <span
            className="
        block
        text-[12.5px] font-semibold
        leading-[1.25]
        tracking-[-0.005em]
      "
          >
            {t('actionRail.saveAsPdf.title')}
          </span>

          <span
            className="
        mt-[2px] block
        text-[11px] font-light
        leading-[1.35]
        text-[#8E8E93]
      "
          >
            {t('actionRail.saveAsPdf.description')}
          </span>
        </span>
      </Button>

      {/* Email to AP */}
      <Button
        type="button"
        variant="productCard"
        shape="lg"
        disabled
        className="mb-2 w-full"
      >
        <span
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#F3F3F4] text-[14px]"
          aria-hidden="true"
        >
          ✉
        </span>

        <span>
          <span
            className="
        block
        text-[12.5px] font-semibold
        leading-[1.25]
        tracking-[-0.005em]
      "
          >
            {t('actionRail.emailToAp.title')}
          </span>

          <span
            className="
        mt-[2px] block
        text-[11px] font-light
        leading-[1.35]
        text-[#8E8E93]
      "
          >
            {t('actionRail.emailToAp.description', {
              email: invoice.detail.billTo.email,
              salesRep: invoice.detail.salesRep,
            })}
          </span>
        </span>
      </Button>

      {/* Copy link */}
      <Button
        type="button"
        variant="productCard"
        shape="lg"
        disabled
        className="mb-2 w-full"
      >
        <span
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#F3F3F4] text-[14px]"
          aria-hidden="true"
        >
          🔗
        </span>

        <span>
          <span
            className="
        block
        text-[12.5px] font-semibold
        leading-[1.25]
        tracking-[-0.005em]
      "
          >
            {t('actionRail.copyLink.title')}
          </span>

          <span
            className="
        mt-[2px] block
        text-[11px] font-light
        leading-[1.35]
        text-[#8E8E93]
      "
          >
            {t('actionRail.copyLink.description')}
          </span>
        </span>
      </Button>

      {/* Open order */}
      <Button
        type="button"
        variant="productCard"
        shape="lg"
        disabled
        className="mb-2 w-full"
      >
        <span
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-[#F3F3F4] text-[14px]"
          aria-hidden="true"
        >
          📦
        </span>

        <span>
          <span
            className="
        block
        text-[12.5px] font-semibold
        leading-[1.25]
        tracking-[-0.005em]
      "
          >
            {t('actionRail.openOrder.title', {
              orderNumber: invoice.detail.orderNumber,
            })}
          </span>

          <span
            className="
        mt-[2px] block
        text-[11px] font-light
        leading-[1.35]
        text-[#8E8E93]
      "
          >
            {t('actionRail.openOrder.description')}
          </span>
        </span>
      </Button>

      {/* Timeline */}
      <div
        className="
          mx-[2px]
          mb-[8px]
          mt-[14px]
          text-[10.5px] font-medium
          uppercase tracking-[0.12em]
          text-[#8E8E93]
        "
      >
        {t('actionRail.timelineHeading')}
      </div>

      {/* Issued */}
      <div
        className="
          flex gap-[10px]
          px-[2px] py-[7px]
          text-[11.5px]
          leading-[1.35]
          text-[#111113]
        "
      >
        <span
          className="
            mt-[5px]
            h-[6px] w-[6px] shrink-0
            rounded-full
            bg-[#4A8569]
          "
          aria-hidden="true"
        />

        <span
          className="
            w-[52px] shrink-0
            pt-[1px]
            text-[10.5px] font-medium
            uppercase tracking-[0.04em]
            text-[#8E8E93]
          "
        >
          {invoice.issueDate}
        </span>

        <span>
          {t('actionRail.timeline.issued', {
            email: invoice.detail.billTo.email,
          })}
        </span>
      </div>

      {/* NetSuite sync */}
      <div
        className="
          flex gap-[10px]
          px-[2px] py-[7px]
          text-[11.5px]
          leading-[1.35]
          text-[#111113]
        "
      >
        <span
          className="
            mt-[5px]
            h-[6px] w-[6px] shrink-0
            rounded-full
            bg-[#4A8569]
          "
          aria-hidden="true"
        />

        <span
          className="
            w-[52px] shrink-0
            pt-[1px]
            text-[10.5px] font-medium
            uppercase tracking-[0.04em]
            text-[#8E8E93]
          "
        >
          {invoice.issueDate}
        </span>

        <span>
          {t('actionRail.timeline.netSuiteSync', {
            netSuiteRef: invoice.detail.netSuiteRef,
          })}
        </span>
      </div>

      {/* Due */}
      <div
        className="
          flex gap-[10px]
          px-[2px] py-[7px]
          text-[11.5px]
          leading-[1.35]
          text-[#111113]
        "
      >
        <span
          className={`
            mt-[5px]
            h-[6px] w-[6px] shrink-0
            rounded-full
            ${isOverdue ? 'bg-[#B7404E]' : 'bg-[#4A8569]'}
          `}
          aria-hidden="true"
        />

        <span
          className="
            w-[52px] shrink-0
            pt-[1px]
            text-[10.5px] font-medium
            uppercase tracking-[0.04em]
            text-[#8E8E93]
          "
        >
          {invoice.dueDate}
        </span>

        <span>
          {t('actionRail.timeline.due', {terms: invoice.detail.terms})}
        </span>
      </div>

      {/* Payment */}
      {isPaid && (
        <div
          className="
            flex gap-[10px]
            px-[2px] py-[7px]
            text-[11.5px]
            leading-[1.35]
            text-[#111113]
          "
        >
          <span
            className="
              mt-[5px]
              h-[6px] w-[6px] shrink-0
              rounded-full
              bg-[#4A8569]
            "
            aria-hidden="true"
          />
          <span
            className="
              w-[52px] shrink-0
              pt-[1px]
              text-[10.5px] font-medium
              uppercase tracking-[0.04em]
              text-[#8E8E93]
            "
          >
            {invoice.detail.payment.paymentDate}
          </span>
          <span>
            {t('actionRail.timeline.paid', {
              method: invoice.detail.payment.method,
              reference: invoice.detail.payment.reference,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
