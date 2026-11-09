import { createPortal } from "react-dom";
import { InvoiceDetailHeader } from "./InvoiceDetailHeader";
import { InvoicePaper } from "./InvoicePaper";
import { InvoiceActionRail } from "./InvoiceActionRail";
import type { Invoice } from "~/features/customerProfileDrawer/types/invoice";

type InvoiceDetailModalProps = {
	invoiceId: string;
	invoices: Invoice[];
	onClose: () => void;
	onNavigate: (invoiceId: string) => void;
};

export function InvoiceDetailModal({
	invoiceId,
	invoices,
	onClose,
	onNavigate,
}: InvoiceDetailModalProps) {
	const currentIndex = invoices.findIndex(
		(invoice) => invoice.id === invoiceId,
	);

	// Prevent rendering with an invalid invoice id.
	if (currentIndex === -1) {
		return null;
	}

	const selectedInvoice = invoices[currentIndex];
	const currentPosition = currentIndex + 1;

	const handlePrevious = () => {
		if (currentIndex <= 0) {
			return;
		}
		onNavigate(invoices[currentIndex - 1].id);
	};

	const handleNext = () => {
		if (currentIndex >= invoices.length - 1) {
			return;
		}
		onNavigate(invoices[currentIndex + 1].id);
	};

	 return createPortal(
		<>
			<div
				role="presentation"
				className="fixed inset-0 z-[220] bg-[rgba(17,17,19,0.46)] print:hidden"
				onClick={onClose}
			/>

			<div
				id="invoicePrintRoot"
				className="pointer-events-none fixed inset-0 z-[221] flex flex-col print:static print:block print:h-auto print:w-auto print:overflow-visible"
				role="dialog"
				aria-modal="true"
				aria-label={`Invoice ${selectedInvoice.id}`}
			>
				<div className="print:hidden">
				<InvoiceDetailHeader
					invoice={selectedInvoice}
					currentPosition={currentPosition}
					totalInvoices={invoices.length}
					onClose={onClose}
					onPrevious={handlePrevious}
					onNext={handleNext}
				/>
				</div>

				<div
					className="
						pointer-events-auto relative mx-auto
						flex min-h-0 flex-1
						w-[min(1240px,96vw)]
						gap-[18px]
						pb-[20px]
						max-[860px]:w-full
						max-[860px]:flex-col
						max-[860px]:gap-[10px]
						max-[860px]:px-[8px]
						max-[860px]:pb-[10px]
						max-[500px]:gap-[6px]
						print:block print:h-auto print:w-full print:gap-0 print:pb-0
					"
				>
					<InvoicePaper invoice={selectedInvoice} />
					<div className="print:hidden">
						<InvoiceActionRail invoice={selectedInvoice} />
					</div>
				</div>
			</div>
		</>, document.body
	);
}

