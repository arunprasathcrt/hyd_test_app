/**
 * Resource route: live per-size inventory for the Products quick view.
 * Called with `?id=gid://shopify/Product/…&color=…`.
 */
import {loadProductAtp} from '~/features/products/lib/atp.server';
import {productAtpParamsSchema} from '~/features/products/schemas/atp.schema';
import type {Route} from './+types/productAtp';

export async function loader({request, context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  const params = productAtpParamsSchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!params.success) {
    return Response.json({rows: [], purchaseOrders: []}, {status: 422});
  }
  return Response.json(
    await loadProductAtp(
      context.env,
      context.storefront,
      params.data.id,
      params.data.color,
    ),
  );
}
