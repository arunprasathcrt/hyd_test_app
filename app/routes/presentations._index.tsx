import { useLoaderData } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Route } from './+types/presentations._index';
import PresentationsPage from '~/features/presentations/PresentationsPage';
import { createPresentationCollection } from '~/features/presentations/lib/create-presentation-collection.server';
import { loadPresentationCustomers } from '~/features/presentations/lib/presentation-customers.server';
import { mapShopifyCollectionToPresentation } from '~/features/presentations/lib/presentation-list.mapper';
import { PRESENTATION_COLLECTIONS_QUERY } from '~/features/presentations/queries/collections';
import {
  adminPresentationCollectionsResponseSchema,
  createPresentationCollectionSchema,
  addProductsToPresentationSchema,
} from '~/features/presentations/schemas/collection.schema';
import type { Presentation } from '~/features/presentations/types/presentations';
import { CURRENT_CUSTOMER_ID_QUERY } from '~/graphql/customer-account/CurrentCustomerIdQuery';
import { adminQuery } from '~/lib/shopify/admin.server';
import { createLogger } from '~/lib/logger';
import { assertSameOrigin } from '~/lib/same-origin.server';
import { addProductsToPresentationCollection } from '~/features/presentations/lib/add-products-to-collection.server';

const log = createLogger('routes.presentations.index');

export const handle = {
  i18n: ['presentations', 'common', 'errors'],
};

export async function loader({ context }: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  let shopifyPresentations: Presentation[] = [];
  const customers = await loadPresentationCustomers(context.env);
  const allCollections = [];
  let after: string | null = null;
  let hasNextPage = true;
  try {
    while (hasNextPage) {
      const payload = await adminQuery({
        env: context.env,
        query: PRESENTATION_COLLECTIONS_QUERY,
        variables: {
          first: 50,
          after,
        },
      });

      const { collections } =
        adminPresentationCollectionsResponseSchema.parse(payload);

      allCollections.push(...collections.edges);

      hasNextPage =
        collections.pageInfo.hasNextPage;

      after =
        collections.pageInfo.endCursor;
    }
    const presentationCollections = allCollections.filter(
      ({ node }) => node.tags?.value === 'Presentation',
    );

    shopifyPresentations = presentationCollections.map(
      ({ node }) =>
        mapShopifyCollectionToPresentation(
          node,
          customers,
        ),
    );
  } catch (error) {
    log.error('Presentation collections lookup failed', {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
  return {
    presentations: shopifyPresentations,
    customers,
  };
}

/**
 * Creates the Shopify Collection for a new presentation. The client creates the
 * local draft and navigates on its own, so this only reports the outcome.
 */
export async function action({ request, context }: Route.ActionArgs) {
  await context.customerAccount.handleAuthStatus();
  assertSameOrigin(request);
  const formData = await request.formData();
  const parsed = createPresentationCollectionSchema.safeParse({
    name: formData.get('name'),
    customer: formData.get('customer'),
    neededBy: formData.get('neededBy'),
  });

  if (!parsed.success) {
    log.error('Presentation collection input rejected', {
      issues: parsed.error.issues.map((issue) => issue.path.join('.')),
    });

    return { ok: false as const };
  }

  const { data, errors } = await context.customerAccount.query(
    CURRENT_CUSTOMER_ID_QUERY,
  );
  const createdBy = data?.customer?.id;

  if (errors?.length || !createdBy) {
    log.error('Presentation creator could not be resolved', {
      errors: errors?.map((error) => error.message),
    });

    return { ok: false as const };
  }
  const productIds = formData.getAll('productIds').map(String);

  const created = await createPresentationCollection(
    context.env,
    parsed.data,
    createdBy,
    productIds,
  );
  if (!created.ok) return created;

  if (!productIds.length) return created;

  const parsedProducts = addProductsToPresentationSchema.safeParse({
    collectionId: created.collectionId,
    productIds,
  });
  if (!parsedProducts.success) {
    log.error('Presentation product selection rejected', {
      collectionId: created.collectionId,
    });
    return created;
  }

  const added = await addProductsToPresentationCollection(
    context.env,
    parsedProducts.data,
  );
  if (!added.ok) {
    log.error('Product was not added to the new presentation', {
      collectionId: created.collectionId,
    });
  }

  return created;
}

export default function PresentationsIndexRoute() {
  const { presentations, customers } = useLoaderData<typeof loader>();
  return (
    <PresentationsPage presentations={presentations} customers={customers} />
  );
}

export function ErrorBoundary() {
  const { t } = useTranslation('errors');
  return (
    <main className="p-8 text-utds-ink">
      <h1 className="text-xl font-semibold">{t('boundary.title')}</h1>
      <p className="mt-2 text-sm text-utds-secondary">
        {t('boundary.unknown')}
      </p>
    </main>
  );
}
