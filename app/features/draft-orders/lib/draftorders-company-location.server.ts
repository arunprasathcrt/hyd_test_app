import type {z} from 'zod';
import {
  COMPANY_LOCATION_DELETE_CONTEXT_QUERY,
  CREATE_COMPANY_LOCATION_MUTATION,
  CURRENT_APP_ACCESS_SCOPES_QUERY,
  DELETE_COMPANY_LOCATION_MUTATION,
  DRAFT_ORDER_COMPANY_SCOPE_QUERY,
} from '~/features/draft-orders/queries/delivery-location';
import {SET_DRAFT_METAFIELD_MUTATION} from '~/features/draft-orders/queries/save-draft-order';
import {
  createCompanyLocationResponseSchema,
  currentAppAccessScopesResponseSchema,
  deleteCompanyLocationContextResponseSchema,
  deleteCompanyLocationResponseSchema,
  draftOrderCompanyScopeResponseSchema,
  type CompanyLocationErrorKey,
  type CreatedCompanyLocation,
} from '~/features/draft-orders/schemas/delivery-location-admin.schema';
import {setDraftMetafieldResponseSchema} from '~/features/draft-orders/schemas/draft-orders-admin.schema';
import {
  deliveryLocationEntrySchema,
  validatedDeliveryLocationEntrySchema,
} from '~/features/draft-orders/schemas/new-draft-order.schema';
import type {
  CreatedDeliveryLocation,
  DraftOrderDelivery,
} from '~/features/draft-orders/types/new-draft-order';
import {createLogger} from '~/lib/logger';
import {adminQuery} from '~/lib/shopify/admin.server';
import {APP_NAMESPACE, COMPANY_APP_METAFIELD_KEYS} from '~/shared/constants/metafields';
import {COMPANY_PAGE_SIZE} from './draftorders-new-loader.server';

const log = createLogger('draftorders.company-location');

export type CompanyLocationAddress = z.infer<typeof deliveryLocationEntrySchema>;

type CreateCompanyLocationResult =
  | {ok: true; location: CreatedCompanyLocation}
  | {ok: false; errorKey: CompanyLocationErrorKey};

type DeleteCompanyLocationResult =
  | {ok: true; deletedLocationId: string}
  | {ok: false; errorKey: 'newDraftOrder.errors.companyLocationAccessRequired' | 'newDraftOrder.errors.companyLocationDeleteFailed' | 'newDraftOrder.errors.companyLocationDeleteNotAllowed' | 'newDraftOrder.errors.companyLocationDefaultCannotDelete'};

function mapAddress(address: {
  recipient?: string | null;
  companyName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  countryCode?: string | null;
  zoneCode?: string | null;
  zip?: string | null;
  phone?: string | null;
} | null | undefined) {
  if (!address) return null;
  return {
    recipient: address.recipient?.trim() ?? '',
    company: address.companyName?.trim() ?? '',
    address1: address.address1?.trim() ?? '',
    address2: address.address2?.trim() ?? '',
    city: address.city?.trim() ?? '',
    countryCode: address.countryCode?.trim() ?? '',
    zoneCode: address.zoneCode?.trim() ?? '',
    zip: address.zip?.trim() ?? '',
    phone: address.phone?.trim() ?? '',
  };
}

/**
 * Only companies the builder loader offers may receive a new location.
 * ❓ TO CONFIRM: rep-ownership scoping does not exist yet (guards were removed
 * with Entra), so the loader lists the store's first companies unscoped. When
 * rep scoping lands, this check must use the same rep-scoped source.
 */
export async function isCompanyInDraftOrderScope(env: Env, companyId: string): Promise<boolean> {
  const payload = await adminQuery({
    env,
    query: DRAFT_ORDER_COMPANY_SCOPE_QUERY,
    variables: {companyFirst: COMPANY_PAGE_SIZE},
  });
  return draftOrderCompanyScopeResponseSchema
    .parse(payload)
    .companies.nodes.some((company) => company.id === companyId);
}

export async function hasCompanyLocationWriteAccess(env: Env): Promise<boolean> {
  const payload = await adminQuery({env, query: CURRENT_APP_ACCESS_SCOPES_QUERY});
  const handles = currentAppAccessScopesResponseSchema
    .parse(payload)
    .currentAppInstallation?.accessScopes.map((scope) => scope.handle) ?? [];
  return handles.includes('write_companies') || handles.includes('write_customers');
}

/** Callers must run `isCompanyInDraftOrderScope` and `hasCompanyLocationWriteAccess` first. */
export async function createCompanyLocation(
  env: Env,
  companyId: string,
  address: CompanyLocationAddress,
): Promise<CreateCompanyLocationResult> {
  const payload = await adminQuery({
    env,
    query: CREATE_COMPANY_LOCATION_MUTATION,
    variables: {
      companyId,
      input: {
        name: address.name,
        shippingAddress: {
          address1: address.address1,
          address2: address.address2 || null,
          city: address.city,
          zoneCode: address.state.toUpperCase(),
          zip: address.zip,
          countryCode: address.countryCode,
        },
        billingSameAsShipping: true,
      },
    },
  });
  const result = createCompanyLocationResponseSchema.parse(payload).companyLocationCreate;

  if (result.userErrors.length || !result.companyLocation) {
    log.warn('Shopify company location creation failed', {companyId, userErrors: result.userErrors});
    const fields = result.userErrors.flatMap((userError) => userError.field ?? []).map((field) => field.toLowerCase());
    return {
      ok: false,
      errorKey: fields.some((field) => field.includes('zonecode'))
        ? 'newDraftOrder.errors.deliveryStateInvalid'
        : fields.some((field) => field.includes('zip'))
          ? 'newDraftOrder.errors.deliveryPostalCodeInvalid'
          : 'newDraftOrder.errors.companyLocationCreateFailed',
    };
  }

  const location = result.companyLocation;
  return {
    ok: true,
    location: {
      id: location.id,
      name: location.name?.trim() || address.name,
      code: location.externalId?.trim() ?? '',
      licensed: false,
      shipping: mapAddress(location.shippingAddress),
      billing: mapAddress(location.billingAddress),
    },
  };
}

