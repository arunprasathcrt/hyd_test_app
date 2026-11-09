import { useLayoutEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/shared/components/ui/Button';
import type { CatalogMutation } from '../schemas/product.schema';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ChevronUpIcon } from './icons/ChevronUpIcon';
import { FilePlusIcon } from './icons/FilePlusIcon';
import { ShareIcon } from './icons/ShareIcon';
import { ShirtIcon } from './icons/ShirtIcon';
import { SparklesIcon } from './icons/SparklesIcon';

type DockIcon = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

export const ACTIONS = [
  {
    intent: 'presentation',
    title: 'dock.presentation',
    hint: 'dock.presentationHint',
    icon: ShareIcon,
  },
  {
    intent: 'collection',
    title: 'dock.collection',
    hint: 'dock.collectionHint',
    icon: BookmarkIcon,
  },
  { intent: 'draft', title: 'dock.draft', hint: 'dock.draftHint', icon: FilePlusIcon },
] as const;

interface DockCard {
  key: string;
  title: string;
  hint: string;
  icon: DockIcon;
  intent?: CatalogMutation['intent'];
  disabled?: boolean;
}

const DOCK_CARDS: DockCard[] = [
  {
    key: 'create-with-ai',
    title: 'detail.createWithAi',
    hint: 'dock.aiHint',
    icon: SparklesIcon,
    disabled: true,
  },
  {
    key: 'build-in-spectrum',
    title: 'detail.buildInSpectrum',
    hint: 'detail.spectrumUnavailable',
    icon: ShirtIcon,
    disabled: true,
  },
  {
    key: 'presentation',
    title: 'dock.presentation',
    hint: 'dock.presentationHint',
    icon: ShareIcon,
    intent: 'presentation',
  },
  {
    key: 'collection',
    title: 'dock.collection',
    hint: 'dock.collectionHint',
    icon: BookmarkIcon,
    intent: 'collection',
  },
  {
    key: 'draft',
    title: 'dock.draft',
    hint: 'dock.draftHint',
    icon: FilePlusIcon,
    intent: 'draft',
  },
];

interface SelectionDockProps {
  count: number;
  onReview: () => void;
  onClear: () => void;
  onIntent: (intent: CatalogMutation['intent']) => void;
}

export function SelectionDock({
  count,
  onReview,
  onClear,
  onIntent,
}: SelectionDockProps) {
  const { t } = useTranslation('products');
  const [dockBounds, setDockBounds] = useState<{ left: number; right: number } | null>(null);

  useLayoutEffect(() => {
    const productGrid = document.querySelector<HTMLElement>(
      '[data-products-page] [data-product-grid]',
    );
    if (!productGrid) return;

    const updateDockBounds = () => {
      const rect = productGrid.getBoundingClientRect();
      const left = Math.round(rect.left);
      const right = Math.round(window.innerWidth - rect.right);

      setDockBounds((current) =>
        current?.left === left && current.right === right
          ? current
          : { left, right },
      );
    };

    updateDockBounds();
    const resizeObserver = new ResizeObserver(updateDockBounds);
    resizeObserver.observe(productGrid);
    window.addEventListener('resize', updateDockBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDockBounds);
    };
  }, []);
  const isCompactDock = dockBounds ? dockBounds.right > 250 : false;
  
  return (
    <div
      data-catalog-dock
      style={dockBounds ?? undefined}
      className="fixed bottom-5 left-6 right-6 z-[80] mx-auto flex flex-wrap w-auto max-w-[1480px] items-center gap-[14px] rounded-2xl border border-[#ECECEE] bg-white p-[10px] text-[#111113] shadow-[0_28px_70px_-22px_rgba(15,15,15,0.28),0_2px_8px_rgba(15,15,15,0.06)] max-[900px]:gap-2 max-[700px]:bottom-3"
    >
      <div
        className={
          isCompactDock
            ? 'basis-full flex items-center gap-1 px-1'
            : 'flex shrink-0 items-center gap-1 px-1'
        }
      >
        <Button
          type="button"
          variant="dockControl"
          size="xs"
          shape="md"
          className="min-w-0 whitespace-nowrap px-1.5 py-0 text-[13.5px] font-semibold leading-none"
          onClick={onReview}
          aria-label={t('dock.review')}
        >
          <span aria-live="polite">{t('dock.count', { count })}</span>
          <ChevronUpIcon size={14} />
        </Button>
        <Button
          type="button"
          variant="dockClear"
          size="xs"
          shape="md"
          className="min-h-7 shrink-0 px-1.5 py-0 text-[12.5px]"
          onClick={onClear}
        >
          {t('dock.clear')}
        </Button>
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-5 gap-2 max-flex max-overflow-x-auto max-pb-1">
        {DOCK_CARDS.map((card) => (
          <Button
            key={card.key}
            type="button"
            variant={
              card.key === 'draft'
                ? 'dockPrimary'
                : card.key === 'build-in-spectrum'
                  ? 'dockMuted'
                  : 'dockCard'
            }
            size="dock"
            shape="lg"
            disabled={card.disabled}
            onClick={card.intent ? () => onIntent(card.intent!) : undefined}
            className={
              isCompactDock
                ? 'grid-cols-1 grid-rows-[auto_auto] justify-items-start gap-y-[6px] min-h-0'
                : 'max-min-w-[168px] gap-x-2 flex items-center'
            }
          >
            <span
              className={`row-span-1 grid h-7 w-7 place-items-center rounded-[9px] bg-[#F7F7F8] ${card.key === 'create-with-ai'
                ? 'text-[#C9A227]'
                : card.key === 'draft'
                  ? 'bg-white/10 text-white'
                  : card.key === 'build-in-spectrum'
                    ? 'bg-white text-[#6B6B70]'
                    : 'text-[#171719]'
                }`}
            >
              <card.icon size={16} />
            </span>
            <span
              className={
                isCompactDock
                  ? 'col-start-1 text-[13px] font-semibold leading-[1.3]'
                  : 'self-center text-[13px] font-semibold leading-[1.3]'
              }
            >
              {t(card.title)}
            </span>
            <span
              className={`hidden col-span-2 text-[12px] font-normal leading-[1.35] text-[#6B6B70] ${card.key === 'draft' ? 'text-white/75' : ''
                }`}
            >
              {t(card.hint)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
