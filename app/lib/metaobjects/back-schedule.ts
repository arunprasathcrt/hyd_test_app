import {z} from 'zod';
import type {ShipTiming} from '~/features/draft-orders/types/new-draft-order';
import {createLogger} from '~/lib/logger';
import {METAOBJECT_TYPES} from '~/shared/constants/metafields';

const log = createLogger('metaobjects.back-schedule');

const backScheduleResponseSchema = z.object({
  backSchedule: z.object({
    nodes: z.array(
      z.object({
        handle: z.string(),
        displayName: z.string().nullable().optional(),
        fields: z.array(z.object({key: z.string(), value: z.string().nullable()})),
      }),
    ),
  }),
});

function normalizeCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function entryDays(
  nodes: z.infer<typeof backScheduleResponseSchema>['backSchedule']['nodes'],
  expected: 'production' | 'shipping' | 'receiving_buffer',
): number | undefined {
  const aliases = expected === 'receiving_buffer'
    ? ['receiving_buffer', 'receiving']
    : [expected];

  for (const node of nodes) {
    const fields = new Map(node.fields.map((field) => [field.key, field.value]));
    const names = [
      normalizeCode(node.handle),
      normalizeCode(node.displayName ?? ''),
      normalizeCode(fields.get('display_name') ?? ''),
    ];

    if (!names.some((name) => aliases.includes(name))) continue;

    const days = Number(fields.get('days'));
    if (Number.isInteger(days) && days >= 0) return days;

    log.warn('Invalid back-schedule entry days', {handle: node.handle});
  }

  return undefined;
}

export function readBackSchedule(payload: unknown, fallback: ShipTiming): ShipTiming {
  const parsed = backScheduleResponseSchema.safeParse(payload);
  if (!parsed.success) {
    log.warn('Back-schedule metaobject payload did not parse', {
      issues: parsed.error.issues.map((issue) => issue.path.join('.')),
    });
    return fallback;
  }

  const nodes = parsed.data.backSchedule.nodes;
  if (!nodes.length) {
    log.warn('No back-schedule entries returned; check Storefront access', {
      type: METAOBJECT_TYPES.backSchedule,
    });
  }

  return {
    productionDays: entryDays(nodes, 'production') ?? fallback.productionDays,
    shippingDays: entryDays(nodes, 'shipping') ?? fallback.shippingDays,
    receivingDays: entryDays(nodes, 'receiving_buffer') ?? fallback.receivingDays,
  };
}