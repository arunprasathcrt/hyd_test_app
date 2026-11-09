import {useTranslation} from 'react-i18next';
import {Button} from '~/shared/components/ui/Button';
import {BuilderTag} from './BuilderFields';
import {ChevronDownIcon} from '../icons/ChevronDownIcon';
import type {DraftOrderIssue} from '../../types/new-draft-order';

interface Props {
  overviewId: string;
  overviewOpen: boolean;
  onOpen: () => void;
  totalUnits: number;
  totalMoney: number;
  issues: DraftOrderIssue[];
}

/**
 * The sticky mobile-only summary bar (prototype: under 1200px, opens the
 * overview sheet). Hidden at `min-[1200px]` where the sidebar overview shows instead.
 */
export function DraftOrderSummaryBar({
  overviewId,
  overviewOpen,
  onOpen,
  totalUnits,
  totalMoney,
  issues,
}: Props) {
  const {t} = useTranslation('newDraftOrder');

  return (
    <div className="sticky top-0 z-[70] mb-4 hidden bg-white py-1.5 max-[1199.98px]:block">
      <Button
        type="button"
        variant="outline"
        size="default"
        shape="lg"
        aria-haspopup="dialog"
        aria-expanded={overviewOpen}
        aria-controls={overviewId}
        onClick={onOpen}
        className="flex min-h-11 w-full cursor-pointer flex-wrap items-center justify-start gap-x-3 gap-y-2 px-3 py-1.5 text-left text-[12.5px] font-medium"
      >
        <b className="text-[13px] font-semibold text-[#111113]">
          {t('newDraftOrder.sumbar.title')}
        </b>
        <span className="font-semibold text-[#111113] tabular-nums">
          {t('newDraftOrder.overview.money', {value: totalMoney})}
        </span>
        <span>
          {t('newDraftOrder.overview.units', {count: totalUnits})}
        </span>
        <BuilderTag tone="neutral">
          {t('newDraftOrder.status.draft')}
        </BuilderTag>
        {issues.length ? (
          <span
            aria-label={t('newDraftOrder.sumbar.attention', {
              count: issues.length,
            })}
            className="box-border inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#111113] px-[5px] text-xs font-semibold text-white tabular-nums"
          >
            {issues.length}
          </span>
        ) : null}
        <ChevronDownIcon className="ml-auto text-[#8E8E93]" />
      </Button>
    </div>
  );
}
