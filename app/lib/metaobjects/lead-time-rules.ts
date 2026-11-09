/**
 * Lead-time reader for the new draft order's Step 2.
 *
 * - `production_lead_time`: decoration methods (`method`, `days`)
 * - `art_and_account`: art/account modifiers (`name`, `days`)
 *
 * The lists and their order come from Shopify. Codes come from the entry
 * handle, so renaming a label does not orphan codes saved on drafts.
 *
 * Served via: metaobject (merchant-owned, Storefront access). No writer: maintained in Shopify.
 */
import {z} from 'zod';
import type {
  LeadTimeConfig,
  LeadTimeOption,
} from '~/features/draft-orders/types/new-draft-order';
import {createLogger} from '~/lib/logger';
import {
  ART_AND_ACCOUNT_FIELDS,
  METAOBJECT_TYPES,
  PRODUCTION_LEAD_TIME_FIELDS,
} from '~/shared/constants/metafields';

const log = createLogger('metaobjects.lead-time-rules');

const metaobjectListSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      handle: z.string(),
      fields: z.array(z.object({key: z.string(), value: z.string().nullable()})),
    }),
  ),
});

export const leadTimeRulesResponseSchema = z.object({
  methods: metaobjectListSchema,
  flags: metaobjectListSchema,
});

/** Keeps codes stable with drafts saved before these lists came from Shopify. */
const CODE_ALIASES: Record<string, string> = {
  blank_no_decoration: 'blank',
  new_art_needs_approval: 'new_art',
  pro_sports_license_mlb_nfl: 'pro_sports_license',
  some_items_need_a_po_not_in_stock: 'needs_po',
};

/** "screen-print" / "3d-embroidery" / "Appliqué" → `screen_print` / `three_d_embroidery` / `applique`. */
function toCode(value: string): string {
  const code = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/^3d(?![a-z])/, 'three_d')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return CODE_ALIASES[code] ?? code;
}

function readOptions(
  list: z.infer<typeof metaobjectListSchema>,
  type: string,
  fieldKeys: {label: string; days: string},
): LeadTimeOption[] {
  // Shopify returns an empty list, not an error, when the definition has no Storefront access.
  if (!list.nodes.length) {
    log.warn('No metaobject entries returned; check Storefront access on the definition', {type});
  }

  const options: LeadTimeOption[] = [];

  for (const node of list.nodes) {
    const fields = new Map(node.fields.map((field) => [field.key, field.value]));
    const label = fields.get(fieldKeys.label)?.trim() || node.handle;
    const rawDays = fields.get(fieldKeys.days);
    const code = toCode(node.handle);
    const days = Number(rawDays);

    if (!code || rawDays == null || !Number.isInteger(days) || days < 0) {
      log.warn('Skipping invalid lead-time entry', {type, handle: node.handle, days: rawDays});
      continue;
    }

    if (options.some((option) => option.code === code)) {
      log.warn('Duplicate lead-time entry', {type, handle: node.handle, code});
      continue;
    }

    options.push({code, label, days});
  }

  return options;
}

/** Parse the Storefront payload over `fallback`. A payload that does not parse returns `fallback`. */
export function readLeadTimeRules(
  payload: unknown,
  fallback: LeadTimeConfig,
): LeadTimeConfig {
  const parsed = leadTimeRulesResponseSchema.safeParse(payload);

  if (!parsed.success) {
    log.warn('Lead-time payload did not parse', {
      issues: parsed.error.issues.map((issue) => issue.path.join('.')),
    });
    return fallback;
  }

  return {
    ...fallback,
    methods: readOptions(parsed.data.methods, METAOBJECT_TYPES.productionLeadTime, {
      label: PRODUCTION_LEAD_TIME_FIELDS.method,
      days: PRODUCTION_LEAD_TIME_FIELDS.days,
    }),
    flags: readOptions(parsed.data.flags, METAOBJECT_TYPES.artAndAccount, {
      label: ART_AND_ACCOUNT_FIELDS.name,
      days: ART_AND_ACCOUNT_FIELDS.days,
    }),
  };
}
