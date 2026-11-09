import type {DraftProduct} from '../../../schemas/draft-product.schema';
import {SHIP_VIA_OPTIONS} from '../../../schemas/draft-product.schema';
import {builderInputClass} from '../BuilderFields';
import {OptionalDateField} from '../OptionalDateField';
import {Fold, metaClass, OptField, OptSelect, type OwnField} from './shared';

interface Props {
  uid: string;
  product: DraftProduct;
  ownFields: OwnField[];
  headerDateHelp: string;
  open: boolean;
  onToggle: () => void;
  foldId: string;
  onChange: (product: DraftProduct) => void;
  text: (key: string, options?: Record<string, unknown>) => string;
}

/** `.u116a-grid`: the "Order line details" fold — per-line overrides of the header defaults. */
export function ProductLineDetailsFold({
  uid,
  product,
  ownFields,
  headerDateHelp,
  open,
  onToggle,
  foldId,
  onChange,
  text,
}: Props) {
  return (
    <Fold
      id={foldId}
      title={text('lineDetails')}
      summary={
        ownFields.length
          ? text('opt.summaryOwn', {
              list: ownFields.map((field) => text(`opt.diff.${field}`)).join(', '),
            })
          : text('headerDefaults')
      }
      open={open}
      onToggle={onToggle}
    >
      <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3.5 max-[759.98px]:grid-cols-1">
        <OptField
          id={`${uid}-shipDate`}
          label={text('opt.shipDate')}
          help={headerDateHelp}
        >
          <OptionalDateField
            id={`${uid}-shipDate`}
            value={product.shipDate}
            label={text('opt.shipDate')}
            describedBy={`${uid}-shipDate-h`}
            onChange={(day) => onChange({...product, shipDate: day})}
          />
        </OptField>
        <OptField id={`${uid}-po`} label={text('opt.po')} help={text('opt.poHelp')}>
          <input
            id={`${uid}-po`}
            maxLength={120}
            value={product.po}
            placeholder={text('opt.poPlaceholder')}
            aria-describedby={`${uid}-po-h`}
            onChange={(event) => onChange({...product, po: event.target.value})}
            className={builderInputClass}
          />
        </OptField>
        <OptField
          id={`${uid}-shipIndicator`}
          label={text('opt.shipIndicator')}
          help={text('opt.indicatorHelp')}
        >
          <OptSelect
            id={`${uid}-shipIndicator`}
            value={product.shipIndicator}
            describedBy={`${uid}-shipIndicator-h`}
            onChange={(value) =>
              onChange({
                ...product,
                shipIndicator: value === 'NB' ? 'NB' : 'SIP',
              })
            }
            options={[
              ['SIP', text('opt.indicatorSip')],
              ['NB', text('opt.indicatorNb')],
            ]}
          />
        </OptField>
        {product.shipIndicator === 'NB' && (
          <OptField
            id={`${uid}-notBefore`}
            label={text('opt.notBefore')}
            help={text('opt.notBeforeHelp')}
            error={product.notBefore ? '' : text('opt.notBeforeError')}
          >
            <OptionalDateField
              id={`${uid}-notBefore`}
              value={product.notBefore}
              label={text('opt.notBefore')}
              describedBy={`${uid}-notBefore-h`}
              onChange={(day) => onChange({...product, notBefore: day})}
            />
          </OptField>
        )}
        <OptField id={`${uid}-shipVia`} label={text('opt.shipVia')} help={text('opt.viaHelp')}>
          <OptSelect
            id={`${uid}-shipVia`}
            value={product.shipVia}
            describedBy={`${uid}-shipVia-h`}
            onChange={(value) => onChange({...product, shipVia: value})}
            options={[
              ['', text('opt.viaHeader', {via: text('opt.headerVia')})],
              ...SHIP_VIA_OPTIONS.map((via) => [via, via] as [string, string]),
            ]}
          />
        </OptField>
        <OptField
          id={`${uid}-inHandsDate`}
          label={text('opt.inHandsDate')}
          help={headerDateHelp}
        >
          <OptionalDateField
            id={`${uid}-inHandsDate`}
            value={product.inHandsDate}
            label={text('opt.inHandsDate')}
            describedBy={`${uid}-inHandsDate-h`}
            onChange={(day) => onChange({...product, inHandsDate: day})}
          />
        </OptField>
        <OptField
          id={`${uid}-eventName`}
          label={text('opt.eventName')}
          help={text('opt.optional')}
        >
          <input
            id={`${uid}-eventName`}
            maxLength={120}
            value={product.eventName}
            placeholder={text('opt.eventPlaceholder')}
            aria-describedby={`${uid}-eventName-h`}
            onChange={(event) => onChange({...product, eventName: event.target.value})}
            className={builderInputClass}
          />
        </OptField>
        <OptField
          id={`${uid}-discountCode`}
          label={text('opt.discountCode')}
          help={text('opt.discountHelp')}
        >
          <input
            id={`${uid}-discountCode`}
            maxLength={60}
            value={product.discountCode}
            placeholder={text('opt.discountPlaceholder')}
            aria-describedby={`${uid}-discountCode-h`}
            onChange={(event) =>
              onChange({...product, discountCode: event.target.value})
            }
            className={builderInputClass}
          />
        </OptField>
        <OptField
          id={`${uid}-shipCode`}
          label={text('opt.shipCode')}
          help={text('opt.optional')}
        >
          <input
            id={`${uid}-shipCode`}
            maxLength={60}
            value={product.shipCode}
            placeholder={text('opt.shipCodePlaceholder')}
            aria-describedby={`${uid}-shipCode-h`}
            onChange={(event) => onChange({...product, shipCode: event.target.value})}
            className={builderInputClass}
          />
        </OptField>
      </div>
      <p className={metaClass}>
        {ownFields.length
          ? text('opt.splitDiff', {
              count: ownFields.length,
              list: ownFields.map((field) => text(`opt.diff.${field}`)).join(` ${text('opt.and')} `),
            })
          : text('opt.splitDefault')}
      </p>
    </Fold>
  );
}
