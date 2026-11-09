import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import type {NewDraftOrderValues} from '../types/new-draft-order';

/** Draft-builder form state — everything but `products`. */
export type NewDraftOrderBuilderValues = Omit<NewDraftOrderValues, 'products'>;

export const EMPTY_BUILDER_VALUES: NewDraftOrderBuilderValues = {
  customerId: '',
  inHandsDate: '',
  inHandsDateManual: false,
  orderName: '',
  description: '',
  programCode: '',
  programCode2: '',
  brands: [],
  orderType: '',
  leadTimeMethods: [],
  leadTimeFlags: [],
  orderClass: '',
  interfaceMode: '',
  cancelDate: '',
  eventDate: '',
  eventName: '',
  billToLocationId: '',
  poNumber: '',
  shipCode: '',
  deliveries: [],
};

interface NewDraftOrderBuilderState extends NewDraftOrderBuilderValues {
  setValues: (values: Partial<NewDraftOrderBuilderValues>) => void;
  reset: (values: NewDraftOrderBuilderValues) => void;
  clear: () => void;
}

/**
 * Mirrors `useNewDraftOrderProductsStore`, so builder form values survive a
 * round trip through other routes the same way product selections do. React Hook Form
 * remains the schema-validated source of truth; this store is kept in sync
 * with it (`NewDraftOrderPage`'s watch/setValue effects), not a replacement.
 */
export const useNewDraftOrderBuilderStore =
  create<NewDraftOrderBuilderState>()(
    persist(
      (set) => ({
        ...EMPTY_BUILDER_VALUES,
        setValues: (values) => set((state) => ({...state, ...values})),
        reset: (values) => set({...values}),
        clear: () => set({...EMPTY_BUILDER_VALUES}),
      }),
      {
        name: 'dtx:new-draft-order:builder',
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );
