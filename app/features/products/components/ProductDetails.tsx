import {useTranslation} from 'react-i18next';
import type {Product} from '../schemas/product.schema';
import type {SavedCollection} from '../schemas/saved-collection.schema';
import {savedCollectionNameFormSchema} from '../schemas/saved-collection.schema';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button, cn} from '../../../shared/components/product';
import {ProductImage} from './ProductCard';
import {CheckIcon} from './icons/CheckIcon';
import {ShirtIcon} from './icons/ShirtIcon';
import {SparklesIcon} from './icons/SparklesIcon';
import type {AtpTable} from '../schemas/atp.schema';
import {ProductAtpTable} from './ProductAtpTable';
import {ProductAtpDisclosure} from './ProductAtpDisclosure';

export function ProductDetails({
  product,
  catalogTitle,
  colorwayProducts,
  savedCollections,
  collectionOpen,
  collectionPending,
  addedCollectionName,
  onAddToCollection,
  onAddSavedCollection,
  onCreateSavedCollection,
  onAddToDraft,
  onCreatePresentation,
  onShowAtp,
  onOpenCatalog,
  onSelectColorway,
  atp,
}: {
  product: Product;
  catalogTitle?: string;
  colorwayProducts: Product[];
  savedCollections: SavedCollection[];
  collectionOpen: boolean;
  collectionPending: boolean;
  addedCollectionName: string | null;
  onAddToCollection: () => void;
  onAddSavedCollection: (collection: SavedCollection) => void;
  onCreateSavedCollection: (name: string) => void;
  onAddToDraft: () => void;
  onCreatePresentation: () => void;
  onShowAtp: () => void;
  onOpenCatalog: () => void;
  onSelectColorway: (product: Product) => void;
  /** Live per-size inventory; null while it loads. */
  atp: AtpTable | null;
}) {
  const {t} = useTranslation('products');
  const collectionForm = useForm({
    resolver: zodResolver(savedCollectionNameFormSchema),
    defaultValues: {name: ''},
    mode: 'onChange',
  });
  const facts =
    product.type === 'art'
      ? [
          [t('detail.artNumber'), product.sku],
          [t('detail.artCategory'), product.artCategory],
          [t('detail.brand'), product.brand],
          [t('detail.teams'), product.licenses.join(', ')],
          [t('detail.tier'), product.tier],
          [t('detail.region'), product.region.join(', ')],
        ]
      : [
          [t('detail.style'), product.styleCode || product.sku],
          [t('detail.color'), product.colorName || product.colorFamily],
          [t('detail.brand'), product.brand],
          [t('detail.category'), product.category],
          [t('detail.fit'), product.gender],
          [
            t('detail.license'),
            product.licenses.join(', ') ||
              t(product.isLicensed ? 'detail.licensedArt' : 'detail.blankOpen'),
          ],
          [t('detail.availability'), product.availability],
          [
            t('detail.artPlacements'),
            product.placementLabels.length
              ? t('detail.zoneCount', {count: product.placementLabels.length})
              : '',
          ],
        ];
  const actionClass =
    'h-auto min-h-10 min-w-0 flex-1 whitespace-normal rounded-[10px] border-[#D7D7DA] bg-white px-3.5 py-2 text-center text-[13px] font-medium text-[#111113] hover:border-[#D7D7DA] hover:bg-[#F7F7F8]';
  const labelClass =
    'block text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]';

  return (
    <div className="grid min-h-full grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] bg-white text-[#111113] max-sm:grid-cols-1">
      <div className="relative flex items-center justify-center bg-[#F5F5F6] p-7 max-sm:p-[18px]">
        <span className="absolute left-3 top-3 z-10 inline-flex h-8 items-center rounded-full border border-[#ECECEE] bg-white px-3 text-[12.5px] font-medium text-[#111113]">
          {t('page.title')}
        </span>
        <div className="w-full">
          <ProductImage
            product={product}
            eager
            className="aspect-auto max-h-[66dvh] object-contain p-0"
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-3 px-7 pb-6 pt-7">
        <div className="flex flex-col gap-3">
          <p className={cn(labelClass, 'm-0')}>
            {product.brand}
            {` · ${product.catalogName || t('page.title')}`}
          </p>
          <h2 className="m-0 text-xl font-semibold leading-[1.3] tracking-[-0.015em] text-[#111113]">
            {product.name}
          </h2>
          <p className="m-0 text-[13px] text-[#5C5C61]">
            {[product.sku, product.colorName, product.gender, product.garmentType]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        {product.price !== null ? (
          <div className="text-xl font-semibold text-[#111113]">
            {t('card.price', {value: product.price})}{' '}
            <small className="text-xs font-normal text-[#6B6B70]">
              {t('detail.priceUnit')}
              {product.moq !== null && product.moq > 0
                ? ` · ${t('card.moq')} ${product.moq}`
                : ''}
            </small>
          </div>
        ) : (
          <div>
            <span className="inline-flex h-[26px] items-center rounded-full bg-[#F2F2F3] px-2.5 text-xs font-medium text-[#5C5C61]">
              {product.tier || t('card.pricePending')}
            </span>
          </div>
        )}

        <dl className="m-0 grid grid-cols-2 gap-x-3.5 gap-y-2 border-y border-[#ECECEE] py-3 text-[13px]">
          {facts.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className={cn(labelClass, 'mb-0.5')}>{label}</dt>
              <dd className="m-0 break-words text-[#111113]">
                {value || t('detail.emptyValue')}
              </dd>
            </div>
          ))}
        </dl>

        {product.type === 'garment' && (
          <section>
            <h3 className={cn(labelClass, 'm-0 mb-1.5')}>
              {t('detail.colorways')}
              <b className="ml-1.5 text-[12.5px] font-medium normal-case tracking-normal text-[#111113]">
                {product.colorName || product.colorFamily}
              </b>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <span
                aria-current="true"
                title={t('detail.currentColorway', {
                  color: product.colorName || product.colorFamily,
                })}
                className="size-9 overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_0_0_1.5px_#111113]"
              >
                <img
                  src={product.image}
                  alt=""
                  width={36}
                  height={36}
                  className="size-full object-contain"
                />
              </span>
              {colorwayProducts.map((colorway) => (
                <button
                  key={colorway.id}
                  type="button"
                  aria-label={t('detail.selectColorway', {
                    color: colorway.colorName || colorway.sku,
                  })}
                  title={colorway.colorName || colorway.sku}
                  onClick={() => onSelectColorway(colorway)}
                  className="size-9 cursor-pointer overflow-hidden rounded-full border-2 border-white bg-white p-0 shadow-[0_0_0_1px_#D7D7DA]"
                >
                  <img
                    src={colorway.image}
                    alt=""
                    width={36}
                    height={36}
                    loading="lazy"
                    className="size-full object-contain"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {product.type === 'garment' && (
          <section className="mb-3.5 mt-3 rounded-[14px] bg-[#F7F7F8] px-3.5 py-3">
            <h3 className={cn(labelClass, 'm-0 mb-1.5')}>
              {t('detail.atpTitle', {color: product.colorName || product.colorFamily})}
            </h3>
            <span className="inline-flex items-center rounded-full border border-[#D7D7DA] bg-white px-3.5 py-1.5 text-[13px] text-[#5C5C61]">
              {t('detail.atpByWarehouse')}
            </span>
            {atp && atp.rows.length > 0 ? (
              <>
                <ProductAtpTable table={atp} />
              </>
            ) : (
              <p className="m-0 mt-2.5 text-[13px] leading-normal text-[#6B6B70]">
                {t(atp ? 'detail.atpUnavailable' : 'detail.atpLoading')}
              </p>
            )}
            <ProductAtpDisclosure
              moq={product.moq}
              hasIncoming={Boolean(atp?.purchaseOrders.length)}
              showInventoryNote={Boolean(atp && atp.rows.length > 0)}
            />
          </section>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              aria-expanded={collectionOpen}
              aria-controls="quick-view-collection-chooser"
              onClick={() => {
                if (!collectionOpen) collectionForm.reset({name: ''});
                onAddToCollection();
              }}
              className={actionClass}
            >
              {addedCollectionName ? <CheckIcon size={15} /> : null}
              {addedCollectionName
                ? t('detail.addedToCollection', {name: addedCollectionName})
                : t('detail.addToCollection')}
            </Button>
            <Button
              type="button"
              onClick={onAddToDraft}
              className={cn(
                actionClass,
                'border-[#1A1A1A] bg-[#1A1A1A] text-[13.5px] text-white hover:border-[#303030] hover:bg-[#303030]',
              )}
            >
              {t('detail.addToDraft')}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCreatePresentation}
              className={actionClass}
            >
              {t('detail.createPresentation')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onShowAtp}
              className={actionClass}
            >
              {t('detail.atpDetails')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled
              className={actionClass}
            >
              <SparklesIcon size={15} />
              {t('detail.createWithAi')}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled
              className={cn(actionClass, 'flex-none border-[#ECECEE] bg-[#F7F7F8] px-4')}
            >
              <ShirtIcon size={16} />
              {t('detail.buildInSpectrum')}
            </Button>
            <span className="inline-flex h-7 items-center rounded-full bg-[#F2F2F3] px-3 text-xs font-medium text-[#5C5C61]">
              {t('detail.spectrumUnavailable')}
            </span>
          </div>
          {catalogTitle ? (
            <button
              type="button"
              onClick={onOpenCatalog}
              className="w-fit cursor-pointer border-0 bg-transparent p-0 text-left text-[12.5px] text-[#5C5C61] underline underline-offset-2"
            >
              {t('detail.openCatalog', {catalog: catalogTitle})}
            </button>
          ) : (
            <span className="text-[12.5px] text-[#5C5C61]">
              {t('detail.catalogUnavailable')}
            </span>
          )}
          {collectionOpen && (
            <section
              id="quick-view-collection-chooser"
              className="mt-2.5 rounded-[14px] border border-[#ECECEE] bg-white p-3"
            >
              <h3 className="m-0 mb-2 block text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
                {t('detail.chooseCollection')}
              </h3>
              <div className="flex max-h-[190px] flex-col gap-1.5 overflow-y-auto">
                {savedCollections.map((collection) => (
                  <button
                    key={collection.id}
                    type="button"
                    disabled={collectionPending}
                    onClick={() => onAddSavedCollection(collection)}
                    className="flex h-[38px] shrink-0 cursor-pointer items-center justify-between gap-2.5 rounded-[10px] border border-[#ECECEE] bg-white px-3 text-left text-[13px] text-[#111113] hover:border-[#111113] disabled:opacity-50"
                  >
                    <span className="min-w-0 truncate">{collection.name}</span>
                    <span className="shrink-0 text-xs text-[#6B6B70]">
                      {t('detail.styleCount', {count: collection.productCount})}
                    </span>
                  </button>
                ))}
                {savedCollections.length === 0 && (
                  <p className="m-0 text-[12.5px] text-[#8B877D]">
                    {t('detail.noCollections')}
                  </p>
                )}
              </div>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void collectionForm.handleSubmit(({name}) => {
                    onCreateSavedCollection(name);
                  })(event);
                }}
              >
                <input
                  {...collectionForm.register('name')}
                  maxLength={100}
                  placeholder={t('detail.newCollectionPlaceholder')}
                  aria-label={t('detail.newCollectionPlaceholder')}
                  className="h-10 min-w-0 flex-1 rounded-[10px] border border-[#D7D7DA] bg-white px-3 text-[13px] text-[#14130F] placeholder:text-[#8B877D] focus-visible:outline-2 focus-visible:outline-mf-primary"
                />
                <Button
                  type="submit"
                  disabled={!collectionForm.formState.isValid || collectionPending}
                  className="h-10 rounded-[10px] border-[#1A1A1A] bg-[#1A1A1A] px-3.5 text-[13px] font-medium text-white disabled:opacity-45"
                >
                  {collectionPending ? t('form.pending') : t('detail.createAndAdd')}
                </Button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
