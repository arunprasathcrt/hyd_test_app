import {Await, Link} from 'react-router';
import {Suspense, useId} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import type {CustomerDetailsQuery} from 'customer-accountapi.generated';
import {Aside} from '~/components/Aside';
import {Footer} from '~/components/Footer';
import {Header} from '~/components/Header';
import {NewCtaDialog} from '~/components/NewCtaDialog';
import {LeftNavigation} from '~/components/LeftNavigation';
import {CartMain} from '~/components/CartMain';
import {
  SEARCH_ENDPOINT,
  SearchFormPredictive,
} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import { Button } from '~/shared/components/ui/Button';

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>;
  customer: Promise<CustomerDetailsQuery['customer'] | null>;
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
  children?: React.ReactNode;
}

export function PageLayout({
  cart,
  customer,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />
      <SearchAside />
      <NewCtaDialog />
      <Suspense
        fallback={
          <PageFrame
            cart={cart}
            customer={customer}
            footer={footer}
            header={header}
            isLoggedIn={isLoggedIn}
            publicStoreDomain={publicStoreDomain}
          >
            {children}
          </PageFrame>
        }
      >
        <Await resolve={isLoggedIn}>
          {(loggedIn) => (
            <PageFrame
              cart={cart}
              customer={customer}
              footer={footer}
              header={header}
              isLoggedIn={isLoggedIn}
              publicStoreDomain={publicStoreDomain}
              showNavigation={loggedIn}
            >
              {children}
            </PageFrame>
          )}
        </Await>
      </Suspense>
    </Aside.Provider>
  );
}

interface PageFrameProps extends PageLayoutProps {
  showNavigation?: boolean;
}

function PageFrame({
  cart,
  customer,
  children,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
  showNavigation = false,
}: PageFrameProps) {
  const content = (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      {header && (
        <Header
          header={header}
          cart={cart}
          isLoggedIn={isLoggedIn}
          publicStoreDomain={publicStoreDomain}
        />
      )}

      {/* `relative` keeps absolutely positioned descendants (e.g. `sr-only` captions)
          inside this scroller; without it they anchor to the viewport and make the
          document itself scroll, leaving white space under the shell. */}
      <main className="relative min-h-0 flex-1 overflow-y-auto">
        {children}
      </main>

      <Footer
        footer={footer}
        header={header}
        publicStoreDomain={publicStoreDomain}
      />
    </div>
  );

  if (!showNavigation) {
    return (
      <div className="min-h-dvh">
        {content}
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#F5F5F5]">
      {/* Left navigation stays fixed in the viewport */}
      <LeftNavigation customer={customer} />

      {/* Only right side scrolls */}
      {content}
    </div>
  );
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  const queriesDatalistId = useId();
  return (
    <Aside type="search" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
              />
              &nbsp;
              <Button type="button" onClick={goToSearch}>
                Search
              </Button>
            </>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items;

            if (state === 'loading' && term.current) {
              return <div>Loading...</div>;
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />;
            }

            return (
              <>
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />
                {term.current && total ? (
                  <Link
                    onClick={closeSearch}
                    to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                  >
                    <p>
                      View all results for <q>{term.current}</q>
                      &nbsp; →
                    </p>
                  </Link>
                ) : null}
              </>
            );
          }}
        </SearchResultsPredictive>
      </div>
    </Aside>
  );
}
