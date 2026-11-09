/**
 * The Accounts data table.
 */
import {Link} from 'react-router';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {accountOverviewPath} from '~/shared/constants/routes';
import {Avatar} from '~/shared/components/Avatar';
import {SegmentBadge} from '~/shared/components/SegmentBadge';
import {Button} from '~/shared/components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '~/shared/components/ui/Table';
import {goalBand, goalPercent} from '../lib/company';
import {CustomerProfileDrawer} from '../../customerProfileDrawer/components';
import {DrawerMetric} from './DrawerMetric';
import type {
  Account,
  AccountsSortDirection,
  AccountsSortKey,
} from '../types/account';

export interface AccountsTableProps {
  /** Already filtered and sorted client-side — see `AccountsPage`. */
  accounts: Account[];
  /** `null` when the list is unsorted. */
  sort: AccountsSortKey | null;
  dir: AccountsSortDirection;
  onSortChange: (column: AccountsSortKey) => void;
}

/** Column count, for the empty row's `colSpan`. */
const COLUMN_COUNT = 7;

export function AccountsTable({
  accounts,
  sort,
  dir,
  onSortChange,
}: AccountsTableProps) {
  const {t} = useTranslation('accounts');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [viewAsAccount, setViewAsAccount] = useState<Account | null>(null);

  const metricEmpty = t('table.metricEmpty');

  function openCustomerProfile(accountId: string) {
    const account = accounts.find((candidate) => candidate.id === accountId);
    if (account) {
      setViewAsAccount(null);
      setSelectedAccount(account);
    }
  }

  function openViewAs(accountId: string) {
    const account = accounts.find((candidate) => candidate.id === accountId);
    if (account) {
      setSelectedAccount(null);
      setViewAsAccount(account);
    }
  }

  return (
    <>
      <Table wrapperClassName="accounts-table-wrapper" className="data-table">
        <TableHeader>
          <TableRow>
            <TableHead className="sort-th">
              <SortableHeader
                column="account"
                label={t('table.columns.account')}
                sort={sort}
                dir={dir}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead className="sort-th">
              <SortableHeader
                column="segment"
                label={t('table.columns.segment')}
                sort={sort}
                dir={dir}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead className="sort-th num">
              <SortableHeader
                column="ordersYtd"
                label={t('table.columns.ordersYtd')}
                sort={sort}
                dir={dir}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead className="sort-th num">
              <SortableHeader
                column="shippedYtd"
                label={t('table.columns.shippedYtd')}
                sort={sort}
                dir={dir}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead className="sort-th num">
              <SortableHeader
                column="openOrders"
                label={t('table.columns.openOrders')}
                sort={sort}
                dir={dir}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead className="sort-th">
              <SortableHeader
                column="goal"
                label={t('table.columns.goal')}
                sort={sort}
                dir={dir}
                onSortChange={onSortChange}
              />
            </TableHead>
            {/* <TableHead /> */}
          </TableRow>
        </TableHeader>

        <TableBody>
          {accounts.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="text-3">
                {t('table.empty')}
              </TableCell>
            </TableRow>
          )}

          {accounts.map((account) => (
            <TableRow
              key={account.id}
              className="selectable cursor-pointer"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest('a')) return;
                openCustomerProfile(account.id);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openCustomerProfile(account.id);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <TableCell>
                <Link
                  to="#customer-profile"
                  className="account-row-link"
                  aria-label={t('table.row.openAriaLabel', {
                    name: account.name,
                  })}
                  onClick={(event) => {
                    event.preventDefault();
                    openCustomerProfile(account.id);
                  }}
                >
                  <Avatar
                    name={account.name}
                    initials={account.initials}
                    address={account.address}
                  />
                </Link>
              </TableCell>

              <TableCell>
                <SegmentBadge
                  segment={account.segment}
                  emptyLabel={metricEmpty}
                />
              </TableCell>

              <TableCell className="num">
                <Count value={account.ordersYtd} empty={metricEmpty} />
              </TableCell>

              <TableCell className="num fw-600">
                <Money value={account.shippedYtd} empty={metricEmpty} />
              </TableCell>

              <TableCell className="num">
                <Money value={account.openOrders} empty={metricEmpty} />
              </TableCell>

              <TableCell>
                <GoalCell account={account} empty={metricEmpty} />
              </TableCell>

               {/* Placeholder for future actions column */}
              {/* <TableCell className="px-3 py-2 text-right">
                <button
                  aria-label={t('table.row.viewAsAriaLabel', {name: account.name})}
                  className="inline-flex items-center rounded-[10px] bg-[#1A1A1A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2A2A2A]"
                  onClick={(event) => {
                    event.stopPropagation();
                    openViewAs(account.id);
                  }}
                  type="button"
                >
                  {t('table.row.viewAs')}
                </button>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedAccount ? (
        <CustomerProfileDrawer
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      ) : null}
      {viewAsAccount ? (
        <ViewAsDrawer
          account={viewAsAccount}
          onClose={() => setViewAsAccount(null)}
        />
      ) : null}
    </>
  );
}

interface SortableHeaderProps {
  column: AccountsSortKey;
  label: string;
  sort: AccountsSortKey | null;
  dir: AccountsSortDirection;
  onSortChange: (column: AccountsSortKey) => void;
}

/**
 * A sortable column header — a plain button, since sorting is entirely
 * client-side (see `sortAccounts` in `lib/company.ts`) and there is no
 * navigation to preserve state across. Used by every column.
 */
function SortableHeader({
  column,
  label,
  sort,
  dir,
  onSortChange,
}: SortableHeaderProps) {
  const {t} = useTranslation('accounts');
  const active = sort === column;
  const nextDir: AccountsSortDirection = active && dir === 'asc' ? 'desc' : 'asc';

  return (
    <button
      type="button"
      onClick={() => onSortChange(column)}
      className={`sort-header${active ? ' active' : ''}`}
      aria-label={t('table.sort.ariaLabel', {
        column: label,
        direction: active
          ? t(`table.sort.${dir === 'desc' ? 'descending' : 'ascending'}`)
          : t('table.sort.unsorted'),
      })}
    >
      {label}
      <span className="sort-arrow" aria-hidden="true">
        {(active ? dir : nextDir) === 'desc' ? '↓' : '↑'}
      </span>
    </button>
  );
}

function ViewAsDrawer({
  account,
  onClose,
}: {
  account: Account;
  onClose: () => void;
}) {
  const {t} = useTranslation('accounts');
  const {t: tCommon} = useTranslation('common');
  const metricEmpty = t('table.metricEmpty');

  return (
    <div className="fixed inset-0 z-[210] bg-black/20">
      <Button
        aria-label={t('viewAsDrawer.close')}
        className="absolute inset-0 h-full w-full cursor-default border-0 bg-transparent"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="view-as-drawer-title"
        aria-modal="true"
        className="absolute right-0 top-0 flex h-full w-[440px] max-w-full flex-col border-l border-[#EAEAEA] bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] max-[600px]:w-full"
        role="dialog"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#EAEAEA] px-5 py-4">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8B8B8B]">
              {t('viewAsDrawer.eyebrow')}
            </p>
            <h2 id="view-as-drawer-title" className="m-0 text-[15px] font-semibold text-[#0F0F0F]">
              {account.name}
            </h2>
          </div>
          <Button
            type="button"
            variant="iconClose"
            aria-label={t('viewAsDrawer.close')}
            onClick={onClose}
          >
            ×
          </Button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-4 rounded-[10px] border border-[#EADFB8] bg-[#FBF6E5] p-3.5">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#7A5B16]">
                {account.segment ?? t('viewAsDrawer.segmentEmpty')}
              </span>
              <span className="text-xs text-[#8B8B8B]">{account.address || t('drawer.locationEmpty')}</span>
            </div>
            <p className="mb-1 text-sm font-semibold text-[#7A5B16]">{t('viewAsDrawer.accountLabel')}</p>
            <p className="m-0 text-sm leading-6 text-[#5C5C61]">{account.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <DrawerMetric label={t('viewAsDrawer.metrics.orders')} value={account.ordersYtd === null ? metricEmpty : tCommon('format.count', {value: account.ordersYtd})} />
          </div>
          <p className="mb-2 mt-5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8B8B8B]">{t('viewAsDrawer.suggestedActions')}</p>
          <div className="flex flex-col gap-2">
            <Link className="inline-flex w-full items-center justify-center rounded-[10px] bg-[#1A1A1A] px-4 py-2.5 text-[13px] font-medium text-white no-underline hover:bg-[#2A2A2A] hover:no-underline" to={accountOverviewPath(account.id)}>
              {t('viewAsDrawer.openPortal')}
            </Link>
            <Link className="inline-flex w-full items-center justify-center rounded-[10px] border border-[#D9D9DE] bg-white px-4 py-2.5 text-[13px] font-medium text-[#5C5C61] no-underline hover:border-[#8B8B8B] hover:text-[#0F0F0F] hover:no-underline" to="/collections">
              {t('viewAsDrawer.buildDraftOrder')}
            </Link>
            <Button
              disabled
              shape="md"
              variant="outline"
              className="w-full"
              type="button"
            >
              {t('viewAsDrawer.openCase')}
            </Button>
          </div>
          {/* <p className="mt-4 rounded-[10px] border border-[#E5E5E7] bg-[#FAFAFA] p-3 text-xs leading-5 text-[#5C5C61]">
            <strong className="font-semibold text-[#0F0F0F]">{t('viewAsDrawer.customerSees')}</strong>{' '}
            {t('viewAsDrawer.customerSeesBody', {name: account.name})}
          </p> */}
          {/* enable in upcoming sprints */}
        </div>
      </aside>
    </div>
  );
}

interface MetricProps {
  value: number | null;
  empty: string;
}

/** A plain count, via the Intl-backed `number` formatter. */
function Count({value, empty}: MetricProps) {
  const {t} = useTranslation('common');

  if (value === null) return <span className="text-3">{empty}</span>;

  return <>{t('format.count', {value})}</>;
}

/** A currency amount, at the prototype's zero decimal places. */
function Money({value, empty}: MetricProps) {
  const {t} = useTranslation('common');

  if (value === null) return <span className="text-3">{empty}</span>;

  return <>{t('format.money', {value})}</>;
}

interface GoalCellProps {
  account: Account;
  empty: string;
}

/**
 * Goal amount with the progress bar beneath it.
 *
 * `shippedYtd` and `goal` arrive as separate metafields, so both are guarded —
 * one can be set without the other, in which case there is no ratio to draw.
 */
function GoalCell({account, empty}: GoalCellProps) {
  const {t} = useTranslation('common');

  const percent = goalPercent(account);

  if (account.goal === null || percent === null) {
    return <span className="text-3">{empty}</span>;
  }

  const band = goalBand(percent);

  return (
    <div className="goal-cell">
      <div className="goal-header">
        <span>{t('format.money', {value: account.goal})}</span>

        <span className={`goal-percent ${band}`}>
          {t('format.percent', {value: percent / 100})}
        </span>
      </div>

      <div className="goal-track">
        {/*
          The bar's width is the one inline style in the screen. It is a
          data-driven value that cannot be a utility class, which is what the
          prototype did too.
        */}
        <div
          className={`goal-bar ${band}`}
          style={{width: `${Math.min(percent, 100)}%`}}
        />
      </div>
    </div>
  );
}
