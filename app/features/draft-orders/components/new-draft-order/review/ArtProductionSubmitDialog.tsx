import {useState, type FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {Check, ChevronDown, Search, Send, X} from 'lucide-react';
import {Dialog} from '@base-ui/react/dialog';
import {Popover as BasePopover} from '@base-ui/react/popover';
import {useFormContext, useWatch} from 'react-hook-form';
import {Button} from '~/shared/components/ui/Button';
import {CustomerApprovalGateDialog} from './CustomerApprovalGateDialog';
import type {NewDraftOrderValues, ShopifyStaffMembersData} from '../../../types/new-draft-order';

interface ArtProductionSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffMembersData?: ShopifyStaffMembersData;
  staffMembersLoading: boolean;
  onLoadStaffMembers: () => void;
  onRetryStaffMembers: () => void;
  customerName?: string;
  previewImage?: string;
  onConfirm: () => void;
}

export function ArtProductionSubmitDialog({
  open,
  onOpenChange,
  staffMembersData,
  staffMembersLoading,
  onLoadStaffMembers,
  onRetryStaffMembers,
  customerName,
  previewImage,
  onConfirm,
}: ArtProductionSubmitDialogProps) {
  const {t} = useTranslation('newDraftOrder');
  const {control, setValue} = useFormContext<NewDraftOrderValues>();
  const approver = useWatch({control, name: 'artApprover'}) ?? '';
  const proofReader = useWatch({control, name: 'proofReader'}) ?? '';
  const message = useWatch({control, name: 'artApproverMessage'}) ?? '';
  const [gateOpen, setGateOpen] = useState(false);
  const reviewerFields = [
    {
      key: 'approver',
      label: 'newDraftOrder.review.locks.submitDialog.approver',
      search: 'newDraftOrder.review.locks.submitDialog.searchApprover',
      value: approver,
      onChange: (value: string) => setValue('artApprover', value, {shouldDirty: true}),
    },
    {
      key: 'proofReader',
      label: 'newDraftOrder.review.locks.submitDialog.proofReader',
      search: 'newDraftOrder.review.locks.submitDialog.searchProofReader',
      value: proofReader,
      onChange: (value: string) => setValue('proofReader', value, {shouldDirty: true}),
    },
  ] as const;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onOpenChange(false);
    setGateOpen(true);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1200] bg-[rgba(17,17,19,.42)] transition-opacity duration-[220ms] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[1200] flex max-h-[calc(100dvh-32px)] w-[min(644px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[22px] border border-[#E7E7E9] bg-white font-sans text-[13px] leading-[1.5] text-[#111113] shadow-[0_24px_64px_rgba(17,17,19,.22)] transition-[opacity,scale] duration-[220ms] ease-[cubic-bezier(.22,1,.36,1)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#ECECEE] px-7 pt-6 pb-4 max-[720px]:px-4">
            <div className="min-w-0">
              <p className="m-0 text-[12px] leading-normal font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                {t('newDraftOrder.review.locks.submitDialog.eyebrow')}
              </p>
              <Dialog.Title className="mt-1 mb-1 text-[22px] leading-[1.3] font-semibold text-[#111113]">
                {t('newDraftOrder.review.locks.submitDialog.title')}
              </Dialog.Title>
              <Dialog.Description className="m-0 text-[13px] leading-[1.45] text-[#5C5C61]">
                {t('newDraftOrder.review.locks.submitDialog.description')}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={t('newDraftOrder.review.locks.submitDialog.close')}
              title={t('newDraftOrder.review.locks.submitDialog.close')}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#6B6B70] hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
            >
              <X aria-hidden="true" size={18} strokeWidth={1.8} />
            </Dialog.Close>
          </header>

          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-7 pt-5 pb-4 max-[720px]:px-4">
              <div className="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
                {reviewerFields.map((field) => (
                  <label key={field.key} className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[12px] font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                      {t(field.label)}
                    </span>
                    <StaffDropdown
                      staffMembers={staffMembersData?.staffMembers ?? []}
                      value={field.value}
                      onChange={field.onChange}
                      searchPlaceholder={t(field.search)}
                      noResultsLabel={t('newDraftOrder.review.locks.submitDialog.noStaffFound')}
                      optionCountLabel={t('newDraftOrder.review.locks.submitDialog.optionCount', {
                        count: staffMembersData?.staffMembers.length ?? 0,
                      })}
                      shopOwnerLabel={t('newDraftOrder.review.locks.submitDialog.shopOwner')}
                      currentUserLabel={t('newDraftOrder.review.locks.submitDialog.you')}
                      loading={staffMembersLoading}
                      loadError={Boolean(staffMembersData?.error)}
                      loadingLabel={t('newDraftOrder.review.locks.submitDialog.loadingStaff')}
                      loadErrorLabel={t('newDraftOrder.review.locks.submitDialog.staffLoadError')}
                      retryLabel={t('newDraftOrder.review.locks.submitDialog.retryStaff')}
                      onRetry={onRetryStaffMembers}
                    />
                  </label>
                ))}
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                  {t('newDraftOrder.review.locks.submitDialog.messageLabel')}
                </span>
                <textarea
                  rows={4}
                  value={message}
                  maxLength={2000}
                  onChange={(event) =>
                    setValue('artApproverMessage', event.target.value, {shouldDirty: true})
                  }
                  placeholder={t('newDraftOrder.review.locks.submitDialog.messagePlaceholder')}
                  className="w-full resize-y rounded-xl border border-[#D7D7DA] bg-white px-3 py-2.5 text-[13px] text-[#111113] placeholder:text-[#8E8E93] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
                />
              </label>

              <section className="pt-0.5">
                <h3 className="m-0 mb-2 text-[12px] font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
                  {t('newDraftOrder.review.locks.submitDialog.effectsTitle')}
                </h3>
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[13px] leading-[1.45] text-[#5C5C61]">
                  {(['locks', 'queues', 'quote', 'production'] as const).map((effect) => (
                    <li key={effect} className="flex items-start gap-2">
                      <Check
                        aria-hidden="true"
                        size={14}
                        strokeWidth={1.8}
                        className="mt-0.5 shrink-0 text-[#2E8B62]"
                      />
                      <span>{t(`newDraftOrder.review.locks.submitDialog.effects.${effect}`)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <footer className="flex shrink-0 items-center gap-2 border-t border-[#ECECEE] px-7 py-3 max-[560px]:px-4">
              <Button
                type="button"
                variant="outline"
                size="control"
                shape="md"
                onClick={() => onOpenChange(false)}
              >
                {t('newDraftOrder.review.locks.submitDialog.cancel')}
              </Button>
              <span className="flex-1" />
              <Button type="submit" variant="default" size="control" shape="md">
                <Send aria-hidden="true" size={16} strokeWidth={1.8} />
                {t('newDraftOrder.review.locks.submitDialog.submit')}
              </Button>
            </footer>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
      <CustomerApprovalGateDialog
        open={gateOpen}
        onOpenChange={setGateOpen}
        customerName={customerName}
        previewImage={previewImage}
        onConfirm={onConfirm}
      />
    </Dialog.Root>
  );
}

function StaffDropdown({
  staffMembers,
  value,
  onChange,
  searchPlaceholder,
  noResultsLabel,
  optionCountLabel,
  shopOwnerLabel,
  currentUserLabel,
  loading,
  loadError,
  loadingLabel,
  loadErrorLabel,
  retryLabel,
  onRetry,
}: {
  staffMembers: ShopifyStaffMembersData['staffMembers'];
  value: string;
  onChange: (value: string) => void;
  searchPlaceholder: string;
  noResultsLabel: string;
  optionCountLabel: string;
  shopOwnerLabel: string;
  currentUserLabel: string;
  loading: boolean;
  loadError: boolean;
  loadingLabel: string;
  loadErrorLabel: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const selected = staffMembers.find((staffMember) => staffMember.id === value);
  const selectedName = selected?.name ||
    [selected?.firstName, selected?.lastName].filter(Boolean).join(' ') ||
    value;
  const normalizedSearch = search.trim().toLowerCase();
  const filteredStaff = staffMembers.filter((staffMember) =>
    [staffMember.name, staffMember.firstName, staffMember.lastName, staffMember.email, staffMember.accountType]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch),
  );

  return (
    <BasePopover.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearch('');
      }}
    >
      <BasePopover.Trigger
        render={
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex h-[46px] w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#D7D7DA] bg-white px-3 text-left text-[13px] text-[#111113] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
          />
        }
      >
        <span className="truncate">{selectedName || searchPlaceholder}</span>
        <ChevronDown aria-hidden="true" size={16} className="shrink-0 text-[#6B6B70]" />
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner
          side="bottom"
          align="start"
          sideOffset={8}
          className="z-[1300] outline-none"
        >
          <BasePopover.Popup
            aria-label={searchPlaceholder}
            className="w-[min(408px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-[#E7E7E9] bg-white p-2 shadow-[0_16px_40px_rgba(17,17,19,.18)]"
          >
        <label className="flex h-11 items-center gap-2 rounded-xl border border-[#D7D7DA] px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#0E6E6E]">
          <Search aria-hidden="true" size={16} className="shrink-0 text-[#8E8E93]" />
          <input
            type="search"
            aria-label={searchPlaceholder}
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] outline-none placeholder:text-[#8E8E93]"
          />
        </label>
        <ul role="listbox" className="m-0 max-h-[300px] list-none overflow-y-auto p-0 pt-1.5">
          {loading ? (
            <li className="px-3 py-4 text-[13px] text-[#6B6B70]">{loadingLabel}</li>
          ) : loadError ? (
            <li className="flex items-center justify-between gap-3 px-3 py-4 text-[13px] text-[#6B6B70]">
              <span>{loadErrorLabel}</span>
              <button
                type="button"
                onClick={onRetry}
                className="shrink-0 font-medium text-[#111113] underline underline-offset-2"
              >
                {retryLabel}
              </button>
            </li>
          ) : filteredStaff.length ? filteredStaff.map((staffMember) => {
            const name = staffMember.name ||
              [staffMember.firstName, staffMember.lastName].filter(Boolean).join(' ');
            const details = [
              staffMember.accountType,
              staffMember.isShopOwner ? shopOwnerLabel : '',
              staffMember.email,
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <li key={staffMember.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === staffMember.id}
                  onClick={() => {
                    onChange(staffMember.id);
                    setOpen(false);
                  }}
                  className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#F7F7F8] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#0E6E6E] aria-selected:bg-[#F7F7F8]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-[#222226]">
                      {name}
                      {staffMember.isCurrent && (
                        <span className="ml-2 rounded-full bg-[#F2F2F3] px-2 py-0.5 text-[11px] font-medium text-[#5C5C61]">
                          {currentUserLabel}
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-[12px] text-[#6B6B70]">{details}</span>
                  </span>
                  {value === staffMember.id && <Check aria-hidden="true" size={16} />}
                </button>
              </li>
            );
          }) : (
            <li className="px-3 py-4 text-[13px] text-[#6B6B70]">{noResultsLabel}</li>
          )}
        </ul>
        <div className="border-t border-[#ECECEE] px-3 pt-2 text-[12px] text-[#8E8E93]">
          {optionCountLabel}
        </div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}