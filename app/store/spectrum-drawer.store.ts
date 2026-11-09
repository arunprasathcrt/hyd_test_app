import {createStore} from 'zustand/vanilla';

interface SpectrumDrawerState {
  /** Whether the Spectrum garment drawer is currently open. */
  isOpen: boolean;

  /** Opens the Spectrum garment drawer. */
  open: () => void;

  /** Closes the Spectrum garment drawer. */
  close: () => void;
}

/**
 * Shared UI state for the Spectrum garment drawer.
 *
 * Allows different entry points, such as Art Design and the left navigation,
 * to open the same drawer without coupling those components together.
 */
export const spectrumDrawerStore = createStore<SpectrumDrawerState>((set) => ({
  isOpen: false,
  open: () => set({isOpen: true}),
  close: () => set({isOpen: false}),
}));