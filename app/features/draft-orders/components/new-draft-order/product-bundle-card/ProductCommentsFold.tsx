import type {DraftProduct} from '../../../schemas/draft-product.schema';
import {builderInputClass, BuilderTag, FieldLabel} from '../BuilderFields';
import {cn} from '~/shared/utils/cn';
import {DOC_KEYS, Fold, metaClass} from './shared';

interface Props {
  uid: string;
  notes: DraftProduct['notes'];
  shipExact: boolean;
  noteCount: number;
  open: boolean;
  onToggle: () => void;
  foldId: string;
  onChangeNote: (doc: (typeof DOC_KEYS)[number], value: string) => void;
  onChangeShipExact: (value: boolean) => void;
  text: (key: string, options?: Record<string, unknown>) => string;
}

/** `.u116a-cmts`: the comments fold, one textarea per document type. */
export function ProductCommentsFold({
  uid,
  notes,
  shipExact,
  noteCount,
  open,
  onToggle,
  foldId,
  onChangeNote,
  onChangeShipExact,
  text,
}: Props) {
  return (
    <Fold
      id={foldId}
      title={text('comments')}
      summary={noteCount ? text('noteCount', {count: noteCount}) : text('summaryNone')}
      open={open}
      onToggle={onToggle}
    >
      <div className="flex flex-col gap-3.5">
        {DOC_KEYS.map((doc) => (
          <div key={doc} className="flex min-w-0 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <FieldLabel htmlFor={`${uid}-doc-${doc}`}>
                {text(`docs.${doc}.label`)}
              </FieldLabel>
              <BuilderTag tone="neutral">{text(`docs.${doc}.tag`)}</BuilderTag>
              {doc === 'mfg' && (
                <label className="inline-flex min-h-7 cursor-pointer items-center gap-1.5 text-[12.5px] text-[#5C5C61]">
                  <input
                    type="checkbox"
                    checked={shipExact}
                    onChange={(event) => onChangeShipExact(event.target.checked)}
                    className="m-0 size-5 accent-[#111113]"
                  />
                  <span>{text('shipExact')}</span>
                </label>
              )}
            </div>
            <textarea
              id={`${uid}-doc-${doc}`}
              rows={2}
              maxLength={2000}
              placeholder={text(`docs.${doc}.placeholder`)}
              value={notes[doc]}
              onChange={(event) => onChangeNote(doc, event.target.value)}
              className={cn(builderInputClass, 'min-h-16 resize-y py-[9px] leading-[1.4]')}
            />
          </div>
        ))}
        <p className={metaClass}>{text('commentsNote')}</p>
      </div>
    </Fold>
  );
}
