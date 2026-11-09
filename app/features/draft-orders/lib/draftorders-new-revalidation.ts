import type {ShouldRevalidateFunction} from 'react-router';
import {ROUTES, stripDataSuffix} from '~/shared/constants/routes';

/** Save returns the draft ID; the mounted editor already owns its current values. */
export function isCompletedDraftSave({
  formMethod,
  formAction,
  actionResult,
  currentUrl,
  nextUrl,
}: Parameters<ShouldRevalidateFunction>[0]): boolean {
  if (
    formMethod?.toUpperCase() !== 'POST' ||
    !formAction ||
    currentUrl.href !== nextUrl.href ||
    currentUrl.pathname !== ROUTES.draftOrdersNew ||
    stripDataSuffix(new URL(formAction, currentUrl).pathname) !== ROUTES.draftOrdersNew
  ) return false;

  return actionResult?.ok === true &&
    typeof actionResult.draft?.orderId === 'string' &&
    actionResult.draft.orderId.length > 0;
}
