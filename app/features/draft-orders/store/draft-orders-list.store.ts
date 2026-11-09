import {create} from 'zustand';
import {createDuplicateDraftOrder} from '../lib/draft-orders';
import type {DraftOrderListItem} from '../types/draft-order';

interface DraftOrdersListState {
  /** Client working copy of the loader's list, so archive/duplicate act on it. */
  draftOrders: DraftOrderListItem[];
  /** The loader array `draftOrders` was copied from; lets the list detect a stale copy. */
  sourceDraftOrders: DraftOrderListItem[] | null;
  archivedDraftOrders: DraftOrderListItem[];
  /** Replaces the working copy with fresh loader data, keeping archived drafts out. */
  setDraftOrders: (draftOrders: DraftOrderListItem[]) => void;
  /** Moves a draft out of the list into the archive. */
  archive: (id: string) => void;
  /** Moves an archived draft back to the top of the list. */
  restore: (id: string) => void;
  /** The draft the user chose to open; the builder reads it once to prefill its steps. */
  openedDraft: DraftOrderListItem | null;
  /** Adds a copy at the top of the list and returns its new id. */
  duplicate: (id: string) => string | null;
  open: (draftOrder: DraftOrderListItem) => void;
  clearOpened: () => void;
}

/**
 * ❓ TO CONFIRM: the list now comes from the route loader and is copied in via
 * `setDraftOrders`. Archive and duplicate are still client-only; they should
 * become actions; only `openedDraft` is genuinely UI state.
 */
export const useDraftOrdersListStore = create<DraftOrdersListState>()((set, get) => ({
  draftOrders: [],
  sourceDraftOrders: null,
  archivedDraftOrders: [],
  setDraftOrders: (draftOrders) => {
    const archivedIds = new Set(get().archivedDraftOrders.map((candidate) => candidate.id));
    set({
      sourceDraftOrders: draftOrders,
      draftOrders: draftOrders.filter((candidate) => !archivedIds.has(candidate.id)),
    });
  },
  archive: (id) => {
    const {draftOrders, archivedDraftOrders} = get();
    const draftOrder = draftOrders.find((candidate) => candidate.id === id);
    if (!draftOrder) return;
    set({
      draftOrders: draftOrders.filter((candidate) => candidate.id !== id),
      archivedDraftOrders: [draftOrder, ...archivedDraftOrders],
    });
  },
  restore: (id) => {
    const {draftOrders, archivedDraftOrders} = get();
    const draftOrder = archivedDraftOrders.find((candidate) => candidate.id === id);
    if (!draftOrder) return;
    set({
      archivedDraftOrders: archivedDraftOrders.filter((candidate) => candidate.id !== id),
      draftOrders: [draftOrder, ...draftOrders],
    });
  },
  openedDraft: null,
  duplicate: (id) => {
    const {draftOrders} = get();
    const source = draftOrders.find((draftOrder) => draftOrder.id === id);
    if (!source) return null;

    const updatedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const copy = createDuplicateDraftOrder(source, draftOrders, updatedDate);
    set({draftOrders: [copy, ...draftOrders]});
    return copy.id;
  },
  open: (draftOrder) => set({openedDraft: draftOrder}),
  clearOpened: () => set({openedDraft: null}),
}));
