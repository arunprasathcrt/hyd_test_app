import {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from '~/shared/components/ui/Button';
import {Dialog} from '../../../shared/components/product';
import type {PresentationCustomer} from '~/features/presentations/types/presentations';
import type {SavedCollectionForm} from '../schemas/saved-collection.schema';
import {savedCollectionFormSchema} from '../schemas/saved-collection.schema';

export interface SaveCollectionItem {
  id: string;
  name: string;
  image: string;
}

interface SaveCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SaveCollectionItem[];
  /** The fetched accounts; each one is an option in the Customer dropdown. */
  customers: PresentationCustomer[];
  pending: boolean;
  onSubmit: (values: SavedCollectionForm) => void;
}

const labelClass =
  'mb-1.5 block text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]';

const controlClass =
  'h-10 w-full rounded-[10px] border border-[#D7D7DA] bg-white px-3 text-[13.5px] text-[#111113] transition-[border-color,box-shadow] duration-150 hover:border-[#C4C4C8] focus:border-[#6B6B70] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0E6E6E]';

/**
 * Prototype "New collection" sheet: the selected styles, a name that starts as
 * "Collection · <date>", an optional customer, Cancel and Save collection.
 * Served via: `$app` collection metafield `custom.customer` (company reference).
 */
export function SaveCollectionDialog({
  open,
  onOpenChange,
  items,
  customers,
  pending,
  onSubmit,
}: SaveCollectionDialogProps) {
  const {t} = useTranslation('products');
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('saveCollection.title')}
      hideHeader
      overlayClassName="bg-[rgba(17,17,19,.42)]"
      bodyClassName="p-6"
      contentClassName="max-w-[560px] rounded-[20px] shadow-[0_30px_80px_rgba(17,17,19,.28)]"
    >
      <SaveCollectionForm
        items={items}
        customers={customers}
        pending={pending}
        onCancel={() => onOpenChange(false)}
        onSubmit={onSubmit}
      />
    </Dialog>
  );
}

function SaveCollectionForm({
  items,
  customers,
  pending,
  onCancel,
  onSubmit,
}: Omit<SaveCollectionDialogProps, 'open' | 'onOpenChange'> & {
  onCancel: () => void;
}) {
  const {t} = useTranslation('products');
  const nameRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<SavedCollectionForm>({
    resolver: zodResolver(savedCollectionFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: t('saveCollection.defaultName', {
        date: new Date(),
        formatParams: {date: {month: 'short', day: 'numeric'}},
      }),
      customer: '',
    },
  });
  const {ref: registerRef, ...nameField} = form.register('name');
  const nameError = form.formState.errors.name?.message;

  // The suggested name arrives focused and selected, so typing replaces it.
  useEffect(() => {
    nameRef.current?.focus();
    nameRef.current?.select();
  }, []);

  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        void form.handleSubmit(onSubmit)(event);
      }}
    >
      <h2 className="mr-11 m-0 text-xl font-semibold tracking-[-0.015em] text-[#111113]">
        {t('saveCollection.title')}
      </h2>
      <p className="mt-1 text-[13px] leading-[1.5] text-[#5C5C61]">
        {t('saveCollection.description', {count: items.length})}
      </p>

      <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
        {items.map((item) => (
          <li
            key={item.id}
            title={item.name}
            className="size-[42px] overflow-hidden rounded-[10px] border border-[#ECECEE] bg-[#F7F7F8]"
          >
            {item.image && (
              <img
                src={item.image}
                alt=""
                width={42}
                height={42}
                loading="lazy"
                className="size-full object-contain"
              />
            )}
          </li>
        ))}
      </ul>

      <label htmlFor="save-collection-name" className={`${labelClass} mt-[18px]`}>
        {t('saveCollection.nameLabel')}
      </label>
      <input
        id="save-collection-name"
        {...nameField}
        ref={(node) => {
          registerRef(node);
          nameRef.current = node;
        }}
        maxLength={100}
        aria-invalid={Boolean(nameError)}
        className={controlClass}
      />
      {nameError && (
        <p role="alert" className="mt-1.5 text-xs text-mf-terra">
          {t(nameError)}
        </p>
      )}

      <label htmlFor="save-collection-customer" className={`${labelClass} mt-[18px]`}>
        {t('saveCollection.customerLabel')}
      </label>
      <select
        id="save-collection-customer"
        {...form.register('customer')}
        className={controlClass}
      >
        <option value="">{t('saveCollection.noCustomer')}</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </select>

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" size="control" shape="md" onClick={onCancel}>
          {t('form.cancel')}
        </Button>
        <Button
          type="submit"
          size="control"
          shape="md"
          disabled={!form.formState.isValid || pending}
        >
          {pending ? t('form.pending') : t('saveCollection.save')}
        </Button>
      </div>
    </form>
  );
}
