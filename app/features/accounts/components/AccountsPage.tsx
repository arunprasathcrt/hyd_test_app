/**
 * The Accounts screen.
 *
 * Free-text search and column sort are client-side state owned here, over
 * whatever page the loader fetched (see `matchesAccountSearch`/`sortAccounts`
 * in `lib/company.ts`) — segment and brand stay URL-driven, unaffected.
 *
 * No data fetching here — the route's loader owns that, and this component
 * takes a shaped view model.
 */
import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '~/shared/components/ui/Button';
import {matchesAccountSearch, sortAccounts} from '../lib/company';
import type {
  Account,
  AccountsSortDirection,
  AccountsSortKey,
  BrandSummary,
  SegmentFilter,
} from '../types/account';
import {AccountsHeader} from './AccountsHeader';
import {AccountsTable} from './AccountsTable';
import {AccountsToolbar} from './AccountsToolbar';
import {ActiveCarts} from './ActiveCarts';
import {BrandFilter} from './BrandFilter';

/** Rows revealed per "Show more" click. */
const PAGE_SIZE = 5;

export interface AccountsPageProps {
  accounts: Account[];
  /**
   * How many accounts are in the rep's book in total, before the toolbar's
   * filters. The subtitle counts the book, not the current filter result.
   */
  totalCount: number;
  activeSegment: SegmentFilter;
  /** The selected "brands" metaobject handle, or `'all'`. */
  activeBrand: string;
  /** Real brand names and live per-brand counts for the Brand filter chips. */
  brandSummaries: BrandSummary[];
  /**
   * Set when the Admin API lookup failed. Already a resolved, translated
   * string — the loader does not hand components a raw error.
   */
  accountsError: string | null;
}

export function AccountsPage({
  accounts,
  totalCount,
  activeSegment,
  activeBrand,
  brandSummaries,
  accountsError,
}: AccountsPageProps) {
  const {t} = useTranslation('accounts');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<AccountsSortKey | null>(null);
  const [dir, setDir] = useState<AccountsSortDirection>('asc');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleAccounts = useMemo(() => {
    const matched = accounts.filter((account) =>
      matchesAccountSearch(account, query),
    );
    return sortAccounts(matched, sort, dir);
  }, [accounts, query, sort, dir]);

  // A new loader fetch or search term changes which rows match at all, so the
  // reveal count restarts rather than carrying over a stale position. Sorting
  // reorders the same set, so it is deliberately not a dependency here.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [accounts, query]);

  const pagedAccounts = useMemo(
    () => visibleAccounts.slice(0, visibleCount),
    [visibleAccounts, visibleCount],
  );

  function handleSortChange(column: AccountsSortKey) {
    if (sort === column) {
      setDir(dir === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(column);
      setDir('asc');
    }
  }

  function handleShowMore() {
    setVisibleCount((count) =>
      Math.min(count + PAGE_SIZE, visibleAccounts.length),
    );
  }

  return (
    <main className="accounts-main" id="main">
      <AccountsHeader count={totalCount} />

      <BrandFilter
        brandSummaries={brandSummaries}
        activeBrand={activeBrand}
        activeSegment={activeSegment}
      />
      <ActiveCarts />
      <AccountsToolbar
        query={query}
        onQueryChange={setQuery}
        activeSegment={activeSegment}
        activeBrand={activeBrand}
      />

      {accountsError ? (
        <div className="accounts-empty">
          <div className="accounts-empty-title">{t('error.title')}</div>
          <div className="accounts-empty-sub">{accountsError}</div>
        </div>
      ) : (
        <>
          <AccountsTable
            accounts={pagedAccounts}
            sort={sort}
            dir={dir}
            onSortChange={handleSortChange}
          />

          {visibleAccounts.length > 0 && (
            <div className="accounts-more-row">
              <span className="accounts-more-muted">
                {t('table.more.showing', {
                  shown: pagedAccounts.length,
                  total: visibleAccounts.length,
                })}
              </span>

              {visibleCount < visibleAccounts.length && (
                <Button
                  type="button"
                  variant="outline"
                  size="control"
                  shape="md"
                  onClick={handleShowMore}
                >
                  {t('table.more.showMore', {
                    count: Math.min(PAGE_SIZE, visibleAccounts.length - visibleCount),
                  })}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}

