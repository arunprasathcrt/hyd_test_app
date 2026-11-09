import {useTranslation} from 'react-i18next';
import ApprovalsTab from './tabs/ApprovalsTab';
import BundleTab from './tabs/BundleTab';
import ColorSequencesTab from './tabs/ColorSequencesTab';
import ProductOverviewTab from './tabs/ProductOverviewTab';
import AssetsFiles from './tabs/AssetsFiles';
import AgvStyleTab from './tabs/AgvStyleTab';
import type {AgvStyleData, ProductCardProduct, ProductCardTabId} from '../types';

interface ProductCardTabPanelProps {
  product: ProductCardProduct;
  activeTab: ProductCardTabId;
  agvData: AgvStyleData;
}

export function ProductCardTabPanel({product, activeTab, agvData}: ProductCardTabPanelProps) {
  const {t} = useTranslation('productCardDrawer');
  if (activeTab === 'overview') return <ProductOverviewTab product={product} />;
  if (activeTab === 'bundle') return <BundleTab product={product} />;
  if (activeTab === 'assets') return <AssetsFiles />;
  if (activeTab === 'agv') return <AgvStyleTab data={agvData} />;
  if (activeTab === 'color') return <ColorSequencesTab />;
  if (activeTab === 'approvals') return <ApprovalsTab />;

  return (
    <div className="flex min-h-[400px] items-center justify-center text-[13px] text-[#8E8E93]">
      {t(`tabs.${activeTab}`)}
    </div>
  );
}
