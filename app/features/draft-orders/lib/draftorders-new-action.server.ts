import {data} from 'react-router';
import {
  DRAFT_ORDER_TAGS_QUERY,
  SAVE_DRAFT_COMPANY_QUERY,
  SAVE_DRAFT_MUTATION,
  DELETE_DRAFT_METAFIELDS_MUTATION,
  SET_DRAFT_METAFIELD_MUTATION,
  UPDATE_DRAFT_MUTATION,
} from '~/features/draft-orders/queries/save-draft-order';
import {
  draftOrderTagsResponseSchema,
  saveDraftCompanyResponseSchema,
  saveDraftMutationResponseSchema,
  setDraftMetafieldResponseSchema,
  updateDraftMutationResponseSchema,
} from '~/features/draft-orders/schemas/draft-orders-admin.schema';
import {buildDraftOrderTags} from '~/features/draft-orders/lib/draft-order-tags';
import {newDraftOrderSchema} from '~/features/draft-orders/schemas/new-draft-order.schema';
import {draftOrderLineItemProductsSchema} from '~/features/draft-orders/schemas/draft-product.schema';
import type {
  CreatedDeliveryLocation,
  NewDraftOrderFieldErrors,
  SaveDraftResult,
} from '~/features/draft-orders/types/new-draft-order';
import {createLogger} from '~/lib/logger';
import {adminQuery} from '~/lib/shopify/admin.server';
import {
  APP_NAMESPACE,
  DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS,
  DRAFT_ORDER_METAFIELD_KEYS,
  DRAFT_ORDER_LINE_ITEMS_METAFIELD,
  DRAFT_ORDER_OPTION_METAFIELD_KEYS,
  PROGRAM_CODE_METAFIELD_KEYS,
} from '~/shared/constants/metafields';
import {
  buildDraftOrderMetafields,
  holdReasonLabel
} from './draftorders-new-metafields.server';
import {buildDraftOrderLineItems} from './draftorders-new-line-items.server';
import {createPendingDeliveryLocations} from './draftorders-company-location.server';

const log = createLogger('routes.draftorders.new.action');

const DRAFT_PLACEHOLDER_LINE_PRICE = '0.01';

function buildDraftCustomAttributes(values: {
  customerId: string;
  programCode: string;
  programCode2: string;
  interfaceMode: string;
  orderClass: string;
}) {
  return [
    {key: DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.customerId, value: values.customerId},
    {key: DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.programCode, value: values.programCode},
    {key: DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.programCode2, value: values.programCode2},
    {key: DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.interfaceMode, value: values.interfaceMode},
    {key: DRAFT_ORDER_CUSTOM_ATTRIBUTE_KEYS.orderClassification, value: values.orderClass},
  ].filter((attribute) => attribute.value.length > 0);
}



type SavePayload = {
  values: unknown;
  draftId?: string;
  lineItemProducts?: unknown;
};

type DraftOrderMutationResult = {
  draftOrder: {
    id: string;
    name?: string | null;
    status: string;
    customer?: {
      displayName?: string | null;
    } | null;
    customAttributes: Array<{
      key: string;
      value?: string | null;
    }>;
  } | null;
  userErrors: Array<{
    field?: string[] | null;
    message: string;
  }>;
};

type SaveDraftActionArgs = {
  request: Request;
  context: {env: any};
};

function badRequest(body: SaveDraftResult, status = 400) {
  return data<SaveDraftResult>(body, {status});
}

