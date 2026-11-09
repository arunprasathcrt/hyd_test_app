import {useEffect, useId, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Plus} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';
import type {DraftProduct} from '../../schemas/draft-product.schema';
import {
  applyTopUp,
  getProductGarmentUnit,
  getProductQuantity,
  getProductSubtotal,
  getProductUnitPrice,
  spreadUnits,
} from '../../lib/draft-products';
import {isoDayToDate} from '../../lib/new-draft-order';
import type {
  WorkflowStage,
  WorkflowStageCode,
} from '../../types/new-draft-order';
import {ProductCardHeader} from './product-bundle-card/ProductCardHeader';
import {ProductMinimumBanner} from './product-bundle-card/ProductMinimumBanner';
import {ProductCardActions} from './product-bundle-card/ProductCardActions';
import {ProductRoadSignBanner} from './product-bundle-card/ProductRoadSignBanner';
import {ProductGarmentDetails} from './product-bundle-card/ProductGarmentDetails';
import {ProductSizesFold} from './product-bundle-card/ProductSizesFold';
import {ProductArtSection} from './product-bundle-card/ProductArtSection';
import {ProductPriceEditor} from './product-bundle-card/ProductPriceEditor';
import {ProductLicenseSection} from './product-bundle-card/ProductLicenseSection';
import {ProductCommentsFold} from './product-bundle-card/ProductCommentsFold';
import {ProductLineDetailsFold} from './product-bundle-card/ProductLineDetailsFold';
import {ProductPricingSummaryFold} from './product-bundle-card/ProductPricingSummaryFold';
import {ProductWorkflowFold} from './product-bundle-card/ProductWorkflowFold';
import {ProductCardFooter} from './product-bundle-card/ProductCardFooter';
import {
  CLOSED_BY_DEFAULT,
  DOC_KEYS,
  Fold,
  getProductChips,
  metaClass,
  secondaryButtonClass,
  segmentButtonClass,
  segmentTrackClass,
  type OwnField,
  type ProductChip,
  type ProductChipTone,
  type StageMark,
} from './product-bundle-card/shared';

// Re-exported for existing consumers (ProductsStep.tsx, BlankGarmentCard.tsx).
export {
  Fold,
  getProductChips,
  metaClass,
  secondaryButtonClass,
  segmentButtonClass,
  segmentTrackClass,
};
export type {ProductChip, ProductChipTone};

interface Props {
  product: DraftProduct;
  index: number;
  open: boolean;
  onToggle: () => void;
  onChange: (product: DraftProduct) => void;
  /** Opens the garment picker for this card; the picked colorway becomes the next line. */
  onDuplicateInColor: () => void;
  /** Opens the art library to add marks to this garment. */
  onQuickPick: () => void;
  onRemove: () => void;
  workflow: WorkflowStage[];
  /** The order's first decoration method (code), for the minimum's source text. */
  method: string;
  /** The header's in-hands date (ISO day): the default for ship and in-hands dates. */
  headerInHands: string;
  /** The soonest the order can be ready (ISO day): the "Ready by" date of the road sign. */
  soonestInHands: string;
  /** The customer's first ship-to, for the license line. */
  shipToName: string;
  /** Opens the garment drawer to add garments next to this card. */
  onAddGarment: () => void;
  nested?: boolean;
  cardQuantity?: number;
  cardMinimum?: number;
  quantityFocusNonce?: number;
}

/**
 * Prototype V116a single-garment card (`.u116a-card.is-single` wrapping the V112
 * `.do112c-bundle`): header (thumbnail, title, chips, total) with the
 * "Card · art · MOQ" strip under it, then the open body — minimum note, card
 * actions, Garment details, Sizes, Interface, Art and decoration, AI render,
 * Set the prices — and the card's accordions (comments, order line details,
 * pricing).
 *
 * ❓ TO CONFIRM — no backing field on `DraftProduct` yet, so these render
 * disabled or are left out rather than invented: art, the AI render, the
 * Interface tabs, VAS, Spectrum build, approval flags, the nine-stage workflow
 * dots and Workflow status accordion, the convert footer, the MOQ source text
 * ("set by the art"), size availability, per-doc comments and ship/event
 * overrides in Order line details.
 */
