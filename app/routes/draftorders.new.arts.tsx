/**
 * Resource route: the art picked in Quick pick. Called with `?productId=…` (repeated),
 * it returns one entry per mark for the line the rep is adding them to.
 */
import {getSelectedDraftArts} from '~/lib/product/draft-arts.server';
import {SEARCH_PARAMS} from '~/shared/constants/routes';
import type {Route} from './+types/draftorders.new.arts';

export async function loader({request, context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  try {
    const selectedArts = await getSelectedDraftArts(
      new URL(request.url).searchParams.getAll(SEARCH_PARAMS.productId),
      context,
    );
    return Response.json({selectedArts});
  } catch {
    return Response.json({selectedArts: []}, {status: 422});
  }
}
