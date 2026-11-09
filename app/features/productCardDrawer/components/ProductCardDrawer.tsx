import {useTranslation} from 'react-i18next';
import {useState} from 'react';
import type {ProductCardProduct, ProductCardTabId} from '../types';
import {PRODUCT_CARD_TABS} from '../types';
import {ProductCardHeader} from './ProductCardHeader';
import {ProductCardMetrics} from './ProductCardMetrics';
import {ProductCardTabs} from './ProductCardTabs';
import {ProductCardTabPanel} from './ProductCardTabPanel';
import {AGV_STYLE_FALLBACK} from '../lib/agv-style-fallback';
import { Button } from '~/shared/components/ui/Button';

interface ProductCardDrawerProps {
  product: ProductCardProduct;
  onClose: () => void;
}

export default function ProductCardDrawer({
  product,
  onClose,
}: ProductCardDrawerProps) {
  const {t} = useTranslation('productCardDrawer');
  const [activeTab, setActiveTab] = useState<ProductCardTabId>('overview');

  const selectTab = (tabId: ProductCardTabId) => {
    if (!PRODUCT_CARD_TABS.find((tab) => tab.id === tabId)?.disabled) {
      setActiveTab(tabId);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('drawer.ariaLabel')}
      className="fixed inset-y-0 right-0 z-[91] flex w-[90vw] max-w-none flex-col border-l border-[#ECECEE] bg-white shadow-[0_20px_60px_rgba(17,17,19,0.10)]"
    >
      <ProductCardHeader
        product={product}
        onClose={onClose}
        onSelectTab={selectTab}
      />
      <ProductCardMetrics />
      <ProductCardTabs activeTab={activeTab} onChange={selectTab} />

      <div className="mt-7 min-h-0 flex-1 overflow-y-auto px-4 ml-5">
        <div className="mx-auto max-w-[1560px]">
          <ProductCardTabPanel
            product={product}
            activeTab={activeTab}
            agvData={AGV_STYLE_FALLBACK}
          />
        </div>
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t border-[#ECECEE] px-8 py-[14px]">
        <span className="text-[11px] text-[#8E8E93]">{t('drawer.footer')}</span>
        <Button type="button" variant="default" shape="pill" onClick={onClose}>
          {t('drawer.close')}
        </Button>
      </footer>
    </div>
  );
}
