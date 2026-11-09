import type {
	PresentationStatusItem,
	PresentationSortItem,
	PresentationDensityItem,
	PresentationFilterItem,
	PresentationStatusOption,
	Presentation,
} from '~/features/presentations/types/presentations';

export const PRESENTATION_SEGMENTS: PresentationStatusItem[] = [
	{
		value: 'all',
		labelKey: 'segments.all',
	},
	{
		value: 'draft',
		labelKey: 'segments.drafts',
	},
	{
		value: 'withCustomer',
		labelKey: 'segments.withCustomer',
	},
	{
		value: 'needsUs',
		labelKey: 'segments.needsUs',
	},
	{
		value: 'approved',
		labelKey: 'segments.approved',
	},
	{
		value: 'closed',
		labelKey: 'segments.closed',
	},
];

export const PRESENTATION_SORT_OPTIONS: PresentationSortItem[] = [
	{
		value: 'updated',
		labelKey: 'sort.recentlyUpdated',
	},
	{
		value: 'needed',
		labelKey: 'sort.neededBy',
	},
	{
		value: 'name',
		labelKey: 'sort.name',
	},
	{
		value: 'customer',
		labelKey: 'sort.customer',
	},
];

export const PRESENTATION_DENSITY_OPTIONS: PresentationDensityItem[] = [
	{
		value: 'comfortable',
		labelKey: 'density.comfortable',
	},
	{
		value: 'compact',
		labelKey: 'density.compact',
	},
];

export const PRESENTATION_FILTERS: PresentationFilterItem[] = [
	{
		id: 'customer',
		labelKey: 'filters.customer',
	},
	{
		id: 'status',
		labelKey: 'filters.status',
	},
	{
		id: 'rep',
		labelKey: 'filters.rep',
	},
];

export const getDefaultNeededBy = () => {
  const date = new Date();
  date.setDate(date.getDate() + 45);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getDefaultPresentationName = (
  shortName: string,
  collectionSuffix: string,
) => {
  const now = new Date();

  const month = new Intl.DateTimeFormat(undefined, {
    month: 'short',
  }).format(now);

  const year = String(now.getFullYear()).slice(-2);

  return `${shortName} ${month} ’${year} ${collectionSuffix}`;
};

export function getPresentationStage(
  presentation: Presentation,
): string {
  switch (presentation.status) {
    case 'draft':
      return 'unsent';

    case 'withCustomer':
      return 'opened';

    case 'needsUs':
      return 'changes';

    case 'approved':
      return 'nodraft';

    case 'closed':
      return 'closed';

    default:
      return '';
  }
}

export function buildStatusCounts(
  presentations: Presentation[],
): PresentationStatusOption[] {
  return [
    {
      value: 'all',
      count: presentations.length,
    },
    {
      value: 'draft',
      count: presentations.filter(
        presentation => presentation.status === 'draft',
      ).length,
    },
    {
      value: 'withCustomer',
      count: presentations.filter(
        presentation => presentation.status === 'withCustomer',
      ).length,
    },
    {
      value: 'needsUs',
      count: presentations.filter(
        presentation => presentation.status === 'needsUs',
      ).length,
    },
    {
      value: 'approved',
      count: presentations.filter(
        presentation => presentation.status === 'approved',
      ).length,
    },
    {
      value: 'closed',
      count: presentations.filter(
        presentation => presentation.status === 'closed',
      ).length,
    },
  ];
}

export function buildCustomerOptions(
  presentations: Presentation[],
) {
  return Array.from(
    new Map(
      presentations.map((presentation) => [
        presentation.customer,
        {
          value: presentation.customer
            .toLowerCase()
            .replace(/\s+/g, '-'),
          label: presentation.customer,
          count: presentations.filter(
            (item) => item.customer === presentation.customer,
          ).length,
        },
      ]),
    ).values(),
  );
}

export function buildRepOptions(
  presentations: Presentation[],
) {
  return Array.from(
    new Map(
      presentations
        .filter((presentation) => presentation.repName !== '')
        .map((presentation) => [
          presentation.repName,
          {
            value: presentation.repName,
            label: presentation.repName,
            count: presentations.filter(
              (item) => item.repName === presentation.repName,
            ).length,
          },
        ]),
    ).values(),
  );
}
