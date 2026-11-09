export type BuildPathType = "spectrum" | "ai";

export interface BuildPath {
  id: BuildPathType;
  tagKey: string;
  titleKey: string;
  descriptionKey: string;
  timeTitleKey: string;
  timeDescriptionKey: string;
  ctaKey: string;
  prosKeys: string[];
  consKeys: string[];
  creditTitleKey: string;
  creditDescriptionKey: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
  isInsideSixWeeks: boolean;
}

export interface QuickPick {
  labelKey: string;
  days: number;
}


/**
 * Garment selection related types and interfaces
*/

export type SpectrumCategory =
  | "all"
  | "Sweats & Hoodies"
  | "Tops"
  | "Headwear"
  | "Bottoms"
  | "Jerseys"
  | "Outerwear"
  | "Accessories"
  | "Bags"
  | "Footwear";

export type SpectrumColor =
  | "all"
  | "Black"
  | "White"
  | "Grey / Heather"
  | "Blue / Navy"
  | "Red"
  | "Green"
  | "Pink"
  | "Other";

export type SpectrumBrand =
  | "all"
  | "Champion"
  | "Gear for Sports"
  | "Lululemon"
  | "Under Armour";

export interface SpectrumGarment {
  id: string;
  style: string;
  name: string;
  spectrumSku: string;
  category: SpectrumCategory;
  colorGroups: SpectrumColor[];
  colors: number;
  brand: SpectrumBrand;
  imageUrl: string;
}

export interface SpectrumFilterOption<T extends string> {
  value: T;
  labelKey: string;
}

export interface SpectrumGarmentFilters {
  query: string;
  category: SpectrumCategory;
  color: SpectrumColor;
  brand: SpectrumBrand;
}