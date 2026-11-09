import {TableCell, TableRow} from '~/shared/components/ui/Table';
import type {DraftOrderListItem} from '../../types/draft-order';
import {DraftOrdersExpandedDetails} from './DraftOrdersExpandedDetails';

interface DraftOrdersAccordionRowProps {
  draftOrder: DraftOrderListItem;
  isExpanded: boolean;
  isArchived?: boolean;
  /** Matches the toggle button's `aria-controls`. */
  panelId: string;
  /** Number of table columns the panel spans. */
  colSpan: number;
}

/** Accordion row shown under a draft order while `isExpanded` is true. */
export function DraftOrdersAccordionRow({
  draftOrder,
  isExpanded,
  isArchived = false,
  panelId,
  colSpan,
}: DraftOrdersAccordionRowProps) {
  if (!isExpanded) return null;

  return (
    <TableRow
      id={panelId}
      className="border-b border-[#ECECEE] bg-white hover:bg-white"
    >
      <TableCell colSpan={colSpan} className="p-0">
        <DraftOrdersExpandedDetails draftOrder={draftOrder} isArchived={isArchived} />
      </TableCell>
    </TableRow>
  );
}
