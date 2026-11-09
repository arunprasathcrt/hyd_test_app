/**
 * Resource route: the draft lines for products picked in the garment drawer.
 * Called with `?productId=…` (repeated), it returns the same lines the
 * builder gets when you come back from the Products page.
 */
import {getSelectedDraftProducts} from '~/lib/product/draft-products.server';
import {SEARCH_PARAMS} from '~/shared/constants/routes';
import type {Route} from './+types/draftorders.new.products';

export async function loader({request, context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  try {
    const selectedProducts = await getSelectedDraftProducts(
      new URL(request.url).searchParams.getAll(SEARCH_PARAMS.productId),
      context,
    );
    return Response.json({selectedProducts});
  } catch {
    return Response.json({selectedProducts: []}, {status: 422});
  }
}
