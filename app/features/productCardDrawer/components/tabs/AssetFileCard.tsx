import type {FC} from 'react';
import {useTranslation} from 'react-i18next';
import type {Asset, AssetSource} from './assetFiles.data';

const SourceBadge: FC<{ source: AssetSource }> = ({ source }) => {
  const {t} = useTranslation('productCardDrawer');
  return (
    <span
      className={`
        inline-flex
        rounded-[5px]
        px-[6px]
        py-[2px]
        text-[9px]
        font-medium
        leading-none
        ${
          source === 'iconic'
            ? 'bg-[#F0E9D5] text-[#7A5B16]'
            : 'bg-[#E2F0EF] text-[#28615F]'
        }
      `}
    >
      {t(`assets.sources.${source}`)}
    </span>
  );
};

const AssetThumbnail: FC<{ asset: Asset }> = ({ asset }) => {
  const {t} = useTranslation('productCardDrawer');
  /*
   * Some prototype thumbnails were inline SVG data URLs.
   * Instead of using <img src="data:image/svg+xml...">,
   * render those thumbnails directly as HTML/Tailwind.
   *
   * This avoids CSP issues in Hydrogen/Cloudflare environments.
   */
  if (asset.thumbnailTextKey) {
    return (
      <div
        className="flex h-full w-[76%] items-center justify-center"
        style={{
          backgroundColor: asset.thumbnailBackground ?? '#0C2340',
        }}
      >
        <span className="px-4 text-center font-[Inter,Helvetica,Arial,sans-serif] text-[17px] font-normal leading-tight text-white/85">
          {t(asset.thumbnailTextKey)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={asset.image}
      alt={t(asset.altKey)}
      loading="lazy"
      className={`
        h-full
        w-full
        bg-white
        ${asset.contain ? 'object-contain' : 'object-cover'}
      `}
    />
  );
};

export const AssetCard: FC<{ asset: Asset }> = ({ asset }) => {
  const {t} = useTranslation('productCardDrawer');
  return (
    <a
      href={asset.href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        block
        overflow-hidden
        rounded-[20px]
        border
        border-[#ECECEE]
        bg-white
        no-underline
        transition-shadow
        hover:shadow-[0_4px_18px_rgba(17,17,19,0.08)]
      "
    >
      {/* Image / Thumbnail */}
      <div
        className="
          relative
          flex
          aspect-[1.3]
          items-center
          justify-center
          overflow-hidden
          bg-white
        "
      >
        <AssetThumbnail asset={asset} />

        {/* File type */}
        <span
          className="
            absolute
            left-2
            top-2
            rounded-[6px]
            bg-[rgba(17,17,19,0.62)]
            px-[7px]
            py-[3px]
            text-[8.5px]
            font-bold
            uppercase
            tracking-[0.08em]
            text-white
          "
        >
          {t(asset.badgeKey)}
        </span>
      </div>

      {/* Card content */}
      <div className="px-3 py-[10px]">
        <div
          className="
            overflow-hidden
            text-ellipsis
            whitespace-nowrap
            text-[12px]
            font-medium
            text-[#111113]
          "
        >
          {t(asset.titleKey)}
        </div>

        <div className="mt-[5px] flex items-center gap-[6px]">
          <SourceBadge source={asset.source} />

          {asset.metaKey && (
            <span className="text-[10px] text-[#8E8E93]">
              {t(asset.metaKey)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
};

