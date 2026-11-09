import type {SVGProps} from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

export function PlusIcon({size = 16, strokeWidth = 2, className, ...props}: Props) {
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
      <path d="M12 5v14m-7-7h14" />
    </svg>
  );
}