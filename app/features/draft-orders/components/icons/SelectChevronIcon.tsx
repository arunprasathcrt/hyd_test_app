import type {SVGProps} from 'react';

export function SelectChevronIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}
