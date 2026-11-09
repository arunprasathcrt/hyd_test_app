import type {SVGProps} from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

export function ZapIcon({size = 16, strokeWidth = 2, className, ...props}: Props) {
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
      <path d="m13 2-3 8h7l-6 12 1-9H5l8-11z" />
    </svg>
  );
}