import {useTranslation} from 'react-i18next';
import type {ProductCardProduct, ProductCardTabId} from '../types';
import {ProductWorkflowStatus} from './ProductWorkflowStatus';
import {Button} from '~/shared/components/ui/Button';

interface ProductCardHeaderProps {
  product: ProductCardProduct;
  onClose: () => void;
  onSelectTab: (tabId: ProductCardTabId) => void;
}

export function ProductCardHeader({
  product,
  onClose,
  onSelectTab,
}: ProductCardHeaderProps) {
  const {t} = useTranslation('productCardDrawer');
  return (
    <header className="flex shrink-0 items-center gap-[18px] border-b border-[#ECECEE] px-8 py-[22px]">
      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#111113] to-[#C99700]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full bg-white object-contain"
        />
      </div>

      <div className="min-w-[150px] flex-[0_1_290px]">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
          {product.id} · {t('header.setBundle')}
        </div>
        <div className="mt-0.5 truncate text-[20px] font-semibold tracking-[-0.01em] text-[#111113]">
          {product.name}
        </div>
        <div className="mt-[7px] flex flex-wrap items-center gap-2 text-[11.5px] text-[#5C5C61]">
          {t('header.brand')}
        </div>
      </div>

      <ProductWorkflowStatus onSelectTab={onSelectTab} />

      <Button
        type="button"
        variant="iconClose"
        size="icon"
        onClick={onClose}
        aria-label={t('drawer.close')}
        className="-translate-y-6"
      >
        ×
      </Button>
    </header>
  );
}
