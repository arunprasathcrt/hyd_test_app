import type {FC} from 'react';
import {useTranslation} from 'react-i18next';
import type {AssetSection} from './assetFiles.data';
import {AssetCard} from './AssetFileCard';

export const AssetSectionView: FC<{ section: AssetSection }> = ({ section }) => {
  const {t} = useTranslation('productCardDrawer');
  return (
    <section className="mb-5">
      {/* Section title */}
      <div
        className="
          mb-[10px]
          mt-[6px]
          text-[10.5px]
          font-semibold
          uppercase
          tracking-[0.12em]
          text-[#8E8E93]
        "
      >
        {t(section.titleKey)}{' '}
        <span className="text-[#C99700]">
          {t('assets.sectionCount', {count: section.count})}
        </span>
      </div>

      {/* Asset grid */}
      <div
        className="
          mb-5
          grid
          grid-cols-[repeat(auto-fill,minmax(210px,1fr))]
          gap-3
        "
      >
        {section.items.map((asset) => (
          <AssetCard
            key={`${t(section.titleKey)}-${asset.titleKey}`}
            asset={asset}
          />
        ))}
      </div>
    </section>
  );
};

