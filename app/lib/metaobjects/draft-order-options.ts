import {z} from 'zod';
import type {MetaobjectOption} from '~/features/draft-orders/types/new-draft-order';
import {createLogger} from '~/lib/logger';
import {METAOBJECT_TYPES} from '~/shared/constants/metafields';

const log = createLogger('metaobjects.draft-order-options');

const metaobjectListSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      handle: z.string(),
      displayName: z.string().nullable().optional(),
      fields: z.array(z.object({key: z.string(), value: z.string().nullable()})),
    }),
  ),
});

const draftOrderOptionsSchema = z.object({
  classifications: metaobjectListSchema,
  interfaces: metaobjectListSchema,
});

type MetaobjectNode = z.infer<typeof metaobjectListSchema>['nodes'][number];

function getLabel(node: MetaobjectNode): string {
  const displayName = node.displayName?.trim();
  if (displayName) return displayName;

  const fields = new Map(node.fields.map((field) => [field.key, field.value?.trim()]));
  for (const key of ['name', 'label', 'title', 'code', 'value']) {
    const value = fields.get(key);
    if (value) return value;
  }

  return node.handle.replace(/[_-]+/g, ' ');
}

function readOptions(
  list: z.infer<typeof metaobjectListSchema>,
  type: string,
): MetaobjectOption[] {
  if (!list.nodes.length) {
    log.warn('No draft-order option metaobjects returned; check Storefront access', {type});
  }

  const seen = new Set<string>();
  return list.nodes.flatMap((node) => {
    const label = getLabel(node);
    const normalized = label.toLowerCase();
    if (!label || seen.has(normalized)) return [];
    seen.add(normalized);
    return [{id: node.id, handle: node.handle, label}];
  });
}

export function readDraftOrderOptions(payload: unknown): {
  orderClassifications: MetaobjectOption[];
  interfaceModes: MetaobjectOption[];
} {
  const parsed = draftOrderOptionsSchema.safeParse(payload);
  if (!parsed.success) {
    log.warn('Draft-order option metaobject payload did not parse', {
      issues: parsed.error.issues.map((issue) => issue.path.join('.')),
    });
    return {orderClassifications: [], interfaceModes: []};
  }

  return {
    orderClassifications: readOptions(
      parsed.data.classifications,
      METAOBJECT_TYPES.orderClassification,
    ),
    interfaceModes: readOptions(parsed.data.interfaces, METAOBJECT_TYPES.draftOrderInterface),
  };
}