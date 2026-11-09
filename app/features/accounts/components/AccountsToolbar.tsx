/**
 * Accounts toolbar — free-text search plus the segment chip row.
 *
 * Prototype markup (DTX `AccountsPage.tsx`, `Search/Search.tsx`,
 * `FilterChip/FilterChip.tsx`):
 *
 *   <div className="apv-toolbar">
 *     <div className="toolbar">
 *       <div className="search-wrap">
 *         <span className="search-wrap-icon" aria-hidden="true"> magnifier svg </span>
 *         <input id="acc-search" type="text"
 *                placeholder="Search by name, city, contact…" disabled />
 *       </div>
 *       {segments.map((segment) => (
 *         <button type="button" className={`chip${active ? ' active' : ''}`}
 *                 onClick={…} disabled>{segment.label}</button>
 *       ))}
 *     </div>
 *   </div>
 *
 * Class names, DOM order, the input's `id` and the magnifier glyph are
 * unchanged, and every label moved verbatim into the resource files — the
 * segment labels into `enums.json` keyed by code, so the code stays the data
 * value.
 *
 * Two things the prototype did NOT do:
 *
 *   - Its segment chips were `disabled` demo scaffolding, and the active
 *     segment was `useState` in `AccountsPage`. Segment filter state lives in
 *     the URL (CLAUDE.md coding rule 12), so the loader stays authoritative
 *     and a filtered list is a shareable link — clicking a segment chip is a
 *     real GET navigation that re-filters the table server-side (see
 *     `shapeList` in `routes/accounts.tsx`), not inert prototype chrome.
 *     The `.toolbar` div is a `<Form method="get">` for this reason; each
 *     segment chip is a `<button type="submit" name="segment">`, which is how
 *     the chips keep the prototype's exact element and class while still
 *     writing the URL.
 *   - The free-text search input was `disabled` demo scaffolding with no
 *     accessible name. It is now a plain controlled input: typing updates
 *     `AccountsPage`'s client-side search state via `onQueryChange` and
 *     re-filters the table in the same render, with no navigation and no
 *     debounce needed. It carries an `aria-label` for the same reason the
 *     prototype's placeholder wasn't enough on its own. Enter is prevented
 *     from submitting the surrounding segment-chip `<Form>` — this input has
 *     nothing to submit.
 */
import {Form} from 'react-router';
import {useTranslation} from 'react-i18next';
import {PrototypeIcon} from '~/shared/components/PrototypeIcon';
import {
  SEGMENT_FILTER_CHIPS,
  SEGMENT_LABEL_KEYS,
} from '~/shared/constants/segments';
import type {SegmentFilter} from '../types/account';

export interface AccountsToolbarProps {
  /** The current client-side search term. */
  query: string;
  onQueryChange: (value: string) => void;
  activeSegment: SegmentFilter;
  /** Preserved via a hidden input so this form doesn't reset the brand chip. */
  activeBrand: string;
}

export function AccountsToolbar({
  query,
  onQueryChange,
  activeSegment,
  activeBrand,
}: AccountsToolbarProps) {
  const {t} = useTranslation('accounts');
  const {t: tEnums} = useTranslation('enums');

  return (
    <div className="apv-toolbar">
      <Form method="get" className="toolbar" role="search">
        <div className="search-wrap">
          <span className="search-wrap-icon" aria-hidden="true">
            <PrototypeIcon name="search" size={14} />
          </span>

          <input
            id="acc-search"
            type="text"
            placeholder={t('toolbar.search.placeholder')}
            aria-label={t('toolbar.search.ariaLabel')}
            value={query}
            onChange={(event) => onQueryChange(event.currentTarget.value)}
            onKeyDown={(event) => {
              // Nothing to submit — the search is pure client-side state.
              if (event.key === 'Enter') event.preventDefault();
            }}
          />
        </div>

        <input type="hidden" name="brand" value={activeBrand} />

        <SegmentChip
          label={t('toolbar.segment.all')}
          value="all"
          active={activeSegment === 'all'}
        />

        {SEGMENT_FILTER_CHIPS.map((code) => (
          <SegmentChip
            key={code}
            label={tEnums(SEGMENT_LABEL_KEYS[code])}
            value={code}
            active={activeSegment === code}
          />
        ))}
      </Form>
    </div>
  );
}

interface SegmentChipProps {
  label: string;
  value: SegmentFilter;
  active: boolean;
}

/**
 * One chip. A submit button rather than a link so the prototype's `<button
 * className="chip">` is preserved exactly; `name`/`value` put the choice in
 * the query string.
 *
 * `aria-pressed` rather than `aria-selected`: the prototype's chip row is not
 * a tablist (unlike the brand row above it, which is), so a toggle-button
 * state is the accurate one.
 */
function SegmentChip({label, value, active}: SegmentChipProps) {
  return (
    <button
      type="submit"
      name="segment"
      value={value}
      className={`chip${active ? ' active' : ''}`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
