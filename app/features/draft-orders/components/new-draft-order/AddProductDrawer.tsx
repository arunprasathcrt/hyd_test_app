import {useTranslation} from 'react-i18next';
import {Dialog} from '~/shared/components/product';
import {Button} from '~/shared/components/ui/Button';
import {CopyIcon} from '../icons/CopyIcon';
import {KeyboardIcon} from '../icons/KeyboardIcon';
import {ShirtIcon} from '../icons/ShirtIcon';
 
// The reference uses a tapered body and an arched handle, without a lid or slots.
function PickProductsIcon({size = 20}: {size?: number}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 7h12l-1.2 14H7.2L6 7Z" />
      <path d="M9 7V6a3 3 0 0 1 6 0v1" />
    </svg>
  );
}
 
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineNumber: number;
  onStart: (query: string) => void;
  onPickProducts: () => void;
}
 
export function AddProductDrawer({
  open,
  onOpenChange,
  lineNumber,
  onStart,
  onPickProducts,
}: Props) {
  const {t} = useTranslation('newDraftOrder');
  const text = (key: string, options?: Record<string, unknown>) =>
    t(`newDraftOrder.products.${key}`, options);
 
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      sheet
      contentClassName="max-w-[600px]"
      title={text('add')}
      footer={
        <Button
          type="button"
          variant="outline"
          size="control"
          shape="md"
          onClick={() => onOpenChange(false)}
          className="ml-auto cursor-pointer text-sm leading-5 font-medium"
        >
          {text('cancel')}
        </Button>
      }
    >
      <p className="mb-2 flex items-center gap-2 text-xs leading-4 font-medium tracking-[0.06em] text-[#6B6B70] uppercase">
        <span className="size-2 rounded-full bg-[#111113]" aria-hidden="true" />
        {text('drawerLine', {number: lineNumber})}
      </p>
      <p className="mt-1.5 text-sm leading-5 font-normal text-[#5C5C61]">
        {text('addDescription')}
      </p>
      <div className="mt-4 space-y-2.5">
        {[
          {
            title: 'newBundle',
            description: 'newBundleDescription',
            Icon: ShirtIcon,
            onClick: () => onStart(''),
          },
          {
            title: 'reuseBundle',
            description: 'reuseBundleDescription',
            Icon: CopyIcon,
            onClick: undefined,
          },
          {
            title: 'pick',
            description: 'pickDescription',
            Icon: PickProductsIcon,
            onClick: onPickProducts,
          },
        ].map(({title, description, Icon, onClick}) => (
          <Button
            key={title}
            type="button"
            variant="outline"
            size="default"
            shape="lg"
            disabled={!onClick}
            onClick={onClick}
            className="flex w-full min-w-0 justify-start cursor-pointer items-center gap-3.5 rounded-[14px] border-[#E7E7EA] bg-white p-4 text-left font-normal hover:bg-[#FAFAFA] focus-visible:outline-[#0E6E6E] data-disabled:cursor-not-allowed"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F7F7F8]">
              <Icon size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0 whitespace-normal [overflow-wrap:anywhere]">
              <b className="block text-sm leading-5 font-semibold tracking-normal text-[#111113]">
                {text(title)}
              </b>
              <span className="mt-0.5 block text-[13px] leading-[18px] font-normal tracking-normal text-[#5C5C61]">
                {text(description)}
              </span>
            </span>
          </Button>
        ))}
      </div>
      <div className="mt-[18px] flex flex-wrap gap-2.5">
        <Button
          type="button"
          variant="outline"
          size="control"
          shape="md"
          disabled
          className="text-sm leading-5 font-medium data-disabled:opacity-100"
        >
          <KeyboardIcon size={18} aria-hidden="true" />
          {text('tabQuickEntry')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="control"
          shape="md"
          disabled
          className="text-sm leading-5 font-medium data-disabled:opacity-100"
        >
          <span className="text-[#C99A19]" aria-hidden="true">
            ✦
          </span>
          {text('startWithAi')}
        </Button>
      </div>
    </Dialog>
  );
}
