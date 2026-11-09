import {useTranslation} from 'react-i18next';
import {BuilderCard, BuilderCardTitle} from '../BuilderFields';

export function ReviewNotesCard() {
  const {t} = useTranslation('newDraftOrder');

  return (
    <BuilderCard aria-label={t('newDraftOrder.review.notes.title')}>
      <header className="mb-4">
        <BuilderCardTitle
          title={t('newDraftOrder.review.notes.title')}
          sub={t('newDraftOrder.review.notes.sub')}
        />
      </header>
      <div>
        <div className="border-t border-[#ECECEE] pt-4">
          <div className="mb-2 text-xs font-semibold tracking-[0.08em] uppercase text-[#8E8E93]">
            {t('newDraftOrder.review.notes.emailsSent')}
          </div>
          <p className="m-0 text-[13px] leading-[1.5] text-[#6B6B70]">
            {t('newDraftOrder.review.notes.emailsEmpty')}
          </p>
        </div>
      </div>
    </BuilderCard>
  );
}
