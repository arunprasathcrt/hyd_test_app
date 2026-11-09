/**
 * Market-segment badge.
 *
 * Ported from DTX `app/components/shared/SegmentBadge.tsx`. The class name
 * (`seg-badge <code>`), the glyph per segment and the em-dash fallback are
 * unchanged; the label now comes from `enums.json` instead of being the raw
 * data value printed to screen.
 *
 * Shared rather than owned by `features/accounts` because segment is a
 * cross-feature enum — pipeline and the customer overview render the same
 * badge — and its labels live in the shared `enums` namespace.
 */
import {useTranslation} from 'react-i18next';
import type {SegmentCode} from '~/features/accounts/types/account';
import {PrototypeIcon} from '~/shared/components/PrototypeIcon';
import {
  SEGMENT_ICONS,
  SEGMENT_LABEL_KEYS,
} from '~/shared/constants/segments';

export interface SegmentBadgeProps {
  segment: SegmentCode | null;
  /** The "—" shown when a company has no segment set. */
  emptyLabel: string;
}

export function SegmentBadge({segment, emptyLabel}: SegmentBadgeProps) {
  const {t} = useTranslation('enums');

  if (!segment) {
    return <span className="text-3 text-xs">{emptyLabel}</span>;
  }

  return (
    <span className={`seg-badge ${segment}`}>
      <PrototypeIcon name={SEGMENT_ICONS[segment]} size={12} />
      {t(SEGMENT_LABEL_KEYS[segment])}
    </span>
  );
}
