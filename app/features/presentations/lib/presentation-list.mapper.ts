/**
 * Temporary Shopify Collection → Presentation mapper.
 *
 * Maps the fields the Shopify Collection list read provides. Fields with no
 * Shopify source get empty values, so the Presentations list can render
 * Shopify collections without runtime errors. Those values are not data.
 *
 * `status` is the one placeholder that is not empty. The Presentation status
 * type has no empty value, so every mapped collection reads as 'draft'.
 */
import type { AdminPresentationCollectionNode } from '~/features/presentations/schemas/collection.schema';
import type {
  Presentation,
  PresentationCoverImage,
  PresentationCustomer,
} from '~/features/presentations/types/presentations';

const COVER_IMAGE_LIMIT = 4;

function resolveCustomerName(
  value: string,
  customers: PresentationCustomer[],
): string {
  return (
    customers.find((customer) => customer.id === value)?.name ??
    customers.find((customer) => customer.name === value)?.name ??
    ''
  );
}

export function mapShopifyCollectionToPresentation(
  collection: AdminPresentationCollectionNode,
  customers: PresentationCustomer[],
): Presentation {
  // Cover images are the first products that have a featured image. The product
  // id stands in for an image id, because the query does not select one, and the
  // product title stands in for missing alt text.
  const coverImages: PresentationCoverImage[] = [];

  for (const product of collection.products.nodes) {
    if (coverImages.length === COVER_IMAGE_LIMIT) {
      break;
    }

    if (product.featuredImage === null) {
      continue;
    }

    coverImages.push({
      id: product.id,
      imageUrl: product.featuredImage.url,
      alt: product.featuredImage.altText ?? product.title,
    });
  }

  // Counts the products returned by `products(first: 50)`, so it caps at 50.
  const styleCount = collection.products.nodes.length;

  const customerValue = collection.customer?.value ?? '';

const customerRecord =
  customers.find((customer) => customer.id === customerValue) ??
  customers.find((customer) => customer.name === customerValue);

  return {
    id: collection.id,
    name: collection.title,
    customer: resolveCustomerName(
      collection.customer?.value ?? '',
      customers,
    ),
    customerCode: collection.customerCode?.value ?? '',
    status: 'draft',
    approvalPercent: 0,
    styleCount,
    totalCount: styleCount,
    approvedCount: 0,
    updatedAt: collection.updatedAt,
    updatedAtMs: Date.parse(collection.updatedAt),
    lastActivity: '',
    activityStatus: '',
    repName: customerRecord?.repName ?? '',
    neededBy: collection.neededBy?.value ?? '',
    neededByPastDue: false,
    coverImages,
  };
}
