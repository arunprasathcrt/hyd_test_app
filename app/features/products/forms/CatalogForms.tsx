import {useEffect, useRef, useState, type ReactNode} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {useFetcher} from 'react-router';
import {useTranslation} from 'react-i18next';
import {Search, X} from 'lucide-react';
import {z} from 'zod';
import {
  catalogMutationSchema,
  catalogQuerySchema,
  priceFilterSchema,
  type CatalogMutation,
  type Product,
} from '../schemas/product.schema';
import {Button, cn} from '../../../shared/components/product';
import type {FacetKey} from '../lib/catalog';

const searchSchema = catalogQuerySchema.pick({q: true});
const inputClass =
  'min-h-10 w-full rounded-mf-sm border border-mf-border-2 bg-mf-surface px-3 text-[13px] text-mf-ink focus-visible:outline-2 focus-visible:outline-mf-primary';

type SearchSuggestion =
  | {kind: 'recent'; value: string}
  | {kind: 'product'; value: Product}
  | {kind: 'filter'; key: FacetKey; value: string; label: string};

export function CatalogSearch({
  query,
  onSearch,
  products,
  facets,
  onProductSelect,
  onFilterSelect,
}: {
  query: string;
  onSearch: (value: string) => void;
  products: Product[];
  facets: Array<{
    key: FacetKey;
    label: string;
    options: Array<{value: string; count: number}>;
  }>;
  onProductSelect: (product: Product) => void;
  onFilterSelect: (key: FacetKey, value: string) => void;
}) {
  const {t} = useTranslation('products');
  const form = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {q: query},
  });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSearch = useRef(onSearch);
  latestSearch.current = onSearch;
  const lastSubmitted = useRef(query);
  const draft = useRef(query);
  const input = useRef<HTMLInputElement | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const {reset} = form;
  useEffect(() => {
    try {
      const stored = localStorage.getItem('catalog.recentSearches');
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentSearches(
            parsed.filter((item): item is string => typeof item === 'string').slice(0, 6),
          );
        }
      }
    } catch {
      // Recent searches are optional and must not block the catalog.
    }
  }, []);
  useEffect(() => {
    if (draft.current === lastSubmitted.current) {
      reset({q: query});
      draft.current = query;
      lastSubmitted.current = query;
    }
  }, [query, reset]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !target?.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        event.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener('keydown', shortcut);
    };
  }, []);
  const submit = (value: string) => {
    if (timer.current) clearTimeout(timer.current);
    lastSubmitted.current = value;
    latestSearch.current(value);
  };
  const rememberSearch = (value: string) => {
    const term = value.trim();
    if (!term) return;
    const next = [term, ...recentSearches.filter((item) => item !== term)].slice(0, 6);
    setRecentSearches(next);
    try {
      localStorage.setItem('catalog.recentSearches', JSON.stringify(next));
    } catch {
      // Search still works when browser storage is unavailable.
    }
  };
  const registration = form.register('q');
  const currentQuery = form.watch('q') as string;
  const trimmedQuery = currentQuery.trim();
  const productSuggestions = trimmedQuery.length >= 2
    ? products.slice(0, 5).map((product) => ({kind: 'product' as const, value: product}))
    : [];
  const filterSuggestions: Array<Extract<SearchSuggestion, {kind: 'filter'}>> = trimmedQuery.length >= 2
    ? facets.flatMap((facet) =>
        ['brand', 'cat', 'col', 'lic', 'dec', 'slots'].includes(facet.key)
          ? facet.options
          .filter((option) => option.value.toLowerCase().includes(trimmedQuery.toLowerCase()))
          .slice(0, 2)
          .map((option) => ({
            kind: 'filter' as const,
            key: facet.key,
            value: option.value,
            label: t(facet.label),
          }))
          : [],
      )
    : [];
  const recentSuggestions: Array<Extract<SearchSuggestion, {kind: 'recent'}>> =
    trimmedQuery.length < 2
      ? recentSearches.map((value) => ({kind: 'recent', value}))
      : [];
  const suggestions: SearchSuggestion[] = trimmedQuery.length < 2
    ? recentSuggestions
    : [...productSuggestions, ...filterSuggestions];
  const chooseSuggestion = (suggestion: SearchSuggestion) => {
    setSuggestionsOpen(false);
    setActiveSuggestion(-1);
    if (suggestion.kind === 'product') {
      rememberSearch(currentQuery);
      onProductSelect(suggestion.value);
    } else if (suggestion.kind === 'filter') {
      rememberSearch(currentQuery);
      onFilterSelect(suggestion.key, suggestion.value);
    } else {
      form.setValue('q', suggestion.value);
      draft.current = suggestion.value;
      submit(suggestion.value);
    }
  };
  const highlightedText = (value: string) => {
    const matchIndex = value.toLowerCase().indexOf(trimmedQuery.toLowerCase());
    if (!trimmedQuery || matchIndex < 0) return value;
    return <>{value.slice(0, matchIndex)}<mark className="bg-mf-gold/20 text-inherit">{value.slice(matchIndex, matchIndex + trimmedQuery.length)}</mark>{value.slice(matchIndex + trimmedQuery.length)}</>;
  };
  useEffect(() => {
    if (activeSuggestion >= 0) {
      document
        .getElementById(`catalog-search-suggestion-${activeSuggestion}`)
        ?.scrollIntoView({block: 'nearest'});
    }
  }, [activeSuggestion]);
  return (
    <form
      role="search"
      className="relative min-w-0 flex-1"
      onFocus={() => setSuggestionsOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setSuggestionsOpen(false);
          setActiveSuggestion(-1);
        }
      }}
      onSubmit={(event) => {
        event.preventDefault();
        if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
          chooseSuggestion(suggestions[activeSuggestion]);
          return;
        }
        void form.handleSubmit(({q}) => {
          rememberSearch(q);
          setSuggestionsOpen(false);
          submit(q);
        })(event);
      }}
    >
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        className="absolute left-1 top-0.5 size-9 max-sm:size-9"
        aria-label={t('search.submit')}
        title={t('search.submit')}
      >
        <Search size={16} />
      </Button>
      <input
        {...registration}
        ref={(element) => {
          registration.ref(element);
          input.current = element;
        }}
        onChange={(event) => {
          void registration.onChange(event);
          const value = event.target.value;
          draft.current = value;
          setSuggestionsOpen(true);
          setActiveSuggestion(-1);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => submit(value), 150);
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && suggestions.length) {
            event.preventDefault();
            setSuggestionsOpen(true);
            setActiveSuggestion((index) => (index + 1) % suggestions.length);
          } else if (event.key === 'ArrowUp' && suggestions.length) {
            event.preventDefault();
            setSuggestionsOpen(true);
            setActiveSuggestion((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
          } else if (event.key === 'Escape') {
            setSuggestionsOpen(false);
            setActiveSuggestion(-1);
          }
        }}
        aria-label={t('search.label')}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={suggestionsOpen && (suggestions.length > 0 || trimmedQuery.length >= 2)}
        aria-controls="catalog-search-suggestions"
        aria-activedescendant={activeSuggestion >= 0 ? `catalog-search-suggestion-${activeSuggestion}` : undefined}
        className={cn(inputClass, 'h-10 rounded-mf-pill pl-11 pr-10 text-[14px] [&::-webkit-search-cancel-button]:appearance-none')}
        placeholder={t('search.placeholder')}
        type="search"
        maxLength={160}
      />
      {!currentQuery && (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-2.5 rounded border border-mf-border-2 px-1.5 text-[11px] text-mf-ink-3"
        >
          /
        </kbd>
      )}
      {Boolean(currentQuery) && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-0.5 size-9 max-sm:size-9"
          aria-label={t('search.clear')}
          onClick={() => {
            form.setValue('q', '');
            draft.current = '';
            submit('');
            input.current?.focus();
          }}
        >
          <X size={16} />
        </Button>
      )}
      {suggestionsOpen && (suggestions.length > 0 || trimmedQuery.length >= 2) && (
        <div
          id="catalog-search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] max-h-[420px] overflow-y-auto rounded-[14px] border border-mf-border-2 bg-mf-surface p-1.5 shadow-mf-3"
        >
          {trimmedQuery.length < 2 ? (
            <>
              <div className="px-2.5 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[.1em] text-mf-ink-4">
                {t('search.suggestions.recent')}
              </div>
              {recentSuggestions.map((suggestion, index) => (
                <SuggestionButton
                  key={`recent-${suggestion.value}`}
                  index={index}
                  active={activeSuggestion === index}
                  onChoose={() => chooseSuggestion(suggestion)}
                >
                  <span className="grid size-[34px] shrink-0 place-items-center rounded-[7px] border border-mf-line bg-mf-surface-2 text-sm text-mf-ink-3">↩</span>
                  <span className="min-w-0">{suggestion.value}</span>
                </SuggestionButton>
              ))}
            </>
          ) : (
            <>
              {productSuggestions.length > 0 && (
                <>
                  <div className="px-2.5 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[.1em] text-mf-ink-4">{t('search.suggestions.styles')}</div>
                  {productSuggestions.map((suggestion, index) => {
                    const product = suggestion.value;
                    return (
                      <SuggestionButton
                        key={`product-${product.id}`}
                        index={index}
                        active={activeSuggestion === index}
                        disabled
                        onChoose={() => chooseSuggestion(suggestion)}
                      >
                        <img loading="lazy" src={product.image} alt="" className="size-[34px] shrink-0 rounded-[7px] border border-mf-line bg-mf-surface-2 object-contain" />
                        <span className="flex min-w-0 flex-col text-left">
                          <span className="truncate">{highlightedText(product.name)}</span>
                          <span className="truncate text-[11.5px] text-mf-ink-3">{product.sku}{product.type === 'garment' && product.price !== null ? ` · $${product.price.toFixed(2)}` : ` · ${t(product.type === 'art' ? 'search.suggestions.art' : 'search.suggestions.reorder')}`}</span>
                        </span>
                      </SuggestionButton>
                    );
                  })}
                </>
              )}
              {filterSuggestions.length > 0 && (
                <>
                  <div className="px-2.5 pb-1 pt-2 text-[10.5px] font-bold uppercase tracking-[.1em] text-mf-ink-4">{t('search.suggestions.filterBy')}</div>
                  {filterSuggestions.map((suggestion, index) => {
                    const optionIndex = productSuggestions.length + index;
                    return (
                      <SuggestionButton
                        key={`filter-${suggestion.key}-${suggestion.value}`}
                        index={optionIndex}
                        active={activeSuggestion === optionIndex}
                        onChoose={() => chooseSuggestion(suggestion)}
                      >
                        <span className="grid size-[34px] shrink-0 place-items-center rounded-[7px] border border-mf-line bg-mf-surface-2 text-sm text-mf-ink-3">⊕</span>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate">{highlightedText(suggestion.value)}</span>
                          <span className="truncate text-[11.5px] text-mf-ink-3">{t('search.suggestions.filter')} · {suggestion.label}</span>
                        </span>
                      </SuggestionButton>
                    );
                  })}
                </>
              )}
              {suggestions.length === 0 && (
                <div className="px-2.5 py-2 text-[10.5px] font-bold uppercase tracking-[.1em] text-mf-ink-4">
                  {t('search.suggestions.empty')}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </form>
  );
}

function SuggestionButton({
  index,
  active,
  disabled = false,
  onChoose,
  children,
}: {
  index: number;
  active: boolean;
  disabled?: boolean;
  onChoose: () => void;
  children: ReactNode;
}) {
  return (
    <button
      id={`catalog-search-suggestion-${index}`}
      type="button"
      role="option"
      aria-selected={active}
      aria-disabled={disabled}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onChoose}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-2.5 py-[7px] text-left text-[13px] text-mf-ink hover:bg-mf-surface-2',
        active && 'bg-mf-surface-2',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
      )}
    >
      {children}
    </button>
  );
}

export function PriceFilter({
  min,
  max,
  onApply,
  compact = false,
}: {
  min: number;
  max: number;
  onApply: (min: number, max: number) => void;
  compact?: boolean;
}) {
  const {t} = useTranslation('products');
  const {t: errorText} = useTranslation('errors');
  const form = useForm({
    resolver: zodResolver(priceFilterSchema),
    values: {min, max},
  });
  if (compact) {
    const commit = () => {
      void form.handleSubmit((values) => onApply(values.min, values.max))();
    };
    return (
      <form
        className="px-1.5 pb-2 pt-1"
        onSubmit={(event) => {
          event.preventDefault();
          commit();
        }}
      >
        <div className="flex items-center justify-between text-[13px] text-mf-ink-2">
          {(['min', 'max'] as const).map((key) => (
            <label key={key} className="flex items-center gap-1">
              $
              <input
                {...form.register(key, {valueAsNumber: true})}
                aria-label={t(
                  key === 'min' ? 'filters.minimum' : 'filters.maximum',
                )}
                type="number"
                min={0}
                max={1000}
                step="0.01"
                onBlur={commit}
                className="h-8 w-[72px] rounded-mf-sm border border-mf-border-2 bg-mf-surface px-2 text-[13px]"
              />
            </label>
          ))}
        </div>
        <div className="relative my-4 h-5">
          <div className="absolute inset-x-0 top-2 h-1 rounded bg-mf-border" />
          {(['min', 'max'] as const).map((key) => (
            <input
              key={key}
              type="range"
              min={0}
              max={1000}
              step={1}
              {...form.register(key, {valueAsNumber: true})}
              aria-label={t(
                key === 'min' ? 'filters.minimum' : 'filters.maximum',
              )}
              onPointerUp={commit}
              onKeyUp={commit}
              className="pointer-events-none absolute inset-0 m-0 w-full appearance-none bg-transparent accent-mf-primary [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mf-primary [&::-moz-range-thumb]:pointer-events-auto"
            />
          ))}
        </div>
        <div className="flex justify-between text-[11px] text-mf-ink-3">
          <span>{t('card.price', {value: min})}</span>
          <span>{t('card.price', {value: max})}</span>
        </div>
        {form.formState.errors.max && (
          <p role="alert" className="mt-2 text-xs text-mf-terra">
            {errorText('errors.price')}
          </p>
        )}
      </form>
    );
  }
  return (
    <form
      className="space-y-3 p-1"
      onSubmit={(event) => {
        void form.handleSubmit((values) => onApply(values.min, values.max))(
          event,
        );
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        {(['min', 'max'] as const).map((key) => (
          <label key={key} className="space-y-1 text-xs text-mf-ink-2">
            <span>
              {t(key === 'min' ? 'filters.minimum' : 'filters.maximum')}
            </span>
            <input
              {...form.register(key, {valueAsNumber: true})}
              type="number"
              min={0}
              max={1000}
              step="0.01"
              className={inputClass}
            />
          </label>
        ))}
      </div>
      <input
        type="range"
        min={0}
        max={1000}
        step={1}
        {...form.register('max', {valueAsNumber: true})}
        aria-label={t('filters.maximum')}
        className="w-full accent-mf-primary"
      />
      {form.formState.errors.max && (
        <p role="alert" className="text-xs text-mf-terra">
          {errorText('errors.price')}
        </p>
      )}
      <Button type="submit" size="small" className="w-full">
        {t('filters.apply')}
      </Button>
    </form>
  );
}

const mutationReplySchema = z.object({
  ok: z.boolean(),
  error: z.string().nullable(),
  fieldErrors: z.record(z.string(), z.array(z.string())),
});

export function CatalogActionForm({
  intent,
  ids,
  onCancel,
}: {
  intent: CatalogMutation['intent'];
  ids: string[];
  onCancel: () => void;
}) {
  const {t} = useTranslation('products');
  const {t: errorText} = useTranslation('errors');
  const fetcher = useFetcher();
  const form = useForm({
    resolver: zodResolver(catalogMutationSchema),
    defaultValues: {intent, ids, name: ''},
  });
  const reply = mutationReplySchema.safeParse(fetcher.data);
  const pending = fetcher.state !== 'idle';
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        void form.handleSubmit((values) => {
          const payload = new FormData();
          payload.set('intent', values.intent);
          payload.set('name', values.name);
          values.ids.forEach((id) => payload.append('ids', id));
          void fetcher.submit(payload, {method: 'post'});
        })(event);
      }}
    >
      <p className="text-sm text-mf-ink-2">
        {t('form.selection', {count: ids.length})}
      </p>
      {intent !== 'draft' && (
        <label className="block space-y-2 text-sm">
          <span>{t('form.name')}</span>
          <input
            {...form.register('name')}
            className={inputClass}
            maxLength={100}
            aria-invalid={Boolean(
              form.formState.errors.name ||
              (reply.success && reply.data.fieldErrors.name),
            )}
          />
          {(form.formState.errors.name ||
            (reply.success && reply.data.fieldErrors.name)) && (
            <span className="text-mf-terra">{errorText('errors.name')}</span>
          )}
        </label>
      )}
      <p className="text-xs leading-relaxed text-mf-ink-3">
        {t('form.notice')}
      </p>
      {(form.formState.errors.ids ||
        (reply.success && reply.data.fieldErrors.ids)) && (
        <p role="alert" className="text-sm text-mf-terra">
          {errorText('errors.selection')}
        </p>
      )}
      {reply.success && reply.data.error && (
        <p role="alert" className="text-sm text-mf-terra">
          {errorText('integrationPending')}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('form.cancel')}
        </Button>
        <Button type="submit" disabled={pending}>
          {t(pending ? 'form.pending' : 'form.submit')}
        </Button>
      </div>
    </form>
  );
}
