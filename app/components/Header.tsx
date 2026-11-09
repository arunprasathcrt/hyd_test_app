import {Form, NavLink} from 'react-router';
import {useTranslation} from 'react-i18next';
import {PrototypeIcon} from '~/shared/components/PrototypeIcon';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {Button} from '~/shared/components/ui/Button';
import {Plus} from 'lucide-react';
import {useStore} from 'zustand';
import {newCtaDialogStore} from '~/store/new-cta-dialog.store';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

export function Header({header}: HeaderProps) {
  const {t} = useTranslation('common');
  const {open} = useAside();
  const openNewCta = useStore(newCtaDialogStore, (state) => state.open);

  return (
    <header className="flex min-h-14 items-center gap-3 border-b border-[#ECECEE] bg-white px-6 py-3 text-[#5C5C61] max-[720px]:px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        shape="md"
        className="hidden min-[0px]:max-[1023px]:inline-flex"
        onClick={() =>
          document.querySelector('.app-sidebar')?.classList.toggle('open')
        }
        aria-label={t('navigation.openMenu')}
      >
        <PrototypeIcon name="customize" size={20} />
      </Button>
      <div className="flex-1" />
      {/* Account and navigation buttons will enabled in the future sprints */}
      {/* <button className="flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent text-[#5C5C61] hover:bg-[#F0F0F0]" type="button" aria-label={t('header.help')}>?</button>
      <button className="topbar-search relative flex h-9 w-9 items-center justify-center rounded-lg border-0 bg-transparent text-[#5C5C61] hover:bg-[#F0F0F0]" onClick={() => open('search')} type="button" aria-label={t('header.notifications')}>
        <PrototypeIcon name="notifications" size={18} />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-[#B7404E]" />
      </button>
      <NavLink className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#1A1A1A] px-3.5 py-2 text-[13px] font-medium text-white no-underline hover:no-underline" to="/collections"><PrototypeIcon name="plus" size={14} />{t('header.new')}</NavLink>
      <NavLink className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#D9D9DE] bg-white px-3 py-1.5 text-xs font-medium text-[#5C5C61] no-underline hover:no-underline max-[720px]:hidden" to="/account"><PrototypeIcon name="switch" size={12} />{t('header.switch')}</NavLink> */}
      <Button
        type="button"
        variant="default"
        size="xs"
        shape="md"
        className="max-[720px]:hidden"
        onClick={openNewCta}
      >
        <Plus
          aria-hidden="true"
          focusable="false"
          className="size-4 shrink-0"
          strokeWidth={1.8}
        />
        {t('header.new')}
      </Button>
      <Form className="account-logout" method="POST" action="/account/logout">
        <Button
          type="submit"
          variant="outline"
          shape = "md"
          size = 'xs'
          className="cursor-pointer max-[720px]:hidden"
        >
          <PrototypeIcon name="external" size={12} />
          {t('header.logOut')}
        </Button>
      </Form>
    </header>
  );
}
