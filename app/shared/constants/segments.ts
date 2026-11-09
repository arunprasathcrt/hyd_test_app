/**
 * Segment presentation maps.
 *
 * Codes are the data values and live in the Zod enum
 * (`features/accounts/schemas/account.schema.ts`). What lives here is how each
 * code is *presented*: its glyph, and its translation key.
 *
 * Both are exhaustive `Record<SegmentCode, …>`, not runtime-built keys.
 * CLAUDE.md forbids `t('segment.' + code)` because extraction tooling cannot
 * see a key that only exists at runtime; the compensating rule is that adding
 * a segment code without adding its entries below is a type error.
 *
 * Served via: `$app metafield` on `Company` (see
 * `shared/constants/metafields.ts`).
 */
import type {SegmentCode} from '~/features/accounts/types/account';
import type {PrototypeIconName} from '~/shared/components/PrototypeIcon';

/**
 * The prototype's `SEG_ICON` map.
 *
 * ❓ TO CONFIRM — the prototype had no `bookstore` entry even though its filter
 * chips offer that segment, only `university`. `bookstore` reuses the
 * mortarboard until the business confirms whether the two are one segment
 * under two names.
 */
export const SEGMENT_ICONS: Record<SegmentCode, PrototypeIconName> = {
  golf: 'flag',
  resort: 'mountain',
  bookstore: 'cap',
  university: 'cap',
  retail: 'store',
  military: 'shield',
  corporate: 'building',
};

/** Keys into the shared `enums` namespace. */
export const SEGMENT_LABEL_KEYS: Record<SegmentCode, string> = {
  golf: 'segment.golf',
  resort: 'segment.resort',
  bookstore: 'segment.bookstore',
  university: 'segment.university',
  retail: 'segment.retail',
  military: 'segment.military',
  corporate: 'segment.corporate',
};

/**
 * The segment codes the filter chips offer, in prototype order.
 *
 * Deliberately NOT `SEGMENT_CODES`: the prototype's chip row omits
 * `university`, and chip order is a design decision rather than a property of
 * the enum. `all` is not listed because it is not a segment — the toolbar
 * renders it as a leading chip of its own.
 *
 * Prototype source (DTX `AccountsPage.tsx`):
 *
 *   const segments = [
 *     {value: 'all', label: 'All'}, {value: 'golf', label: 'Golf'},
 *     {value: 'resort', label: 'Resort'}, {value: 'bookstore', label: 'Bookstore'},
 *     {value: 'retail', label: 'Retail'}, {value: 'military', label: 'Military'},
 *     {value: 'corporate', label: 'Corporate'},
 *   ];
 */
export const SEGMENT_FILTER_CHIPS: readonly SegmentCode[] = [
  'golf',
  'resort',
  'bookstore',
  'retail',
  'military',
  'corporate',
];
