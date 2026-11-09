import {Await, NavLink, useLocation} from 'react-router';
import {Suspense, useState} from 'react';
import {useTranslation} from 'react-i18next';
import type {CustomerDetailsQuery} from 'customer-accountapi.generated';
import {PrototypeIcon} from '~/shared/components/PrototypeIcon';
import {UnrivaledLogo} from './UnrivaledLogo';
import {useStore} from 'zustand';
import {spectrumDrawerStore} from '~/store/spectrum-drawer.store';
import {Button} from '~/shared/components/ui/Button';

const navigationGroups = [
  {
    key: 'workspace',
    label: 'navigation.groups.workspace',
    accordion: false,
    items: [
      {
        to: '/',
        key: 'navigation.items.startHere',
        icon: 'star',
        enabled: false,
      },
      {
        to: '/',
        key: 'navigation.items.home',
        icon: 'home',
        enabled: false,
      },
    ],
  },
  {
    key: 'sales',
    label: 'navigation.groups.sales',
    accordion: true,
    you: true,
    items: [
      {
        to: '/accounts',
        key: 'navigation.items.accounts',
        icon: 'contacts',
        enabled: true,
      },
      {
        to: '/productList',
        key: 'navigation.items.products',
        icon: 'star',
        enabled: true,
      },
      {
        to: '/collections',
        key: 'navigation.items.catalogs',
        icon: 'book',
        enabled: false,
      },
      {
        to: '/artDesign',
        key: 'navigation.items.artDesign',
        icon: 'art',
        enabled: true,
        children: [
          {
            key: 'navigation.items.buildSpectrum',
            enabled: true,
          },
        ],
      },
      {
        to: '/presentations',
        key: 'navigation.items.presentations',
        icon: 'eye',
        enabled: true,
      },
      {
        to: '/draftorders',
        key: 'navigation.items.draftOrders',
        icon: 'quotes',
        enabled: true,
      },
      {
        to: '/orders',
        key: 'navigation.items.orders',
        icon: 'orders',
        enabled: true,
      },
      {
        to: '/account',
        key: 'navigation.items.commissions',
        icon: 'commissions',
        enabled: false,
      },
      {
        to: '/account',
        key: 'navigation.items.forecast',
        icon: 'insights',
        enabled: false,
      },
    ],
  },
  {
    key: 'artDesign',
    label: 'navigation.groups.artDesign',
    accordion: true,
    items: [
      {
        to: '/blogs/journal',
        key: 'navigation.items.designQueue',
        icon: 'art',
        enabled: false,
      },
      {
        to: '/blogs/journal',
        key: 'navigation.items.createArt',
        icon: 'star',
        enabled: false,
      },
      {
        to: '/accounts',
        key: 'navigation.items.accounts',
        icon: 'contacts',
        enabled: false,
      },
    ],
  },
  {
    key: 'artProduction',
    label: 'navigation.groups.artProduction',
    accordion: true,
    items: [
      {
        to: '/blogs/journal',
        key: 'navigation.items.artQueue',
        icon: 'sewing',
        enabled: false,
      },
      {
        to: '/account',
        key: 'navigation.items.commandCenter',
        icon: 'insights',
        enabled: false,
      },
      {
        to: '/account',
        key: 'navigation.items.productionDashboard',
        icon: 'orders',
        enabled: false,
      },
      {
        to: '/accounts',
        key: 'navigation.items.accounts',
        icon: 'contacts',
        enabled: false,
      },
    ],
  },
  {
    key: 'licensing',
    label: 'navigation.groups.licensing',
    accordion: true,
    items: [
      {
        to: '/blogs/journal',
        key: 'navigation.items.licenseQueue',
        icon: 'shield',
        enabled: false,
      },
      {
        to: '/account',
        key: 'navigation.items.licensingDatabase',
        icon: 'layers',
        enabled: false,
      },
      {
        to: '/accounts',
        key: 'navigation.items.accounts',
        icon: 'contacts',
        enabled: false,
      },
    ],
  },
  {
    key: 'finance',
    label: 'navigation.groups.finance',
    accordion: true,
    items: [
      {
        to: '/accounts',
        key: 'navigation.items.financeAccounts',
        icon: 'contacts',
        enabled: false,
      },
      {
        to: '/orders',
        key: 'navigation.items.ordersAr',
        icon: 'orders',
        enabled: false,
      },
    ],
  },
  {
    key: 'general',
    label: 'navigation.groups.general',
    accordion: true,
    items: [
      {
        to: '/account',
        key: 'navigation.items.notifications',
        icon: 'notifications',
        enabled: false,
      },
      {
        to: '/account',
        key: 'navigation.items.settings',
        icon: 'settings',
        enabled: false,
      },
    ],
  },
] as const;

