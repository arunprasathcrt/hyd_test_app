import { useTranslation } from "react-i18next";
import type { Invoice } from "~/features/customerProfileDrawer/types/invoice";


type InvoicePaperProps = {
  invoice: Invoice;
};

export function InvoicePaper({ invoice }: InvoicePaperProps) {
  const { t } = useTranslation("invoice");
  const isPaid = invoice.status === "Paid";
  const isOverdue = invoice.status === "Overdue";

  return (
    <div className="min-w-0 flex-1 max-w-[900px] overflow-auto overscroll-contain rounded-[14px] bg-[#3B3B40] p-[26px] shadow-[0_16px_48px_rgba(17,17,19,0.18)] max-[860px]:p-[12px] max-[500px]:p-[8px] print:max-w-none print:flex-none print:w-full print:overflow-visible print:p-0 print:bg-white print:shadow-none">
      <div
        id="utxInvSheet"
        aria-label={`Invoice ${invoice.id}`}
        className="relative mx-auto flex min-h-[980px] w-[820px] max-w-none flex-col rounded-[4px] bg-white px-[56px] pb-[44px] pt-[54px] text-[12.5px] leading-[1.5] text-[#111113] shadow-[0_24px_60px_rgba(0,0,0,0.35)] print:mx-0 print:w-full print:min-h-0 print:shadow-none"
      >
        {/* Status Stamp */}
        {(isPaid || isOverdue) && (
          <div
            className={`absolute right-[52px] top-[118px] rotate-[-11deg] rounded-[8px] border-[3px] px-[16px] py-[5px] text-[17px] font-bold tracking-[0.2em] opacity-[0.55] ${isOverdue
              ? "border-[#B42318] text-[#B42318]"
              : "border-[#2E5944] text-[#2E5944]"
              }`}
          >
            {t(`status.${invoice.status.toLowerCase()}`).toUpperCase()}
          </div>
        )}

        {/* Invoice Header */}
        <div className="flex items-start justify-between gap-[20px]">
          {/* Company Information */}
          <div>
            <div className="text-[21px] font-bold leading-none tracking-[0.3em] text-[#111113]">
              {t("paper.companyName")}
            </div>

            <div className="mt-[4px] text-[9.5px] font-medium tracking-[0.62em] text-[#5C5C61]">
              {t("paper.companyTagline")}
            </div>

            <div className="mt-[12px] text-[10.5px] font-light leading-[1.6] text-[#5C5C61]">
              {t("paper.companyAddress")}
              <br />
              {t("paper.companyContact")}
            </div>
          </div>

          {/* Invoice Information */}
          <div className="text-right">
            <div className="text-[27px] font-light leading-none tracking-[0.3em] text-[#111113]">
              {t("paper.title")}
            </div>

            <div className="mt-[8px] text-[14px] font-semibold tabular-nums text-[#111113]">
              {invoice.id}
            </div>

            <div className="mt-[3px] text-[10.5px] font-light text-[#5C5C61]">
              {t("paper.issuedDue", { issueDate: invoice.issueDate, dueDate: invoice.dueDate })}
            </div>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="my-[22px] grid grid-cols-4 gap-x-[16px] gap-y-[10px] border-y border-[#ECECEE] py-[12px]">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.meta.customerNumber")}
            </div>
            <div className="mt-[2px] text-[11.5px] font-medium tabular-nums text-[#111113]">
              {invoice.detail.customerNumber}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.meta.poNumber")}
            </div>
            <div className="mt-[2px] text-[11.5px] font-medium tabular-nums text-[#111113]">
              {invoice.detail.poNumber}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.meta.order")}
            </div>
            <div className="mt-[2px] text-[11.5px] font-medium tabular-nums text-[#111113]">
              {invoice.detail.orderNumber}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.meta.netSuiteRef")}
            </div>
            <div className="mt-[2px] text-[11.5px] font-medium tabular-nums text-[#111113]">
              {invoice.detail.netSuiteRef}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.meta.invoiceDate")}
            </div>
            <div className="mt-[2px] text-[11.5px] font-medium tabular-nums text-[#111113]">
              {invoice.issueDate}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.meta.dueDate")}
            </div>
            <div className="mt-[2px] text-[11.5px] font-medium tabular-nums text-[#111113]">
              {invoice.dueDate}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.meta.terms")}
            </div>
            <div className="mt-[2px] text-[11.5px] font-medium text-[#111113]">
              {invoice.detail.terms}
            </div>
          </div>

          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.meta.salesRep")}
            </div>
            <div className="mt-[2px] text-[11.5px] font-medium text-[#111113]">
              {invoice.detail.salesRep}
            </div>
          </div>
        </div>

        {/* Invoice Parties */}
        <div className="mb-[20px] grid grid-cols-3 gap-[16px]">
          {/* Bill To */}
          <div>
            <div className="mb-[5px] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.parties.billTo")}
            </div>

            <div className="text-[11.5px] leading-[1.55] text-[#111113]">
              <span className="font-semibold">
                {invoice.detail.billTo.name}
              </span>

              <br />

              <span className="font-light text-[#5C5C61]">
                {invoice.detail.billTo.attention}
              </span>

              <br />

              <span className="font-light text-[#5C5C61]">
                {invoice.detail.billTo.location}
              </span>

              <br />

              <span className="font-light text-[#5C5C61]">
                {invoice.detail.billTo.email}
              </span>
            </div>
          </div>

          {/* Ship To */}
          <div>
            <div className="mb-[5px] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.parties.shipTo")}
            </div>

            <div className="text-[11.5px] leading-[1.55] text-[#111113]">
              <span className="font-semibold">
                {invoice.detail.shipTo.name}
              </span>

              <br />

              <span className="font-light text-[#5C5C61]">
                {invoice.detail.shipTo.location}
              </span>

              <br />

              <span className="font-light text-[#5C5C61]">
                {invoice.detail.shipTo.reference}
              </span>
            </div>
          </div>

          {/* Remit To */}
          <div>
            <div className="mb-[5px] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.parties.remitTo")}
            </div>

            <div className="text-[11.5px] leading-[1.55] text-[#111113]">
              <span className="font-semibold">
                {invoice.detail.remitTo.name}
              </span>

              <br />

              <span className="font-light text-[#5C5C61]">
                {invoice.detail.remitTo.reference}
              </span>

              <br />

              <span className="font-light text-[#5C5C61]">
                {invoice.detail.remitTo.address}
              </span>

              <br />

              <span className="font-light text-[#5C5C61]">
                {invoice.detail.remitTo.payment}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-[14px] w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-[38%] border-b-2 border-[#111113] pb-[7px] pr-[6px] text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
                  {t("paper.items.item")}
                </th>

                <th className="border-b-2 border-[#111113] pb-[7px] pr-[6px] text-left text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
                  {t("paper.items.sizeRun")}
                </th>

                <th className="border-b-2 border-[#111113] pb-[7px] pr-0 text-right text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
                  {t("paper.items.qty")}
                </th>

                <th className="border-b-2 border-[#111113] pb-[7px] pr-0 text-right text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
                  {t("paper.items.unit")}
                </th>

                <th className="border-b-2 border-[#111113] pb-[7px] pr-0 text-right text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
                  {t("paper.items.amount")}
                </th>
              </tr>
            </thead>

            <tbody>
              {invoice.detail.items.map((item) => (
                <tr
                  key={item.id}
                  className={
                    item.isDecoration
                      ? "[&>td]:pb-[8px] [&>td]:pt-[2px] [&>td]:text-[11px] [&>td]:font-light [&>td]:text-[#5C5C61]"
                      : "[&>td]:border-t [&>td]:border-[#F0F0F2]"
                  }
                >
                  <td
                    className={
                      item.isDecoration
                        ? "align-top pr-[6px]"
                        : "align-top pb-[3px] pt-[9px] pr-[6px] text-[11.5px] text-[#111113]"
                    }
                  >
                    {item.isDecoration ? (
                      <>↳ {item.name}</>
                    ) : (
                      <>
                        <div className="font-semibold tracking-[-0.005em]">
                          {item.name}
                        </div>

                        <div className="mt-[1px] text-[10.5px] font-light text-[#8E8E93]">
                          {item.description}
                        </div>
                      </>
                    )}
                  </td>

                  <td
                    className={
                      item.isDecoration
                        ? "align-top pr-[6px]"
                        : "align-top pb-[3px] pt-[9px] pr-[6px] text-[10.5px] font-light text-[#5C5C61]"
                    }
                  >
                    <span className="tabular-nums">
                      {item.sizeRun}
                    </span>
                  </td>

                  <td
                    className={`align-top text-right tabular-nums ${item.isDecoration
                      ? "pb-[8px] pt-[2px] text-[11px] font-light text-[#5C5C61]"
                      : "pb-[3px] pt-[9px] text-[11.5px] text-[#111113]"
                      }`}
                  >
                    {item.quantity}
                  </td>

                  <td
                    className={`align-top text-right tabular-nums ${item.isDecoration
                      ? "pb-[8px] pt-[2px] text-[11px] font-light text-[#5C5C61]"
                      : "pb-[3px] pt-[9px] text-[11.5px] text-[#111113]"
                      }`}
                  >
                    {item.unitPrice}
                  </td>

                  <td
                    className={`align-top text-right tabular-nums ${item.isDecoration
                      ? "pb-[8px] pt-[2px] text-[11px] font-light text-[#5C5C61]"
                      : "pb-[3px] pt-[9px] text-[11.5px] text-[#111113]"
                      }`}
                  >
                    {item.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals + Payment */}
        <div className="mt-[4px] flex w-full min-w-0 items-start gap-[26px]">
          {/* Payment / Notes */}
          <div className="min-w-0 flex-1 text-[10.5px] font-light leading-[1.65] text-[#5C5C61]">
            <div className="mb-[4px] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
              {t("paper.payment.heading")}
            </div>

            <div>
              {invoice.detail.payment.instructions}
            </div>

            <div>
              {t("paper.payment.salesTax", { rate: invoice.detail.payment.salesTaxRate })}
            </div>

            {/* Payment Record */}
            {invoice.detail.payment.paymentDate &&
              invoice.detail.payment.reference && (
                <div className="mt-[14px]">
                  <div className="mb-[4px] text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
                    {t("paper.payment.paymentsHeading")}
                  </div>

                  <div className="flex justify-between gap-[12px] border-t border-[#F0F0F2] py-[6px] text-[11px] tabular-nums text-[#5C5C61]">
                    <span>
                      {t("paper.payment.record", {
                        date: invoice.detail.payment.paymentDate,
                        method: invoice.detail.payment.method,
                        reference: invoice.detail.payment.reference,
                      })}
                    </span>

                    <span>{invoice.detail.payment.amount}</span>
                  </div>
                </div>
              )}
          </div>

          {/* Totals */}
          <table className="w-[288px] shrink-0 border-collapse">
            <tbody>
              <tr>
                <td className="pr-[14px] py-[4px] text-[11.5px] font-light text-[#5C5C61]">
                  {t("paper.totals.merchandise")}
                </td>
                <td className="py-[4px] text-right text-[11.5px] font-medium tabular-nums text-[#111113]">
                  {invoice.detail.totals.merchandise}
                </td>
              </tr>

              <tr>
                <td className="pr-[14px] py-[4px] text-[11.5px] font-light text-[#5C5C61]">
                  {t("paper.totals.decoration")}
                </td>
                <td className="py-[4px] text-right text-[11.5px] font-medium tabular-nums text-[#111113]">
                  {invoice.detail.totals.decoration}
                </td>
              </tr>

              {invoice.detail.totals.artSetup && (
                <tr>
                  <td className="pr-[14px] py-[4px] text-[11.5px] font-light text-[#5C5C61]">
                    {t("paper.totals.artSetup")}
                  </td>
                  <td className="py-[4px] text-right text-[11.5px] font-medium tabular-nums text-[#111113]">
                    {invoice.detail.totals.artSetup}
                  </td>
                </tr>
              )}

              <tr>
                <td className="pr-[14px] py-[4px] text-[11.5px] font-light text-[#5C5C61]">
                  {t("paper.totals.licensingRoyalty", { rate: "10%" })}
                </td>
                <td className="py-[4px] text-right text-[11.5px] font-medium tabular-nums text-[#111113]">
                  {invoice.detail.totals.licensingRoyalty}
                </td>
              </tr>

              <tr>
                <td className="pr-[14px] py-[4px] text-[11.5px] font-light text-[#5C5C61]">
                  {t("paper.totals.freight")}
                </td>
                <td className="py-[4px] text-right text-[11.5px] font-medium tabular-nums text-[#111113]">
                  {invoice.detail.totals.freight}
                </td>
              </tr>

              <tr>
                <td className="pr-[14px] py-[4px] text-[11.5px] font-light text-[#5C5C61]">
                  {t("paper.totals.salesTax", { rate: invoice.detail.payment.salesTaxRate })}
                </td>
                <td className="py-[4px] text-right text-[11.5px] font-medium tabular-nums text-[#111113]">
                  {invoice.detail.totals.tax}
                </td>
              </tr>

              <tr>
                <td className="border-t-2 border-[#111113] pt-[8px] pr-[14px] text-[12.5px] font-semibold text-[#111113]">
                  {t("paper.totals.invoiceTotal")}
                </td>
                <td className="border-t-2 border-[#111113] pt-[8px] text-right text-[12.5px] font-semibold tabular-nums text-[#111113]">
                  {invoice.detail.totals.invoiceTotal}
                </td>
              </tr>

              <tr>
                <td className="pr-[14px] pt-[4px] text-[11.5px] font-light text-[#5C5C61]">
                  {t("paper.totals.paymentsApplied")}
                </td>
                <td className="pt-[4px] text-right text-[11.5px] font-medium tabular-nums text-[#111113]">
                  {invoice.detail.totals.paymentsApplied}
                </td>
              </tr>

              <tr
                className={
                  invoice.detail.totals.balanceDue === "$0.00"
                    ? "text-[#2E5944]"
                    : isOverdue
                      ? "text-[#B42318]"
                      : "text-[#111113]"
                }
              >
                <td className="pr-[14px] pt-[6px] text-[14px] font-bold">
                  {t("paper.totals.balanceDue")}
                </td>

                <td className="pt-[6px] text-right text-[14px] font-bold tabular-nums">
                  {invoice.detail.totals.balanceDue}
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Invoice Footer */}
        <div className="mt-auto flex justify-between gap-[14px] border-t border-[#ECECEE] pt-[16px] text-[10px] font-light leading-[1.6] text-[#8E8E93]">
          <span>
            {t("paper.footer.note")}
          </span>

          <span className="whitespace-nowrap">
            {t("paper.footer.questions", { salesRep: invoice.detail.salesRep })}
          </span>
        </div>
      </div>
    </div>
  );
}


