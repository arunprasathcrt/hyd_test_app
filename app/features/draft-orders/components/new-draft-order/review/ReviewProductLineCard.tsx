import type {ReactNode} from 'react';
import {Pencil} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {useSearchParams} from 'react-router';
import {SEARCH_PARAMS} from '~/shared/constants/routes';
import {Button} from '~/shared/components/ui/Button';
import {BuilderTag} from '../BuilderFields';
import {issueLabel} from '../../../lib/new-draft-order';
import type {DraftOrderIssue, DraftOrderReviewLine} from '../../../types/new-draft-order';

// Overrides the link/xs variant's full width and uppercase label.
const lineLinkClass =
  'w-auto min-h-7 cursor-pointer gap-1.5 whitespace-nowrap text-xs font-medium normal-case tracking-normal';
const lineActionClass = `${lineLinkClass} text-[#5C5C61] underline hover:text-[#111113]`;

export function ReviewProductLineCard({line, issues, onIssue}: {
  line: DraftOrderReviewLine;
  issues: DraftOrderIssue[];
  onIssue: (issue: DraftOrderIssue) => void;
}) {
  const {t} = useTranslation('newDraftOrder');
  const [, setSearchParams] = useSearchParams();
  const unitPrice =
    line.garmentUnitPrice + line.artUnitPrice + line.decorationUnitPrice;
  const lineTotal = line.lineTotal;
  const goToStep = (step: 'products' | 'ship') => {
    setSearchParams((params) => {
      params.set(SEARCH_PARAMS.step, step);
      return params;
    });
  };
  const artState = t(
    line.artSelected
      ? 'newDraftOrder.review.lines.artReady'
      : 'newDraftOrder.review.lines.artNotChosen',
  );
  const notSet = (label: string) => (
    <span className="text-[#8E8E93]">{label}</span>
  );
  const fields: Array<{
    key: 'garment' | 'artwork' | 'decoration' | 'shipTo' | 'sizes' | 'quantity';
    value: ReactNode;
    sub?: string;
  }> = [
    {
      key: 'garment',
      value: [line.sku, line.color].filter(Boolean).join(' · '),
      sub: line.brand,
    },
    {
      key: 'artwork',
      value:
        line.artworkCode ??
        notSet(t('newDraftOrder.review.lines.artNotChosen')),
      sub: line.artworkCode,
    },
    {
      key: 'decoration',
      value: line.decoration
        ? t(
            `newDraftOrder.leadTime.methods.options.${line.decoration}.label`,
          )
        : notSet(t('newDraftOrder.overview.notSet')),
    },
    {
      key: 'shipTo',
      value: line.shipTo || notSet(t('newDraftOrder.overview.notSet')),
      sub: line.shipToAddress,
    },
    {
      key: 'sizes',
      value: line.sizes.length
        ? line.sizes.map((size, index) => (
            <div key={size.size} className={index > 0 ? 'mt-2.5' : ''}>
              {size.size} × {size.quantity}
            </div>
          ))
        : notSet(t('newDraftOrder.review.lines.sizesNotSet')),
    },
    {key: 'quantity', value: line.quantity},
  ];
  const prices = [
    ['quantity', line.quantity],
    [
      'garmentPrice',
      t('newDraftOrder.overview.money', {value: line.garmentUnitPrice}),
    ],
    ['artPrice', t('newDraftOrder.overview.money', {value: line.artUnitPrice})],
    [
      'decorationPrice',
      t('newDraftOrder.overview.money', {value: line.decorationUnitPrice}),
    ],
    ['unitPrice', t('newDraftOrder.overview.money', {value: unitPrice})],
  ] as const;

  return (
    <li className="grid min-w-0 grid-cols-[20px_56px_minmax(0,1fr)] items-start gap-x-3 border-b border-[#ECECEE] py-4 first:pt-0 last:border-b-0 last:pb-0 max-[520px]:grid-cols-[20px_minmax(0,1fr)]">
      <div
        aria-hidden="true"
        className="bg-gray-100 rounded-full pt-0.5 text-center text-xs leading-5 font-semibold text-[#6B6B70] tabular-nums"
      >
        {line.lineNumber}
      </div>
      <span
        aria-hidden="true"
        className="inline-flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#F5F5F6] text-xs font-semibold text-[#8E8E93] max-[520px]:hidden"
      >
        {line.image ? (
          <img
            src={line.image}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        ) : (
          line.thumbnailFallback
        )}
      </span>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <b className="min-w-0 text-[14px] leading-5 font-semibold text-[#111113] [overflow-wrap:anywhere]">
            {line.name}
          </b>
          <BuilderTag tone="neutral">
            {t('newDraftOrder.review.lines.notSent')}
          </BuilderTag>
          <span className="inline-flex h-[22px] items-center rounded-full bg-[#F7F7F8] px-2 text-[11.5px] font-medium text-[#6B6B70]">
            {t('newDraftOrder.review.lines.artCard', {
              card: line.bundleCard,
              state: artState,
            })}
          </span>
        </div>

        <dl className="m-0 grid min-w-0 grid-cols-3 gap-x-4 gap-y-3 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
          {fields.map(({key, value, sub}) => (
            <div key={key} className="min-w-0">
              <dt className="text-xs leading-[1.5] text-[#6B6B70]">
                {t(`newDraftOrder.review.lines.${key}`)}
              </dt>
              <dd className="m-0 text-[13px] leading-[1.45] text-[#111113] tabular-nums [overflow-wrap:anywhere]">
                {value}
                {sub ? (
                  <span className="block text-xs text-[#6B6B70]">{sub}</span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>

        <div
          role="group"
          aria-label={t('newDraftOrder.review.lines.priceAria', {
            line: line.lineNumber,
          })}
          className="grid grid-cols-6 gap-3 rounded-[10px] bg-[#F7F7F8] px-3 py-2.5 max-[900px]:grid-cols-3 max-[520px]:grid-cols-2"
        >
          {prices.map(([key, value]) => (
            <span
              key={key}
              className="flex min-w-0 flex-col text-[13px] leading-[1.4] text-[#111113] tabular-nums"
            >
              <em className="text-xs not-italic text-[#6B6B70]">
                {t(`newDraftOrder.review.lines.price.${key}`)}
              </em>
              {value}
            </span>
          ))}
          <span className="flex min-w-0 flex-col items-end text-[13px] leading-[1.4] text-[#111113] tabular-nums max-[900px]:items-start">
            <em className="text-xs not-italic text-[#6B6B70]">
              {t('newDraftOrder.review.lines.price.lineTotal')}
            </em>
            <b className="font-semibold">
              {t('newDraftOrder.overview.money', {value: lineTotal})}
            </b>
          </span>
        </div>

        {issues.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0" aria-live="polite">
            {issues.map((issue) => (
              <li key={issue.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-[10px] bg-[#FDEDED] px-3 py-2.5 text-[13px] leading-[1.5] text-[#B42320]">
                <span>{issueLabel(t, issue)}</span>
                <span className="ml-auto flex flex-wrap items-center gap-3">
                  {issue.key === 'belowMinimum' && (
                    <Button
                      type="button"
                      variant="link"
                      size="xs"
                      disabled
                      title={t('newDraftOrder.review.lines.overrideUnavailable')}
                      className={`${lineLinkClass} text-inherit underline`}
                    >
                      {t('newDraftOrder.review.lines.requestOverride')}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={() => onIssue(issue)}
                    className={`${lineLinkClass} text-inherit underline`}
                  >
                    {t('newDraftOrder.review.lines.fix')}
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Button
            type="button"
            variant="link"
            size="xs"
            onClick={() => goToStep('products')}
            className= {lineActionClass}
          >
            <Pencil size={14} strokeWidth={1.8} aria-hidden="true" />
            {t('newDraftOrder.review.lines.editProduct')}
          </Button>
          <Button
            type="button"
            variant="link"
            size="xs"
            onClick={() => goToStep('ship')}
            className={lineActionClass}
          >
            <Pencil size={14} strokeWidth={1.8} aria-hidden="true" />
            {t('newDraftOrder.review.lines.editShipTo')}
          </Button>
          {line.convertsWithLine ? (
            <span className="text-xs text-[#6B6B70]">
              {t('newDraftOrder.review.lines.convertsWith', {
                card: line.bundleCard,
                line: line.convertsWithLine,
              })}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}
