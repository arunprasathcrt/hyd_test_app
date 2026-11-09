import {data} from 'react-router';
import {
  deleteDeliveryLocationInputSchema,
  type DeleteDeliveryLocationActionResult,
} from '~/features/draft-orders/schemas/delivery-location-admin.schema';
import {createLogger} from '~/lib/logger';
import {deleteCompanyLocation} from './draftorders-company-location.server';

const log = createLogger('routes.draftorders.new.delete-delivery-location');

type ActionArgs = {
  request: Request;
  context: {env: Env};
};

function response(body: DeleteDeliveryLocationActionResult, status = 200) {
  return data(body, {status});
}

function formString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function deleteDeliveryLocationAction({request, context}: ActionArgs) {
  if (request.method !== 'POST') {
    return response({
      intent: 'deleteDeliveryLocation',
      ok: false,
      errorKey: 'newDraftOrder.errors.companyLocationDeleteFailed',
    }, 405);
  }

  try {
    const formData = await request.formData();
    const parsedInput = deleteDeliveryLocationInputSchema.safeParse({
      companyId: formString(formData, 'companyId'),
      locationId: formString(formData, 'locationId'),
    });
    if (!parsedInput.success) {
      return response({
        intent: 'deleteDeliveryLocation',
        ok: false,
        errorKey: 'newDraftOrder.errors.companyLocationDeleteNotAllowed',
      }, 400);
    }

    const result = await deleteCompanyLocation(context.env, parsedInput.data.companyId, parsedInput.data.locationId);
    if (!result.ok) {
      const status = result.errorKey === 'newDraftOrder.errors.companyLocationAccessRequired'
        ? 403
        : result.errorKey === 'newDraftOrder.errors.companyLocationDefaultCannotDelete'
          ? 409
          : result.errorKey === 'newDraftOrder.errors.companyLocationDeleteNotAllowed'
            ? 403
            : 400;
      return response({intent: 'deleteDeliveryLocation', ok: false, errorKey: result.errorKey}, status);
    }

    return response({intent: 'deleteDeliveryLocation', ok: true, deletedLocationId: result.deletedLocationId});
  } catch (error) {
    log.error('Shopify company location deletion request failed', error);
    return response({
      intent: 'deleteDeliveryLocation',
      ok: false,
      errorKey: 'newDraftOrder.errors.companyLocationDeleteFailed',
    }, 500);
  }
}