export async function deleteCompanyLocation(
  env: Env,
  companyId: string,
  locationId: string,
): Promise<DeleteCompanyLocationResult> {
  if (!(await isCompanyInDraftOrderScope(env, companyId))) {
    return {ok: false, errorKey: 'newDraftOrder.errors.companyLocationDeleteNotAllowed'};
  }
  if (!(await hasCompanyLocationWriteAccess(env))) {
    return {ok: false, errorKey: 'newDraftOrder.errors.companyLocationAccessRequired'};
  }

  const contextPayload = await adminQuery({
    env,
    query: COMPANY_LOCATION_DELETE_CONTEXT_QUERY,
    variables: {companyId, locationFirst: 250},
  });
  const company = deleteCompanyLocationContextResponseSchema.parse(contextPayload).company;
  if (!company || company.id !== companyId || !company.locations.nodes.some((location) => location.id === locationId)) {
    return {ok: false, errorKey: 'newDraftOrder.errors.companyLocationDeleteNotAllowed'};
  }
  const primaryLocationId = company.defaultShipTo?.value?.trim() || company.locations.nodes[0]?.id;
  if (primaryLocationId === locationId) {
    return {ok: false, errorKey: 'newDraftOrder.errors.companyLocationDefaultCannotDelete'};
  }

  const deletePayload = await adminQuery({
    env,
    query: DELETE_COMPANY_LOCATION_MUTATION,
    variables: {companyLocationId: locationId},
  });
  const result = deleteCompanyLocationResponseSchema.parse(deletePayload).companyLocationDelete;
  if (result.userErrors.length || result.deletedCompanyLocationId !== locationId) {
    log.warn('Shopify company location deletion failed', {companyId, locationId, userErrors: result.userErrors});
    return {ok: false, errorKey: 'newDraftOrder.errors.companyLocationDeleteFailed'};
  }

  return {ok: true, deletedLocationId: locationId};
}

/** Persists the company's default ship-to; the new-draft loader lists it first. */
export async function setCompanyDefaultShipTo(env: Env, companyId: string, locationId: string): Promise<boolean> {
  try {
    const payload = await adminQuery({
      env,
      query: SET_DRAFT_METAFIELD_MUTATION,
      variables: {
        metafields: [{
          ownerId: companyId,
          namespace: APP_NAMESPACE,
          key: COMPANY_APP_METAFIELD_KEYS.defaultShipToLocationId,
          type: 'single_line_text_field',
          value: locationId,
        }],
      },
    });
    const {userErrors} = setDraftMetafieldResponseSchema.parse(payload).metafieldsSet;
    if (userErrors.length) {
      log.warn('Company default ship-to save failed', {companyId, userErrors});
      return false;
    }
    return true;
  } catch (error) {
    log.warn('Company default ship-to save failed', {
      companyId,
      cause: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Turns delivery-drawer addresses (no `locationId`, a `customAddress`) into
 * Company Locations at draft-save time, so abandoned drafts never touch the
 * customer account. Locations are pushed into `createdLocations` as they are
 * made, so a caller can return them even after a later failure or throw and
 * the client adopts them instead of creating duplicates on retry.
 */
export async function createPendingDeliveryLocations(
  env: Env,
  companyId: string,
  deliveries: DraftOrderDelivery[],
  createdLocations: CreatedDeliveryLocation[],
): Promise<{deliveries: DraftOrderDelivery[]; errorKey?: string}> {
  const pending = deliveries.flatMap((delivery, index) =>
    !delivery.locationId.trim() && delivery.customAddress ? [index] : [],
  );
  if (!pending.length) return {deliveries};

  if (!(await isCompanyInDraftOrderScope(env, companyId))) {
    log.warn('Delivery location create denied: company outside draft-order scope', {companyId});
    return {deliveries, errorKey: 'newDraftOrder.errors.companyLocationNotAllowed'};
  }
  if (!(await hasCompanyLocationWriteAccess(env))) {
    return {deliveries, errorKey: 'newDraftOrder.errors.companyLocationAccessRequired'};
  }

  const next = [...deliveries];
  for (const index of pending) {
    const delivery = next[index];
    // Drafts saved before country capture carry no country; the drawer defaulted those to US.
    const address = validatedDeliveryLocationEntrySchema.safeParse({
      ...delivery.customAddress,
      countryCode: delivery.customAddress?.countryCode ?? 'US',
    });
    if (!address.success) {
      return {deliveries: next, errorKey: address.error.issues[0]?.message};
    }

    const result = await createCompanyLocation(env, companyId, address.data);
    if (!result.ok) return {deliveries: next, errorKey: result.errorKey};

    createdLocations.push({deliveryIndex: index, location: result.location});
    const {customAddress: _saved, ...rest} = delivery;
    next[index] = {...rest, locationId: result.location.id};
  }

  return {deliveries: next};
}
