import {useTranslation} from 'react-i18next';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';
import {issueLabel} from '../../lib/new-draft-order';
import type {DraftOrderIssue} from '../../types/new-draft-order';

interface Props {
  stepIssues: DraftOrderIssue[];
  /** Set when the rep tried to move on with blocking issues. */
  hardStop: boolean;
  onIssue: (issue: DraftOrderIssue) => void;
}

/** The current step's "needs attention" banner (prototype `#do112.missing`). */
export function DraftOrderIssuesBanner({stepIssues, hardStop, onIssue}: Props) {
  const {t} = useTranslation('newDraftOrder');

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('mb-4 min-w-0', !stepIssues.length && 'hidden')}
    >
      {stepIssues.length ? (
        <div
          className={cn(
            'flex flex-col gap-1 rounded-[10px] px-3 py-2.5 text-[12.5px] leading-[1.5]',
            stepIssues.some((issue) => issue.severity === 'block')
              ? 'bg-[#FFF6E5] text-[#6B4A0B]'
              : 'bg-[#F7F7F8] text-[#5C5C61]',
          )}
        >
          <b className="text-[13px] font-semibold">
            {t('newDraftOrder.missing.title', {
              count: stepIssues.length,
            })}
          </b>
          <span>{t('newDraftOrder.missing.body')}</span>
          {hardStop && (
            <span role="alert" className="font-semibold">
              {t('newDraftOrder.missing.hardStop')}
            </span>
          )}
          <ul className="m-0 mt-0.5 flex list-none flex-wrap gap-x-3 gap-y-0.5 p-0">
            {stepIssues.map((issue) => (
              <li key={issue.id}>
                <Button
                  type="button"
                  variant="link"
                  size="default"
                  shape="square"
                  onClick={() => onIssue(issue)}
                  className="min-h-7 cursor-pointer justify-start border-0 bg-transparent p-0 text-left text-[12.5px] font-normal text-inherit underline underline-offset-2 focus-visible:rounded-[3px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E] pointer-coarse:min-h-10"
                >
                  {issueLabel(t, issue)}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
