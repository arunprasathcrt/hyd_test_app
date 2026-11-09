/**
 * Accounts page header — title and the access/deep-link subtitle.
 *
 * Prototype markup (DTX `AccountsHeader/AccountsHeader.tsx`):
 *
 *   <div className="page-header">
 *     <div className="page-title-block">
 *       <h1 className="page-title">My Accounts</h1>
 *       <p className="page-subtitle">
 *         All {count} {count === 1 ? 'account' : 'accounts'} · full access
 *         (Finance · Art · Licensing) · click any row to deep-link
 *       </p>
 *     </div>
 *   </div>
 *
 * Both labels moved verbatim into `locales/en/accounts.json`, middots and
 * parentheses intact. The prototype's inline `count === 1` ternary is replaced
 * by i18next's `_one` / `_other` plural suffixes — CLAUDE.md forbids a ternary
 * on a count in a component — which is why the subtitle is two keys.
 */
import {useTranslation} from 'react-i18next';

export interface AccountsHeaderProps {
  count: number;
}

export function AccountsHeader({count}: AccountsHeaderProps) {
  const {t} = useTranslation('accounts');

  return (
    <div className="page-header">
      <div className="page-title-block">
        <h1 className="page-title">{t('header.title')}</h1>

        <p className="page-subtitle">{t('header.subtitle', {count})}</p>
      </div>
    </div>
  );
}
