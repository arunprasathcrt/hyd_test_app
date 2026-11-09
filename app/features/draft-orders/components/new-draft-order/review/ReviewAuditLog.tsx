import {useTranslation} from 'react-i18next';
import {BuilderCard, BuilderCardTitle} from '../BuilderFields';

export function ReviewAuditLog() {
  const {t} = useTranslation('newDraftOrder');

  return (
    <BuilderCard aria-label={t('newDraftOrder.review.auditlog.title')}>
      <header className="mb-4">
        <BuilderCardTitle
          title={t('newDraftOrder.review.auditlog.title')}
          sub={t('newDraftOrder.review.auditlog.sub')}
        />
      </header>
      <p className="m-0 text-[13px] leading-[1.5] text-[#6B6B70]">
        {t('newDraftOrder.review.auditlog.empty')}
      </p>
    </BuilderCard>
  );
}
