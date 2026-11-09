import type {SVGProps} from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

export function CalendarIcon({size = 16, strokeWidth = 1.8, className, ...props}: Props) {
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
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M16 3v3M8 3v3M3 9.5h18" />
    </svg>
  );
}
