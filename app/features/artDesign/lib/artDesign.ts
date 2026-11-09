import type { BuildPathType, CalendarDay, SpectrumBrand, SpectrumCategory, SpectrumColor, SpectrumGarment, SpectrumGarmentFilters } from "../types/artDesign"

export const SIX_WEEKS_IN_DAYS = 42;
export const ART_DESIGN_NEEDED_BY_STORAGE_KEY = "artDesign.neededByDate";
export const ART_DESIGN_BUILD_PATH_STORAGE_KEY = "artDesign.buildPath";

export const getSavedNeededByDate = (): Date | null => {
  try {
    const savedDate = window.localStorage.getItem(
      ART_DESIGN_NEEDED_BY_STORAGE_KEY,
    );
    if (!savedDate) return null;
    const date = new Date(savedDate);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return startOfDay(date);
  } catch {
    return null;
  }
};

export const saveNeededByDate = (date: Date): void => {
  try {
    const normalizedDate = startOfDay(date);
    window.localStorage.setItem(
      ART_DESIGN_NEEDED_BY_STORAGE_KEY,
      normalizedDate.toISOString(),
    );
  } catch {
    return;
  }
};

export const getSavedBuildPath = (): BuildPathType | null => {
  try {
    const savedPath = window.localStorage.getItem(
      ART_DESIGN_BUILD_PATH_STORAGE_KEY,
    );

    if (savedPath === "spectrum" || savedPath === "ai") {
      return savedPath;
    }

    return null;
  } catch {
    return null;
  }
};

export const saveBuildPath = (path: BuildPathType): void => {
  try {
    window.localStorage.setItem(
      ART_DESIGN_BUILD_PATH_STORAGE_KEY,
      path,
    );
  } catch {
    return;
  }
};

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getDaysDifference = (
  from: Date,
  to: Date,
): number => {
  const start = startOfDay(from).getTime();
  const end = startOfDay(to).getTime();
  return Math.round((end - start) / 86_400_000);
};

export const isSameDay = (first: Date, second: Date): boolean =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

export const formatShortDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);

export const getMonthTitle = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(date);

export const createCalendarDays = (
  month: Date,
  today: Date,
): CalendarDay[] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const calendarStart = new Date(year, monthIndex, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(calendarStart, index);
    const daysOut = getDaysDifference(today, date);

    return {
      date,
      isCurrentMonth: date.getMonth() === monthIndex,
      isPast: daysOut < 0,
      isToday: isSameDay(date, today),
      isInsideSixWeeks: daysOut >= 0 && daysOut < SIX_WEEKS_IN_DAYS,
    };
  });
};

export const getDateSummaryValues = (
  selectedDate: Date,
  today: Date,
) => {
  const daysOut = getDaysDifference(today, selectedDate);
  const insideSixWeeks =
    daysOut >= 0 && daysOut < SIX_WEEKS_IN_DAYS;

  return {
    daysOut,
    insideSixWeeks,
    daysShort: Math.max(0, SIX_WEEKS_IN_DAYS - daysOut),
  };
};

export const formatWeekdayShortDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);

export const canNavigatePreviousMonth = (
  month: Date,
  today: Date,
): boolean =>
  month.getFullYear() > today.getFullYear() ||
  month.getMonth() > today.getMonth();

interface CalendarDayClassOptions {
  selected: boolean;
  isInsideSixWeeks: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
  isBoundary: boolean;
}

