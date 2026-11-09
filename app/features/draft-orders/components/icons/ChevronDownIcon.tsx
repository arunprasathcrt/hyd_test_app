import type {SVGProps} from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

export function ChevronDownIcon({size = 16, strokeWidth = 1.8, className, ...props}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