export function ProductBundleCard({
  product,
  index,
  open,
  onToggle,
  onChange,
  onDuplicateInColor,
  onQuickPick,
  onRemove,
  workflow,
  method,
  headerInHands,
  soonestInHands,
  shipToName,
  onAddGarment,
  nested = false,
  cardQuantity,
  cardMinimum,
  quantityFocusNonce,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const uid = useId();
  const [folds, setFolds] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (quantityFocusNonce === undefined) return;
    setFolds((current) => ({...current, sizes: true}));
  }, [quantityFocusNonce]);

  useEffect(() => {
    if (quantityFocusNonce === undefined || !open || folds.sizes === false) return;
    const frame = requestAnimationFrame(() => {
      const input = document.querySelector<HTMLInputElement>(
        `[data-size-input="${CSS.escape(product.id)}"]`,
      );
      input?.scrollIntoView({block: 'center', behavior: 'smooth'});
      input?.focus({preventScroll: true});
      input?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [quantityFocusNonce, open, folds.sizes, product.id]);

  const text = (key: string, options?: Record<string, unknown>) =>
    t(`newDraftOrder.products.${key}`, options);
  const money = (value: number) => t('newDraftOrder.overview.money', {value});
  const units = (count: number) => t('newDraftOrder.overview.units', {count});

  const isOpen = (key: string) => folds[key] ?? !CLOSED_BY_DEFAULT.has(key);
  const toggle = (key: string) =>
    setFolds((current) => ({...current, [key]: !isOpen(key)}));
  const foldId = (key: string) => `${uid}-${key}`;

  const quantity = getProductQuantity(product);
  const subtotal = getProductSubtotal(product);
  const minimum = cardMinimum ?? product.minimumQuantity;
  const minimumQuantity = cardQuantity ?? quantity;
  const remaining = Math.max(0, minimum - minimumQuantity);
  const metMinimum = minimum > 0 && remaining === 0;
  const first = product.variants[0];
  const color = first?.color ?? '';
  const chips = getProductChips(product).filter(
    (chip) => chip.key !== 'belowMinimumTag' || remaining > 0,
  );
  const detailsSummary =
    [color, product.productType, first?.sku].filter(Boolean).join(' · ') ||
    text('notSetYet');
  const progress =
    remaining > 0
      ? text('moqProgressToGo', {quantity: minimumQuantity, minimum, remaining})
      : text('moqProgress', {quantity: minimumQuantity, minimum});
  const short = minimum > 0 && remaining > 0;
  const garmentUnit = getProductGarmentUnit(product);
  const unitEach = getProductUnitPrice(product);
  const noteCount = DOC_KEYS.filter((doc) => product.notes[doc].trim()).length;
  const ownFields: OwnField[] = (
    [
      ['shipDate', product.shipDate],
      ['po', product.po.trim()],
      ['shipIndicator', product.shipIndicator === 'NB' ? 'NB' : ''],
      ['notBefore', product.shipIndicator === 'NB' ? product.notBefore : ''],
      ['shipVia', product.shipVia],
      ['inHandsDate', product.inHandsDate],
      ['eventName', product.eventName.trim()],
      ['discountCode', product.discountCode.trim()],
      ['shipCode', product.shipCode.trim()],
    ] as [OwnField, string][]
  )
    .filter(([, value]) => value)
    .map(([field]) => field);
  // Prototype `sign()`: a road sign only, nothing is blocked.
  const onTrack = !headerInHands || soonestInHands <= headerInHands;
  const headerDateHelp = headerInHands
    ? text('opt.headerDate', {date: isoDayToDate(headerInHands)})
    : text('opt.headerNotSet');
  const productName = product.name.replace(/[®™]/g, '');
  const [preview, setPreview] = useState(false);
  const topUpRows = short ? spreadUnits(product, remaining) : [];

  // Prototype `cardChecks`: the nine stages, rolled up for this card. The card's minimum
  // is stage 2's (Quantity approval); not needed counts as clear.
  const stages = workflow.map((stage, order) => {
    let state: 'passed' | 'na' | 'open' =
      stage.state === 'passed'
        ? 'passed'
        : stage.state === 'na'
          ? 'na'
          : 'open';
    if (
      product.blank &&
      ['customer_art', 'art_production', 'license'].includes(stage.code)
    )
      state = 'na';
    // Prototype: "Not needed: Not licensed art" clears the License stage.
    if (stage.code === 'license' && !product.licensed) state = 'na';
    let mark: StageMark =
      state === 'passed'
        ? 'done'
        : state === 'na'
          ? 'na'
          : stage.state === 'blocked'
            ? 'flag'
            : 'prog';
    if (stage.code === 'quantity' && short) {
      state = 'open';
      mark = 'flag';
    }
    return {code: stage.code, n: order + 1, state, mark};
  });
  const cleared = stages.filter((stage) => stage.state !== 'open').length;
  const allClear = !short && stages.length > 0 && cleared === stages.length;
  const stageName = (code: WorkflowStageCode) =>
    t(`newDraftOrder.overview.stages.${code}`);
  const openStageNames = stages
    .filter((stage) => stage.state === 'open' && stage.code !== 'quantity')
    .map((stage) => stageName(stage.code));
  const approved =
    stages.find((stage) => stage.code === 'customer_art')?.state !== 'open';
  const markLabel = (mark: StageMark) =>
    text(
      {done: 'markDone', na: 'markNa', flag: 'markFlag', prog: 'markProg'}[
        mark
      ],
    );
  const markWord = (mark: StageMark) =>
    text(
      {
        done: 'markDoneLabel',
        na: 'markNaLabel',
        flag: 'markFlagLabel',
        prog: 'markProgLabel',
      }[mark],
    );

  function openWorkflow() {
    setFolds((current) => ({...current, wf: true}));
    requestAnimationFrame(() =>
      document
        .getElementById(foldId('wf'))
        ?.scrollIntoView({block: 'nearest', behavior: 'smooth'}),
    );
  }

  function setQuantity(variantId: string, next: number) {
    if (!Number.isSafeInteger(next)) return;
    onChange({
      ...product,
      variants: product.variants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              quantity: Math.min(99999, Math.max(0, Math.floor(next))),
            }
          : variant,
      ),
    });
  }

  return (
    <article
      className={cn(
        'min-w-0 font-sans font-normal text-[#111113] [&_button:not(:disabled):not([data-disabled])]:cursor-pointer [&_a[href]]:cursor-pointer [&_button[data-disabled]]:opacity-100! [&_button[data-disabled]]:pointer-events-auto! [&_button[data-disabled]]:cursor-not-allowed! [&_button:disabled]:opacity-100! [&_button:disabled]:pointer-events-auto! [&_button:disabled]:cursor-not-allowed! rounded-[14px] border bg-white transition-colors duration-[120ms] hover:border-[#D7D7DA]',
        open ? 'border-[#D7D7DA]' : 'border-[#ECECEE]',
        nested && 'rounded-none border-0',
      )}
    >
      <ProductCardHeader
        product={product}
        index={index}
        open={open}
        onToggle={onToggle}
        uid={uid}
        color={color}
        chips={chips}
        soonestInHands={soonestInHands}
        onTrack={onTrack}
        nested={nested}
        minimum={minimum}
        minimumQuantity={minimumQuantity}
        metMinimum={metMinimum}
        progress={progress}
        subtotal={subtotal}
        stages={stages}
        cleared={cleared}
        onOpenWorkflow={openWorkflow}
        text={text}
        money={money}
        units={units}
        stageName={stageName}
        markWord={markWord}
      />

      {open && (
        <div
          id={`${uid}-body`}
          role="region"
          aria-label={text('lineTitle', {
            number: index + 1,
            name: product.name,
          })}
          className="min-w-0 px-[18px] pt-1 pb-[18px] max-[759.98px]:px-3 max-[759.98px]:pb-3.5"
        >
          {short && (
            <ProductMinimumBanner
              remaining={remaining}
              minimumQuantity={minimumQuantity}
              minimum={minimum}
              methodLabel={t(
                `newDraftOrder.leadTime.methods.options.${method}.label`,
              ).toLowerCase()}
              productName={productName}
              preview={preview}
              onTogglePreview={() => setPreview((current) => !current)}
              topUpRows={topUpRows}
              quantity={quantity}
              index={index}
              onApply={() => {
                onChange(applyTopUp(product, topUpRows));
                setPreview(false);
              }}
              onCancel={() => setPreview(false)}
              text={text}
            />
          )}

          <ProductCardActions
            productName={product.name}
            onDuplicateInColor={onDuplicateInColor}
            onRemove={onRemove}
            text={text}
          />

          {/* `.qb-card-fields` */}
          <div className="flex flex-col gap-3">
            {soonestInHands && (
              <ProductRoadSignBanner
                onTrack={onTrack}
                trackTitle={text(onTrack ? 'sign.onTrack' : 'sign.atRiskTitle')}
                body={
                  onTrack
                    ? text('sign.onTrackBody', {
                        ready: isoDayToDate(soonestInHands),
                        inHands: headerInHands
                          ? isoDayToDate(headerInHands)
                          : '',
                      })
                    : text('sign.atRiskBody', {
                        date: isoDayToDate(soonestInHands),
                      })
                }
              />
            )}

            <ProductGarmentDetails
              uid={uid}
              detailsOpen={isOpen('details')}
              onToggleDetails={() => toggle('details')}
              detailsSummary={detailsSummary}
              color={color}
              productType={product.productType}
              sku={first?.sku ?? ''}
              customerSku={product.customerSku ?? ''}
              onDetailsChange={(patch) => onChange({...product, ...patch})}
              text={text}
            />

            <ProductSizesFold
              product={product}
              quantity={quantity}
              open={isOpen('sizes')}
              onToggle={() => toggle('sizes')}
              foldId={foldId('sizes')}
              onSetQuantity={setQuantity}
              text={text}
              units={units}
            />

            {!product.blank && (
              <ProductArtSection
                uid={uid}
                index={index}
                foldIds={{art: foldId('art'), render: foldId('render')}}
                open={{art: isOpen('art'), render: isOpen('render')}}
                onToggle={{
                  art: () => toggle('art'),
                  render: () => toggle('render'),
                }}
                arts={product.arts}
                placements={product.placements}
                methods={product.decorationMethods}
                onQuickPick={onQuickPick}
                onChangeArt={(artId, patch) =>
                  onChange({
                    ...product,
                    arts: product.arts.map((art) =>
                      art.id === artId ? {...art, ...patch} : art,
                    ),
                  })
                }
                text={text}
              />
            )}

            <ProductPriceEditor
              product={product}
              garmentUnit={garmentUnit}
              unitEach={unitEach}
              subtotal={subtotal}
              open={isOpen('price')}
              onToggle={() => toggle('price')}
              foldId={foldId('price')}
              onChange={onChange}
              text={text}
              money={money}
            />
          </div>

          {/* `.u116a-cb.is-in`: the card's accordions */}
          <div className="mt-3.5 flex min-w-0 flex-col gap-3 border-t border-[#ECECEE] pt-3.5">
            <ProductLicenseSection
              uid={uid}
              shipToName={shipToName}
              text={text}
            />
            {/* Add a garment stays below License, outside the pricing accordion. */}
            <Button
              type="button"
              variant="ghost"
              shape="square"
              onClick={onAddGarment}
              className="inline-flex min-h-10 max-w-full flex-wrap items-center justify-start gap-x-2 gap-y-0.5 self-start rounded-[10px] border border-[#D7D7DA] bg-white px-4 py-1.5 text-left text-[13px] leading-[1.2] font-medium text-[#111113] transition-colors hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
            >
              <Plus size={16} aria-hidden="true" />
              <span>{text('addBlankGarment')}</span>
              {product.brand && (
                <span className="text-xs font-normal text-[#6B6B70]">
                  {product.brand}
                </span>
              )}
            </Button>

            <div className="flex min-w-0 flex-col">
              <ProductCommentsFold
                uid={uid}
                notes={product.notes}
                shipExact={product.shipExact}
                noteCount={noteCount}
                open={isOpen('cmts')}
                onToggle={() => toggle('cmts')}
                foldId={foldId('cmts')}
                onChangeNote={(doc, value) =>
                  onChange({
                    ...product,
                    notes: {...product.notes, [doc]: value},
                  })
                }
                onChangeShipExact={(value) =>
                  onChange({...product, shipExact: value})
                }
                text={text}
              />
              <ProductLineDetailsFold
                uid={uid}
                product={product}
                ownFields={ownFields}
                headerDateHelp={headerDateHelp}
                open={isOpen('opt')}
                onToggle={() => toggle('opt')}
                foldId={foldId('opt')}
                onChange={onChange}
                text={text}
              />
              {/* A grouped card shows its Pricing and Workflow status once, combined, on the card itself. */}
              {!nested && (
                <>
                  <ProductPricingSummaryFold
                    product={product}
                    garmentUnit={garmentUnit}
                    unitEach={unitEach}
                    quantity={quantity}
                    subtotal={subtotal}
                    open={isOpen('pricing')}
                    onToggle={() => toggle('pricing')}
                    foldId={foldId('pricing')}
                    text={text}
                    money={money}
                  />
                  <ProductWorkflowFold
                    stages={stages}
                    cleared={cleared}
                    quantity={quantity}
                    minimum={minimum}
                    remaining={remaining}
                    short={short}
                    open={isOpen('wf')}
                    onToggle={() => toggle('wf')}
                    foldId={foldId('wf')}
                    text={text}
                    stageName={stageName}
                    markLabel={markLabel}
                  />
                </>
              )}
            </div>

            {!nested && (
              <ProductCardFooter
                allClear={allClear}
                short={short}
                approved={approved}
                remaining={remaining}
                quantity={quantity}
                minimum={minimum}
                openStageNames={openStageNames}
                productName={productName}
                unitEach={unitEach}
                subtotal={subtotal}
                text={text}
                money={money}
                units={units}
              />
            )}
          </div>
        </div>
      )}
    </article>
  );
}
