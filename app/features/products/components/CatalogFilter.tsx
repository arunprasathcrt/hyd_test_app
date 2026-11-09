import {useId, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ChevronDown, Grid2X2, SlidersHorizontal, Star} from 'lucide-react';
import type {CatalogBook} from '../schemas/product.schema';
import type {CatalogModel, FacetKey} from '../lib/catalog';
import {
  Button,
  Checkbox,
  Dialog,
  Popover,
} from '../../../shared/components/product';
import {PriceFilter} from '../forms/CatalogForms';

type Facet = CatalogModel['facets'][number];
const SPECIAL_LABELS = {
  new: 'values.new',
  carryover: 'values.carryover',
  licensed: 'values.licensed',
  blank: 'values.blank',
  '12': 'values.12',
  '24': 'values.24',
  '48': 'values.48',
  over48: 'values.over48',
} as const;

export function FacetValue({
  facetKey,
  value,
}: {
  facetKey: FacetKey;
  value: string;
}) {
  const {t} = useTranslation('products');
  // szf values carry a "Group|Size" prefix internally (e.g. "Shoe|7") so the
  // facet options can be grouped by size type — pills/chips show the size only.
  if (facetKey === 'szf') return <>{value.includes('|') ? value.split('|')[1] : value}</>;
  return (
    <>
      {['fresh', 'lz', 'moq'].includes(facetKey) && value in SPECIAL_LABELS
        ? t(SPECIAL_LABELS[value as keyof typeof SPECIAL_LABELS])
        : value}
    </>
  );
}

