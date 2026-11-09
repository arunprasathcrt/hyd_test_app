export type AssetSource = 'iconic' | 'spectrum';

export interface Asset {
  href: string;
  image?: string;
  thumbnailTextKey?: string;
  thumbnailBackground?: string;
  altKey: string;
  badgeKey: string;
  titleKey: string;
  source: AssetSource;
  metaKey?: string;
  contain?: boolean;
}

export interface AssetSection {
  titleKey: string;
  count: number;
  items: Asset[];
}

const catalogImage =
  'https://cdn.repspark.net/2/p/srPM0k3RgQCQ6j0qy5ZhzwCucDtVe3xxoVmtq9ASNO8/srPM0k3RgQCQ6j0qy5ZhzwCucDtVe3xxoVmtq9ASNO8-s_2000x2000';

export const assetSections: AssetSection[] = [
  {
    titleKey: 'assets.sections.renderings',
    count: 4,
    items: [
      {
        href: 'https://dam.iconic.io/PP-2200.png',
        image: catalogImage,
        altKey: 'assets.alt.catalogPhoto',
        badgeKey: 'assets.badges.rendering',
        titleKey: 'assets.titles.catalogPhoto',
        source: 'iconic',
      },
      {
        href: 'https://dam.iconic.io/pp2200/ART-PP-2200-on-block.png',
        thumbnailTextKey: 'assets.thumbnails.artOnBlock',
        thumbnailBackground: '#0C2340',
        altKey: 'assets.alt.artOnBlock',
        badgeKey: 'assets.badges.png',
        titleKey: 'assets.titles.artOnBlock',
        source: 'iconic',
        contain: true,
      },
      {
        href: 'https://dam.iconic.io/pp2200/ART-PP-2200-on-garment.png',
        image: catalogImage,
        altKey: 'assets.alt.artOnGarment',
        badgeKey: 'assets.badges.png',
        titleKey: 'assets.titles.artOnGarment',
        source: 'spectrum',
      },
      {
        href: 'https://dam.iconic.io/pp2200/web/PP-2200.jpg',
        image: catalogImage,
        altKey: 'assets.alt.webImage',
        badgeKey: 'assets.badges.jpg',
        titleKey: 'assets.titles.webImage',
        source: 'iconic',
      },
    ],
  },

  {
    titleKey: 'assets.sections.artFiles',
    count: 4,
    items: [
      {
        href: 'https://dam.iconic.io/pp2200/ART-PP-2200.png',
        thumbnailTextKey: 'assets.thumbnails.artFile',
        thumbnailBackground: '#0C2340',
        altKey: 'assets.alt.artFile',
        badgeKey: 'assets.badges.png',
        titleKey: 'assets.titles.artFile',
        source: 'iconic',
        metaKey: 'assets.metadata.resolution300Dpi',
        contain: true,
      },
      {
        href: 'https://dam.iconic.io/pp2200/ART-PP-2200.ai',
        thumbnailTextKey: 'assets.thumbnails.illustrator',
        thumbnailBackground: '#0C2340',
        altKey: 'assets.alt.illustratorMaster',
        badgeKey: 'assets.badges.ai',
        titleKey: 'assets.titles.illustratorMaster',
        source: 'iconic',
        contain: true,
      },
      {
        href: 'https://dam.iconic.io/pp2200/refer-to.png',
        thumbnailTextKey: 'assets.thumbnails.referTo',
        thumbnailBackground: '#0C2340',
        altKey: 'assets.alt.referToArt',
        badgeKey: 'assets.badges.png',
        titleKey: 'assets.titles.referToArt',
        source: 'iconic',
        contain: true,
      },
      {
        href: 'https://dam.iconic.io/pp2200/crest.png',
        thumbnailTextKey: 'assets.thumbnails.crest',
        thumbnailBackground: '#0C2340',
        altKey: 'assets.alt.crestLogo',
        badgeKey: 'assets.badges.png',
        titleKey: 'assets.titles.crestLogo',
        source: 'iconic',
        contain: true,
      },
    ],
  },

  {
    titleKey: 'assets.sections.production',
    count: 3,
    items: [
      {
        href: 'https://files.spectrumcustomizer.com/recipe/ART-PP-2200.pdf',
        thumbnailTextKey: 'assets.thumbnails.productionReady',
        thumbnailBackground: '#7A5B16',
        altKey: 'assets.alt.productionSeparations',
        badgeKey: 'assets.badges.pdf',
        titleKey: 'assets.titles.productionSeparations',
        source: 'spectrum',
        contain: true,
      },
      {
        href: 'https://files.spectrumcustomizer.com/callouts/ART-PP-2200.pdf',
        thumbnailTextKey: 'assets.thumbnails.colorCallouts',
        thumbnailBackground: '#0C2340',
        altKey: 'assets.alt.colorCallouts',
        badgeKey: 'assets.badges.pdf',
        titleKey: 'assets.titles.colorCallouts',
        source: 'spectrum',
        contain: true,
      },
      {
        href: 'https://files.spectrumcustomizer.com/placement/ART-PP-2200.pdf',
        thumbnailTextKey: 'assets.thumbnails.placementCoords',
        thumbnailBackground: '#0C2340',
        altKey: 'assets.alt.placementCoordinates',
        badgeKey: 'assets.badges.pdf',
        titleKey: 'assets.titles.placementCoordinates',
        source: 'spectrum',
        contain: true,
      },
    ],
  },

  {
    titleKey: 'assets.sections.threeD',
    count: 1,
    items: [
      {
        href: 'https://files.spectrumcustomizer.com/3d/PP-2200.glb',
        image: catalogImage,
        altKey: 'assets.alt.threeDModel',
        badgeKey: 'assets.badges.glb',
        titleKey: 'assets.titles.threeDModel',
        source: 'spectrum',
      },
    ],
  },
];

