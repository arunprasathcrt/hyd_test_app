export const DECORATION_COST: Record<string, number> = {
	'Screen Print': 4.5,
	Embroidery: 6,
	'3D Puff Embroidery': 7.5,
	DTG: 5,
	'HTV Heat Transfer': 3.75,
	Applique: 6.5,
	Foil: 5.25,
	Rhinestone: 8,
};

export const DEFAULT_DECORATION_COST = 4.5;

export const DEFAULT_DECORATION_METHOD = 'Screen Print';

const METHOD_PREFERENCE = [
	'Screen Print',
	'Embroidery',
	'DTG',
	'HTV Heat Transfer',
];

export function decorationCostFor(method: string): number {
	return DECORATION_COST[method] ?? DEFAULT_DECORATION_COST;
}

export function buildMethodFor(decorationMethods: string[]): string {
	const preferred = METHOD_PREFERENCE.find((method) =>
		decorationMethods.includes(method),
	);

	return preferred ?? decorationMethods[0] ?? DEFAULT_DECORATION_METHOD;
}
