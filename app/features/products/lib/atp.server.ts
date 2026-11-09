import {adminQuery} from '~/lib/shopify/admin.server';
import {createLogger} from '~/lib/logger';
import type {ProductsLoaderContext} from '~/lib/product/product.server';
import {ATP_RECORD_FIELDS} from '~/shared/constants/metafields';
import {PRODUCT_ATP_QUERY, PRODUCT_ATP_RECORDS_QUERY} from '../queries/atp';
import type {AtpTable} from '../schemas/atp.schema';
import {
  atpRecordsResponseSchema,
  productAtpResponseSchema,
} from '../schemas/atp.schema';

const log = createLogger('products.atp');
const MAX_PAGES = 5;

const isOption = (name: string, match: string) =>
  name.toLowerCase().includes(match);

type Storefront = ProductsLoaderContext['storefront'];

/** One `atp_size_info` record: a size's units available now, and optionally a PO. */
interface AtpRecord {
  size: string;
  available: number | null;
  po: string;
  date: string | null;
  units: number | null;
}

/** Variant sizes and record sizes are both typed in the store; join them ignoring case and spacing. */
function sizeKey(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]/g, '');
}

/** Record quantities are free text ("1,200"); keep one only when it is a whole number. */
function unitsOf(raw: string): number | null {
  const digits = raw.replace(/[,\s]/g, '');
  return /^\d+$/.test(digits) ? Number(digits) : null;
}

function toAtpRecord(fields: {key: string; value: string | null}[]): AtpRecord | null {
  const value = (key: string) =>
    fields.find((field) => field.key === key)?.value?.trim() ?? '';
  const size = value(ATP_RECORD_FIELDS.size);
  if (!size) return null;
  return {
    size,
    available: unitsOf(value(ATP_RECORD_FIELDS.available)),
    po: value(ATP_RECORD_FIELDS.poNumber),
    date: value(ATP_RECORD_FIELDS.futureDate) || null,
    units: unitsOf(value(ATP_RECORD_FIELDS.total)),
  };
}

/**
 * The ATP records on the given variants. Read through the Storefront API (the
 * Admin token cannot read metaobjects). A failure here is logged and returns no
 * records, so on-hand inventory still shows.
 */
async function loadAtpRecords(
  storefront: Storefront,
  productId: string,
  variantIds: Set<string>,
): Promise<AtpRecord[]> {
  const records: AtpRecord[] = [];
  let after: string | null = null;

  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const response = atpRecordsResponseSchema.parse(
        await storefront.query(PRODUCT_ATP_RECORDS_QUERY, {
          variables: {id: productId, after},
        }),
      );
      if (!response.product) break;
      for (const variant of response.product.variants.nodes) {
        if (!variantIds.has(variant.id)) continue;
        for (const reference of variant.atpRecords?.references.nodes ?? []) {
          const record = toAtpRecord(reference.fields ?? []);
          if (record) records.push(record);
        }
      }
      if (!response.product.variants.pageInfo.hasNextPage) break;
      after = response.product.variants.pageInfo.endCursor;
    }
  } catch (error) {
    log.warn('Product ATP records lookup failed', {
      productId,
      cause: error instanceof Error ? error.message : String(error),
    });
    return [];
  }

  return records;
}

/**
 * Units by size for one product colorway, plus its incoming purchase orders.
 * A size's units available now come from its ATP record when it has one, else from
 * variant inventory; each PO column is a distinct PO number and date on the records.
 * Served via: native variant `inventoryQuantity` and the variant's
 * `custom.atp_size_info` metaobject records.
 * ❓ TO CONFIRM — `total` on a record is read as that size's units on its PO, and
 * `available` as its units available now.
 */
export async function loadProductAtp(
  env: Env,
  storefront: Storefront,
  productId: string,
  color: string,
): Promise<AtpTable> {
  const variants: {
    id: string;
    inventoryQuantity: number | null;
    options: {name: string; value: string}[];
  }[] = [];
  let after: string | null = null;

  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const payload = await adminQuery({
        env,
        query: PRODUCT_ATP_QUERY,
        variables: {id: productId, after},
      });
      const {product} = productAtpResponseSchema.parse(payload);
      if (!product) break;
      product.variants.nodes.forEach((node) =>
        variants.push({
          id: node.id,
          inventoryQuantity: node.inventoryQuantity,
          options: node.selectedOptions,
        }),
      );
      if (!product.variants.pageInfo.hasNextPage) break;
      after = product.variants.pageInfo.endCursor;
    }
  } catch (error) {
    log.error('Product inventory lookup failed', {
      productId,
      cause: error instanceof Error ? error.message : String(error),
    });
    return {rows: [], purchaseOrders: []};
  }

  const wanted = color.trim().toLowerCase();
  const colorOf = (variant: (typeof variants)[number]) =>
    variant.options.find((option) => isOption(option.name, 'color'))?.value ?? '';
  const matching = wanted
    ? variants.filter((variant) => colorOf(variant).toLowerCase() === wanted)
    : [];
  const scoped = matching.length ? matching : variants;

  const records = await loadAtpRecords(
    storefront,
    productId,
    new Set(scoped.map((variant) => variant.id)),
  );

  const bySize = new Map<
    string,
    {
      label: string;
      inventory: number | null;
      available: number | null;
      incoming: Record<string, number>;
    }
  >();
  const rowFor = (raw: string) => {
    const key = sizeKey(raw);
    let row = bySize.get(key);
    if (!row) {
      row = {
        label: raw.trim(),
        inventory: null,
        available: null,
        incoming: {},
      };
      bySize.set(key, row);
    }
    return row;
  };

  scoped.forEach((variant) => {
    const size = variant.options.find((option) => isOption(option.name, 'size'))?.value;
    if (!size) return;
    const row = rowFor(size);
    row.inventory = (row.inventory ?? 0) + Math.max(0, variant.inventoryQuantity ?? 0);
  });

  const columns = new Map<string, AtpTable['purchaseOrders'][number]>();
  records.forEach((record) => {
    const row = rowFor(record.size);
    if (record.available !== null && row.available === null) {
      row.available = record.available;
    }
    if (!record.po && !record.date) return;
    const key = `${record.po}|${record.date ?? ''}`;
    columns.set(key, {key, po: record.po, date: record.date});
    if (record.units !== null) {
      row.incoming[key] = (row.incoming[key] ?? 0) + record.units;
    }
  });

  const purchaseOrders = [...columns.values()].sort(
    (a, b) =>
      (a.date ?? '9999').localeCompare(b.date ?? '9999') ||
      a.po.localeCompare(b.po),
  );

  return {
    rows: [...bySize.values()].map((row) => {
      return {
        size: row.label,
        available: row.available ?? row.inventory ?? 0,
        incoming: row.incoming,
      };
    }),
    purchaseOrders,
  };
}
