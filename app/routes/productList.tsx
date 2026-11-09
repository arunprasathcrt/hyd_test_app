import { useLoaderData, useNavigation } from 'react-router';
import type { Route } from './+types/productList';
import { ProductListing } from '~/features/products/components/ProductListing';
import { loadProducts } from '~/lib/product/product.server';
import { loadPresentationCollectionName } from '~/features/presentations/lib/presentation-collection-name.server';
import { addProductsToPresentationCollection } from '~/features/presentations/lib/add-products-to-collection.server';
import { addProductsToPresentationSchema } from '~/features/presentations/schemas/collection.schema';
import { loadPresentationCustomers } from '~/features/presentations/lib/presentation-customers.server';
import { CURRENT_CUSTOMER_ID_QUERY } from '~/graphql/customer-account/CurrentCustomerIdQuery';
import {
  savedCollectionActionSchema,
} from '~/features/products/schemas/saved-collection.schema';
import {
  loadSavedCollections,
  saveProductToCollection,
} from '~/features/products/lib/saved-collections.server';
import { assertSameOrigin } from '~/lib/same-origin.server';
import { FLAG_ON, SEARCH_PARAMS } from '~/shared/constants/routes';
import { VIEWS } from '~/features/products/lib/catalog';

export async function loader({ request, context }: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  const searchParams = new URL(request.url).searchParams;

  // The picker drawer only browses the catalog; saved collections and presentation
  // lookups are Admin API calls it never uses.
  if (searchParams.get(SEARCH_PARAMS.picker) === FLAG_ON) {
    // Only the collection for the drawer's own view is read, not all four.
    const view = VIEWS.find((role) => role === searchParams.get(SEARCH_PARAMS.view));
    const data = await loadProducts(request, context, view ? [view] : VIEWS);
    return {
      ...data,
      savedCollections: [],
      presentationCustomers: [],
      presentationCollectionName: null,
      presentation: null,
    };
  }

  const data = await loadProducts(request, context);
  const [{data: customerData}, presentationCustomers] = await Promise.all([
    context.customerAccount.query(CURRENT_CUSTOMER_ID_QUERY),
    loadPresentationCustomers(context.env),
  ]);
  const customerId = customerData?.customer?.id ?? '';
  const savedCollections = customerId
    ? await loadSavedCollections(context.env, customerId)
    : [];
  const id = searchParams.get('id');
  const presentationCollectionName = id
    ? await loadPresentationCollectionName(context.env, id)
    : null;
  const presentation =
    id && presentationCollectionName !== null
      ? {
        id,
        name: presentationCollectionName,
      }
      : null;
  return {
    ...data,
    savedCollections,
    presentationCustomers,
    presentationCollectionName,
    presentation,
  };
}

/**
 * Adds products to a Shopify presentation collection. Only the Shopify add path
 * submits here; the draft and addition paths write to local storage.
 */
export async function action({ request, context }: Route.ActionArgs) {
  await context.customerAccount.handleAuthStatus();
  assertSameOrigin(request);
  const formData = await request.formData();
  const operation = formData.get('operation');

  if (operation === 'add' || operation === 'create') {
    const parsedSavedCollection = savedCollectionActionSchema.safeParse(
      operation === 'add'
        ? {
            operation,
            collectionId: formData.get('collectionId'),
            productIds: formData.getAll('productIds'),
          }
        : {
            operation,
            name: formData.get('name'),
            customerId: formData.get('customerId') ?? '',
            productIds: formData.getAll('productIds'),
          },
    );
    if (!parsedSavedCollection.success) return {ok: false as const};

    const {data: customerData, errors} = await context.customerAccount.query(
      CURRENT_CUSTOMER_ID_QUERY,
    );
    const ownerId = customerData?.customer?.id;
    if (errors?.length || !ownerId) return {ok: false as const};

    return saveProductToCollection(
      context.env,
      ownerId,
      parsedSavedCollection.data,
    );
  }

  const parsed = addProductsToPresentationSchema.safeParse({
    collectionId: formData.get('collectionId'),
    productIds: formData.getAll('productIds'),
  });

  if (!parsed.success) {
    return { ok: false as const };
  }

  return addProductsToPresentationCollection(context.env, parsed.data);
}

export default function CatalogPage() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const pending = navigation.state !== 'idle';

  return (
    <ProductListing
      model={data}
      presentation={data.presentation}
      savedCollections={data.savedCollections}
      presentationCustomers={data.presentationCustomers}
      pending={pending}
    />
  );
}
