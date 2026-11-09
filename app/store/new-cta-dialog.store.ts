import {createStore} from 'zustand/vanilla';

interface NewCtaDialogState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const newCtaDialogStore = createStore<NewCtaDialogState>((set) => ({
  isOpen: false,
  open: () => set({isOpen: true}),
  close: () => set({isOpen: false}),
}));
