import {data} from 'react-router';
import {
  createDeliveryLocationInputSchema,
  type CreateDeliveryLocationActionResult,
} from '~/features/draft-orders/schemas/delivery-location-admin.schema';
import {createLogger} from '~/lib/logger';
import {
  createCompanyLocation,
  hasCompanyLocationWriteAccess,
  isCompanyInDraftOrderScope,
  setCompanyDefaultShipTo,
} from './draftorders-company-location.server';

const log = createLogger('routes.draftorders.new.delivery-location');

type ActionArgs = {
  request: Request;
  context: {env: Env};
};

function response(body: CreateDeliveryLocationActionResult, status = 200) {
  return data(body, {status});
}

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function createDeliveryLocationAction({request, context}: ActionArgs) {
  if (request.method !== 'POST') {
    return response({
      intent: 'createDeliveryLocation',
      ok: false,
      errorKey: 'newDraftOrder.errors.companyLocationCreateFailed',
    }, 405);
  }

  try {
    const formData = await request.formData();
    const parsedInput = createDeliveryLocationInputSchema.safeParse({
      companyId: formString(formData, 'companyId'),
      name: formString(formData, 'name'),
      address1: formString(formData, 'address1'),
      address2: formString(formData, 'address2'),
      city: formString(formData, 'city'),
      state: formString(formData, 'state'),
      zip: formString(formData, 'zip'),
      countryCode: formString(formData, 'countryCode').toUpperCase(),
    });

    if (!parsedInput.success) {
      return response({
        intent: 'createDeliveryLocation',
        ok: false,
        errorKey: parsedInput.error.issues.some((issue) => issue.message === 'newDraftOrder.errors.deliveryStateInvalid')
          ? 'newDraftOrder.errors.deliveryStateInvalid'
          : 'newDraftOrder.errors.companyLocationCreateFailed',
      }, 400);
    }

    const {companyId, ...address} = parsedInput.data;
    const setAsDefault = formString(formData, 'setAsDefault') === 'true';

    if (!(await isCompanyInDraftOrderScope(context.env, companyId))) {
      log.warn('Company location create denied: company outside draft-order scope', {companyId});
      return response({
        intent: 'createDeliveryLocation',
        ok: false,
        errorKey: 'newDraftOrder.errors.companyLocationNotAllowed',
      }, 403);
    }

    if (!(await hasCompanyLocationWriteAccess(context.env))) {
      return response({
        intent: 'createDeliveryLocation',
        ok: false,
        errorKey: 'newDraftOrder.errors.companyLocationAccessRequired',
      }, 403);
    }

    const result = await createCompanyLocation(context.env, companyId, address);
    if (!result.ok) {
      return response({intent: 'createDeliveryLocation', ok: false, errorKey: result.errorKey}, 400);
    }

    const defaultSaved = !setAsDefault ||
      await setCompanyDefaultShipTo(context.env, companyId, result.location.id);

    return response({
      intent: 'createDeliveryLocation',
      ok: true,
      location: result.location,
      ...(defaultSaved ? {} : {warningKey: 'newDraftOrder.errors.companyLocationDefaultFailed' as const}),
    });
  } catch (error) {
    log.error('Shopify company location creation request failed', error);
    return response({
      intent: 'createDeliveryLocation',
      ok: false,
      errorKey: 'newDraftOrder.errors.companyLocationCreateFailed',
    }, 500);
  }
}


