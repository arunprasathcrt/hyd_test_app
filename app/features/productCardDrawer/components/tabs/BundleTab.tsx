import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface Product {
  id: string;
  name: string;
}

interface BundleTabProps {
  product: Product;
}

type SourceType = 'NETSUITE' | 'ICONIK' | 'SPECTRUM';

interface BundleSectionProps {
  title: string;
  source?: SourceType;
  children: ReactNode;
}

interface BundleCardProps {
  children: ReactNode;
}

interface SourceBadgeProps {
  source: SourceType;
}

export default function BundleTab({product}: BundleTabProps) {
  const {t} = useTranslation('productCardDrawer');
  return (
    <section
      aria-label={t('bundle.ariaLabel')}
      className="max-w-[1560px] font-sans"
    >
      <BundleSection title={t('bundle.sections.garment')} source="NETSUITE">
        <BundleCard>
          <div className="text-[13.5px] font-medium leading-normal text-[#111113]">
            {product.id} · {product.name}
          </div>

          <div className="mt-1.5 text-[12px] leading-[1.7] text-[#5C5C61]">
            <div>{t('bundle.brand', {brand: t('header.brand')})}</div>
            <div>{t('bundle.fabric', {fabric: t('bundle.fabricValue')})}</div>
            <div>{t('bundle.netsuiteItem', {item: t('bundle.netsuiteItemValue')})}</div>
            <div>
              {t('bundle.inventory', {available: t('bundle.availableUnits'), onHand: t('bundle.onHandUnits'), location: t('bundle.inventoryLocation')})}
            </div>
          </div>
        </BundleCard>
      </BundleSection>

      <BundleSection title={t('bundle.sections.artwork', {count: 1})}>
        <BundleCard>
          <div className="text-[13.5px] font-medium leading-normal text-[#111113]">
            ART-PP-2200 <BundlePill>{t('overview.notApplicable')}</BundlePill>
          </div>

          <div className="mt-1.5 text-[12px] leading-[1.7] text-[#5C5C61]">
            <div>{t('bundle.customerSuppliedArt')}</div>
            <div>
              {t('bundle.artKind', {kind: t('bundle.artKindValue')})} <SourceBadge source="ICONIK" />
            </div>
            <div>
              {t('bundle.dam')}{' '}
              <a
                href="https://dam.iconic.io/PP-2200"
                target="_blank"
                rel="noreferrer"
                style={{color: '#0F4C4C'}}
                className="text-[#0F4C4C] underline-offset-2 hover:underline"
              >
                {t('bundle.damLink')}
              </a>
            </div>
          </div>
        </BundleCard>
      </BundleSection>

      <BundleSection title={t('bundle.sections.decoration', {count: 1})} source="SPECTRUM">
        <BundleCard>
          <div className="text-[13.5px] font-medium leading-normal text-[#111113]">
            {t('bundle.decorationCode')} · {t('overview.decorationName')}
          </div>

          <div className="mt-1.5 text-[12px] leading-[1.7] text-[#5C5C61]">
            <div>{t('bundle.decorationPlacement', {placement: t('bundle.decorationPlacementValue')})}</div>
            <div>{t('bundle.decorationTier', {tier: t('bundle.tierValue'), price: t('bundle.decorationPrice')})}</div>
          </div>
        </BundleCard>
      </BundleSection>
    </section>
  );
}

function BundleSection({title, source, children}: BundleSectionProps) {
  return (
    <section className="last:mb-0">
      <div className="mb-2.5 text-[10.5px] font-semibold uppercase leading-normal tracking-[0.12em] text-[#8E8E93]">
        {title}
        {source && <SourceBadge source={source} />}
      </div>
      {children}
    </section>
  );
}

function BundleCard({children}: BundleCardProps) {
  return (
    <div className="rounded-lg mb-4 border border-[#ECECEE] px-4 py-3">
      {children}
    </div>
  );
}

function SourceBadge({source}: SourceBadgeProps) {
  const {t} = useTranslation('productCardDrawer');
  const colors: Record<SourceType, string> = {
    NETSUITE: 'bg-[#EAF1EC] text-[#2E5944]',
    ICONIK: 'bg-[#EEF4F7] text-[#28566A]',
    SPECTRUM: 'bg-[#FDF3DE] text-[#865B0D]',
  };

  return (
    <span
      className={`ml-1 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold normal-case tracking-normal ${colors[source]}`}
    >
      {t(`overview.sources.${source.toLowerCase()}`)}
    </span>
  );
}

function BundlePill({children}: {children: ReactNode}) {
  return (
    <span className="inline-flex rounded-full bg-[#F4F4F2] px-2.5 py-1 text-[10px] text-[#5C5C61]">
      {children}
    </span>
  );
}
