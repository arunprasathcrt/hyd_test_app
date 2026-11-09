import {useEffect, useRef, useState} from 'react';
import {useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {FileText, Image, Plus} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {AddProductDrawer} from './AddProductDrawer';
import {cn} from '~/shared/utils/cn';
import {
  getDraftCards,
  getDraftTotals,
  getProductQuantity,
} from '../../lib/draft-products';
import type {WorkflowStage} from '../../types/new-draft-order';
import {BlankGarmentCard} from './BlankGarmentCard';
import {useNewDraftOrderProductsStore} from '../../store/new-draft-order-products.store';
import {GarmentPickerDrawer} from './GarmentPickerDrawer';
import {
  ProductBundleCard,
  getProductChips,
  segmentButtonClass,
  segmentTrackClass,
} from './ProductBundleCard';

interface Props {
  onPickProducts: () => void;
  workflow: WorkflowStage[];
  /** The order's first decoration method (code). */
  method: string;
  /** The header's in-hands date (ISO day). */
  headerInHands: string;
  soonestInHands: string;
  shipToName: string;
  /** Set when an issue is clicked: open that product and focus its sizes. */
  focusRequest: {productId: string; nonce: number} | null;
}

const DOT_TONE = {
  neutral: 'bg-[#8E8E93]',
  warn: 'bg-[#B26A00]',
  bad: 'bg-[#A02020]',
} as const;

/**
 * Prototype `#do112P-products` (`.do112c`): the step bar (Bundles · Quick
 * entry, the counts, Start with art / Add product), the bundle rail beside the
 * cards when the column is wide or chips above them when it is narrow, and the
 * stacked cards, one open at a time (`ProductBundleCard`).
 *
 * ❓ TO CONFIRM — Quick entry, the order's road sign ("as fast as its weakest
 * link") and the weak-link notice need lead-time data that `DraftProduct`
 * doesn't carry. Quick entry renders disabled; the rest is left out.
 */
export function ProductsStep({
  onPickProducts,
  workflow,
  method,
  headerInHands,
  soonestInHands,
  shipToName,
  focusRequest,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const {
    products,
    openProductId,
    setOpenProductId,
    addOpen,
    setAddOpen,
    garmentDrawer,
    setGarmentDrawer,
    addGarments,
    addArts,
    duplicateInColor,
    updateProduct,
    removeProduct,
  } = useNewDraftOrderProductsStore();
  const emptyRef = useRef<HTMLDivElement>(null);
  const [itemQuery, setItemQuery] = useState('');
  // Step 1's brands: the catalog drawer only offers products from these.
  const orderBrands = useWatch<{brands: string[]}, 'brands'>({name: 'brands'});
  const cards = getDraftCards(products);
  const targetCard = cards.find((card) => card.id === garmentDrawer?.cardId);
  const targetProduct = products.find(
    (product) => product.id === garmentDrawer?.productId,
  );
  // Same fallback the cards use, so the drawer names the line the card shows.
  const targetLineNumber = targetProduct
    ? (targetProduct.lineNumber ?? products.indexOf(targetProduct) + 1)
    : products.length + 1;
  // Quick pick's header names the garment: "Gameday HW Motion Polo UM7410".
  const targetGarment = targetProduct
    ? [targetProduct.name.replace(/[®™]/g, ''), targetProduct.variants[0]?.sku]
        .filter(Boolean)
        .join(' ')
    : undefined;
  useEffect(() => {
    if (!focusRequest) return;
    if (focusRequest.productId === 'empty') {
      emptyRef.current?.scrollIntoView({block: 'center', behavior: 'smooth'});
      emptyRef.current?.focus({preventScroll: true});
      return;
    }
    setOpenProductId(focusRequest.productId);

  }, [focusRequest, setOpenProductId]);

  const money = (value: number) => t('newDraftOrder.overview.money', {value});
  const text = (key: string, options?: Record<string, unknown>) =>
    t(`newDraftOrder.products.${key}`, options);
  const totals = getDraftTotals(products, 0);

  return (
    <div className="@container flex min-w-0 flex-col gap-3.5 [&_button:not(:disabled):not([data-disabled])]:cursor-pointer [&_a[href]]:cursor-pointer">
      {/* `.do112c-bar` */}
      <div className="flex min-w-0 flex-wrap items-center gap-x-3.5 gap-y-2.5">
        <div
          role="group"
          aria-label={text('tabsLabel')}
          className={segmentTrackClass}
        >
          <Button
            type="button"
            variant="ghost"
            size="default"
            shape="square"
            aria-pressed="true"
            className={cn(segmentButtonClass(true), 'border-0 py-0')}
          >
            {text('tabBundles')}
            <span className="text-xs font-medium text-[#5C5C61] tabular-nums">
              {cards.length}
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="default"
            shape="square"
            disabled
            aria-pressed="false"
            className={cn(segmentButtonClass(false), 'border-0 py-0')}
          >
            {text('tabQuickEntry')}
          </Button>
        </div>
        <span className="min-w-0 text-[13.5px] font-medium break-words text-[#111113] tabular-nums">
          {text('summary', {
            cards: text('cardCount', {count: cards.length}),
            garments: text('garmentCount', {count: products.length}),
            units: t('newDraftOrder.overview.units', {count: totals.units}),
            total: money(totals.subtotal),
          })}
        </span>
        {/* `.u116a-adds` */}
        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 max-[599.98px]:w-full">
          <Button
            type="button"
            variant="outline"
            size="control"
            shape="md"
            disabled
            className="data-disabled:opacity-100"
          >
            <Image size={16} aria-hidden="true" />
            {text('ai')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="control"
            shape="md"
            aria-haspopup="dialog"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={16} aria-hidden="true" />
            {text('add')}
          </Button>
        </div>
      </div>

      {!products.length ? (
        <div>
          <div
            ref={emptyRef}
            tabIndex={-1}
            aria-label={text('emptyTitle')}
            className={cn(
              'flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border-2 bg-white px-4 py-14 text-center outline-none focus:border-[#0E6E6E]',
              focusRequest?.productId === 'empty'
                ? 'border-[#0E6E6E]'
                : 'border-transparent',
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#F7F7F8]">
              <FileText
                className="text-[#5C5C61]"
                size={30}
                aria-hidden="true"
              />
            </span>
            <h3 className="text-lg font-semibold">{text('emptyTitle')}</h3>
            <Button
              type="button"
              variant="outline"
              size="control"
              shape="md"
              disabled
              className="data-disabled:opacity-100"
            >
              <span className="text-[#C99A19]" aria-hidden="true">
                ✦
              </span>
              {text('createWithAi')}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-3 pb-7">
            <Button
              type="button"
              variant="outline"
              size="control"
              shape="md"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={16} aria-hidden="true" />
              {text('add')}
            </Button>
            <p className="text-sm text-[#6B6B70]">{text('emptyDescription')}</p>
          </div>
        </div>
      ) : (
        /* `.do112c-body`: rail beside the cards at 1000px, chips above them below it */
        <div className="flex flex-col gap-3 @[1000px]:grid @[1000px]:grid-cols-[220px_minmax(0,1fr)] @[1000px]:items-start @[1000px]:gap-4">
          {cards.length > 1 && (
            <nav
              aria-label={text('tabBundles')}
              className="min-w-0 @[1000px]:sticky @[1000px]:top-4"
            >
              <ol className="-m-1 flex list-none flex-nowrap gap-2 overflow-x-auto p-1 [scrollbar-width:none] @[1000px]:m-0 @[1000px]:flex-col @[1000px]:overflow-visible @[1000px]:p-0 [&::-webkit-scrollbar]:hidden">
                {cards.map((card, index) => {
                  const product = card.products[0];
                  const current = card.products.some(
                    (line) => line.id === openProductId,
                  );
                  const cardUnits = card.products.reduce(
                    (sum, garment) => sum + getProductQuantity(garment),
                    0,
                  );
                  const cardName =
                    card.products.length > 1 && card.products.every((line) => line.blank)
                      ? text('blankCardTitle', {number: index + 1})
                      : card.products.length > 1
                        ? text('bundleCardTitle', {number: index + 1})
                      : product.name;
                  const chip = getProductChips({
                    ...product,
                    variants: card.products.flatMap(
                      (garment) => garment.variants,
                    ),
                    minimumQuantity: Math.max(
                      ...card.products.map(
                        (garment) => garment.minimumQuantity,
                      ),
                    ),
                  })[0];
                  return (
                    <li
                      key={product.id}
                      className="min-w-0 shrink-0 @[1000px]:shrink"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="default"
                        shape="md"
                        aria-current={current ? 'true' : undefined}
                        aria-label={text('railItemLabel', {
                          title: text('lineTitle', {
                            number: index + 1,
                            name: product.name,
                          }),
                          status: text(chip?.key ?? 'readyStatus'),
                        })}
                        onClick={() => setOpenProductId(product.id)}
                        className={cn(
                          'flex min-h-10 max-w-[260px] items-center gap-2.5 rounded-[10px] border bg-white py-1.5 pr-3 pl-1.5 text-left text-[#111113] hover:border-[#D7D7DA] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E] @[1000px]:w-full @[1000px]:max-w-none',
                          current
                            ? 'border-[#111113] shadow-[inset_0_0_0_.5px_#111113]'
                            : 'border-[#ECECEE]',
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'inline-flex size-7 shrink-0 items-center justify-center rounded-[9px] text-[12.5px] font-semibold tabular-nums',
                            current
                              ? 'bg-[#111113] text-white'
                              : 'bg-[#F7F7F8]',
                          )}
                        >
                          {index + 1}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <b className="truncate text-[13px] leading-[1.35] font-semibold">
                            {cardName}
                          </b>
                          <span className="flex items-center gap-1.5 truncate text-xs text-[#6B6B70]">
                            <i
                              aria-hidden="true"
                              className={cn(
                                'size-1.5 shrink-0 rounded-full',
                                DOT_TONE[chip?.tone ?? 'neutral'],
                              )}
                            />
                            {text('railStatus', {
                              status: text(chip?.key ?? 'readyStatus'),
                              units: t('newDraftOrder.overview.units', {
                                count: cardUnits,
                              }),
                            })}
                          </span>
                        </span>
                      </Button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
          <div className="flex min-w-0 flex-col gap-2.5">
            {cards.map((card, cardIndex) => {
              const grouped =
                card.products.length > 1 &&
                card.products.every((product) => product.blank);
              const cardQuantity = card.products.reduce(
                (sum, product) => sum + getProductQuantity(product),
                0,
              );
              const cardMinimum = Math.max(
                ...card.products.map((product) => product.minimumQuantity),
              );
              const lines = card.products.map((product) => (
                <ProductBundleCard
                  key={product.id}
                  product={product}
                  quantityFocusNonce={focusRequest?.productId === product.id ? focusRequest.nonce : undefined}
                  index={
                    (product.lineNumber ?? products.indexOf(product) + 1) - 1
                  }
                  open={openProductId === product.id}
                  onToggle={() =>
                    setOpenProductId(
                      openProductId === product.id ? null : product.id,
                    )
                  }
                  onChange={updateProduct}
                  onDuplicateInColor={() => duplicateInColor(product.id)}
                  onQuickPick={() =>
                    setGarmentDrawer({mode: 'art', productId: product.id})
                  }
                  onRemove={() => removeProduct(product.id)}
                  workflow={workflow}
                  method={method}
                  headerInHands={headerInHands}
                  soonestInHands={soonestInHands}
                  shipToName={shipToName}
                  nested={grouped}
                  cardQuantity={cardQuantity}
                  cardMinimum={cardMinimum}
                  onAddGarment={() =>
                    setGarmentDrawer({mode: 'addGarment', cardId: card.id})
                  }
                />
              ));
              return grouped ? (
                <BlankGarmentCard
                  key={card.id}
                  number={cardIndex + 1}
                  products={card.products}
                  workflow={workflow}
                >
                  {lines}
                </BlankGarmentCard>
              ) : (
                <div key={card.id}>{lines}</div>
              );
            })}
          </div>
        </div>
      )}

      {garmentDrawer && (
        <GarmentPickerDrawer
          key={`${garmentDrawer.mode}-${garmentDrawer.cardId ?? garmentDrawer.productId ?? 'new'}`}
          open={garmentDrawer !== null}
          onOpenChange={(open) => {
            if (!open) setGarmentDrawer(null);
          }}
          mode={garmentDrawer.mode}
          initialQuery={itemQuery}
          brand={targetCard?.products[0].brand ?? targetProduct?.brand}
          brands={orderBrands}
          cardNumber={targetCard ? cards.indexOf(targetCard) + 1 : undefined}
          lineNumber={targetLineNumber}
          garmentLabel={targetGarment}
          onAdd={(picked) => addGarments(picked, garmentDrawer.cardId)}
          onAddArts={(arts) => {
            if (garmentDrawer.productId) addArts(garmentDrawer.productId, arts);
          }}
        />
      )}

      <AddProductDrawer
        open={addOpen}
        onOpenChange={setAddOpen}
        lineNumber={products.length + 1}
        onStart={(query) => {
          setItemQuery(query);
          setAddOpen(false);
          setGarmentDrawer({mode: 'newBundle'});
        }}
        onPickProducts={() => {
          setAddOpen(false);
          onPickProducts();
        }}
      />
    </div>
  );
}
