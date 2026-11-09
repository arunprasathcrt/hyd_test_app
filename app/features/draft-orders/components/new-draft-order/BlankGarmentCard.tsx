import {useState, type ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {Check, Shirt} from 'lucide-react';
import {BrandLogo} from '~/shared/components/product';
import {BRAND_LOGOS} from '~/shared/components/product/BrandLogo';
import type {DraftProduct} from '../../schemas/draft-product.schema';
import type {WorkflowStage} from '../../types/new-draft-order';
import {
  getProductGarmentUnit,
  getProductQuantity,
  getProductSubtotal,
  getProductUnitPrice,
} from '../../lib/draft-products';
import {Fold, metaClass} from './ProductBundleCard';

export function BlankGarmentCard({
  number,
  products,
  workflow,
  children,
}: {
  number: number;
  products: DraftProduct[];
  workflow: WorkflowStage[];
  children: ReactNode;
}) {
  const {t} = useTranslation('newDraftOrder');
  const [pricingOpen, setPricingOpen] = useState(false);
  const [wfOpen, setWfOpen] = useState(false);
  const text = (key: string, options?: Record<string, unknown>) =>
    t(`newDraftOrder.products.${key}`, options);
  const money = (value: number) => t('newDraftOrder.overview.money', {value});
  const units = products.reduce(
    (sum, product) => sum + getProductQuantity(product),
    0,
  );
  const total = products.reduce(
    (sum, product) => sum + getProductSubtotal(product),
    0,
  );
  const brand = products[0].brand;
  const minimum = Math.max(...products.map((product) => product.minimumQuantity));
  const remaining = Math.max(0, minimum - units);
  const short = minimum > 0 && remaining > 0;
  // Prototype `cardChecks`: the nine stages, rolled up for this card. Blank garments
  // skip art, art production and licensing; "quantity" clears once the minimum is met.
  const stages = workflow.map((stage) => {
    if (['customer_art', 'art_production', 'license'].includes(stage.code))
      return true;
    if (stage.code === 'quantity') return !short;
    return stage.state === 'passed' || stage.state === 'na';
  });
  const cleared = stages.filter(Boolean).length;
  const allClear = !short && cleared === stages.length;
  const stageName = (code: string) =>
    t(`newDraftOrder.overview.stages.${code}`);
  const openStageNames = workflow
    .filter((stage, index) => !stages[index] && stage.code !== 'quantity')
    .map((stage) => stageName(stage.code));
  const summary = text('blankSummary', {count: products.length, units});
  return (
    <article className="min-w-0 overflow-hidden rounded-[14px] border border-[#D7D7DA] bg-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#ECECEE] p-4">
        <span className="grid size-12 place-items-center rounded-xl bg-[#F7F7F8] text-[#8E8E93]">
          <Shirt size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">
            {text('blankCardTitle', {number})}
          </h3>
          <p className="text-xs text-[#6B6B70]">{summary}</p>
        </div>
        <strong className="text-sm tabular-nums">
          {t('newDraftOrder.overview.money', {value: total})}
        </strong>
        <div className="flex basis-full flex-wrap items-center gap-4 pl-15 text-xs text-[#6B6B70]">
          {BRAND_LOGOS[brand] ? (
            <BrandLogo
              name={brand}
              className="flex h-5 w-24 shrink-0 items-center [&_svg]:block [&_svg]:max-h-4 [&_svg]:w-full [&_svg]:max-w-full"
            />
          ) : (
            <span>{brand}</span>
          )}
          <span aria-hidden="true" className="flex gap-1">
            {stages.map((clear, index) => (
              <i
                key={workflow[index].code}
                className={
                  clear
                    ? 'my-auto h-0.5 w-2 bg-[#D7D7DA]'
                    : 'size-2 rounded-full border border-[#8E8E93]'
                }
              />
            ))}
          </span>
          <span>
            {text('dotsCleared', {cleared, total: stages.length})}
          </span>
        </div>
      </header>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-[#ECECEE] p-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#F7F7F8] text-[#8E8E93]">
            <Shirt size={24} />
          </span>
          <div>
            <h4 className="text-sm font-semibold">{text('blankGarments')}</h4>
            <p className="text-xs text-[#6B6B70]">{text('blankDescription')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold">{text('garments')}</h4>
          <span className="text-xs text-[#6B6B70]">
            {summary} · {text('oneArtBrand')}
          </span>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#ECECEE] divide-y divide-[#ECECEE]">
          {children}
        </div>
        {/* The card's Pricing and Workflow status are combined once here, not repeated per garment. */}
        <div className="rounded-xl border border-[#ECECEE] px-3.5">
          <Fold
            id="card-pricing"
            title={text('pricing')}
            summary={text('cardPricingSummary', {units, total: money(total)})}
            open={pricingOpen}
            onToggle={() => setPricingOpen((current) => !current)}
          >
            <div className="m-0 grid grid-cols-[minmax(0,1fr)_88px_120px_88px] gap-x-4">
              <div className="col-span-4 grid grid-cols-subgrid pb-2">
                <span className="w-fit rounded bg-[#F0F0F2] px-2 py-1 text-xs font-semibold whitespace-nowrap text-[#111113]">
                  {text('pricingGarment')}
                </span>
                <span className="w-fit justify-self-end rounded bg-[#F0F0F2] px-2 py-1 text-xs font-semibold whitespace-nowrap text-[#111113]">
                  {text('pricingUnitTotal')}
                </span>
                <span className="w-fit justify-self-end rounded bg-[#F0F0F2] px-2 py-1 text-xs font-semibold whitespace-nowrap text-[#111113]">
                  {text('pricingQtyUnit')}
                </span>
                <span className="w-fit justify-self-end rounded bg-[#F0F0F2] px-2 py-1 text-xs font-semibold whitespace-nowrap text-[#111113]">
                  {text('pricingLineTotal')}
                </span>
              </div>
              {products.map((product) => {
                const quantity = getProductQuantity(product);
                const unitEach = getProductUnitPrice(product);
                const garmentUnit = getProductGarmentUnit(product);
                const subtotal = getProductSubtotal(product);
                const first = product.variants[0];
                const variantMeta = [first?.color, first?.sku]
                  .filter(Boolean)
                  .join(' · ');
                const priceMeta = [
                  `${text('pricingGarment')} ${money(garmentUnit)}`,
                  `${text('pricingArt')} ${money(product.artPrice)}`,
                  `${text('pricingDecoration')} ${
                    product.decorationPrice
                      ? money(product.decorationPrice)
                      : text('pricingNone')
                  }`,
                  `${text('pricingAdders')} ${
                    product.adderPrice ? money(product.adderPrice) : text('pricingNone')
                  }`,
                ].join(' · ');
                return (
                  <div
                    key={product.id}
                    className="col-span-4 grid grid-cols-subgrid items-start gap-y-0.5 border-t border-[#ECECEE] py-2.5"
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[13px] font-semibold whitespace-nowrap text-[#111113]">
                        {text('lineTitle', {
                          number: product.lineNumber ?? products.indexOf(product) + 1,
                          name: product.name.replace(/[®™]/g, ''),
                        })}
                      </span>
                      {variantMeta && (
                        <span className="text-xs text-[#6B6B70]">{variantMeta}</span>
                      )}
                      <span className="text-xs text-[#6B6B70]">{priceMeta}</span>
                    </div>
                    <span className="text-right text-[13.5px] font-medium whitespace-nowrap tabular-nums text-[#111113]">
                      {money(unitEach)}
                    </span>
                    <span className="text-right text-[13.5px] whitespace-nowrap tabular-nums text-[#6B6B70]">
                      {`${quantity} × ${money(unitEach)}`}
                    </span>
                    <span className="text-right text-[13.5px] font-semibold whitespace-nowrap tabular-nums text-[#111113]">
                      {money(subtotal)}
                    </span>
                  </div>
                );
              })}
              <div className="col-span-4 grid grid-cols-subgrid items-baseline border-t border-[#ECECEE] pt-2.5">
                <span className="text-sm font-semibold whitespace-nowrap text-[#111113]">
                  {text('cardTotalLabel')}
                </span>
                <span />
                <span className="text-right text-[13.5px] whitespace-nowrap tabular-nums text-[#6B6B70]">
                  {t('newDraftOrder.overview.units', {count: units})}
                </span>
                <span className="text-right text-base font-semibold whitespace-nowrap tabular-nums text-[#111113]">
                  {money(total)}
                </span>
              </div>
            </div>
            <p className={metaClass}>{text('pricingNote')}</p>
          </Fold>
          <Fold
            id="card-wf"
            title={text('workflowTitle')}
            summary={text('workflowSummary', {cleared, total: stages.length})}
            open={wfOpen}
            onToggle={() => setWfOpen((current) => !current)}
          >
            <ol className="m-0 flex list-none flex-col p-0">
              {workflow.map((stage, order) => (
                <li
                  key={stage.code}
                  className={`flex items-start gap-3 border-t border-[#ECECEE] py-2.5 ${
                    order === 0 ? 'border-t-0 pt-1' : ''
                  }`}
                >
                  <span
                    role="img"
                    aria-label={stages[order] ? text('markDone') : text('markProg')}
                    className={`inline-flex size-[22px] shrink-0 items-center justify-center rounded-full ${
                      stages[order]
                        ? 'bg-[#EEF6F1] text-[#1F7A4D]'
                        : 'bg-[#F7F7F8] text-[#6B6B70]'
                    }`}
                  >
                    {stages[order] ? (
                      <Check size={14} aria-hidden="true" />
                    ) : (
                      <i className="block size-2 rounded-full bg-[#6B6B70]" />
                    )}
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5 text-xs leading-normal">
                    <b
                      className={
                        stages[order]
                          ? 'text-[13px] font-medium text-[#5C5C61]'
                          : 'text-[13px] font-semibold text-[#111113]'
                      }
                    >
                      {text('stageTitle', {n: order + 1, name: stageName(stage.code)})}
                    </b>
                    {stage.code === 'quantity' && short && (
                      <span className="break-words text-[#5C5C61]">
                        {text('stageShort', {
                          total: units,
                          moq: minimum,
                          remaining,
                          source: text('moqSourceProgram'),
                        })}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className={metaClass}>{text('workflowNote')}</p>
          </Fold>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-t border-[#ECECEE] pt-3 max-[599.98px]:flex-col max-[599.98px]:items-stretch">
          {allClear ? (
            <div
              role="status"
              className="flex min-w-0 flex-[1_1_100%] flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-[10px] border border-[#D5EBDD] bg-[#EEF6F1] px-3.5 py-3"
            >
              <span
                aria-hidden="true"
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[#1F7A4D] text-white"
              >
                <Check size={16} />
              </span>
              <b className="text-sm font-semibold text-[#1F7A4D]">
                {text('readyTitle')}
              </b>
            </div>
          ) : (
            <span className={metaClass}>
              {short
                ? openStageNames.length > 0
                  ? text('convertWaitsMinimumThen', {
                      remaining,
                      total: units,
                      moq: minimum,
                      stages: openStageNames.slice(0, 3).join(', '),
                    })
                  : text('convertWaitsMinimum', {remaining, total: units, moq: minimum})
                : text('convertWaitsStages', {
                    why: openStageNames.slice(0, 3).join(', '),
                  })}
            </span>
          )}
          <span className="ml-auto text-sm font-semibold whitespace-nowrap text-[#111113] tabular-nums">
            {text('cardFootTotal', {units, total: money(total)})}
          </span>
        </div>
      </div>
    </article>
  );
}
