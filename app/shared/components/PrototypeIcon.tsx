/**
 * Prototype icon set.
 *
 * The glyphs are the exact path data from the prototype's `ICON` map, rendered
 * with its `SVG()` wrapper (viewBox 0 0 24 24, `stroke="currentColor"`,
 * stroke-width 1.75, round caps and joins) so icons match pixel for pixel.
 * CLAUDE.md is explicit that the prototype's own inline-SVG set is preserved
 * rather than swapped for lucide equivalents.
 *
 * Two deliberate differences from DTX `app/components/PrototypeIcon.jsx`:
 *
 *   - The paths are real JSX. The prototype (and the DTX port) injected them
 *     with `dangerouslySetInnerHTML`, which defeats React's escaping for no
 *     benefit when the markup is a compile-time constant.
 *   - Only the glyphs the app actually renders are carried. The rest of the
 *     prototype's map is added as the screens that need it are converted,
 *     rather than shipped dead.
 *
 * Every glyph is `aria-hidden`: these are decorative, and the label beside
 * them carries the meaning. An icon used as the sole content of a control
 * needs an `aria-label` on the control itself.
 */

export type PrototypeIconName =
  | 'art'
  | 'book'
  | 'building'
  | 'flag'
  | 'cap'
  | 'commissions'
  | 'contacts'
  | 'customize'
  | 'external'
  | 'eye'
  | 'home'
  | 'insights'
  | 'layers'
  | 'mountain'
  | 'search'
  | 'notifications'
  | 'document'
  | 'orders'
  | 'palette'
  | 'plus'
  | 'quotes'
  | 'sewing'
  | 'settings'
  | 'shield'
  | 'star'
  | 'store'
  | 'switch';

/**
 * `<path d="M5 21V3"/><path d="M5 3l13 2-13 4Z"/>`
 */
const GLYPHS: Record<PrototypeIconName, React.ReactNode> = {
  art: <path d="M4 19 19 4M7 4h13v13M4 7v13h13" />,
  book: <><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2-2Z" /><path d="M5 18a2 2 0 0 1 2-2h12" /></>,
  contacts: <><circle cx="9" cy="8" r="3" /><path d="M3 20c.6-3.2 2.5-5 6-5s5.4 1.8 6 5" /><path d="M16 5.5a3 3 0 0 1 0 5.5M17 15c2 .5 3.2 2 3.7 4" /></>,
  commissions: <><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15 9.5c-.5-1-1.5-1.5-3-1.5s-3 .7-3 2 1.3 2 3 2 3 .7 3 2-1.3 2-3 2-2.5-.5-3-1.5" /></>,
  customize: <><path d="M4 6h16M4 12h16M4 18h16" /><circle cx="8" cy="6" r="2" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" /><circle cx="10" cy="18" r="2" fill="currentColor" stroke="none" /></>,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" /></>,
  document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  flag: (
    <>
      <path d="M5 21V3" />
      <path d="M5 3l13 2-13 4Z" />
    </>
  ),
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
  insights: <><path d="M4 19V5M4 19h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  mountain: (
    <>
      <path d="M3 19l5-9 4 6 5-7 4 10Z" />
      <circle cx="17" cy="6" r="1.2" />
    </>
  ),
  cap: (
    <>
      <path d="M2 8 L12 4 L22 8 L12 12 Z" />
      <path d="M6 10v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4" />
      <line x1="22" y1="8" x2="22" y2="14" />
    </>
  ),
  store: (
    <>
      <path d="M3 8 V21 H21 V8" />
      <path d="M3 8 L5 3 H19 L21 8 Z" />
      <path d="M9 21 v-6 h6 v6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2 L4 5 V11 c0 6 4 9 8 11 c4 -2 8 -5 8 -11 V5 Z" />
      <line x1="8" y1="11" x2="16" y2="11" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <line x1="9" y1="7" x2="9" y2="8" />
      <line x1="15" y1="7" x2="15" y2="8" />
      <line x1="9" y1="11" x2="9" y2="12" />
      <line x1="15" y1="11" x2="15" y2="12" />
      <line x1="9" y1="15" x2="9" y2="16" />
      <line x1="15" y1="15" x2="15" y2="16" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  notifications: (
    <>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </>
  ),
  orders: <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  palette: <><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.13-.29-.29-.44-.65-.44-1.13 0-.93.75-1.69 1.69-1.69h1.99c3.29 0 5.55-2.65 5.55-6.38C22 6.04 17.52 2 12 2z" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  quotes: <><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></>,
  sewing: <><circle cx="8" cy="8" r="3" /><path d="M10 10 20 20M14 4h6v6M4 16h6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19 15a2 2 0 0 0 .4 2.2l.1.1-2 2-.1-.1A2 2 0 0 0 15 19a2 2 0 0 0-1.5 1.8V21h-3v-.2A2 2 0 0 0 9 19a2 2 0 0 0-2.2.4l-.1.1-2-2 .1-.1A2 2 0 0 0 5 15a2 2 0 0 0-1.8-1.5H3v-3h.2A2 2 0 0 0 5 9a2 2 0 0 0-.4-2.2l-.1-.1 2-2 .1.1A2 2 0 0 0 9 5a2 2 0 0 0 1.5-1.8V3h3v.2A2 2 0 0 0 15 5a2 2 0 0 0 2.2-.4l.1-.1 2 2-.1.1A2 2 0 0 0 19 9a2 2 0 0 0 1.8 1.5h.2v3h-.2A2 2 0 0 0 19 15Z" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  switch: <><path d="M7 7h12l-3-3M17 17H5l3 3" /><path d="M19 7v4M5 13v4" /></>,
};

export interface PrototypeIconProps {
  name: PrototypeIconName;
  /** Rendered width and height in px. The prototype's `SVG(icon, w, h)`. */
  size?: number;
  className?: string;
}

export function PrototypeIcon({
  name,
  size = 20,
  className,
}: PrototypeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  );
}
