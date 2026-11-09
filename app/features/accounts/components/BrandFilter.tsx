/**
 * Brand filter chip row.
 *
 * Prototype markup (DTX `BrandFilter/BrandFilter.tsx`) — one "All brands"
 * chip plus one chip per brand, each a `<button disabled>` with a coloured
 * dot, a label and a meta count:
 *
 *   <div className="brand-chip-row" role="tablist" aria-label="Brand filter">
 *     <span className="brand-chip-row-label">Brand</span>
 *     <button className="brand-chip brand-all active" role="tab"
 *             aria-selected="true" type="button" disabled>
 *       <span className="brand-chip-dot" />
 *       All brands
 *       <span className="brand-chip-meta">3 total</span>
 *     </button>
 *     … one more chip per brand, each with its own label and count
 *   </div>
 *
 * Class names, DOM order and the `role="tablist"`/`role="tab"` wiring are
 * unchanged from the prototype. The "All brands" chrome stays translated UI
 * copy in `locales/en/accounts.json`.
 *
 * Unlike the prototype, the chips are live filters, not inert demo markup —
 * clicking one narrows the table to accounts referencing that brand, the
 * same way Shopify's own Companies admin filters by "Brands". Filter state
 * lives in the URL (CLAUDE.md coding rule 12): each chip is a
 * `<button type="submit" name="brand">` inside a `<Form method="get">`, so
 * the click is a full navigation and the loader stays authoritative (see
 * `shapeList` in `routes/accounts.tsx`). A hidden input resubmits the active
 * segment unchanged, matching `AccountsToolbar`'s segment chips. Free-text
 * search and column sort are not part of this navigation at all — both are
 * client-side state in `AccountsPage`, so there is nothing of theirs to
 * preserve here.
 *
 * The brand set itself is no longer the prototype's fixed Under
 * Armour/Champion/Other taxonomy — it is the `"brands"` metaobjects actually
 * referenced by companies' `name.brands` metafield (confirmed live against
 * `metafieldDefinition(id: "gid://shopify/MetafieldDefinition/264568176832")`),
 * resolved and counted in the route loader via `summarizeBrandCounts`. Each
 * brand's `name` is live Shopify data, not app-authored UI text, so it is
 * rendered directly rather than through `t()` — the same treatment
 * `AccountsTable` already gives `account.name`. The chip's `className` is
 * likewise derived straight from the brand's `handle` (`brand-${handle}`)
 * rather than a hardcoded per-brand lookup, so a new "brands" metaobject
 * shows up with no code change — `accounts.css` keys dot colours off the
 * same handle-derived class, falling back to a neutral dot otherwise.
 */
import {Form} from 'react-router';
import {useTranslation} from 'react-i18next';
import type {BrandSummary, SegmentFilter} from '../types/account';

export interface BrandFilterProps {
  brandSummaries: BrandSummary[];
  /** The selected "brands" metaobject handle, or `'all'`. */
  activeBrand: string;
  /** Preserved via a hidden input so a brand click doesn't reset the segment. */
  activeSegment: SegmentFilter;
}

export function BrandFilter({
  brandSummaries,
  activeBrand,
  activeSegment,
}: BrandFilterProps) {
  const {t} = useTranslation('accounts');
  const {t: tCommon} = useTranslation('common');

  return (
    <Form
      method="get"
      className="brand-chip-row"
      role="tablist"
      aria-label={t('brands.ariaLabel')}
    >
      <span className="brand-chip-row-label">{t('brands.label')}</span>
      <input type="hidden" name="segment" value={activeSegment} />

      <button
        className={`brand-chip brand-all${activeBrand === 'all' ? ' active' : ''}`}
        role="tab"
        aria-selected={activeBrand === 'all'}
        type="submit"
        name="brand"
        value="all"
      >
        <span className="brand-chip-dot" />
        {t('brands.all.label')}
        <span className="brand-chip-meta">
          {t('brands.all.meta', {count: brandSummaries.length})}
        </span>
      </button>

      {brandSummaries.map((brand) => {
        const active = activeBrand === brand.handle;

        return (
          <button
            key={brand.id}
            className={`brand-chip brand-${brand.handle}${active ? ' active' : ''}`}
            role="tab"
            aria-selected={active}
            type="submit"
            name="brand"
            value={brand.handle}
          >
            <span className="brand-chip-dot" />
            {brand.name}
            <span className="brand-chip-meta">
              {tCommon('format.count', {value: brand.count})}
            </span>
          </button>
        );
      })}
    </Form>
  );
}


