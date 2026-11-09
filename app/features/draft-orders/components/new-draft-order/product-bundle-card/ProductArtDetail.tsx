import {useState, type KeyboardEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {CloseIcon} from '../../icons/CloseIcon';
import {FileIcon} from '../../icons/FileIcon';
import {SparklesIcon} from '../../icons/SparklesIcon';
import {Button} from '~/shared/components/ui/Button';
import {
  DRAFT_ART_ARTIST_CHOICES,
  type DraftArt,
} from '../../../schemas/draft-product.schema';
import {BuilderTag, FieldLabel, builderInputClass} from '../BuilderFields';
import {
  OptField,
  OptSelect,
  metaClass,
  secondaryButtonClass,
  smallButtonClass,
  subHeadingClass,
} from './shared';

/** The ink-or-thread mode pills: the chosen one is solid, the other outlined. */
const inkModeClass = (selected: boolean) =>
  `inline-flex min-h-9 items-center rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
    selected
      ? 'border-[#111113] bg-[#111113] text-white'
      : 'border-[#ECECEE] bg-white text-[#5C5C61] hover:text-[#111113]'
  }`;

const PROCESS_CODES = ['P1', 'P2', 'P3', 'P4', 'X1', 'X2', 'X3', 'X4'] as const;

interface Props {
  uid: string;
  art: DraftArt;
  /** The garment's placement labels, from the store. */
  placements: string[];
  /** The garment's decoration methods, from the store. */
  methods: string[];
  onChange: (patch: Partial<DraftArt>) => void;
  text: (key: string, options?: Record<string, unknown>) => string;
}

/**
 * Prototype `briefHTML` (the art card and its brief): the selected mark's sku, its
 * Edit / Submit / vector buttons, and the brief fields. Options come from the
 * garment (placements, methods) or from the enums; the process prices and lead
 * times are not on the catalog yet, so the method menu shows the name only.
 */
export function ProductArtDetail({
  uid,
  art,
  placements,
  methods,
  onChange,
  text,
}: Props) {
  const {t: tEnums} = useTranslation('enums');
  const [ink, setInk] = useState('');
  const [pair, setPair] = useState({omit: '', add: ''});
  const field = (name: string) => `${uid}-${art.id}-${name}`;

  const placementOptions: [string, string][] = [
    ['', tEnums('artPlacement.match')],
    ...placements.map((label): [string, string] => [label, label]),
  ];
  const methodOptions: [string, string][] = [
    ['', text('briefNotSet')],
    ...methods.map((label): [string, string] => [label, label]),
  ];
  const codeOptions: [string, string][] = [
    ['', tEnums('processCode.none')],
    ...PROCESS_CODES.map((code): [string, string] => [
      code,
      tEnums(`processCode.${code}`),
    ]),
  ];
  const referOptions: [string, string][] = [
    ['', tEnums('referType.none')],
    ['art', tEnums('referType.art')],
    ['file', tEnums('referType.file')],
  ];
  const artistOptions: [string, string][] = DRAFT_ART_ARTIST_CHOICES.map(
    (choice): [string, string] => [choice, tEnums(`artistChoice.${choice}`)],
  );

  const addInk = () => {
    const name = ink.trim();
    if (!name) return;
    onChange({inks: [...art.inks, name]});
    setInk('');
  };
  const onInkKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addInk();
  };
  const addPair = () => {
    const omit = pair.omit.trim();
    const add = pair.add.trim();
    if (!omit && !add) return;
    onChange({swaps: [...art.swaps, {omit, add}]});
    setPair({omit: '', add: ''});
  };

  const inkSequence = art.inkMode === 'sequence';

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="self-start">
        <BuilderTag tone="neutral">{text('approval.customerNone')}</BuilderTag>
      </div>

      {/* The selected mark */}
      <div className="rounded-[14px] border border-[#ECECEE] bg-white p-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="size-14 flex-none overflow-hidden rounded-[10px] bg-[#F7F7F8]">
            {art.image && (
              <img
                src={art.image}
                alt=""
                loading="lazy"
                className="size-full object-contain"
              />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <b className="block truncate text-[15px] font-semibold text-[#111113]">
              {art.name}
            </b>
            <span className={metaClass}>
              {art.licensed
                ? text('artMetaLicensed', {sku: art.sku})
                : art.sku}
            </span>
          </div>
        </div>
        {/* ❓ TO CONFIRM — Edit with AI, the art production submit and the vector upload are not built yet */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            className={secondaryButtonClass}
          >
            <SparklesIcon size={14} className="text-[#C9A227]" />
            <span>{text('artEditWithAi')}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            className={secondaryButtonClass}
          >
            {text('artSubmitProduction')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            shape="square"
            disabled
            className={secondaryButtonClass}
          >
            <FileIcon size={14} />
            <span>{text('artAttachVector')}</span>
          </Button>
        </div>
      </div>

      {/* The brief */}
      <div className="flex min-w-0 flex-col gap-4 rounded-[14px] border border-[#ECECEE] bg-white p-4">
        <div className={subHeadingClass}>{text('brief', {name: art.name})}</div>

        <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 max-[759.98px]:grid-cols-1">
          <OptField id={field('placement')} label={text('briefPlacement')} help="">
            <OptSelect
              id={field('placement')}
              value={art.placement}
              options={placementOptions}
              onChange={(placement) => onChange({placement})}
              describedBy=""
            />
          </OptField>
          <OptField id={field('size')} label={text('briefSize')} help="">
            <input
              id={field('size')}
              type="text"
              value={art.artSize}
              placeholder={text('briefSizePlaceholder')}
              onChange={(event) => onChange({artSize: event.target.value})}
              className={builderInputClass}
            />
          </OptField>
          <OptField id={field('process')} label={text('briefProcess')} help="">
            <OptSelect
              id={field('process')}
              value={art.process}
              options={methodOptions}
              onChange={(process) => onChange({process})}
              describedBy=""
            />
          </OptField>
          <OptField id={field('code')} label={text('briefProcessCode')} help="">
            <OptSelect
              id={field('code')}
              value={art.processCode}
              options={codeOptions}
              onChange={(processCode) => onChange({processCode})}
              describedBy=""
            />
          </OptField>
          <OptField id={field('refer')} label={text('briefReferTo')} help="">
            <OptSelect
              id={field('refer')}
              value={art.referType}
              options={referOptions}
              onChange={(referType) =>
                onChange({referType: referType as DraftArt['referType']})
              }
              describedBy=""
            />
          </OptField>
          <OptField
            id={field('derives')}
            label={text('briefDerives')}
            help={text('briefDerivesHelp')}
          >
            <input
              id={field('derives')}
              type="text"
              value={art.referTo}
              placeholder={text('briefDerivesPlaceholder')}
              onChange={(event) => onChange({referTo: event.target.value})}
              className={builderInputClass}
            />
          </OptField>
        </div>

        {/* Ink or thread sequence */}
        <div className="flex min-w-0 flex-col gap-2">
          <FieldLabel as="span" id={field('ink')}>
            {text('briefInk')}
          </FieldLabel>
          <div
            role="radiogroup"
            aria-labelledby={field('ink')}
            className="flex flex-wrap gap-2"
          >
            <Button
              type="button"
              variant="ghost"
              shape="square"
              role="radio"
              aria-checked={inkSequence}
              onClick={() => onChange({inkMode: 'sequence'})}
              className={inkModeClass(inkSequence)}
            >
              {text('briefInkSequence')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              shape="square"
              role="radio"
              aria-checked={!inkSequence}
              onClick={() => onChange({inkMode: 'artist'})}
              className={inkModeClass(!inkSequence)}
            >
              {text('briefInkArtist')}
            </Button>
          </div>
          {inkSequence ? (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                {art.inks.map((name, index) => (
                  <span
                    key={`${index}-${name}`}
                    className="inline-flex min-h-8 items-center gap-1 rounded-full border border-[#D7D7DA] bg-white pr-1 pl-3 text-[12.5px] text-[#111113]"
                  >
                    {text('briefInkChip', {number: index + 1, name})}
                    <button
                      type="button"
                      aria-label={text('briefRemoveInk', {name})}
                      onClick={() =>
                        onChange({inks: art.inks.filter((_, k) => k !== index)})
                      }
                      className="inline-grid size-6 place-items-center rounded-full text-[#6B6B70] hover:bg-[#F3F3F4]"
                    >
                      <CloseIcon size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                id={field('ink-input')}
                type="text"
                value={ink}
                placeholder={text('briefInkPlaceholder')}
                aria-label={text('briefInkPlaceholder')}
                onChange={(event) => setInk(event.target.value)}
                onKeyDown={onInkKey}
                className={builderInputClass}
              />
              <span className={metaClass}>
                {art.inks.length
                  ? text('briefInkHelpSet')
                  : text('briefInkHelpEmpty')}
              </span>
            </>
          ) : (
            <>
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <div className="w-80 max-w-full">
                <OptSelect
                  id={field('artist')}
                  value={art.artistChoice}
                  options={artistOptions}
                  onChange={(artistChoice) =>
                    onChange({
                      artistChoice: artistChoice as DraftArt['artistChoice'],
                    })
                  }
                  describedBy=""
                />

                </div>
                <span className={metaClass}>{text('briefArtistHelp')}</span>
              </div>
            </>
          )}
        </div>

        {/* Adds and omits */}
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <FieldLabel as="span" id={field('pairs')}>
              {text('briefPairs')}
            </FieldLabel>
            <BuilderTag tone="neutral" className="normal-case tracking-normal text-[12.5px] font-medium">{text('briefOptional')}</BuilderTag>
          </div>
          {art.swaps.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {art.swaps.map((swap, index) => (
                <li
                  key={`${index}-${swap.omit}-${swap.add}`}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-[10px] bg-[#F7F7F8] px-3 py-2 text-[12.5px] text-[#111113]"
                >
                  <span className="min-w-0 truncate">
                    {swap.omit && swap.add
                      ? text('briefPairBoth', {omit: swap.omit, add: swap.add})
                      : swap.omit
                        ? text('briefPairOmit', {name: swap.omit})
                        : text('briefPairAdd', {name: swap.add})}
                  </span>
                  <button
                    type="button"
                    aria-label={text('briefRemovePair')}
                    onClick={() =>
                      onChange({swaps: art.swaps.filter((_, k) => k !== index)})
                    }
                    className="inline-grid size-6 flex-none place-items-center rounded-full text-[#6B6B70] hover:bg-[#F3F3F4]"
                  >
                    <CloseIcon size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="grid min-w-0 grid-cols-[1fr_auto_1fr_auto] items-center gap-2 max-[759.98px]:grid-cols-1">
            <input
              type="text"
              value={pair.omit}
              placeholder={text('briefOmit')}
              aria-label={text('briefOmit')}
              onChange={(event) => setPair({...pair, omit: event.target.value})}
              className={builderInputClass}
            />
            <span className="text-[13px] text-[#6B6B70]">{text('briefTo')}</span>
            <input
              type="text"
              value={pair.add}
              placeholder={text('briefAddInstead')}
              aria-label={text('briefAddInstead')}
              onChange={(event) => setPair({...pair, add: event.target.value})}
              className={builderInputClass}
            />
            <Button
              type="button"
              variant="ghost"
              shape="square"
              onClick={addPair}
              className={smallButtonClass}
            >
              {text('briefAddPair')}
            </Button>
          </div>
        </div>

        {/* Comment for the render and Art Design */}
        <div className="flex min-w-0 flex-col gap-2">
          <FieldLabel as="span" id={field('message')}>
            {text('briefMessage')}
          </FieldLabel>
          <textarea
            id={field('message')}
            rows={3}
            value={art.message}
            placeholder={text('briefMessagePlaceholder')}
            onChange={(event) => onChange({message: event.target.value})}
            className={`${builderInputClass} min-h-20 py-2.5`}
          />
        </div>
      </div>
    </div>
  );
}
