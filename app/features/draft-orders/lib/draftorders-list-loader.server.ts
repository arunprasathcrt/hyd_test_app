import { adminQuery } from '~/lib/shopify/admin.server';
import { logger } from '~/lib/logger';
import { GET_DRAFT_ORDERS_QUERY } from '../queries/draft-orders-list';
import { draftOrdersListResponseSchema } from '../schemas/draft-orders-admin.schema';
import { mapDraftOrderLines } from './draft-order-lines';
import type { DraftOrderListBrand, DraftOrderListItem } from '../types/draft-order';

/**
 * Maps a vendor name from `utxBrands` to a list brand. Anything unrecognised
 * goes to `other`, the Gear bucket, so the list's brand keys stay closed.
 */
function toListBrand(vendor: string): DraftOrderListBrand {
  const normalized = vendor.trim().toLowerCase();

  if (normalized === 'under armour' || normalized === 'ua') {
    return 'ua';
  }

  if (normalized === 'champion') {
    return 'champion';
  }

  if (normalized === 'lululemon') {
    return 'lululemon';
  }

  return 'other';
}

export async function loadDraftOrdersList(context: { env: Env }) {
  // ==========================================
  // Fetch Draft Orders from Admin API
  // ==========================================
  const allDraftOrders = [];
  let after: string | null = null;
  let hasNextPage = true;
  let availableVendors: string[] = [];
  let companies: Array<{
    locations: {
      nodes: Array<{
        id: string;
        name?: string | null;
      }>;
    };
  }> = [];

  while (hasNextPage) {
    const payload = await adminQuery({
      env: context.env,
      query: GET_DRAFT_ORDERS_QUERY,
      variables: {
        // Smaller pages keep the per-query cost down now that each draft carries its line items.
        first: 50,
        vendorFirst: 50,
        after,
      },
    });

    const parsed =
      draftOrdersListResponseSchema.parse(payload);

    allDraftOrders.push(
      ...parsed.draftOrders.nodes,
    );

    availableVendors =
      parsed.productVendors.nodes;

    companies = parsed.companies.nodes;

    hasNextPage =
      parsed.draftOrders.pageInfo.hasNextPage;

    after =
      parsed.draftOrders.pageInfo.endCursor;
  }
  const brandOrder = [
    'Under Armour',
    'Champion',
    'Lululemon',
    'Gear',
  ];

  const availableBrands = brandOrder.filter((brand) =>
    availableVendors.includes(brand),
  );

  const locationLookup = new Map<string, string>();

  companies.forEach((company) => {
    company.locations.nodes.forEach((location) => {
      locationLookup.set(
        location.id,
        location.name ?? '',
      );
    });
  });

  // ==========================================
  // Map Draft Orders
  // ==========================================

  const mappedDraftOrders = [...allDraftOrders]
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? '').getTime() -
        new Date(a.updatedAt ?? '').getTime(),
    )
    .map((node): DraftOrderListItem => {
      return {
        id: node.name ?? '',
        gid: node.id,
        // TODO: Determine the actual version value once the backend mapping is confirmed.
        version: 1,
        description: node.description?.value ?? '',
        // TODO: Map the actual draft order status from Shopify once the backend mapping is confirmed.
        status: 'draft',
        customer:
          node.utxCustomerName?.value ??
          node.customer?.displayName ??
          '',
        brands: node.utxBrands?.value
          ? node.utxBrands.value
            .split(',')
            .map(toListBrand)
          : [],
        shipTo: (() => {
          try {
            const deliveries = node.deliveries?.value
              ? (JSON.parse(node.deliveries.value) as Array<{
                locationId?: string;
              }>)
              : [];

            const locationId = deliveries[0]?.locationId;

            return locationLookup.get(locationId ?? '') ?? '';
          } catch {
            return '';
          }
        })(),
        updatedDate: node.updatedAt
          ? new Date(node.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
          : '',
        // TODO: Replace the placeholder workflow stages once workflow data becomes available from Shopify.
        workflow: [
          { code: 'customer_art', status: 'queued' },
          { code: 'quantity', status: 'queued' },
          { code: 'art_production', status: 'queued' },
          { code: 'license', status: 'queued' },
          { code: 'final_approval', status: 'queued' },
          { code: 'inventory', status: 'queued' },
          { code: 'capacity', status: 'queued' },
          { code: 'pricing', status: 'queued' },
          { code: 'financial', status: 'queued' },
        ],
        amount: Number(
          node.totalPriceSet?.shopMoney?.amount ?? 0,
        ),
        lines: mapDraftOrderLines(node.lineItems.nodes),
      };
    });
  return {
    draftOrders: mappedDraftOrders,
    availableBrands,
  };
}