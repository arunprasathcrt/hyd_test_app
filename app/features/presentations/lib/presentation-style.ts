import type { Product } from '~/features/products/schemas/product.schema';
import type {
	PresentationStyle,
	PresentationStyleKind,
} from '~/features/presentations/types/presentations';
import { buildMethodFor, decorationCostFor } from './decoration-cost';

const DEFAULT_PLACEMENT = 'Left Chest';

const KIND_BY_PRODUCT_TYPE: Record<Product['type'], PresentationStyleKind> = {
	garment: 'blank',
	art: 'art',
	bundles: 'blank',
};

function titleCase(value: string): string {
	return value
		.toLowerCase()
		.replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

export function normalizeArtName(name: string): string {
	const stripped = name.replace(/\s+-\s+[A-Z0-9]+$/, '').trim();

	return /[a-z]/.test(stripped) ? stripped : titleCase(stripped);
}

export function toPresentationStyle(product: Product): PresentationStyle {
	const kind = KIND_BY_PRODUCT_TYPE[product.type];
	const styleName =
		kind === 'art' ? normalizeArtName(product.name) : product.name;

	return {
		id: product.id,
		kind,
		styleName,
		brand: product.brand,
		sku: product.sku,
		color: product.colorName,
		imageUrl: product.image,
		imageAlt: styleName,
		artId: kind === 'art' ? product.id : undefined,
		price: product.price,
		moq: product.moq,
		decision: null,
	};
}

export function toBuildStyle(
	garment: Product,
	art: Product,
	slot: string,
	method: string,
): PresentationStyle {
	return {
		id: `${garment.id}+${art.id}`,
		kind: 'build',
		styleName: garment.name,
		brand: garment.brand,
		sku: garment.sku,
		color: garment.colorName,
		imageUrl: garment.image,
		imageAlt: garment.name,
		price:
			garment.price === null
				? null
				: garment.price + decorationCostFor(method),
		moq: garment.moq,
		decision: null,
		artId: art.id,
		artName: normalizeArtName(art.name),
		artImageUrl: art.image,
		slot,
		method,
	};
}

export function makeBuildItem(garment: Product, art: Product): DraftStyleItem {
	return {
		key: `${garment.id}+${art.id}`,
		kind: 'build',
		garmentId: garment.id,
		artId: art.id,
		slot: garment.placementLabels[0] ?? DEFAULT_PLACEMENT,
		method: buildMethodFor(garment.decorationMethods),
	};
}

export type DraftStyleItem =
	| {key: string; kind: 'blank'; garmentId: string}
	| {key: string; kind: 'art'; artId: string}
	| {
			key: string;
			kind: 'build';
			garmentId: string;
			artId: string;
			slot: string;
			method: string;
		};

function getRecordsById(
	products: Product[],
): Map<string, Product> {
	return new Map(
		products.map((record) => [record.id, record]),
	);
}


export function styleItemsForSelection(
	ids: string[],
	products: Product[],
): DraftStyleItem[] {
	const records = getRecordsById(products);
	const selected: Product[] = [];

	ids.forEach((id) => {
		const record = records.get(id);

		if (record) {
			selected.push(record);
		}
	});

	const arts = selected.filter((record) => record.type === 'art');
	const garments = selected.filter((record) => record.type !== 'art');

	if (arts.length === 1 && garments.length > 0) {
		return garments.map((garment) => makeBuildItem(garment, arts[0]));
	}

	return selected.map((record): DraftStyleItem =>
		record.type === 'art'
			? {key: record.id, kind: 'art', artId: record.id}
			: {key: record.id, kind: 'blank', garmentId: record.id},
	);
}

