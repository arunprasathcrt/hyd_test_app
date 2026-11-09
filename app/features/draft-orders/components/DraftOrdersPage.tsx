import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '~/shared/components/ui/Button';
import { ROUTES } from '~/shared/constants/routes';
import { DraftOrdersList } from './draft-order-list/DraftOrdersList';
import { DraftOrdersKpis } from './draft-order-list/DraftOrdersKpi';
import { getDraftOrderKpis } from '../lib/draft-orders';
import type { DraftOrderListItem } from '../types/draft-order';

interface DraftOrdersPageProps {
  draftOrders: DraftOrderListItem[];
  availableBrands: string[];
}

type DraftOrdersView = 'list' | 'mgr';

const segButtonClass =
  'inline-flex min-h-9 cursor-pointer items-center gap-[7px] whitespace-nowrap rounded-[9px] border-0 bg-transparent px-3.5 text-[13px] font-medium text-[#5C5C61] transition-[background] duration-150 hover:text-[#111113] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0E6E6E] aria-pressed:bg-white aria-pressed:text-[#111113] aria-pressed:shadow-[0_1px_3px_rgba(17,17,19,.1)] pointer-coarse:min-h-10';

export function DraftOrdersPage({ draftOrders, availableBrands }: DraftOrdersPageProps) {
  const { t } = useTranslation('draftOrders');
  const navigate = useNavigate();
  const [activeView, setActiveView] =
    useState<DraftOrdersView>('list');
  const kpis = getDraftOrderKpis(draftOrders);

  return (
    <section className="w-full">
      <header className="m-0 mb-1.5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3.5 border-0 bg-transparent pt-0.5 pb-4">
        <div className="min-w-0 flex-[1_1_300px]">
          <h1 className="m-0 text-[20px] font-semibold leading-[1.3] tracking-[-0.015em] text-[#111113]">
            {t('draftOrders.page.title')}
          </h1>
        </div>

        <div
          className="flex flex-wrap items-center gap-2 max-[759.98px]:w-full"
          role="group"
          aria-label={t('draftOrders.page.actionsAriaLabel')}
        >
          <div
            className="box-border inline-flex max-w-full gap-0.5 overflow-x-auto rounded-xl bg-[#F7F7F8] p-0.75 scrollbar-none [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label={t('draftOrders.page.viewAriaLabel')}
          >
            <Button
              type="button"
              variant="ghost"
              aria-pressed={activeView === 'list'}
              onClick={() => setActiveView('list')}
              className={segButtonClass}
            >
              {t('draftOrders.page.views.draftOrders')}
            </Button>

            <Button
              type="button"
              disabled
              aria-pressed={false}
              className={`${segButtonClass} cursor-not-allowed opacity-50`}
            >
              {t('draftOrders.page.views.managerApprovals')}
            </Button>
          </div>

          <Button
            type="button"
            variant="default"
            size="control"
            shape="md"
            className="max-[759.98px]:ml-auto"
            onClick={() =>
              void navigate(ROUTES.draftOrdersNew)
            }
          >
            <Plus
              aria-hidden="true"
              focusable="false"
              className="size-4 shrink-0"
              strokeWidth={1.8}
            />
            <span>{t('draftOrders.page.newDraftOrder')}</span>
          </Button>
        </div>
      </header>
      <>
        <DraftOrdersKpis kpis={kpis} />
        <div className="mt-3">
          <DraftOrdersList
            draftOrders={draftOrders}
            availableBrands={availableBrands}
          />
        </div>
      </>
    </section>
  );
}
