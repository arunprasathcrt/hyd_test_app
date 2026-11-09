import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {LayoutGridIcon} from '../../icons/LayoutGridIcon';
import {PlusIcon} from '../../icons/PlusIcon';
import {SparklesIcon} from '../../icons/SparklesIcon';
import {Button} from '~/shared/components/ui/Button';
import type {DraftArt} from '../../../schemas/draft-product.schema';
import {
  Fold,
  metaClass,
  secondaryButtonClass,
  segmentButtonClass,
  segmentTrackClass,
  smallButtonClass,
} from './shared';
import {FieldLabel} from '../BuilderFields';
import {ProductArtDetail} from './ProductArtDetail';

interface Props {
  uid: string;
  index: number;
  foldIds: {art: string; render: string};
  open: {art: boolean; render: boolean};
  onToggle: {art: () => void; render: () => void};
  arts: DraftArt[];
  /** The garment's placement labels and decoration methods, from the store. */
  placements: string[];
  methods: string[];
  onQuickPick: () => void;
  onChangeArt: (artId: string, patch: Partial<DraftArt>) => void;
  text: (key: string, options?: Record<string, unknown>) => string;
}

/**
 * Shown only for a garment that isn't blank: the Interface segmented control,
 * the Art and decoration fold (the tiles, then the selected mark's brief), the
 * design-team door, and the AI render fold.
 */
export function ProductArtSection({
  uid,
  index,
  foldIds,
  open,
  onToggle,
  arts,
  placements,
  methods,
  onQuickPick,
  onChangeArt,
  text,
}: Props) {
  const {t: tEnums} = useTranslation('enums');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = arts.find((art) => art.id === selectedId) ?? arts[0];
  const licensed = arts.some((art) => art.licensed);

  return (
    <>
      {/* `.do112c-tabs`: the Interface control */}
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        <FieldLabel as="span" id={`${uid}-interface`}>
          {text('interface')}
        </FieldLabel>
        <div
          role="group"
          aria-labelledby={`${uid}-interface`}
          className={segmentTrackClass}
        >
          <Button
            type="button"
            variant="ghost"
            shape="square"
            aria-pressed="true"
            className={segmentButtonClass(true)}
          >
            {text('interfaceGarmentArt')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            aria-pressed="false"
            className={segmentButtonClass(false)}
          >
            {text('interfaceArtOnly')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            aria-pressed="false"
            className={segmentButtonClass(false)}
          >
            {text('interfaceBlank')}
          </Button>
        </div>
      </div>

      {/* Art and decoration */}
      <Fold
        id={foldIds.art}
        title={text('art')}
        summary={
          arts.length
            ? licensed
              ? text('artSummaryLicensed', {count: arts.length})
              : text('artCount', {count: arts.length})
            : text('artSummaryNone')
        }
        open={open.art}
        onToggle={onToggle.art}
      >
        <div
          role="group"
          aria-label={text('artTilesLabel', {number: index + 1})}
          className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5 max-[599.98px]:grid-cols-2"
        >
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            className="relative flex min-h-28 flex-col items-start justify-center gap-1 rounded-[14px] border border-dashed border-[#D7D7DA] bg-[#F7F7F8] p-3 text-left text-[#111113] disabled:cursor-not-allowed"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-[10px] bg-white text-[#111113]">
              <PlusIcon size={18} />
            </span>
            <b className="max-w-full text-[13px] leading-[1.35] font-semibold">
              {text('newArtwork')}
            </b>
            <span className="max-w-full truncate text-xs font-normal leading-[1.4] text-[#6B6B70]">
              {text('newArtworkHint')}
            </span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            shape="square"
            onClick={onQuickPick}
            className="relative flex min-h-28 flex-col items-start justify-center gap-1 rounded-[14px] border border-dashed border-[#D7D7DA] bg-[#F7F7F8] p-3 text-left text-[#111113]"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-[10px] bg-white text-[#111113]">
              <LayoutGridIcon size={18} />
            </span>
            <b className="max-w-full text-[13px] leading-[1.35] font-semibold">
              {text('quickPick')}
            </b>
            <span className="max-w-full truncate text-xs font-normal leading-[1.4] text-[#6B6B70]">
              {text('quickPickHint')}
            </span>
          </Button>
          {/* One tile per mark Quick pick added, beside Quick pick */}
          {arts.map((art) => {
            const isSelected = art.id === selected?.id;
            return (
              <Button
                key={art.id}
                type="button"
                variant="ghost"
                shape="square"
                aria-pressed={isSelected}
                onClick={() => setSelectedId(art.id)}
                className={`relative flex min-h-28 flex-col items-start justify-end gap-1 rounded-[14px] bg-white p-3 text-left text-[#111113] ${
                  isSelected
                    ? 'border-2 border-[#111113]'
                    : 'border border-[#ECECEE] hover:border-[#D7D7DA]'
                }`}
              >
                <span className="flex h-16 w-full items-center justify-center overflow-hidden rounded-[10px] bg-[#F7F7F8]">
                  {art.image && (
                    <img
                      src={art.image}
                      alt=""
                      loading="lazy"
                      className="size-full object-contain"
                    />
                  )}
                </span>
                <b className="max-w-full truncate text-[13px] leading-[1.35] font-semibold">
                  {art.name}
                </b>
                <span className="max-w-full truncate text-xs font-normal leading-[1.4] text-[#6B6B70]">
                  {text('artTileMeta', {
                    sku: art.sku,
                    placement: art.placement || tEnums('artPlacement.match'),
                  })}
                </span>
              </Button>
            );
          })}
        </div>

        {selected ? (
          <ProductArtDetail
            key={selected.id}
            uid={uid}
            art={selected}
            placements={placements}
            methods={methods}
            onChange={(patch) => onChangeArt(selected.id, patch)}
            text={text}
          />
        ) : (
          <p className={metaClass}>{text('artEmpty')}</p>
        )}
      </Fold>

      {/* The design team door, under Art and decoration */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-t border-[#ECECEE] py-3.5">
        <p className="m-0 min-w-0 flex-1 text-[13px] leading-normal font-normal text-[#6B6B70]">
          {text('requestDesignHint')}
        </p>
        {/* ❓ TO CONFIRM — the design request sheet is not built yet */}
        <Button
          type="button"
          variant="ghost"
          shape="square"
          disabled
          className={smallButtonClass}
        >
          {text('requestDesign')}
        </Button>
      </div>

      {/* AI render */}
      <Fold
        id={foldIds.render}
        title={text('aiRender')}
        summary={text('renderSummary')}
        open={open.render}
        onToggle={onToggle.render}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-2">
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            className={secondaryButtonClass}
          >
            <SparklesIcon size={14} className="text-[#C9A227]" />
            <span>{text('renderWith')}</span>
          </Button>
          <span className={metaClass}>{text('renderHint')}</span>
        </div>
      </Fold>
    </>
  );
}
