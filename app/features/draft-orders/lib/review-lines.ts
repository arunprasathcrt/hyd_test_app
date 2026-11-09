import type {DraftProduct} from '../schemas/draft-product.schema';
import type {DraftOrderDelivery, DraftOrderReviewLine, NewDraftOrderLocation} from '../types/new-draft-order';
import {
  getDraftCards,
  getProductGarmentUnit,
  getProductQuantity,
  getProductSubtotal,
} from './draft-products';

/** Builds Review step lines from the products store; no products gives no lines. */
export function toReviewLines(
  products: DraftProduct[],
  {
    decoration,
    deliveries,
    locations,
    locale,
    cityLine,
  }: {
    decoration?: string;
    deliveries: DraftOrderDelivery[];
    locations: NewDraftOrderLocation[];
    locale: string;
    /** Translated `newDraftOrder.ship.location.cityLine`. */
    cityLine: (address: {city: string; zone: string; zip: string}) => string;
  },
): DraftOrderReviewLine[] {
  const cards = getDraftCards(products);
  const listFormat = new Intl.ListFormat(locale, {style: 'long', type: 'conjunction'});
  return products.map((product, index) => {
    const cardIndex = cards.findIndex(
      (card) => card.id === (product.cardId ?? product.id),
    );
    const cardLead = cards[cardIndex]?.products[0];
    const firstVariant = product.variants[0];
    const assignedDeliveries = deliveries.filter((delivery) => deliveries.length === 1
      ? getProductQuantity(product) > 0
      : product.variants.some((variant) => (delivery.allocations?.[product.id]?.[variant.id] ?? 0) > 0));
    const destinationNames = assignedDeliveries.map((delivery) =>
      delivery.customAddress?.name ?? locations.find((location) => location.id === delivery.locationId)?.name ?? '',
    ).filter(Boolean);
    const destinationAddresses = assignedDeliveries.map((delivery) => {
      if (delivery.customAddress) {
        const address = delivery.customAddress;
        return [address.address1, address.address2, cityLine({city: address.city, zone: address.state, zip: address.zip})]
          .filter(Boolean)
          .join(', ');
      }
      const address = locations.find((location) => location.id === delivery.locationId)?.shipping;
      if (!address) return '';
      return [address.address1, address.address2, cityLine({city: address.city, zone: address.zoneCode, zip: address.zip})]
        .filter(Boolean)
        .join(', ');
    }).filter(Boolean);
    return {
      id: product.id,
      sku: firstVariant?.sku ?? '',
      name: product.name,
      color: firstVariant?.color ?? '',
      brand: product.brand,
      image: product.image || undefined,
      thumbnailFallback: product.name.slice(0, 2).toUpperCase(),
      decoration,
      shipTo: listFormat.format(destinationNames),
      shipToAddress: listFormat.format(destinationAddresses),
      quantity: getProductQuantity(product),
      sizes: product.variants
        .filter((variant) => variant.quantity > 0)
        .map((variant) => ({size: variant.size, quantity: variant.quantity})),
      garmentUnitPrice: getProductGarmentUnit(product),
      artUnitPrice: product.artPrice,
      decorationUnitPrice: product.decorationPrice + product.adderPrice,
      lineTotal: getProductSubtotal(product),
      bundleCard: cardIndex + 1,
      artSelected: false,
      convertsWithLine:
        cardLead && cardLead.id !== product.id
          ? (cardLead.lineNumber ?? products.indexOf(cardLead) + 1)
          : undefined,
      lineNumber: product.lineNumber ?? index + 1,
    };
  });
}
