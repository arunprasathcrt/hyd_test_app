import {clsx, type ClassValue} from 'clsx';
import {extendTailwindMerge} from 'tailwind-merge';

/** Teaches tailwind-merge the UTDS radius scale so `rounded-utds-*` classes dedupe. */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['utds-sm', 'utds-md', 'utds-lg', 'utds-xl', 'utds-2xl', 'utds-pill'],
    },
  },
});

/** Joins classes (strings, arrays, objects), skips empty ones. Later class wins. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
