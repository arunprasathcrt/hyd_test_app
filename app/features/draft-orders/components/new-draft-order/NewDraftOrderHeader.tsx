import {Link} from 'react-router';
import {useTranslation} from 'react-i18next';
import {ROUTES} from '~/shared/constants/routes';
import {isoDayToDate} from '../../lib/new-draft-order';
import type {DraftOrderListStatus} from '../../types/draft-order';

interface Props {
  customerName: string;
  /** Set when an existing draft is open; replaces the "New Draft Order" title. */
  orderId?: string;
  status?: DraftOrderListStatus;
  version: number;
  validUntil: string;
}

/**
 * Prototype `.do112-top .page-header`: the back eyebrow, the title, the
 * customer · status · version · expiry line, and the header actions.
 *
 * The prototype keeps Add line, Save draft and Send in the DOM but hides them
 * here (Save and Send live in the footer, Add line shows on Products only), so
 * only Create with AI renders.
 */
export function NewDraftOrderHeader({
  customerName,
  orderId,
  status,
  version,
  validUntil,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const {t: tList} = useTranslation('draftOrders');

  return (
    <div className="m-0 mb-2.5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pt-0.5 max-[768px]:mb-3.5 max-[759.98px]:gap-2.5">
      <div className="min-w-0 flex-[1_1_300px] max-[759.98px]:basis-full">
        <Link
          to={ROUTES.draftOrders}
          className="mb-1.5 -ml-1.5 inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-[9px] pr-2.5 pl-1.5 text-[12.5px] leading-normal font-medium text-[#5C5C61] no-underline before:mr-2 before:block before:size-1.5 before:rotate-45 before:border-b-2 before:border-l-2 before:border-current before:content-[''] hover:bg-[#F7F7F8] hover:text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
        >
          {t('newDraftOrder.page.eyebrow')}
        </Link>

        <h1 className="mx-0 my-0.5 text-[20px] leading-[1.3] font-semibold tracking-[-0.015em] text-[#111113]">
          {orderId ?? t('newDraftOrder.page.title')}
        </h1>

        <p className="m-0 max-w-[640px] text-[13px] leading-normal text-[#5C5C61]">
          {customerName}
          {' · '}
          <span className="inline-flex min-h-[22px] items-center gap-1.5 rounded-full bg-[#F7F7F8] px-2 align-middle text-xs leading-[1.2] font-medium whitespace-nowrap before:block before:size-1.5 before:rounded-full before:bg-current before:content-['']">
            {status
              ? tList(`draftOrders.page.list.statuses.${status}`)
              : t('newDraftOrder.status.draft')}
          </span>
          {' · '}
          {t('newDraftOrder.page.subtitle.version', {version})}
          {' · '}
          {t('newDraftOrder.page.subtitle.expires', {date: isoDayToDate(validUntil)})}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 max-[759.98px]:-m-1 max-[759.98px]:max-w-full max-[759.98px]:flex-nowrap max-[759.98px]:justify-start max-[759.98px]:overflow-x-auto max-[759.98px]:p-1">
        <button
          type="button"
          disabled
          className="disabled:cursor-not-allowed disabled:opacity-45 ml-2 inline-flex min-h-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[9px] border border-[#D7D7DA] bg-white px-3 text-[12.5px] leading-[1.2] font-medium whitespace-nowrap text-[#111113] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E] pointer-coarse:min-h-10"
        >
          <span aria-hidden="true" className="text-[#C9A227]">
            ✦
          </span>
          {t('newDraftOrder.page.actions.createWithAi')}
        </button>
      </div>
    </div>
  );
}
