export const PRODUCTS_ROUTE = '/productList';

export const PRESENTATIONS_ROUTE = '/presentations';

export const SHOPIFY_COLLECTION_GID_PREFIX = 'gid://shopify/Collection/';

export const PRESENTATION_DETAILS_ROUTE = '/presentations/details';

export function presentationDetailsUrl(id: string): string {
	return `${PRESENTATION_DETAILS_ROUTE}?id=${encodeURIComponent(id)}`;
}
