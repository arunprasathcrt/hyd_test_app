const PRINTING_CLASS = 'printing-single-document';

/** Print a portalled document while hiding all other direct body children. */
export function printOnlyDocument() {
  const root = document.documentElement;
  const clearPrintingState = () => {
    root.classList.remove(PRINTING_CLASS);
    window.removeEventListener('afterprint', clearPrintingState);
  };

  root.classList.add(PRINTING_CLASS);
  window.addEventListener('afterprint', clearPrintingState);
  window.print();
}