async function saveDraftOrderActionUnchecked({
  request,
  context,
}: SaveDraftActionArgs) {
  if (request.method !== 'POST') {
    return badRequest(
      {
        ok: false,
        errors: {},
        formError: 'newDraftOrder.errors.saveFailed',
      },
      405,
    );
  }

  const formData = await request.formData();
  const payload = formData.get('payload');

  if (typeof payload !== 'string') {
    return badRequest({
      ok: false,
      errors: {},
      formError: 'newDraftOrder.errors.saveFailed',
    });
  }

  let parsedPayload: unknown;

  try {
    parsedPayload = JSON.parse(payload);
  } catch {
    return badRequest({
      ok: false,
      errors: {},
      formError: 'newDraftOrder.errors.saveFailed',
    });
  }

  const normalizedPayload: SavePayload =
    parsedPayload !== null &&
    typeof parsedPayload === 'object' &&
    'values' in parsedPayload
      ? (parsedPayload as SavePayload)
      : {values: parsedPayload};

  const draftId =
    typeof normalizedPayload.draftId === 'string' && normalizedPayload.draftId.trim().length > 0
      ? normalizedPayload.draftId.trim()
      : undefined;

  const parsed = newDraftOrderSchema.safeParse(normalizedPayload.values);

  if (!parsed.success) {
    const errors: NewDraftOrderFieldErrors = {};

    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (
        typeof field === 'string' &&
        errors[field as keyof NewDraftOrderFieldErrors] === undefined
      ) {
        errors[field as keyof NewDraftOrderFieldErrors] = issue.message;
      }
    }

    return badRequest({ok: false, errors});
  }

  const lineItemProducts = draftOrderLineItemProductsSchema.safeParse(
    normalizedPayload.lineItemProducts,
  );
  if (!lineItemProducts.success) {
    log.warn('Step-3 line-item payload rejected', {
      issues: lineItemProducts.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      ),
    });
    return badRequest({
      ok: false,
      errors: {},
      formError: 'newDraftOrder.errors.saveFailed',
    });
  }

  const createdLocations: CreatedDeliveryLocation[] = [];

  try {
    // Delivery-drawer addresses become Company Locations only now that the draft is saved.
    const pendingLocations = await createPendingDeliveryLocations(
      context.env,
      parsed.data.customerId,
      parsed.data.deliveries ?? [],
      createdLocations,
    );
    if (pendingLocations.errorKey) {
      return badRequest({
        ok: false,
        errors: {},
        formError: pendingLocations.errorKey,
        createdLocations,
      });
    }
    const deliveries = pendingLocations.deliveries;

    const companyPayload = await adminQuery({
      env: context.env,
      query: SAVE_DRAFT_COMPANY_QUERY,
      variables: {id: parsed.data.customerId},
    });

    const companyParsed = saveDraftCompanyResponseSchema.parse(companyPayload);
    const companyName = companyParsed.node?.name?.trim() || parsed.data.customerId;
    const metafields = buildDraftOrderMetafields(parsed.data.brands, {
      artComment: parsed.data.artComment,
      manufacturingComment: parsed.data.manufacturingComment,
      invoiceComment: parsed.data.invoiceComment,
      acknowledgementComment: parsed.data.acknowledgementComment,
      shipExact: parsed.data.shipExact,
      description: parsed.data.description,
      orderName: parsed.data.orderName,
      leadTimeFlags: parsed.data.leadTimeFlags,
      leadTimeMethods: parsed.data.leadTimeMethods,
      interfaceMode: parsed.data.interfaceMode,
      orderClass: parsed.data.orderClass,
      orderType: parsed.data.orderType,
      programCode2: parsed.data.programCode2,
      programCode: parsed.data.programCode,
      inHandsDate: parsed.data.inHandsDate,
      deliveries,
      defaultShipToLocationId: deliveries[0]?.locationId ?? '',
      shipCode: parsed.data.shipCode ?? '',
      billToLocationId: parsed.data.billToLocationId ?? '',
      eventName: parsed.data.eventName ?? '',
      eventDate: parsed.data.eventDate,
      cancelDate: parsed.data.cancelDate,
      companyName,
      poNumber: parsed.data.poNumber ?? '',
    });

    // Every Step-3 card travels in this one metafield, sent by the browser as
    // `lineItemProducts` and validated above. Written even when empty so an
    // update clears removed cards.
    metafields.push({
      namespace: DRAFT_ORDER_LINE_ITEMS_METAFIELD.namespace,
      key: DRAFT_ORDER_LINE_ITEMS_METAFIELD.key,
      type: DRAFT_ORDER_LINE_ITEMS_METAFIELD.type,
      value: JSON.stringify(lineItemProducts.data),
    });
    const customAttributes = buildDraftCustomAttributes({
      customerId: parsed.data.customerId,
      programCode: parsed.data.programCode,
      programCode2: parsed.data.programCode2,
      interfaceMode: parsed.data.interfaceMode,
      orderClass: parsed.data.orderClass,
    });

    // The zustand-backed product picks, published as real Shopify draft order
    // lines (one per size with a quantity > 0); see buildDraftOrderLineItems
    // for why these are custom lines rather than variant-linked ones. A draft
    // order still needs at least one line, so an empty pick keeps the old
    // placeholder rather than failing to save.
    const productLines = buildDraftOrderLineItems(parsed.data.products);
    const lineItems =
      productLines.length > 0
        ? productLines
        : [
            {
              title: parsed.data.orderName.trim() || `UTX Draft ${parsed.data.inHandsDate}`,
              quantity: 1,
              originalUnitPrice: DRAFT_PLACEHOLDER_LINE_PRICE,
              taxable: false,
              customAttributes: [
                {key: 'utx_placeholder', value: 'true'},
                {key: 'utx_customer_id', value: parsed.data.customerId},
              ],
            },
          ];

    const runCreateDraft = async (): Promise<DraftOrderMutationResult> => {
      const createPayload = await adminQuery({
        env: context.env,
        query: SAVE_DRAFT_MUTATION,
        variables: {
          input: {
            note: parsed.data.orderName,
            poNumber: parsed.data.poNumber?.trim() ?? '',
            tags: buildDraftOrderTags([], parsed.data.brands),
            lineItems,
            customAttributes,
            metafields,
          },
        },
      });

      return saveDraftMutationResponseSchema.parse(createPayload).draftOrderCreate;
    };

    const runUpdateDraft = async (id: string): Promise<DraftOrderMutationResult> => {
      // `draftOrderUpdate` replaces every tag, so read the current tags and keep the ones this save does not own.
      const tagsPayload = await adminQuery({
        env: context.env,
        query: DRAFT_ORDER_TAGS_QUERY,
        variables: {id},
      });
      const existingTags = draftOrderTagsResponseSchema.parse(tagsPayload).draftOrder?.tags ?? [];

      const updatePayload = await adminQuery({
        env: context.env,
        query: UPDATE_DRAFT_MUTATION,
        variables: {
          id,
          input: {
            note: parsed.data.orderName,
            poNumber: parsed.data.poNumber?.trim() ?? '',
            tags: buildDraftOrderTags(existingTags, parsed.data.brands),
            lineItems,
            customAttributes,
            metafields,
          },
        },
      });

      return updateDraftMutationResponseSchema.parse(updatePayload).draftOrderUpdate;
    };

    // A failed update must not create a replacement draft: validation errors
    // will fail again, and an uncertain response could otherwise duplicate it.
    const saveFlow = draftId ? 'update' : 'create';
    const mutationResult = draftId
      ? await runUpdateDraft(draftId)
      : await runCreateDraft();

    if (mutationResult.userErrors.length || !mutationResult.draftOrder) {
      log.warn('Admin draft order save failed', {
        userErrors: mutationResult.userErrors,
        flow: saveFlow,
      });

      return badRequest({
        ok: false,
        errors: {},
        formError: 'newDraftOrder.errors.saveFailed',
        createdLocations,
      });
    }

    // Save optional references after draft creation so missing definitions cannot reject the draft.
    const savedDraftOrder = mutationResult.draftOrder;
    // Resolves to false when the reference did not save, so the result can say so.
    const saveReferenceMetafield = async (key: string, id: string): Promise<boolean> => {
      if (!id) return true;

      try {
        const payload = await adminQuery({
          env: context.env,
          query: SET_DRAFT_METAFIELD_MUTATION,
          variables: {
            metafields: [
              {
                ownerId: savedDraftOrder.id,
                namespace: 'custom',
                key,
                type: 'list.metaobject_reference',
                value: JSON.stringify([id]),
              },
            ],
          },
        });
        const result = setDraftMetafieldResponseSchema.parse(payload);
        if (result.metafieldsSet.userErrors.length > 0) {
          log.warn('Draft metaobject metafield save failed', {
            draftId: savedDraftOrder.id,
            key,
            userErrors: result.metafieldsSet.userErrors,
          });
          return false;
        }
        return true;
      } catch (error) {
        log.warn('Draft metaobject metafield save failed', {
          draftId: savedDraftOrder.id,
          key,
          cause: error instanceof Error ? error.message : String(error),
        });
        return false;
      }
    };

    const referenceResults = await Promise.all([
      saveReferenceMetafield(PROGRAM_CODE_METAFIELD_KEYS.first, parsed.data.programCode),
      saveReferenceMetafield(PROGRAM_CODE_METAFIELD_KEYS.second, parsed.data.programCode2),
      saveReferenceMetafield(
        DRAFT_ORDER_OPTION_METAFIELD_KEYS.classification,
        parsed.data.orderClass,
      ),
      saveReferenceMetafield(
        DRAFT_ORDER_OPTION_METAFIELD_KEYS.interface,
        parsed.data.interfaceMode,
      ),
    ]);
    const referencesSaved = referenceResults.every(Boolean);

    // Step 5 locks are written after the draft exists, like the references
    // above, so a lock definition mismatch can never reject the draft itself.
    // Booleans always write (unlocking must clear); who/when only exist while locked.
    const lockMetafield = (key: string, type: string, value: string) => ({
      ownerId: savedDraftOrder.id,
      namespace: 'custom',
      key,
      type,
      value,
    });
    const lockedBy = parsed.data.lockedBy?.trim() ?? '';
    const lockedDate = parsed.data.lockedDate?.trim() ?? '';
    const artApprover = parsed.data.artApprover?.trim() ?? '';
    const proofReader = parsed.data.proofReader?.trim() ?? '';
    const artApproverMessage = parsed.data.artApproverMessage?.trim() ?? '';
    const holdReason = parsed.data.holdReason?.trim() ?? '';
    const holdUntil = parsed.data.holdUntil?.trim() ?? '';
    const holdStatus = parsed.data.holdStatus ?? '';
    const holdNote = parsed.data.holdNote?.trim() ?? '';
    const heldBy = parsed.data.heldBy?.trim() ?? '';
    const lockWrites = [
      lockMetafield(
        DRAFT_ORDER_METAFIELD_KEYS.finalArtLocked,
        'boolean',
        parsed.data.finalArtLocked ? 'true' : 'false',
      ),
      lockMetafield(
        DRAFT_ORDER_METAFIELD_KEYS.quantitiesLocked,
        'boolean',
        parsed.data.quantitiesLocked ? 'true' : 'false',
      ),
      ...(lockedBy
        ? [lockMetafield(DRAFT_ORDER_METAFIELD_KEYS.lockedBy, 'single_line_text_field', lockedBy)]
        : []),
      ...(lockedDate
        ? [lockMetafield(DRAFT_ORDER_METAFIELD_KEYS.lockedDate, 'date', lockedDate)]
        : []),
      ...(artApprover
        ? [
            lockMetafield(
              DRAFT_ORDER_METAFIELD_KEYS.artApprover,
              'single_line_text_field',
              artApprover,
            ),
          ]
        : []),
      ...(proofReader
        ? [
            lockMetafield(
              DRAFT_ORDER_METAFIELD_KEYS.proofReader,
              'single_line_text_field',
              proofReader,
            ),
          ]
        : []),
      ...(artApproverMessage
        ? [
            lockMetafield(
              DRAFT_ORDER_METAFIELD_KEYS.artApproverMessage,
              'multi_line_text_field',
              artApproverMessage,
            ),
          ]
        : []),
    ];
    const lockClears = [
      ...(lockedBy ? [] : [DRAFT_ORDER_METAFIELD_KEYS.lockedBy]),
      ...(lockedDate ? [] : [DRAFT_ORDER_METAFIELD_KEYS.lockedDate]),
      ...(artApprover ? [] : [DRAFT_ORDER_METAFIELD_KEYS.artApprover]),
      ...(proofReader ? [] : [DRAFT_ORDER_METAFIELD_KEYS.proofReader]),
      ...(artApproverMessage ? [] : [DRAFT_ORDER_METAFIELD_KEYS.artApproverMessage]),
    ].map((key) => ({ownerId: savedDraftOrder.id, namespace: 'custom', key}));
    try {
      const setPayload = await adminQuery({
        env: context.env,
        query: SET_DRAFT_METAFIELD_MUTATION,
        variables: {metafields: lockWrites},
      });
      const setResult = setDraftMetafieldResponseSchema.parse(setPayload);
      if (setResult.metafieldsSet.userErrors.length > 0) {
        log.warn('Draft lock metafield save failed', {
          draftId: savedDraftOrder.id,
          userErrors: setResult.metafieldsSet.userErrors,
        });
      }
      if (lockClears.length > 0) {
        await adminQuery({
          env: context.env,
          query: DELETE_DRAFT_METAFIELDS_MUTATION,
          variables: {metafields: lockClears},
        });
      }
    } catch (error) {
      log.warn('Draft lock metafield save failed', {
        draftId: savedDraftOrder.id,
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    const holdWrites = [
      ...(holdReason
        ? [
            lockMetafield(
              DRAFT_ORDER_METAFIELD_KEYS.holdReason,
              'single_line_text_field',
              holdReasonLabel(holdReason),
            ),
          ]
        : []),
      ...(holdUntil
        ? [lockMetafield(DRAFT_ORDER_METAFIELD_KEYS.holdUntil, 'date', holdUntil)]
        : []),
      ...(holdStatus
        ? [
            lockMetafield(
              DRAFT_ORDER_METAFIELD_KEYS.holdStatus,
              'single_line_text_field',
              holdStatus,
            ),
          ]
        : []),
      ...(holdNote
        ? [
            lockMetafield(
              DRAFT_ORDER_METAFIELD_KEYS.holdNote,
              'multi_line_text_field',
              holdNote,
            ),
          ]
        : []),
      ...(heldBy
        ? [
            lockMetafield(
              DRAFT_ORDER_METAFIELD_KEYS.heldBy,
              'single_line_text_field',
              heldBy,
            ),
          ]
        : []),
    ];
    const holdClears = [
      ...(holdReason ? [] : [DRAFT_ORDER_METAFIELD_KEYS.holdReason]),
      ...(holdUntil ? [] : [DRAFT_ORDER_METAFIELD_KEYS.holdUntil]),
      ...(holdStatus ? [] : [DRAFT_ORDER_METAFIELD_KEYS.holdStatus]),
      ...(holdNote ? [] : [DRAFT_ORDER_METAFIELD_KEYS.holdNote]),
      ...(heldBy ? [] : [DRAFT_ORDER_METAFIELD_KEYS.heldBy]),
    ].flatMap((key) =>
      [APP_NAMESPACE, 'custom'].map((namespace) => ({
        ownerId: savedDraftOrder.id,
        namespace,
        key,
      })),
    );

    try {
      for (const metafield of holdWrites) {
        const writeMetafield = async (input: typeof metafield) => {
          const payload = await adminQuery({
            env: context.env,
            query: SET_DRAFT_METAFIELD_MUTATION,
            variables: {metafields: [input]},
          });
          return setDraftMetafieldResponseSchema.parse(payload);
        };
        let attemptedMetafield = metafield;
        let holdResult = await writeMetafield(attemptedMetafield);
        if (
          metafield.key === DRAFT_ORDER_METAFIELD_KEYS.holdNote &&
          holdResult.metafieldsSet.userErrors.length > 0
        ) {
          attemptedMetafield = {
            ...metafield,
            type: 'single_line_text_field',
            value: metafield.value.replace(/\s*[\r\n\u2028\u2029]+\s*/g, ' ').trim(),
          };
          holdResult = await writeMetafield(attemptedMetafield);
        }
        if (holdResult.metafieldsSet.userErrors.length > 0) {
          log.warn('Draft hold metafield save failed', {
            draftId: savedDraftOrder.id,
            key: attemptedMetafield.key,
            namespace: attemptedMetafield.namespace,
            type: attemptedMetafield.type,
            userErrors: holdResult.metafieldsSet.userErrors,
          });
        } else if (
          !holdResult.metafieldsSet.metafields.some(
            (saved) =>
              saved.namespace === attemptedMetafield.namespace &&
              saved.key === attemptedMetafield.key,
          )
        ) {
          log.warn('Draft hold metafield write returned no saved field', {
            draftId: savedDraftOrder.id,
            key: attemptedMetafield.key,
            namespace: attemptedMetafield.namespace,
            type: attemptedMetafield.type,
          });
        }
      }
      if (holdClears.length > 0) {
        await adminQuery({
          env: context.env,
          query: DELETE_DRAFT_METAFIELDS_MUTATION,
          variables: {metafields: holdClears},
        });
      }
    } catch (error) {
      log.warn('Draft hold metafield save failed', {
        draftId: savedDraftOrder.id,
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    const brands = parsed.data.brands
      .map((value) => value.trim())
      .filter(Boolean);

    return data<SaveDraftResult>({
      ok: true,
      draft: {
        orderId: mutationResult.draftOrder.id,
        displayId: mutationResult.draftOrder.name ?? undefined,
        customer: mutationResult.draftOrder.customer?.displayName?.trim() || companyName,
        status: mutationResult.draftOrder.status,
        brands,
      },
      createdLocations,
      warnings: referencesSaved ? [] : ['newDraftOrder.errors.referenceSaveFailed'],
    });
  } catch (error) {
    log.error('Save draft admin mutation failed', {
      cause: error instanceof Error ? error.message : String(error),
    });

    return data<SaveDraftResult>(
      {
        ok: false,
        errors: {},
        formError: 'newDraftOrder.errors.saveFailed',
        createdLocations,
      },
      {status: 500},
    );
  }
}

export async function saveDraftOrderAction(args: SaveDraftActionArgs) {
  try {
    return await saveDraftOrderActionUnchecked(args);
  } catch (error) {
    log.error('Draft order action failed before save handling', error);
    return data<SaveDraftResult>(
      {
        ok: false,
        errors: {},
        formError: 'newDraftOrder.errors.saveFailed',
      },
      {status: 500},
    );
  }
}
