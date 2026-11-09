import {useTranslation} from 'react-i18next';
import {Button} from '~/shared/components/ui/Button';
import {InfoIcon} from './icons/InfoIcon';

export function ProductAtpDisclosure({
  moq,
  hasIncoming,
  showInventoryNote,
}: {
  moq: number | null;
  hasIncoming: boolean;
  showInventoryNote: boolean;
}) {
  const {t} = useTranslation('products');

  return (
    <>
      {showInventoryNote && (
        <p className="m-0 mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-normal text-mf-ink-3">
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#F2F2F3] px-2.5 py-0.5 text-[12px] text-[#5C5C61]">
            {t('detail.atpPlaceholder')}
          </span>
          <span>
            {t(hasIncoming ? 'detail.atpNote' : 'detail.atpNoteNoIncoming')}
          </span>
        </p>
      )}
      {moq !== null && moq > 0 && (
        <div className="mt-5 flex items-center gap-2.5 border-t border-[#ECECEE] pt-4 text-[14px] leading-normal text-[#6B6B70]">
          <span>{t('detail.atpMoqFeed', {moq})}</span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            shape="pill"
            aria-label={t('detail.atpMoqInfo')}
            title={t('detail.atpMoqInfo')}
            className="size-8 min-h-0 px-0 py-0 text-[#6B6B70]"
          >
            <InfoIcon size={16} />
          </Button>
        </div>
      )}
    </>
  );
}