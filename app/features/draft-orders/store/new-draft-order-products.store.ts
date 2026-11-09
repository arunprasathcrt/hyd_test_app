import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {
  createDraftArt,
  normalizeDraftProduct,
  type CatalogArt,
  type DraftProduct,
} from '../schemas/draft-product.schema';

export type GarmentDrawer = {
  mode: 'newBundle' | 'addGarment' | 'art';
  cardId?: string;
  /** The line Quick pick adds marks to. */
  productId?: string;
};

interface NewDraftOrderProductsState {
  products: DraftProduct[];
  openProductId: string | null;
  addOpen: boolean;
  garmentDrawer: GarmentDrawer | null;
  setOpenProductId: (id: string | null) => void;
  setAddOpen: (open: boolean) => void;
  setGarmentDrawer: (drawer: GarmentDrawer | null) => void;
  setProducts: (products: DraftProduct[]) => void;
  addProducts: (products: DraftProduct[]) => void;
  addGarments: (products: DraftProduct[], cardId?: string) => void;
  duplicateInColor: (sourceId: string) => void;
  addArts: (productId: string, arts: CatalogArt[]) => void;
  updateProduct: (product: DraftProduct) => void;
  removeProduct: (id: string) => void;
  clear: () => void;
}

export const useNewDraftOrderProductsStore =
  create<NewDraftOrderProductsState>()(
    persist(
      (set) => ({
        products: [],
        openProductId: null,
        addOpen: false,
        garmentDrawer: null,
        setOpenProductId: (openProductId) => set({openProductId}),
        setAddOpen: (addOpen) => set({addOpen}),
        setGarmentDrawer: (garmentDrawer) => set({garmentDrawer}),
        setProducts: (products) => set({products}),
        addProducts: (products) =>
          set((state) => {
            const existingIds = new Set(
              state.products.map(
                (product) => product.sourceProductId ?? product.id,
              ),
            );
            const additions = products.filter(
              (product) => !existingIds.has(product.id),
            );
            if (!additions.length) return state;
            const newCardIds = new Map<string, string>();
            additions.forEach((product) => {
              if (!newCardIds.has(product.brand))
                newCardIds.set(product.brand, crypto.randomUUID());
            });
            const groupedAdditions = additions.map((product) => ({
              ...product,
              cardId: newCardIds.get(product.brand),
            }));
            return {
              products: [...state.products, ...groupedAdditions],
              openProductId: groupedAdditions[0].id,
            };
          }),
        addGarments: (picked, cardId) =>
          set((state) => {
            const target = cardId
              ? state.products.find(
                  (product) => (product.cardId ?? product.id) === cardId,
                )
              : undefined;
            if (cardId && !target)
              throw new Error('The selected card no longer exists');
            if (
              target &&
              picked.some((product) => product.brand !== target.brand)
            )
              throw new Error('Garments must use the card brand');
            const lastLine = Math.max(
              0,
              ...state.products.map(
                (product, index) => product.lineNumber ?? index + 1,
              ),
            );
            const newCardIds = new Map<string, string>();
            if (!cardId) {
              picked.forEach((product) => {
                if (!newCardIds.has(product.brand))
                  newCardIds.set(product.brand, crypto.randomUUID());
              });
            }
            const additions = picked.map((product, index) => {
              const id = crypto.randomUUID();
              return {
                ...product,
                id,
                sourceProductId: product.sourceProductId ?? product.id,
                cardId: cardId ?? newCardIds.get(product.brand) ?? id,
                lineNumber: lastLine + index + 1,
                blank: Boolean(cardId),
                variants: product.variants.map((variant) => ({
                  ...variant,
                  quantity: 0,
                })),
              };
            });
            return {
              products: [
                ...state.products.map((product, index) => ({
                  ...product,
                  lineNumber: product.lineNumber ?? index + 1,
                  ...((product.cardId ?? product.id) === cardId
                    ? {cardId, blank: true}
                    : {}),
                })),
                ...additions,
              ],
              openProductId: additions.at(-1)?.id ?? state.openProductId,
              garmentDrawer: null,
            };
          }),
        /**
         * Prototype `qbDuplicateLine`: the line is copied right below its source, in the
         * same card, with every setting and no units. The copy keeps the source's garment.
         */
        duplicateInColor: (sourceId) =>
          set((state) => {
            const source = state.products.find(
              (product) => product.id === sourceId,
            );
            if (!source)
              throw new Error('The line to duplicate no longer exists');
            const cardId = source.cardId ?? source.id;
            const copy: DraftProduct = {
              ...source,
              id: crypto.randomUUID(),
              sourceProductId: source.sourceProductId ?? source.id,
              cardId,
              blank: true,
              variants: source.variants.map((variant) => ({
                ...variant,
                quantity: 0,
              })),
            };
            const at = state.products.indexOf(source);
            return {
              products: [
                ...state.products.slice(0, at + 1),
                copy,
                ...state.products.slice(at + 1),
              ].map((product, index) => ({
                ...product,
                lineNumber: index + 1,
                ...((product.cardId ?? product.id) === cardId
                  ? {cardId, blank: true}
                  : {}),
              })),
              openProductId: copy.id,
            };
          }),
        addArts: (productId, arts) =>
          set((state) => ({
            products: state.products.map((product) =>
              product.id === productId
                ? {
                    ...product,
                    arts: [
                      ...product.arts,
                      ...arts
                        .filter(
                          (art) =>
                            !product.arts.some((added) => added.id === art.id),
                        )
                        .map((art) =>
                          createDraftArt(art, product.decorationMethods[0] ?? ''),
                        ),
                    ],
                  }
                : product,
            ),
            garmentDrawer: null,
          })),
        updateProduct: (updated) =>
          set((state) => ({
            products: state.products.map((product) =>
              product.id === updated.id ? updated : product,
            ),
          })),
        removeProduct: (id) =>
          set((state) => ({
            products: state.products.filter((product) => product.id !== id),
            openProductId:
              state.openProductId === id
                ? (state.products.find((product) => product.id !== id)?.id ??
                  null)
                : state.openProductId,
          })),
        clear: () =>
          set({
            products: [],
            openProductId: null,
            garmentDrawer: null,
            addOpen: false,
          }),
      }),
      {
        name: 'dtx:new-draft-order:products',
        storage: createJSONStorage(() => sessionStorage),
        partialize: ({products}) => ({products}),
        // Rows saved before the brief and the garment lists existed get their defaults.
        merge: (persisted, current) => ({
          ...current,
          products: (
            (persisted as {products?: object[]} | undefined)?.products ?? []
          ).map(normalizeDraftProduct),
        }),
      },
    ),
  );
