import {z} from 'zod';
import {createLogger} from '~/lib/logger';
import {adminQuery} from '~/lib/shopify/admin.server';
import {
  DUPLICATE_DRAFT_MUTATION,
  DUPLICATE_SOURCE_DRAFT_QUERY,
} from '../queries/duplicate-draft-order';

const log = createLogger('routes.draftorders.duplicate');

const nullableString = z.string().nullable().optional();
const attributeSchema = z.object({key: z.string(), value: nullableString});

const sourceResponseSchema = z.object({
  node: z
    .object({
      id: z.string(),
      note2: nullableString,
      poNumber: nullableString,
      tags: z.array(z.string()),
      taxExempt: z.boolean().optional(),
      customer: z.object({id: z.string()}).nullable().optional(),
      customAttributes: z.array(attributeSchema),
      metafields: z.object({
        nodes: z.array(
          z.object({
            namespace: z.string(),
            key: z.string(),
            type: z.string(),
            value: z.string(),
          }),
        ),
      }),
      lineItems: z.object({
        nodes: z.array(
          z.object({
            title: nullableString,
            quantity: z.number(),
            taxable: z.boolean().optional(),
            variant: z.object({id: z.string()}).nullable().optional(),
            originalUnitPriceSet: z
              .object({shopMoney: z.object({amount: z.string()}).nullable()})
              .nullable()
              .optional(),
            customAttributes: z.array(attributeSchema),
          }),
        ),
      }),
    })
    .nullable(),
});

const createResponseSchema = z.object({
  draftOrderCreate: z.object({
    draftOrder: z.object({id: z.string(), name: nullableString}).nullable(),
    userErrors: z.array(z.object({message: z.string()})),
  }),
});

/**
 * Workflow and send state belong to the original; a copy starts fresh.
 * `custom.draft_order_status` is a `list.metaobject_reference`, so copying it
 * would point both drafts at the same workflow records.
 * ❓ TO CONFIRM: the `workflow.*` keys are per `DRAFT_ORDER_WORKFLOW_METAFIELD_KEYS`.
 */
const isWorkflowMetafield = (key: string) =>
  key.startsWith('workflow.') || key === 'draft_order_status';

/**
 * Shopify returns this app's reserved namespace resolved (`app--<id>` or
 * `app--<id>--<name>`), but a create call only takes the `$app` form.
 */
function toWritableNamespace(namespace: string): string {
  const match = /^app--\d+(?:--(.+))?$/.exec(namespace);
  if (!match) return namespace;
  return match[1] ? `$app:${match[1]}` : '$app';
}

const definedAttributes = (attributes: Array<{key: string; value?: string | null}>) =>
  attributes.flatMap(({key, value}) => (value ? [{key, value}] : []));

export type DuplicateDraftResult =
  | {ok: true; id: string; name: string}
  | {ok: false; reason: 'notFound' | 'failed'};

/** Copies a saved draft, with its lines, tags, attributes and metafields, as a new draft. */
export async function duplicateDraftOrder(
  env: Env,
  sourceId: string,
): Promise<DuplicateDraftResult> {
  try {
    const source = sourceResponseSchema.parse(
      await adminQuery({env, query: DUPLICATE_SOURCE_DRAFT_QUERY, variables: {id: sourceId}}),
    ).node;
    if (!source) return {ok: false, reason: 'notFound'};

    const lineItems = source.lineItems.nodes.map((line) => {
      const customAttributes = definedAttributes(line.customAttributes);
      return line.variant
        ? {variantId: line.variant.id, quantity: line.quantity, customAttributes}
        : {
            title: line.title ?? '',
            quantity: line.quantity,
            originalUnitPrice: line.originalUnitPriceSet?.shopMoney?.amount ?? '0.00',
            taxable: line.taxable ?? true,
            customAttributes,
          };
    });

    const created = createResponseSchema.parse(
      await adminQuery({
        env,
        query: DUPLICATE_DRAFT_MUTATION,
        variables: {
          input: {
            // The field is `note2` on a DraftOrder but `note` on its input.
            note: source.note2 ?? '',
            poNumber: source.poNumber ?? '',
            tags: source.tags,
            taxExempt: source.taxExempt ?? false,
            lineItems,
            customAttributes: definedAttributes(source.customAttributes),
            metafields: source.metafields.nodes
              .filter((metafield) => !isWorkflowMetafield(metafield.key))
              .map((metafield) => ({
                ...metafield,
                namespace: toWritableNamespace(metafield.namespace),
              })),
            ...(source.customer ? {purchasingEntity: {customerId: source.customer.id}} : {}),
          },
        },
      }),
    ).draftOrderCreate;

    if (!created.draftOrder || created.userErrors.length) {
      log.warn('Draft duplicate rejected', {sourceId, userErrors: created.userErrors});
      return {ok: false, reason: 'failed'};
    }

    return {ok: true, id: created.draftOrder.id, name: created.draftOrder.name ?? ''};
  } catch (error) {
    log.error('Draft duplicate failed', {
      sourceId,
      cause: error instanceof Error ? error.message : String(error),
    });
    return {ok: false, reason: 'failed'};
  }
}
