import {createStore} from 'zustand/vanilla';

export function createCatalogStore() {
  return createStore<{
    selectedIds: string[];
    toggle: (id: string) => void;
    select: (ids: string[]) => void;
    clear: () => void;
  }>((set) => ({
    selectedIds: [],
    toggle: (id) =>
      set(({selectedIds}) => ({
        selectedIds: selectedIds.includes(id)
          ? selectedIds.filter((selected) => selected !== id)
          : [...selectedIds, id],
      })),
    select: (ids) => set({selectedIds: [...new Set(ids)]}),
    clear: () => set({selectedIds: []}),
  }));
}
