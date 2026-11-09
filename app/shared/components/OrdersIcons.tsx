export function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        left-[11px]
        top-1/2
        z-10
        -translate-y-1/2
        text-[#8B8B8B]
      "
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />

      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

      <polyline points="7 10 12 15 17 10" />

      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      className="
        h-[13px]
        w-[13px]
        shrink-0
        text-[#8B8B8B]
      "
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />

      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="
        h-[11px]
        w-[11px]
        text-[#8B8B8B]
      "
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />

      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
