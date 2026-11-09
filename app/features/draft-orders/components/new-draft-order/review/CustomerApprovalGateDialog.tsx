import {useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Dialog} from '@base-ui/react/dialog';
import {Button} from '~/shared/components/ui/Button';

type ApprovalMethod = 'email' | 'call' | 'inPerson' | 'textPortal';

interface CustomerApprovalGateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName?: string;
  previewImage?: string;
  onConfirm: () => void;
}

const approvalMethods: Array<{value: ApprovalMethod; label: string}> = [
  {value: 'email', label: 'newDraftOrder.review.locks.approvalGate.methods.email'},
  {value: 'call', label: 'newDraftOrder.review.locks.approvalGate.methods.call'},
  {value: 'inPerson', label: 'newDraftOrder.review.locks.approvalGate.methods.inPerson'},
  {value: 'textPortal', label: 'newDraftOrder.review.locks.approvalGate.methods.textPortal'},
];

export function CustomerApprovalGateDialog({
  open,
  onOpenChange,
  customerName,
  previewImage,
  onConfirm,
}: CustomerApprovalGateDialogProps) {
  const {t} = useTranslation('newDraftOrder');
  const [sameDesign, setSameDesign] = useState(false);
  const [noChanges, setNoChanges] = useState(false);
  const [method, setMethod] = useState<ApprovalMethod | ''>('');
  const [reference, setReference] = useState('');
  const canConfirm = sameDesign && noChanges && method !== '';

  const confirm = () => {
    if (!canConfirm) return;
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[1200] bg-[rgba(17,17,19,.42)] transition-opacity duration-[220ms] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[1200] flex max-h-[calc(100dvh-32px)] w-[min(648px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-3.5 overflow-y-auto rounded-[24px] border border-[#E7E7E9] bg-white p-7 font-sans text-[13px] leading-[1.5] text-[#111113] shadow-[0_24px_64px_rgba(17,17,19,.22)] transition-[opacity,scale] duration-[220ms] ease-[cubic-bezier(.22,1,.36,1)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 max-[560px]:p-4">
          <Dialog.Title className="m-0 text-[22px] leading-[1.3] font-semibold text-[#111113]">
            {t('newDraftOrder.review.locks.approvalGate.title')}
          </Dialog.Title>
          <Dialog.Description className="m-0 text-[13px] leading-[1.5] text-[#5C5C61]">
            <Trans
              ns="newDraftOrder"
              i18nKey="newDraftOrder.review.locks.approvalGate.description"
              values={{customer: customerName || t('newDraftOrder.review.locks.approvalGate.customerFallback')}}
              components={{strong: <strong className="font-semibold text-[#45454A]" />}}
            />
          </Dialog.Description>

          {previewImage && (
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-xl bg-[#F5F5F6]">
              <img src={previewImage} alt="" className="size-full object-cover" />
            </div>
          )}

          <label className="flex min-h-[74px] cursor-pointer items-start gap-3 rounded-[14px] border border-[#ECECEE] px-4 py-3.5">
            <input
              type="checkbox"
              checked={sameDesign}
              onChange={(event) => setSameDesign(event.target.checked)}
              className="mt-0.5 size-[21px] shrink-0 accent-[#1A1A1A]"
            />
            <span className="text-[13px] leading-[1.5] text-[#222226]">
              {t('newDraftOrder.review.locks.approvalGate.sameDesign')}
            </span>
          </label>

          <label className="flex min-h-[53px] cursor-pointer items-center gap-3 rounded-[14px] border border-[#ECECEE] px-4 py-3">
            <input
              type="checkbox"
              checked={noChanges}
              onChange={(event) => setNoChanges(event.target.checked)}
              className="size-[21px] shrink-0 accent-[#1A1A1A]"
            />
            <span className="text-[13px] leading-[1.5] text-[#222226]">
              {t('newDraftOrder.review.locks.approvalGate.noChanges')}
            </span>
          </label>

          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="mb-2 text-[13px] font-medium text-[#222226]">
              {t('newDraftOrder.review.locks.approvalGate.howTitle')}
            </legend>
            <div className="flex flex-wrap gap-2">
              {approvalMethods.map((approvalMethod) => (
                <label key={approvalMethod.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="customer-approval-method"
                    value={approvalMethod.value}
                    checked={method === approvalMethod.value}
                    onChange={() => setMethod(approvalMethod.value)}
                    className="peer sr-only"
                  />
                  <span className="inline-flex min-h-[46px] items-center rounded-full border border-[#ECECEE] px-4 text-[13px] text-[#222226] peer-checked:border-[#1A1A1A] peer-checked:bg-[#F7F7F8] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#0E6E6E]">
                    {t(approvalMethod.label)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label htmlFor="customer-approval-reference" className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[#6B6B70]">
              {t('newDraftOrder.review.locks.approvalGate.referenceLabel')}{' '}
              <span className="text-[#8E8E93]">
                {t('newDraftOrder.review.locks.approvalGate.optional')}
              </span>
            </span>
            <input
              id="customer-approval-reference"
              type="text"
              maxLength={200}
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder={t('newDraftOrder.review.locks.approvalGate.referencePlaceholder')}
              className="h-11 w-full rounded-xl border border-[#D7D7DA] bg-white px-3 text-[13px] text-[#111113] placeholder:text-[#8E8E93] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0E6E6E]"
            />
          </label>

          <footer className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="link"
              size="small"
              shape="md"
              onClick={() => onOpenChange(false)}
              className="mr-auto underline"
            >
              {t('newDraftOrder.review.locks.approvalGate.cancel')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="control"
              shape="pill"
              onClick={() => onOpenChange(false)}
            >
              {t('newDraftOrder.review.locks.approvalGate.sendForApproval')}
            </Button>
            <Button
              type="button"
              variant="default"
              size="control"
              shape="pill"
              disabled={!canConfirm}
              aria-disabled={!canConfirm}
              onClick={confirm}
            >
              {t('newDraftOrder.review.locks.approvalGate.confirm')}
            </Button>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}