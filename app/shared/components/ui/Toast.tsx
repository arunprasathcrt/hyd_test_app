import {Toast as ToastPrimitive} from '@base-ui/react/toast';
import {XIcon} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Button} from '~/shared/components/ui/Button';
import {cn} from '~/shared/utils/cn';

/**
 * App-wide toast manager. Holds no request data — toasts are only added from
 * client event handlers — so a module-level instance is safe on the server.
 *
 * @example
 * // Success notification with auto-dismiss
 * const {t} = useTranslation('accounts');
 * toast.add({title: t('actions.saved'), type: 'success', timeout: 1500});
 *
 * @example
 * // Error with action button
 * toast.add({
 *   title: t('errors.uploadFailed'),
 *   description: t('errors.tryAgain'),
 *   type: 'error',
 *   action: {label: t('common.retry'), onClick: () => retryUpload()}
 * });
 */
const toast = ToastPrimitive.createToastManager();

/** Per-toast extras: `className` lets one caller restyle its own toast without touching the rest. */
type ToastData = {className?: string};

function ToastProvider({...props}: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal({...props}: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />;
}

/** Stack anchored to the bottom center of the viewport. */
function ToastViewport({className, ...props}: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-4 z-[1300] mx-auto w-auto max-w-[320px] outline-none',
        className,
      )}
      {...props}
    />
  );
}

function Toast({className, ...props}: ToastPrimitive.Root.Props) {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        'group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-xl bg-[#111113] text-utds-inverse shadow-[0_10px_30px_rgba(17,17,19,0.24)] will-change-transform outline-none select-none focus-visible:ring-[3px] focus-visible:ring-[#0E6E6E]/50',
        '[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]',
        'h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]',
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        'data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
        'data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]',
        '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]',
        'data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        'data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        'data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        'data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
        'data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        className,
      )}
      {...props}
    />
  );
}

/** Container for toast content; automatically manages layout and visibility. */
function ToastContent({className, ...props}: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        'flex h-full items-center gap-3 overflow-hidden px-3.5 py-2.5 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100',
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({className, ...props}: ToastPrimitive.Title.Props) {
  return <ToastPrimitive.Title data-slot="toast-title" className={cn('text-[13px] font-normal leading-[1.5]', className)} {...props} />;
}

/** Optional secondary message, displayed below the title with reduced opacity. */
function ToastDescription({className, ...props}: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn('text-sm text-utds-inverse/70', className)}
      {...props}
    />
  );
}

/** Optional action shown on the right as an underlined text link on the ink toast. */
function ToastAction({className, ...props}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(
        'min-h-7 shrink-0 cursor-pointer border-0 bg-transparent px-1 text-[13px] font-semibold text-white underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
        className,
      )}
      {...props}
    />
  );
}

/** Dismiss button with built-in X icon and hover styling. */
function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon" className="size-7 max-sm:size-7" />,
  ...props
}: ToastPrimitive.Close.Props) {
  const {t} = useTranslation('common');

  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label={t('toast.close')}
      render={render}
      className={cn(
        "relative shrink-0 text-utds-secondary after:absolute after:-inset-2 after:content-[''] hover:text-utds-ink",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" size={16} />}
    </ToastPrimitive.Close>
  );
}


function ToastList() {
  const {toasts} = ToastPrimitive.useToastManager<ToastData>();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem} className={toastItem.data?.className}>
      <ToastContent>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
      </ToastContent>
    </Toast>
  ));
}

/**
 * App-wide toast provider. Mount once in the root component, then call `toast.add(...)`
 * from anywhere in the app to display notifications.
 *
 * Toasts stack vertically at the bottom center of the viewport and auto-dismiss
 * after a configurable timeout. Supports success, error, warning, and info types.
 *
 * @example
 * // In root.tsx
 * import {Toaster, toast} from '~/shared/components/ui/Toast';
 *
 * export default function Root() {
 *   return (
 *     <Toaster>
 *       <Outlet />
 *     </Toaster>
 *   );
 * }
 *
 * @example
 * // In a component or action
 * toast.add({
 *   title: t('actions.saved'),
 *   type: 'success',
 *   timeout: 1500
 * });
 */
function Toaster({children, toastManager = toast, ...props}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
};