export const getCalendarDayClass = ({
  selected,
  isInsideSixWeeks,
  isPast,
  isCurrentMonth,
  isBoundary,
}: CalendarDayClassOptions): string => {
  const base =
    "relative aspect-square h-auto w-full min-h-9 min-w-0 shrink rounded-full border-0 p-0 text-[13.5px] font-medium transition";

  const state = selected
    ? "bg-[#111113] text-white hover:bg-[#111113] hover:text-white"
    : isBoundary
      ? "bg-transparent text-[#5C5C61] hover:bg-transparent hover:text-[#5C5C61]"
    : isInsideSixWeeks
      ? "bg-[#FFF6E5] text-[#6B4A0B] hover:bg-[#FFF6E5] hover:text-[#6B4A0B]"
      : "bg-[#EEF6F1] text-[#1F7A4D] hover:bg-[#EEF6F1] hover:text-[#1F7A4D]";

  const availability = isPast
    ? "cursor-default bg-transparent text-[#8E8E93] hover:scale-100 hover:bg-transparent hover:text-[#8E8E93]"
    : "cursor-pointer hover:scale-110 hover:shadow-[inset_0_0_0_1px_currentColor]";

  const outsideMonth = !isCurrentMonth ? "opacity-40" : "";

  return [base, state, availability, outsideMonth]
    .filter(Boolean)
    .join(" ");
};

export const getDateHintValues = (
  date: Date,
  today: Date,
) => {
  const daysOut = getDaysDifference(today, date);

  return {
    daysOut,
    insideSixWeeks:
      daysOut >= 0 && daysOut < SIX_WEEKS_IN_DAYS,
  };
};

/**
 * Garment selection fucntions
*/

export const filterSpectrumGarments = (
  garments: SpectrumGarment[],
  filters: SpectrumGarmentFilters,
): SpectrumGarment[] => {
  const query = filters.query.trim().toLowerCase();

  return garments.filter((garment) => {
    const matchesSearch =
      !query ||
      garment.name.toLowerCase().includes(query) ||
      garment.style.toLowerCase().includes(query) ||
      garment.colorGroups.some((color) =>
        color.toLowerCase().includes(query),
      );

    const matchesCategory =
      filters.category === "all" ||
      garment.category === filters.category;

    const matchesColor =
      filters.color === "all" ||
      garment.colorGroups.includes(filters.color);

    const matchesBrand =
      filters.brand === "all" ||
      garment.brand === filters.brand;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesColor &&
      matchesBrand
    );
  });
};

export const getSpectrumCategoryCount = (
  garments: SpectrumGarment[],
  category: SpectrumCategory,
  filters: SpectrumGarmentFilters,
): number => {
  const query = filters.query.trim().toLowerCase();

  return garments.filter((garment) => {
    const matchesSearch =
      !query ||
      garment.name.toLowerCase().includes(query) ||
      garment.style.toLowerCase().includes(query);
    const matchesColor =
      filters.color === "all" ||
      garment.colorGroups.includes(filters.color);

    const matchesCategory =
      category === "all" ||
      garment.category === category;

    const matchesBrand =
      filters.brand === "all" ||
      garment.brand === filters.brand;

    return (
      matchesSearch &&
      matchesColor &&
      matchesCategory &&
      matchesBrand
    );
  }).length;
};

export const getSpectrumColorCount = (
  garments: SpectrumGarment[],
  color: SpectrumColor,
  filters: SpectrumGarmentFilters,
): number => {
  const query = filters.query.trim().toLowerCase();

  return garments.filter((garment) => {
    const matchesSearch =
      !query ||
      garment.name.toLowerCase().includes(query) ||
      garment.style.toLowerCase().includes(query);

    const matchesCategory =
      filters.category === "all" ||
      garment.category === filters.category;

    const matchesBrand =
      filters.brand === "all" ||
      garment.brand === filters.brand;

    const matchesColor =
      color === "all" ||
      garment.colorGroups.includes(color);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesBrand &&
      matchesColor
    );
  }).length;
};

export const getSpectrumBrandCount = (
  garments: SpectrumGarment[],
  brand: SpectrumBrand,
  filters: SpectrumGarmentFilters,
): number => {
  const query = filters.query.trim().toLowerCase();

  return garments.filter((garment) => {
    const matchesSearch =
      !query ||
      garment.name.toLowerCase().includes(query) ||
      garment.style.toLowerCase().includes(query);

    const matchesCategory =
      filters.category === "all" ||
      garment.category === filters.category;

    const matchesColor =
      filters.color === "all" ||
      garment.colorGroups.includes(filters.color);

    const matchesBrand =
      brand === "all" ||
      garment.brand === brand;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesColor &&
      matchesBrand
    );
  }).length;
};