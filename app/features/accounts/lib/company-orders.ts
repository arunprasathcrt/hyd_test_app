/**
 * `CompanyOrder[]` (nested under `Company.orders`, see `queries/companies.ts`)
 * → the Orders tab's row shape.
 *
 * ❓ TO CONFIRM — the prototype also carries a new/reorder indicator per row.
 * That is a business classification with no field anywhere in Shopify, so
 * rather than invent it, this mapping omits it until a real source (NetSuite
 * via Celigo, or a dedicated `$app` metafield) is identified.
 */
import type {
  AccountOrderRow,
  CompanyOrder,
  CompanyOrderLineItem,
} from '../schemas/company-orders.schema';

/** Column order for the Orders tab's size breakdown. */
export const SIZE_COLUMNS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3X', '4X'] as const;

/**
 * Store variants record size under a "Size" selected option, but the value
 * spelling isn't consistent (`"2X"` vs `"2XL"`, `"Small"` vs `"S"`). This maps
 * the common spellings onto `SIZE_COLUMNS`; anything else returns `null` and
 * is left out of the breakdown rather than guessed at.
 */
function normalizeSizeCode(value: string): (typeof SIZE_COLUMNS)[number] | null {
  const code = value.trim().toUpperCase();

  switch (code) {
    case 'XS':
    case 'X-SMALL':
    case 'EXTRA SMALL':
      return 'XS';
    case 'S':
    case 'SM':
    case 'SMALL':
      return 'S';
    case 'M':
    case 'MD':
    case 'MED':
    case 'MEDIUM':
      return 'M';
    case 'L':
    case 'LG':
    case 'LARGE':
      return 'L';
    case 'XL':
    case 'X-LARGE':
    case 'EXTRA LARGE':
      return 'XL';
    case '2XL':
    case '2X':
    case 'XXL':
      return '2XL';
    case '3XL':
    case '3X':
    case 'XXXL':
      return '3X';
    case '4XL':
    case '4X':
    case 'XXXXL':
      return '4X';
    default:
      return null;
  }
}

function sizeCodeFor(lineItem: CompanyOrderLineItem): string | null {
  const sizeOption = lineItem.variant?.selectedOptions.find(
    (option) => option.name.trim().toLowerCase() === 'size',
  );
  return sizeOption ? normalizeSizeCode(sizeOption.value) : null;
}

export function toOrderRows(orders: CompanyOrder[]): AccountOrderRow[] {
  return orders.map((order) => {
    const qty = order.lineItems.nodes.reduce(
      (sum, lineItem) => sum + lineItem.quantity,
      0,
    );
    const amount = Number(order.totalPriceSet.shopMoney.amount);

    const sizes: Record<string, number> = {};
    for (const lineItem of order.lineItems.nodes) {
      const code = sizeCodeFor(lineItem);
      if (!code) continue;
      sizes[code] = (sizes[code] ?? 0) + lineItem.quantity;
    }

    return {
      id: order.id,
      po: order.poNumber || order.name,
      createdAt: order.createdAt,
      financialStatus: order.displayFinancialStatus ?? null,
      fulfillmentStatus: order.displayFulfillmentStatus ?? null,
      qty,
      unit: qty > 0 ? amount / qty : 0,
      amount,
      currencyCode: order.totalPriceSet.shopMoney.currencyCode,
      sizes,
    };
  });
}

