import type {SVGProps} from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

export function ChevronUpIcon({size = 16, strokeWidth = 2, className, ...props}: Props) {
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
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}