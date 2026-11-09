import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface ProductOverviewTabProps {
  product: {
    id: string;
    name: string;
    units: number;
    image: string;
  };
}

interface SkuRowProps {
  type: string;
  source: string;
  code: string;
  name?: string;
  description: ReactNode;
  gradient: string;
  image?: string;
  letter?: string;
}

export default function ProductOverviewTab({product}: ProductOverviewTabProps) {
  const {t} = useTranslation('productCardDrawer');
  return (
    <section aria-label={t('overview.ariaLabel')} className="pb-6">
      <div className="mb-[18px] flex flex-wrap gap-2">
        <Pill variant="success">{t('overview.pills.setBundle')}</Pill>
        <Pill>{t('overview.pills.customizable')}</Pill>
        <Pill>{t('overview.pills.gender')}</Pill>
      </div>

      <div className="mb-2.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
        {t('overview.bundleHeading', {count: 3})}
      </div>

      <div className="mb-2 rounded-lg border border-[#ECECEE] px-2">
        <SkuRow
          type={t('overview.types.garment')}
          source={t('overview.sources.netsuite')}
          code={product.id}
          name={product.name}
          description={t('overview.garmentDescription')}
          gradient="from-[#0C2340] to-[#1A3A6A]"
          image={product.image}
        />
      </div>

      <div className="mb-2 rounded-lg border border-[#ECECEE] px-2">
        <SkuRow
          type={t('overview.types.art')}
          source={t('overview.sources.iconik')}
          code="ART-PP-2200"
          description={<>{t('overview.artDescription')} · <Pill>{t('overview.notApplicable')}</Pill></>}
          gradient="from-[#111113] to-[#C99700]"
          letter="A"
        />
      </div>

      <div className="mb-2 rounded-lg border border-[#ECECEE] px-2">
        <SkuRow
          type={t('overview.types.decoration')}
          source={t('overview.sources.spectrum')}
          code="DEC-PP-2200"
          name={t('overview.decorationName')}
          description={t('overview.decorationDescription')}
          gradient="from-[#0F4C4C] to-[#1A6A6A]"
          letter="D"
        />
      </div>

      <div className="flex justify-between border-t border-[#ECECEE] px-1 pt-[14px] text-[13px]">
        <span className="text-[#5C5C61]">{t('overview.priceLabel')}</span>
        <span className="font-semibold text-[#111113]">{t('overview.priceValue')}</span>
      </div>

      <div className="mt-[14px] text-[11px] text-[#8E8E93]">
        {t('overview.placements', {count: 1})}
        <span className="ml-1.5 inline-flex rounded-full bg-[#F4F4F2] px-2 py-1 text-[10px] text-[#5C5C61]">
          {t('overview.placementName')}
        </span>
      </div>

      <div className="mt-3 text-[11px] text-[#8E8E93]">
        {t('overview.lifetimeUnits')} <span className="font-medium text-[#111113]">{product.units}</span>
      </div>
    </section>
  );
}

function SkuRow({
  type,
  source,
  code,
  name,
  description,
  gradient,
  image,
  letter,
}: SkuRowProps) {
  return (
    <div className="flex items-center gap-4 border-b border-[#ECECEE] py-3 last:border-b-0">
      <div
        className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${gradient} text-sm font-semibold text-white`}
      >
        {letter || 'G'}
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full bg-white object-contain"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#8E8E93]">
          {type}
          <span className="ml-1.5 rounded bg-[#F4F4F2] px-1.5 py-0.5 text-[8px] font-medium normal-case tracking-normal text-[#5C5C61]">
            {source}
          </span>
        </div>
        <div className="mt-[3px] text-[13.5px] font-medium text-[#111113]">
          {code}{name ? ` · ${name}` : ''}
        </div>
      </div>

      <div className="whitespace-nowrap text-right text-[12px] text-[#5C5C61]">
        {description}
      </div>
    </div>
  );
}

function Pill({
  children,
  variant = 'default',
}: {
  children: ReactNode;
  variant?: 'default' | 'success';
}) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] ${variant === 'success' ? 'bg-[#EAF1EC] text-[#2E5944]' : 'bg-[#F4F4F2] text-[#5C5C61]'}`}>
      {children}
    </span>
  );
}
