import type { BuildPath, QuickPick, SpectrumBrand, SpectrumCategory, SpectrumColor, SpectrumFilterOption, SpectrumGarment } from "../app/features/artDesign/types/artDesign";

export const QUICK_PICKS: QuickPick[] = [
  { labelKey: "datePicker.quick.twoWeeks", days: 14 },
  { labelKey: "datePicker.quick.fourWeeks", days: 28 },
  { labelKey: "datePicker.quick.sixWeeks", days: 42 },
  { labelKey: "datePicker.quick.eightWeeks", days: 56 },
];

export const BUILD_PATHS: BuildPath[] = [
  {
    id: "spectrum",
    tagKey: "buildPaths.spectrum.tag",
    titleKey: "buildPaths.spectrum.title",
    descriptionKey: "buildPaths.spectrum.description",
    timeTitleKey: "buildPaths.spectrum.timeTitle",
    timeDescriptionKey: "buildPaths.spectrum.timeDescription",
    creditTitleKey: "buildPaths.spectrum.creditTitle",
    creditDescriptionKey: "buildPaths.spectrum.creditDescription",
    ctaKey: "buildPaths.spectrum.cta",
    prosKeys: [
      "buildPaths.spectrum.pros.catalog",
      "buildPaths.spectrum.pros.licensed",
      "buildPaths.spectrum.pros.production",
      "buildPaths.spectrum.pros.handoff",
    ],
    consKeys: [
      "buildPaths.spectrum.cons.existing",
      "buildPaths.spectrum.cons.placements",
    ],
  },
  {
    id: "ai",
    tagKey: "buildPaths.ai.tag",
    titleKey: "buildPaths.ai.title",
    descriptionKey: "buildPaths.ai.description",
    timeTitleKey: "buildPaths.ai.timeTitle",
    timeDescriptionKey: "buildPaths.ai.timeDescription",
    creditTitleKey: "buildPaths.ai.creditTitle",
    creditDescriptionKey: "buildPaths.ai.creditDescription",
    ctaKey: "buildPaths.ai.cta",
    prosKeys: [
      "buildPaths.ai.pros.concepts",
      "buildPaths.ai.pros.reskin",
      "buildPaths.ai.pros.renders",
      "buildPaths.ai.pros.creative",
    ],
    consKeys: [
      "buildPaths.ai.cons.timeline",
      "buildPaths.ai.cons.approvals",
    ],
  },
];

export const DATE_PICKER_LEGENDS = [
  {
    id: "spectrum",
    labelKey: "datePicker.legend.spectrum",
    indicatorClass: "bg-[#B26A00]",
  },
  {
    id: "ai",
    labelKey: "datePicker.legend.ai",
    indicatorClass: "bg-[#1F7A4D]",
  },
  {
    id: "boundary",
    labelKey: "datePicker.legend.firstDay",
    indicatorClass: "border-2 border-[#1F7A4D] bg-white",
  },
] as const;

/**
 * Garment selection mock data
*/

export const SPECTRUM_CATEGORIES: SpectrumFilterOption<SpectrumCategory>[] = [
  { value: "all", labelKey: "spectrumDrawer.categories.all" },
  { value: "Sweats & Hoodies", labelKey: "spectrumDrawer.categories.sweats" },
  { value: "Tops", labelKey: "spectrumDrawer.categories.tops" },
  { value: "Headwear", labelKey: "spectrumDrawer.categories.headwear" },
  { value: "Bottoms", labelKey: "spectrumDrawer.categories.bottoms" },
  { value: "Jerseys", labelKey: "spectrumDrawer.categories.jerseys" },
  { value: "Outerwear", labelKey: "spectrumDrawer.categories.outerwear" },
  { value: "Accessories", labelKey: "spectrumDrawer.categories.accessories" },
  { value: "Bags", labelKey: "spectrumDrawer.categories.bags" },
  { value: "Footwear", labelKey: "spectrumDrawer.categories.footwear" },
];

export const SPECTRUM_COLORS: SpectrumFilterOption<SpectrumColor>[] = [
  { value: "all", labelKey: "spectrumDrawer.colors.all" },
  { value: "Black", labelKey: "spectrumDrawer.colors.black" },
  { value: "White", labelKey: "spectrumDrawer.colors.white" },
  { value: "Grey / Heather", labelKey: "spectrumDrawer.colors.grey" },
  { value: "Blue / Navy", labelKey: "spectrumDrawer.colors.blue" },
  { value: "Red", labelKey: "spectrumDrawer.colors.red" },
  { value: "Green", labelKey: "spectrumDrawer.colors.green" },
  { value: "Pink", labelKey: "spectrumDrawer.colors.pink" },
  { value: "Other", labelKey: "spectrumDrawer.colors.other" },
];

