/**
 * Resource route: the Print Preview model for one saved draft.
 * Called with `?id=<draft order GID>`.
 */
import {loadDraftOrderPreview} from '~/features/draft-orders/lib/draftorders-preview.server';
import {createLogger} from '~/lib/logger';
import {SEARCH_PARAMS} from '~/shared/constants/routes';
import type {Route} from './+types/draftorders.preview';

const log = createLogger('routes.draftorders.preview');

export async function loader({request, context}: Route.LoaderArgs) {
  const id = new URL(request.url).searchParams.get(SEARCH_PARAMS.draftId)?.trim();
  if (!id) return Response.json({preview: null}, {status: 400});

  try {
    const preview = await loadDraftOrderPreview(context.env, id);
    return Response.json({preview}, {status: preview ? 200 : 404});
  } catch (error) {
    log.error('Draft preview failed', {
      cause: error instanceof Error ? error.message : String(error),
    });
    return Response.json({preview: null}, {status: 500});
  }
}