type Customer = CustomerDetailsQuery['customer'] | null;

export function LeftNavigation({customer}: {customer: Promise<Customer>}) {
  const {t} = useTranslation('common');
  const location = useLocation();
  const openSpectrumDrawer = useStore(
    spectrumDrawerStore,
    (state) => state.open,
  );

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    sales: true,
    artDesign: false,
    artProduction: false,
    licensing: false,
    finance: false,
    general: true,
  });

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((current) => ({
      ...current,
      [groupKey]: !current[groupKey],
    }));
  };

  return (
    <aside
      className="
        flex
        h-dvh
        w-[248px]
        shrink-0
        flex-col
        overflow-hidden
        border-r
        border-[#ECECEE]
        bg-[#FAFAFA]
      "
    >
      {/* Header - stays fixed */}
      <div className="shrink-0 px-3 pt-3.5">
        <NavLink
          to="/"
          className="
            flex
            items-center
            justify-center
            border-b
            border-[#ECECEE]
            px-[38px]
            pb-[22px]
            pt-[18px]
          "
        >
          <UnrivaledLogo />
        </NavLink>

        <Button
          type="button"
          variant="outline"
          shape="md"
          size="default"
          disabled
          className="relative mt-3.5 w-full justify-start pl-8 pr-12 text-left"
        >
          <span
            className="
            absolute
            left-2.5
            top-1/2
            -translate-y-1/2 "
          >
            <PrototypeIcon name="search" size={14} />
          </span>

          <span className="truncate">{t('navigation.quickSearch')}</span>

          <span
            className="
            absolute
            right-2
            top-1/2
            -translate-y-1/2
            rounded-[4px]
            border
            border-[#ECECEE]
            bg-[#F4F4F6]
            px-[7px]
            py-[2px]
            font-mono
            text-[10px]
            font-semibold
            tracking-[0.04em]
            text-[#8E8E93] "
          >
            ⌘K
          </span>
        </Button>
      </div>

      {/* Navigation - ONLY THIS AREA SCROLLS */}
      <div
        className="
          min-h-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          px-3
          pb-4
          pt-1
          [scrollbar-color:#D7D7DA_transparent]
          [scrollbar-width:thin]
        "
      >
        <nav aria-label={t('navigation.ariaLabel')}>
          {navigationGroups.map((group) => {
            const isOpen = openGroups[group.key] ?? false;

            return (
              <div key={group.key}>
                {/* Normal prototype group */}
                {!group.accordion && (
                  <>
                    <div
                      className="
                        nav-group
                        px-2.5
                        pb-1.5
                        pt-3
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.1em]
                        text-[#A1A1A6]
                      "
                    >
                      {t(group.label)}
                    </div>

                    <ul className="list-none">
                      {group.items.map((item) => (
                        <NavigationItem
                          key={`${group.key}-${item.key}`}
                          item={item}
                          location={location}
                        />
                      ))}
                    </ul>
                  </>
                )}

                {/* Prototype accordion group */}
                {group.accordion && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      shape="square"
                      size="small"
                      aria-expanded={isOpen}
                      onClick={() => toggleGroup(group.key)}
                    >
                      <span className="flex-1">
                        {t(group.label)}

                        {'you' in group && group.you && (
                          <span
                            className="
                            ml-2
                            rounded-full
                            bg-[#FBF6E5]
                            px-1.5
                            py-0.5
                            text-[9px]
                            font-semibold
                            normal-case
                            tracking-normal
                            text-[#7A5B16]
                            border
                            border-solid
                            border-[#EADFB8]
                          "
                          >
                            {t('navigation.you')}
                          </span>
                        )}
                      </span>

                      <svg
                        aria-hidden="true"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className={`
                          shrink-0
                          transition-transform
                          duration-200
                          ${isOpen ? 'rotate-180' : ''}
                        `}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </Button>

                    {isOpen && (
                      <ul className="list-none">
                        {group.items.map((item) => (
                          <NavigationItem
                            key={`${group.key}-${item.key}`}
                            item={item}
                            location={location}
                            onOpenSpectrumDrawer={openSpectrumDrawer}
                          />
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer - stays fixed */}
      <div
        className="
          shrink-0
          border-t
          border-[#ECECEE]
          bg-[#FAFAFA]
          px-3
          pb-3.5
          pt-3.5
        "
      >
        <Suspense fallback={<UserMini t={t} customer={null} />}>
          <Await resolve={customer}>
            {(resolvedCustomer) => (
              <UserMini t={t} customer={resolvedCustomer} />
            )}
          </Await>
        </Suspense>
      </div>
    </aside>
  );
}

function NavigationItem({
  item,
  location,
  onOpenSpectrumDrawer,
}: {
  item: (typeof navigationGroups)[number]['items'][number];
  location: ReturnType<typeof useLocation>;
  onOpenSpectrumDrawer?: () => void;
}) {
  const {t} = useTranslation('common');
  const to: string = item.to;

  const isBuildInSpectrumActive = location.pathname === '/artDesignSpectrum';

  const isActive =
    item.enabled &&
    (location.pathname === to ||
      (to !== '/' && location.pathname.startsWith(`${to}/`)) ||
      (to === '/artDesign' && isBuildInSpectrumActive));


  const children = 'children' in item ? item.children : undefined;

  if (!item.enabled) {
    return (
      <li>
        <span
          aria-disabled="true"
          className="
            flex
            cursor-not-allowed
            items-center
            gap-[11px]
            rounded-[7px]
            px-2.5
            py-2
            text-[13px]
            text-[#B5B5BA]
            opacity-70
          "
        >
          <PrototypeIcon name={item.icon} size={16} />

          <span className="min-w-0 truncate">{t(item.key)}</span>
        </span>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={item.to}
        className={`
          relative
          flex
          items-center
          gap-[11px]
          rounded-[7px]
          px-2.5
          py-2
          text-[13px]
          no-underline
          ${
            isActive
              ? 'bg-white font-medium text-[#111113] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
              : 'text-[#5C5C61] hover:bg-[#F0F0F0] hover:text-[#111113]'
          }
        `}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="
              absolute
              -left-0.5
              bottom-2
              top-2
              w-0.5
              rounded-[2px]
              bg-[#1A1A1A]
            "
          />
        )}

        <PrototypeIcon name={item.icon} size={16} />

        <span className="min-w-0 truncate">{t(item.key)}</span>
      </NavLink>

      {isActive && children && (
        <ul
          aria-label={t('navigation.items.artDesign')}
          className="my-[1px] mb-1 list-none p-0"
        >
          {children.map((child) => (
            <li key={child.key} className="relative">
              <Button
                type="button"
                variant="ghost"
                shape="md"
                size="default"
                onClick={onOpenSpectrumDrawer}
              >
                {t(child.key)}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function UserMini({
  t,
  customer,
}: {
  t: (key: string) => string;
  customer: CustomerDetailsQuery['customer'] | null;
}) {
  const firstName = customer?.firstName?.trim() ?? '';
  const lastName = customer?.lastName?.trim() ?? '';

  const displayName = [firstName, lastName].filter(Boolean).join(' ');

  const name = displayName || t('navigation.user');

  const initials =
    [firstName.charAt(0), lastName.charAt(0)].join('').toUpperCase() ||
    initialsFromName(name);

  return (
    <NavLink
      to="/account"
      className="
        flex
        items-center
        gap-2.5
        rounded-md
        px-2
        py-1.5
        text-[#5C5C61]
        no-underline
        hover:bg-[#F0F0F0]
        hover:no-underline
      "
    >
      <span
        className="
          flex
          h-[30px]
          w-[30px]
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[linear-gradient(135deg,#444,#111)]
          text-[11px]
          font-semibold
          text-white
        "
      >
        {initials}
      </span>

      <span className="min-w-0 flex-1">
        <strong
          className="
            block
            overflow-hidden
            text-ellipsis
            whitespace-nowrap
            text-[12.5px]
            font-medium
            text-[#0F0F0F]
          "
        >
          {name}
        </strong>

        <small
          className="
            mt-0.5
            block
            overflow-hidden
            text-ellipsis
            whitespace-nowrap
            text-[11px]
            text-[#8B8B8B]
          "
        >
          {t('navigation.role')}
        </small>
      </span>

      <span aria-hidden="true">↔</span>
    </NavLink>
  );
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
