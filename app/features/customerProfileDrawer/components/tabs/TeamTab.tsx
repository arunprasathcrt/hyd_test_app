import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {Avatar} from '~/shared/components/Avatar';
import {Badge} from '~/shared/components/ui/Badge';
import type {Account} from '../../../accounts/types/account';
import {accountTeam, accountTeamHistory} from '../../lib/team-fallback';
import type {TeamHistoryEntry, TeamMember} from '../../types/team';

export interface TeamTabProps {
  account: Account;
}

/** Everyone who touches this account — sales, art production, licensing, finance. */
export function TeamTab({account}: TeamTabProps) {
  const {t} = useTranslation('accounts');
  const team = accountTeam(account);
  const history = accountTeamHistory(account);

  return (
    <div className="w-full text-sm leading-6 text-utds-ink">
      <div className="mb-3.5 rounded-xl border border-[#E4E4E6] bg-[#F3F4F6] px-3.5 py-[11px] text-xs text-[#5C5C61]">
        <strong className="text-[#111113]">{t('drawer.panels.team.intro')}</strong>{' '}
        {t('drawer.panels.team.introDetail')}
      </div>

      <TeamSection title={t('drawer.panels.team.membersTitle')}>
        {team.length > 0 ? (
          team.map((member) => (
            <TeamMemberRow
              key={`${member.role}-${member.name}`}
              member={member}
              roleLabel={t(`drawer.panels.team.roles.${member.role}`)}
            />
          ))
        ) : (
          <p className="text-xs text-[#8E8E93]">
            {t('drawer.panels.team.noMembers')}
          </p>
        )}
      </TeamSection>

      <TeamSection title={t('drawer.panels.team.historyTitle')}>
        {history.map((entry) => (
          <TeamHistoryRow
            entry={entry}
            key={`${entry.date}-${entry.event}`}
          />
        ))}
      </TeamSection>
    </div>
  );
}

function TeamSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 mt-[18px] text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93] first:mt-0">
        {title}
      </div>
      <div className="mb-3.5 rounded-[14px] border border-[#ECECEE] bg-white px-4 py-3.5">
        {children}
      </div>
    </div>
  );
}

function TeamMemberRow({
  member,
  roleLabel,
}: {
  member: TeamMember;
  roleLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#F4F4F2] py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <Avatar
          name={member.name}
          initials={member.initials}
          address={member.specialty}
          nameClassName="text-[12.5px] font-semibold"
        />
      </div>
      <Badge className="shrink-0 text-[11px]">{roleLabel}</Badge>
    </div>
  );
}

function TeamHistoryRow({entry}: {entry: TeamHistoryEntry}) {
  return (
    <div className="flex gap-3 border-b border-[#F4F4F2] py-2.5 last:border-b-0">
      <div className="w-24 shrink-0 text-[11px] text-[#8E8E93]">
        {entry.date}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] text-[#111113]">{entry.event}</div>
        <div className="text-[11px] text-[#8E8E93]">{entry.who}</div>
      </div>
    </div>
  );
}
