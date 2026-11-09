export const PRODUCT_ROUTES = {
  listing: '/rep/products',
  preview: '/dev/products',
  login: '/login',
} as const;

export const PRODUCT_NAMESPACES = ['products', 'errors'] as const;
export const PRODUCT_PERMISSION = 'sales.act';
export const PENDING_BRANDS = [
  'brands.champion',
  'brands.reebok',
  'brands.lululemon',
  'brands.gearForSports',
] as const;

export const PRODUCT_FIELD_MAP = [
  {
    fields: [
      'id',
      'sku',
      'name',
      'brand',
      'gender',
      'category',
      'garmentType',
      'colorName',
      'colorHex',
      'colorFamily',
      'sizeRun',
      'image',
    ],
    id: 'UPC.productIdentity',
    servedVia: 'native',
    api: 'Storefront',
  },
  {fields: ['price'], id: 'UPC.basePrice', servedVia: 'native', api: 'Storefront'},
  {
    fields: ['subtitle', 'placementLabels', 'popularity'],
    id: 'UPC.displayMetadata',
    servedVia: 'computed in app',
    api: null,
  },
  {
    fields: [
      'catalogName',
      'season',
      'recencyScore',
      'channel',
      'sport',
      'tier',
      'family',
      'fabric',
      'features',
      'placementCodes',
      'decorationMethods',
      'availability',
      'moq',
    ],
    id: 'UPC.catalogAttributes',
    servedVia: null,
    api: null,
  },
  {
    fields: ['type', 'licenses', 'region', 'isLicensed', 'artCategory'],
    id: 'UPC.artMetadata',
    servedVia: null,
    api: null,
  },
  {
    fields: [
      'q',
      'view',
      'sort',
      'density',
      'page',
      'min',
      'max',
      'counts',
      'selection',
    ],
    id: 'MOD.productsState',
    servedVia: 'computed in app',
    api: null,
  },
  {
    fields: ['books', 'collections', 'builds', 'atp', 'draft', 'presentation'],
    id: 'MOD.productsIntegrations',
    servedVia: null,
    api: null,
  },
].map((field) => ({
  ...field,
  idStatus: 'SUGGESTED',
  mappingStatus: 'TO CONFIRM',
}));
