import {Link} from 'react-router';
import {useStore} from 'zustand';
import {useTranslation} from 'react-i18next';
import {PrototypeIcon} from '~/shared/components/PrototypeIcon';
import {Dialog} from '~/shared/components/product';
import {ROUTES} from '~/shared/constants/routes';
import {newCtaDialogStore} from '~/store/new-cta-dialog.store';

const MODAL_CLASS =
  'max-w-[440px] rounded-[20px] shadow-[0_30px_80px_rgba(17,17,19,.28)]';
const TITLE_CLASS =
  'text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-[#111113]';
const BODY_CLASS = 'px-3 pb-3.5 pt-2';
const CARD_CLASS =
  'group grid w-full min-h-14 grid-cols-[32px_minmax(0,1fr)] grid-rows-[auto_auto] items-center gap-x-3 rounded-[10px] bg-transparent px-2.5 py-2 text-left font-sans text-[#111113] no-underline hover:bg-[#F7F7F8] hover:no-underline';
const ICON_CLASS =
  'row-span-2 box-border size-8 rounded-[10px] bg-[#F7F7F8] p-2 text-[#111113] group-hover:bg-white';
const CARD_TITLE_CLASS = 'm-0 block text-[13.5px] font-medium';
const CARD_DESCRIPTION_CLASS = 'block text-xs text-[#5C5C61]';

export function NewCtaDialog() {
  const {t} = useTranslation('common');
  const isOpen = useStore(newCtaDialogStore, (state) => state.isOpen);
  const close = useStore(newCtaDialogStore, (state) => state.close);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      title={t('newCta.title')}
      subtitle={t('newCta.subtitle')}
      contentClassName={MODAL_CLASS}
      titleClassName={TITLE_CLASS}
      bodyClassName={BODY_CLASS}
    >
      <div className="flex flex-col gap-0.5">
        <Link to={ROUTES.draftOrdersNew} onClick={close} className={CARD_CLASS}>
          <PrototypeIcon name="document" size={32} className={ICON_CLASS} />
          <span className={CARD_TITLE_CLASS}>
            {t('newCta.draftOrder.title')}
          </span>
          <span className={CARD_DESCRIPTION_CLASS}>
            {t('newCta.draftOrder.description')}
          </span>
        </Link>
        <Link to={ROUTES.presentations} onClick={close} className={CARD_CLASS}>
          <PrototypeIcon name="palette" size={32} className={ICON_CLASS} />
          <span className={CARD_TITLE_CLASS}>
            {t('newCta.presentation.title')}
          </span>
          <span className={CARD_DESCRIPTION_CLASS}>
            {t('newCta.presentation.description')}
          </span>
        </Link>
      </div>
    </Dialog>
  );
}
