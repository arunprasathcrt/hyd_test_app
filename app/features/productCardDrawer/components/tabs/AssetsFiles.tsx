import {useTranslation} from 'react-i18next';
import {assetSections} from './assetFiles.data';
import {AssetSectionView} from './AssetSection';

export default function AssetsFiles() {
  const {t} = useTranslation('productCardDrawer');
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1560px]">
        {/* Description */}
        <div className="mb-[14px] text-[11.5px] text-[#5C5C61]">
          {t('assets.description')}
        </div>

        {/* Sections */}
        {assetSections.map((section) => (
          <AssetSectionView
            key={section.titleKey}
            section={section}
          />
        ))}
      </div>
    </div>
  );
}