export function FacetOptions({
  facet,
  onToggle,
  onClear,
  model,
  groupPlacements = true,
}: {
  groupPlacements?: boolean;
  model?: CatalogModel & {books: CatalogBook[]};
  facet: Facet;
  onClear: (key: FacetKey) => void;
  onToggle: (key: FacetKey, value: string) => void;
}) {
  const {t} = useTranslation('products');
  const [search, setSearch] = useState('');
  const id = useId();
  const options = facet.options.filter((option) =>
    option.value.toLowerCase().includes(search.toLowerCase()),
  );
  if (facet.key === 'slots' && groupPlacements) {
    // Groups come from the store (placement_group on each placement); ungrouped ones list last, with no heading.
    const groupOf = (value: string) => model?.placementGroups[value] ?? '';
    const groups = new Map<string, Facet['options']>();
    facet.options
      .filter((option) => option.count > 0 || option.selected)
      .forEach((option) => {
        const group = groupOf(option.value);
        groups.set(group, [...(groups.get(group) ?? []), option]);
      });
    const ordered = [...groups.entries()].sort(
      ([a], [b]) => Number(a === '') - Number(b === ''),
    );
    return (
      <div>
        {ordered.map(([group, entries]) => (
          <div key={group}>
            {group && (
              <h3 className="px-1.5 pb-1 pt-[11px] text-[10.5px] font-bold uppercase tracking-[.12em] text-mf-ink-4">
                {group}
              </h3>
            )}
            <FacetOptions
              facet={{...facet, options: entries}}
              onToggle={onToggle}
              onClear={onClear}
              model={model}
              groupPlacements={false}
            />
          </div>
        ))}
      </div>
    );
  }
  if (facet.key === 'szf') {
    // Values arrive as "Group|Size" (e.g. "Men's|XS") when the size's group
    // is known, plain otherwise \u2014 ungrouped sizes share one fallback bucket.
    const groups = new Map<string, typeof options>();
    options.forEach((option) => {
      const [prefix, size] = option.value.split('|');
      const group = size !== undefined ? prefix : t('card.sizes');
      groups.set(group, [...(groups.get(group) ?? []), option]);
    });
    const sortedGroups = [...groups.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return (
      <div>
        {sortedGroups.map(([group, sizes]) => {
          const sizeOf = (option: (typeof sizes)[number]) =>
            option.value.includes('|') ? option.value.split('|')[1] : option.value;
          return (
            <div key={group}>
              <h3 className="px-1 py-2 text-[11px] font-bold uppercase text-mf-ink-3">
                {group}
              </h3>
              <div className="flex flex-wrap gap-1.5 pb-3">
                {sizes
                  .map((option) => (
                    <Button
                      key={option.value}
                      size="small"
                      variant={option.selected ? 'default' : 'outline'}
                      className="min-w-9 rounded-mf-sm px-2"
                      aria-pressed={option.selected}
                      disabled={!option.count && !option.selected}
                      onClick={() => onToggle(facet.key, option.value)}
                    >
                      {sizeOf(option)}
                    </Button>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div>
      {facet.key === 'col' && (
        <button
          type="button"
          aria-pressed={!facet.options.some((option) => option.selected)}
          onClick={() => onClear('col')}
          className="mb-1 flex w-full items-center gap-2.5 rounded-mf-sm border-b border-mf-line p-2 text-left"
        >
          <Grid2X2 size={28} className="shrink-0 text-mf-ink-3" />
          <span>
            <span className="block text-[13px] font-semibold">
              {t('filters.allCatalogs')}
            </span>
            <span className="text-[11px] text-mf-ink-3">
              {t('filters.catalogsMatch', {
                count: options.filter((option) => option.count > 0).length,
              })}
            </span>
          </span>
        </button>
      )}
      {facet.key !== 'col' &&
        (facet.options.length > 12 ||
          facet.key === 'lic' ||
          facet.key === 'st') && (
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label={t('filters.search', {facet: t(facet.label)})}
            placeholder={t('filters.search', {facet: t(facet.label)})}
            className="mb-2 min-h-9 w-full rounded-mf-sm border border-mf-border-2 bg-mf-surface-2 px-3 text-[12.5px] focus-visible:outline-2 focus-visible:outline-mf-primary"
          />
        )}
      {options.length === 0 && (
        <p className="p-2 text-xs text-mf-ink-3">{t('filters.empty')}</p>
      )}
      {options
        .filter(
          (option) =>
            facet.key !== 'col' || option.count > 0 || option.selected,
        )
        .map((option, index) => (
          <label
            key={option.value}
            htmlFor={`${id}-${index}`}
            className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-mf-sm px-1.5 py-1.5 hover:bg-mf-surface-2 max-sm:min-h-11"
          >
            <Checkbox
              id={`${id}-${index}`}
              checked={option.selected}
              onCheckedChange={() => onToggle(facet.key, option.value)}
              disabled={!option.count && !option.selected}
            />
            {facet.key === 'col' &&
              (model?.books.find((book) => book.title === option.value)
                ?.cover ||
                model?.catalogCovers[option.value]) && (
                <img
                  src={
                    model?.books.find((book) => book.title === option.value)
                      ?.cover || model?.catalogCovers[option.value]
                  }
                  alt=""
                  loading="lazy"
                  className="h-12 w-9 shrink-0 rounded object-cover"
                />
              )}
            {facet.key === 'cf' && (
              <span
                className="size-5 shrink-0 rounded-full border border-mf-border-2"
                style={{
                  backgroundColor: model?.colorSwatches[option.value] || '#ccc',
                }}
              />
            )}
            <span className="min-w-0 flex-1 text-[13px] text-mf-ink">
              <FacetValue facetKey={facet.key} value={option.value} />
              {facet.key === 'col' && (
                <span className="block text-[11px] text-mf-ink-3">
                  {t('brands.styles', {count: option.count})}
                </span>
              )}
            </span>
            {facet.key !== 'col' && (
              <span className="text-[11.5px] tabular-nums text-mf-ink-3">
                {option.count}
              </span>
            )}
          </label>
        ))}
    </div>
  );
}

export function CatalogFilters({
  model,
  onToggle,
  onPrice,
  onReset,
  onClear,
}: {
  model: CatalogModel & {books: CatalogBook[]};
  onToggle: (key: FacetKey, value: string) => void;
  onPrice: (min: number, max: number) => void;
  onReset: () => void;
  onClear: (key: FacetKey) => void;
}) {
  const {t} = useTranslation('products');
  const [moreOpen, setMoreOpen] = useState(false);
  const primary: (FacetKey | 'price')[] = [
    'brand',
    'col',
    'cat',
    'szf',
    'cf',
    'dec',
    'av',
  ];
  const sheetOrder: (FacetKey | 'price')[] = [
    'cat',
    'brand',
    'col',
    'szf',
    'slots',
    'dec',
    'av',
    'price',
    'cf',
    'gen',
    'lic',
    'fresh',
    'fab',
    'ft',
    'artcat',
    'tier',
    'sport',
    'st',
    'se',
    'chan',
    'moq',
    'lz',
  ];
  const more = model.facets.filter((facet) => !primary.includes(facet.key));
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () =>
      new Set([
        'cf',
        'gen',
        'lic',
        'fresh',
        'fab',
        'ft',
        'artcat',
        'tier',
        'sport',
        'st',
        'se',
        'chan',
        'moq',
        'lz',
      ]),
  );
  const sheetId = useId();
  const moreCount =
    Number(
      model.query.view !== 'art' &&
        (model.query.min > 0 || model.query.max < 1000),
    ) +
    more.reduce(
      (count, facet) =>
        count + facet.options.filter((option) => option.selected).length,
      0,
    );
  return (
    <>
      <div
        role="group"
        aria-label={t('filters.label')}
        className="flex min-w-0 flex-wrap items-center gap-1.5"
      >
        {primary.map((key) => {
          const facet = model.facets.find((entry) => entry.key === key);
          if (!facet && (key !== 'price' || model.query.view === 'art'))
            return null;
          const label = key === 'price' ? t('facets.price') : t(facet!.label);
          const count =
            key === 'price'
              ? Number(
                  model.query.view !== 'art' &&
                    (model.query.min > 0 || model.query.max < 1000),
                )
              : facet!.options.filter((option) => option.selected).length;
          return (
            <Popover
              key={key}
              label={label}
              trigger={
                <Button
                  variant="outline"
                  size="small"
                  className={
                    count
                      ? 'border-mf-primary shadow-[inset_0_0_0_1px_#1a1a1a]'
                      : ''
                  }
                >
                  {['col', 'slots', 'lic'].includes(key) && (
                    <Star
                      size={10}
                      className="fill-mf-gold-deep text-mf-gold-deep"
                    />
                  )}
                  {label}
                  {count > 0 && (
                    <span className="rounded-full bg-mf-primary px-1.5 text-[11px] text-white">
                      {count}
                    </span>
                  )}
                  <ChevronDown size={12} className="text-mf-ink-3" />
                </Button>
              }
            >
              {key === 'price' ? (
                <PriceFilter
                  min={model.query.min}
                  max={model.query.max}
                  onApply={onPrice}
                />
              ) : (
                <FacetOptions
                  facet={facet!}
                  onToggle={onToggle}
                  model={model}
                  onClear={onClear}
                />
              )}
            </Popover>
          );
        })}
        <Button
          variant="outline"
          size="small"
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          className={
            moreCount
              ? 'border-mf-primary shadow-[inset_0_0_0_1px_#1a1a1a]'
              : ''
          }
          onClick={() => setMoreOpen(true)}
        >
          <SlidersHorizontal size={14} />
          {t('filters.more')}
          {moreCount > 0 && (
            <span className="rounded-full bg-mf-primary px-1.5 text-[11px] text-white">
              {moreCount}
            </span>
          )}
        </Button>
      </div>
      <Dialog
        sheet
        open={moreOpen}
        onOpenChange={setMoreOpen}
        title={t('filters.all')}
        footer={
          <>
            <Button
              variant="ghost"
              className="min-h-0 rounded-lg px-2 py-1.5 text-[12.5px] text-mf-gold-deep"
              onClick={onReset}
            >
              {t('filters.reset')}
            </Button>
            <Button
              className="h-[34px] min-h-0 px-4 py-0"
              onClick={() => setMoreOpen(false)}
            >
              {t('filters.done')}
            </Button>
          </>
        }
      >
        <div className="mb-3.5 rounded-xl border border-[#E3E8EE] bg-[#F6F8FA] px-3 py-2.5 text-[12.5px] leading-[1.45] text-[#374151]">
          <b>{t('filters.sourceTitle')}</b> {t('filters.sourceBody')}
        </div>
        {sheetOrder.map((key) => {
          const facet = more.find((entry) => entry.key === key);
          if (
            key === 'price'
              ? model.query.view === 'art' || model.query.view === 'all'
              : !facet
          )
            return null;
          const count =
            key === 'price'
              ? Number(
                  model.query.view !== 'art' &&
                    (model.query.min > 0 || model.query.max < 1000),
                )
              : facet!.options.filter((option) => option.selected).length;
          const open = !collapsed.has(key);
          const headingId = `${sheetId}-${key}-heading`;
          const bodyId = `${sheetId}-${key}-body`;
          return (
            <section key={key} className="border-t border-mf-line py-0.5">
              <button
                type="button"
                id={headingId}
                aria-expanded={open}
                aria-controls={bodyId}
                onClick={() =>
                  setCollapsed((previous) => {
                    const next = new Set(previous);
                    if (next.has(key)) next.delete(key);
                    else next.add(key);
                    return next;
                  })
                }
                className="flex w-full items-center justify-between px-0.5 py-3 text-left text-[13.5px] font-semibold text-mf-ink"
              >
                <span className="flex items-center">
                  {t(key === 'price' ? 'facets.price' : facet!.label)}
                  {(key === 'slots' || key === 'lic') && (
                    <Star
                      size={10}
                      aria-hidden="true"
                      className="ml-[5px] fill-mf-gold-deep text-mf-gold-deep"
                    />
                  )}
                  {count > 0 && (
                    <span className="ml-2 rounded-full bg-mf-primary px-[7px] py-px text-[10.5px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className={`mr-1 text-mf-ink-3 transition-transform motion-reduce:transition-none ${open ? '' : '-rotate-90'}`}
                />
              </button>
              <div
                id={bodyId}
                role="group"
                aria-labelledby={headingId}
                hidden={!open}
                className="px-0.5 pb-3 pt-0.5"
              >
                {key === 'price' ? (
                  <PriceFilter
                    compact
                    min={model.query.min}
                    max={model.query.max}
                    onApply={onPrice}
                  />
                ) : (
                  <FacetOptions
                    facet={facet!}
                    onToggle={onToggle}
                    model={model}
                    onClear={onClear}
                  />
                )}
              </div>
            </section>
          );
        })}
      </Dialog>
    </>
  );
}
