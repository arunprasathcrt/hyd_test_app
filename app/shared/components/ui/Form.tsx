import * as React from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import {cn} from '~/shared/utils/cn';

const Form = FormProvider;

const FormFieldContext = React.createContext<{name: string} | null>(null);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({...props}: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{name: props.name as string}}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

function useFormField() {
  const context = React.useContext(FormFieldContext);
  const {getFieldState, formState} = useFormContext();

  if (!context) {
    throw new Error('useFormField must be used within <FormField>');
  }

  const fieldState = getFieldState(context.name, formState);

  return {
    name: context.name,
    error: fieldState.error,
    invalid: fieldState.invalid,
    isDirty: fieldState.isDirty,
    isTouched: fieldState.isTouched,
  };
}

function FormItem({className, ...props}: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-1.5', className)} {...props} />;
}

function FormControl({className, ...props}: React.ComponentProps<'div'>) {
  return <div className={cn(className)} {...props} />;
}

function FormMessage({className, ...props}: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('m-0 text-xs leading-normal text-[#A02020]', className)}
      {...props}
    />
  );
}

export {Form, FormField, FormItem, FormControl, FormMessage, useFormField};