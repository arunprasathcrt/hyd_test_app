import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {Badge} from '~/shared/components/ui/Badge';
import type {RoleGate} from '../../../../../mocks/customer-profile/productApprovals';
import {
  PIPELINE_STAGE_KEYS,
  ROLE_GATES,
} from '../../../../../mocks/customer-profile/productApprovals';

export default function ApprovalsTab() {
  const {t} = useTranslation('productCardDrawer');
  const clearedCount = PIPELINE_STAGE_KEYS.length;

  return (
    <section aria-label={t('approvals.ariaLabel')} className="pb-6">
      <SectionHeading>{t('approvals.roleGatesHeading')}</SectionHeading>

      <div>
        {ROLE_GATES.map((gate) => (
          <RoleGateRow gate={gate} key={gate.roleKey} />
        ))}
      </div>

      <SectionHeading className="mt-5">
        {t('approvals.pipelineHeading', {cleared: clearedCount, total: PIPELINE_STAGE_KEYS.length})}
      </SectionHeading>

      <div className="flex flex-wrap gap-[7px]">
        {PIPELINE_STAGE_KEYS.map((stageKey, index) => (
          <Badge className="gap-[5px] px-[9px] font-semibold" key={stageKey} variant="success">
            {index + 1}. {t(`approvals.pipelineStages.${stageKey}`)}
          </Badge>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({children, className = ''}: {children: ReactNode; className?: string}) {
  return (
    <div className={`mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93] ${className}`}>
      {children}
    </div>
  );
}

function RoleGateRow({gate}: {gate: RoleGate}) {
  const {t} = useTranslation('productCardDrawer');
  const approver = gate.approverKey ? t(`approvals.approvers.${gate.approverKey}`) : t('approvals.noApprover');

  return (
    <div className="flex items-center justify-between border-b border-[#F4F4F2] py-[11px] text-[13px]">
      <span className="font-normal text-utds-ink">
        {t(`approvals.roles.${gate.roleKey}`)}{' '}
        <span className="text-[11px] text-utds-muted">· {approver}</span>
      </span>
      <Badge className="gap-[5px] px-[9px] font-semibold" variant={gate.status === 'approved' ? 'success' : 'warning'}>
        {t(`approvals.status.${gate.status}`)}
      </Badge>
    </div>
  );
}
