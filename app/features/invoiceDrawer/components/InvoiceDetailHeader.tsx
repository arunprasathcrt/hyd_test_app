import { useTranslation } from "react-i18next";
import type { Invoice } from "~/features/customerProfileDrawer/types/invoice";
import { Button } from "~/shared/components/ui/Button";

type InvoiceDetailHeaderProps = {
  invoice: Invoice;
  currentPosition: number;
  totalInvoices: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

const statusStyles = {
	Paid: "bg-[#EAF1ED] text-[#2E5944]",
	Overdue: "bg-[#FBEAEC] text-[#7A2630]",
	Due: "bg-[#F3F3F4] text-[#5C5C61]",
} as const;


export function InvoiceDetailHeader({
  invoice,
  currentPosition,
  totalInvoices,
  onClose,
  onPrevious,
  onNext,
}: InvoiceDetailHeaderProps) {
	const { t } = useTranslation("invoice");
  const isFirstInvoice = currentPosition === 1;
  const isLastInvoice = currentPosition === totalInvoices;

  return (
    <div
      className="
			pointer-events-auto mx-auto mt-[18px] mb-[12px]
			flex w-[min(1240px,96vw)] items-center gap-[14px]
			rounded-[14px] border border-[#ECECEE] bg-white
			p-[10px_14px]
			shadow-[0_16px_48px_rgba(17,17,19,0.16)]
		"
    >
      {/* Close */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        shape="pill"
        onClick={onClose}
        aria-label={t('header.closeAriaLabel')}
      >
        ×
      </Button>

      {/* Invoice information */}
      <div className="min-w-0 flex-1">
        <div
          className="
					flex flex-wrap items-center gap-[8px]
					text-[14.5px] font-semibold
					tracking-[-0.005em] text-[#111113]
					"
        >
          {invoice.id}
          <span
            className={`
						inline-flex items-center
						rounded-full
						px-[9px] py-[2px]
						text-[10px] font-semibold
						uppercase tracking-[0.07em]
						${statusStyles[invoice.status]}
					`}
          >
            {t(`status.${invoice.status.toLowerCase()}`)}

          </span>
        </div>

        <div
          className="
					mt-[1px]
					text-[11.5px]
					font-light
					text-[#5C5C61]
				"
        >
          {invoice.customer} · {invoice.amount} · {invoice.detail.terms}
        </div>
      </div>

      {/* Invoice navigation */}
      <div className="flex shrink-0 items-center gap-[8px]">
        <Button
          type="button"
          variant="outline"
          size="icon"
          shape="pill"
          onClick={onPrevious}
          disabled={isFirstInvoice}
          aria-label={t('header.previousAriaLabel')}
        >
          ‹
        </Button>

        <span
          className="
					whitespace-nowrap
					text-[11px] font-light
					text-[#8E8E93]
					tabular-nums
				"
        >
					{t("header.position", { current: currentPosition, total: totalInvoices })}
        </span>

        <Button
          type="button"
          variant="outline"
          size="icon"
          shape="pill"
          onClick={onNext}
          disabled={isLastInvoice}
          aria-label={t('header.nextAriaLabel')}
        >
          ›
        </Button>
      </div>
    </div>
  );
}
