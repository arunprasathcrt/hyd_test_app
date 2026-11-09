/**
 * Maps a Shopify Presentation Collection to the Presentation Details shape.
 *
 * Pure: no IO. The route loader fetches the collection and passes it in along
 * with the customer list, so the name lookup uses the same list as the popup.
 *
 * Fields with no Shopify source get empty values, as the list mapper does. Two
 * are placeholders with a visible effect, and are noted where they are set.
 */
import type { AdminPresentationCollectionDetail } from '~/features/presentations/schemas/collection.schema';
import type {
  PresentationCoverImage,
  PresentationCustomer,
  PresentationDetail,
  PresentationStyle,
} from '~/features/presentations/types/presentations';

const COVER_IMAGE_LIMIT = 4;
const NEEDED_BY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The customer metafield holds a company GID when it is a reference, or a name
 * when it is text. Both resolve against the same customer list.
 */
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

function isPastDue(neededBy: string): boolean {
  if (neededBy === '') return false;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return new Date(`${neededBy}T00:00:00`).getTime() < startOfToday.getTime();
}

function toStyle(product: AdminPresentationCollectionDetail['products']['nodes'][number]): PresentationStyle {
  const image = product.featuredImage;
  return {
    id: product.id,
    kind: 'blank',
    styleName: product.title,
    brand: product.vendor,
    sku: product.variants.nodes[0]?.sku ?? '',
    color:
      product.variants.nodes[0]?.selectedOptions.find(
        (option) => option.name === 'Color',
      )?.value ?? '',
    imageUrl: image?.url ?? '',
    imageAlt: image?.altText ?? product.title,
    price: Number(product.priceRangeV2.minVariantPrice.amount),
    moq: product.moq?.value
      ? Number(product.moq.value)
      : null,
    decision: null,
  };
}

export function mapShopifyCollectionToPresentationDetail(
  collection: AdminPresentationCollectionDetail,
  customers: PresentationCustomer[],
  createdByName: string,
): PresentationDetail {
  const styles = collection.products.nodes.map(toStyle);

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

  const neededBy =
    collection.neededBy?.value && NEEDED_BY_PATTERN.test(collection.neededBy.value)
      ? collection.neededBy.value
      : '';
  
  const customerValue = collection.customer?.value ?? '';
  const customerRecord =
    customers.find((customer) => customer.id === customerValue) ??
    customers.find((customer) => customer.name === customerValue);

  return {
    id: collection.id,
    name: collection.title,
    customer: resolveCustomerName(collection.customer?.value ?? '', customers),
    customerCode: collection.customerCode?.value ?? '',
    status: collection.status?.value === 'draft' ? 'draft' : 'draft',
    approvalPercent: 0,
    styleCount: styles.length,
    totalCount: styles.length,
    approvedCount: 0,
    updatedAt: collection.updatedAt,
    updatedAtMs: Date.parse(collection.updatedAt),
    lastActivity: '',
    activityStatus: '',
    repName: customerRecord?.repName ?? '',
    createdByName,
    neededBy,
    neededByPastDue: isPastDue(neededBy),
    coverImages,
    styles,
    activity: [],
  };
}
