export interface ProductCardProduct {
  id: string;
  name: string;
  units: number;
  image: string;
}

export type AgvColorRowId = 'white' | 'navy';
export type AgvTableValueKey =
  | 'standardInk'
  | 'whiteBaseInk'
  | 'tonalInk'
  | 'pmsMatch'
  | 'tonalNavy';

export interface AgvColorRow {
  id: AgvColorRowId;
  swatch: string;
  tonalLightKey: AgvTableValueKey;
  tonalDarkKey: AgvTableValueKey;
  colorOnColorKey: AgvTableValueKey;
}

export type AgvLocationId = 'fcc' | 'lc';
export type AgvLocationSizeKey = 'max12' | 'max4';

export interface AgvLocation {
  id: AgvLocationId;
  sizeKey: AgvLocationSizeKey;
}

export type AgvMethodKey = 'p1' | 'p2' | 'x1' | 'by' | 'cp4';
export type AgvNoteKey = 'note1' | 'note2' | 'note3';

export interface AgvStyleData {
  colorRows: AgvColorRow[];
  locations: AgvLocation[];
  methods: AgvMethodKey[];
  notes: AgvNoteKey[];
}

export type ProductCardTabId =
  | 'overview'
  | 'bundle'
  | 'assets'
  | 'agv'
  | 'inventory'
  | 'production'
  | 'color'
  | 'licensing'
  | 'comments'
  | 'activity'
  | 'orders'
  | 'approvals';

export interface ProductCardTab {
  id: ProductCardTabId;
  disabled?: boolean;
}

export const PRODUCT_CARD_TABS: ProductCardTab[] = [
  {id: 'overview'},
  {id: 'bundle'},
  {id: 'assets'},
  {id: 'agv'},
  {id: 'inventory', disabled: true},
  {id: 'production', disabled: true},
  {id: 'color'},
  {id: 'licensing', disabled: true},
  {id: 'comments', disabled: true},
  {id: 'activity', disabled: true},
  {id: 'orders', disabled: true},
  {id: 'approvals'},
];