export const SPECTRUM_BRANDS: SpectrumFilterOption<SpectrumBrand>[] = [
  { value: "all", labelKey: "spectrumDrawer.brands.all" },
  { value: "Champion", labelKey: "spectrumDrawer.brands.champion" },
  { value: "Gear for Sports", labelKey: "spectrumDrawer.brands.gearForSports" },
  { value: "Lululemon", labelKey: "spectrumDrawer.brands.lululemon" },
  { value: "Under Armour", labelKey: "spectrumDrawer.brands.underArmour" },
];

export const SPECTRUM_GARMENTS: SpectrumGarment[] = [
  {
    id: 'spectrum-um0752-1033',
    style: 'UM0752',
    spectrumSku: 'UM07521033',
    name: 'Tech™ Stretch Short Sleeve Tee',
    category: 'Tops',
    colorGroups: ['White', 'Other'],
    brand: "Under Armour",
    colors: 2,
    imageUrl:
      'https://cdn.repspark.net/2/p/nhZnvAucIkcqriWrIB6j1Epk94cExFHgR8bFe_hbqg8/nhZnvAucIkcqriWrIB6j1Epk94cExFHgR8bFe_hbqg8-s_400x400',
  },
  {
    id: 'spectrum-c6200-1103',
    style: 'C6200',
    spectrumSku: 'C62001103',
    name: 'C6200',
    category: 'Tops',
    colorGroups: ['Other'],
    brand: "Under Armour",
    colors: 9,
    imageUrl:
      'https://cdn.repspark.net/2/p/9JucmKqhO_vegFHa3JCgYde_SLNwFGdOCz3z-qFiRgM/9JucmKqhO_vegFHa3JCgYde_SLNwFGdOCz3z-qFiRgM-s_400x400',
  },
  {
    id: 'spectrum-cp2071-000',
    style: 'CP2071',
    spectrumSku: 'CP2071000',
    name: 'CP2071',
    category: 'Tops',
    colorGroups: ['Other'],
    brand: "Under Armour",
    colors: 17,
    imageUrl:
      'https://cdn.repspark.net/2/p/MUm_yw5awVaZrxENVwJhwvv5GTunUgv9I1U2GTtsdAw/MUm_yw5awVaZrxENVwJhwvv5GTunUgv9I1U2GTtsdAw-s_1500x1500',
  },
  {
    id: 'spectrum-g4017-000',
    style: 'G4017',
    spectrumSku: 'G4017000',
    name: 'G4017',
    category: 'Tops',
    colorGroups: ['Other'],
    brand: "Under Armour",
    colors: 15,
    imageUrl:
      'https://cdn.repspark.net/2/p/lNJjxxKeOsdmhJgIZ8RF7w-AVeOVEvZ36K4DwatC-qM/lNJjxxKeOsdmhJgIZ8RF7w-AVeOVEvZ36K4DwatC-qM-s_400x400',
  },
  {
    id: 'spectrum-gh703u-190',
    style: 'GH703U',
    spectrumSku: 'G40177164',
    name: 'GH703U',
    category: 'Tops',
    colorGroups: ['Other'],
    brand: "Under Armour",
    colors: 9,
    imageUrl:
      'https://cdn.repspark.net/2/p/qcfl278LoEfKjvxFjPPPuXyT_DAZ4x9sDZLgnoJZk4U/qcfl278LoEfKjvxFjPPPuXyT_DAZ4x9sDZLgnoJZk4U-s_400x400',
  },
  {
    id: 'spectrum-um1505-148',
    style: 'UM1505',
    spectrumSku: 'UM1505148',
    name: 'UM1505',
    category: 'Tops',
    colorGroups: ['Other'],
    brand: "Under Armour",
    colors: 14,
    imageUrl:
      'https://cdn.repspark.net/2/p/wB51c8hdqX6-j_I8x9apH91wB0EGtlfyo61Q_Z01B6Y/wB51c8hdqX6-j_I8x9apH91wB0EGtlfyo61Q_Z01B6Y-s_400x400',
  },
];