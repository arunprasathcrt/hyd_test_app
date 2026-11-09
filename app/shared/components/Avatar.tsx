/**
 * Account avatar cell — initials disc, name, and a grey meta line beneath.
 *
 * Ported from DTX `app/components/shared/Avatar.tsx`. DOM order and class
 * names are unchanged. The disc is decorative (the name is rendered right
 * beside it), so it is hidden from the accessibility tree rather than read out
 * as two stray letters.
 *
 * Renders no literal text of its own, so it declares no namespace — every
 * string it shows is passed in already resolved.
 */
import {initialsFor} from '~/features/accounts/lib/company';

export interface AvatarProps {
  name: string;
  /** Overrides the initials derived from `name`. */
  initials?: string;
  /** The meta line — "Austin, TX", or a location name, or nothing. */
  address?: string;
  /** Extra classes appended to the name line, for callers with denser rows. */
  nameClassName?: string;
}

export function Avatar({
  name,
  initials,
  address,
  nameClassName,
}: AvatarProps) {
  return (
    <div className="avatar-content">
      <div className="avatar md" aria-hidden="true">
        {initials || initialsFor(name)}
      </div>

      <div className="min-w-0">
        <div className={`avatar-name ${nameClassName || ''}`.trim()}>{name}</div>

        <div className="avatar-meta">{address || ''}</div>
      </div>
    </div>
  );
}
