import type {SVGProps} from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

export function OrderTypeNewIcon({size = 18, strokeWidth = 1.8, className, ...props}: Props) {
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
      <path d="M12 3l2.6 5.6L20 9.5l-4 4 1 5.9L12 16.8 7 19.4l1-5.9-4-4 5.4-.9z" />
    </svg>
  );
}
