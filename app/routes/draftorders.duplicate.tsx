/**
 * Resource route: POST `draftId=<GID>` copies a saved draft as a new draft.
 * The list revalidates afterwards, so the copy appears at the top.
 */
import {data} from 'react-router';
import {duplicateDraftOrder} from '~/features/draft-orders/lib/draftorders-duplicate.server';
import {assertSameOrigin} from '~/lib/same-origin.server';
import {SEARCH_PARAMS} from '~/shared/constants/routes';
import type {Route} from './+types/draftorders.duplicate';

export async function action({request, context}: Route.ActionArgs) {
  assertSameOrigin(request);
  const draftId = String((await request.formData()).get(SEARCH_PARAMS.draftId) ?? '').trim();
  if (!draftId) return data({ok: false as const, reason: 'failed' as const}, {status: 400});

  const result = await duplicateDraftOrder(context.env, draftId);
  return data(result, {status: result.ok ? 200 : result.reason === 'notFound' ? 404 : 500});
}
