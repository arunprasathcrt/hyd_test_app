import {useTranslation} from 'react-i18next';
import {PRODUCT_CARD_TABS, type ProductCardTabId} from '../types';
import {TabStrip} from '~/shared/components/TabStrip';

interface ProductCardTabsProps {
  activeTab: ProductCardTabId;
  onChange: (tab: ProductCardTabId) => void;
}

export function ProductCardTabs({activeTab, onChange}: ProductCardTabsProps) {
  const {t} = useTranslation('productCardDrawer');
  const tabs = PRODUCT_CARD_TABS.map((tab) => ({
    id: tab.id,
    label: t(`tabs.${tab.id}`),
    disabled: tab.disabled,
  }));

  return (
    <TabStrip
      tabs={tabs}
      activeTab={activeTab}
      onChange={onChange}
      className="px-8 py-3"
    />
  );
}
