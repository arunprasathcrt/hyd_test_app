import {forwardRef} from 'react';
import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '~/shared/utils/cn';

export const inputVariants = cva(
  'box-border border border-[#C4C4C8] w-full min-w-0 border bg-white text-[#111113] placeholder:text-[#6B6B70] placeholder:opacity-100 transition-[border-color,box-shadow] duration-150 hover:border-[#C4C4C8] focus:border-[#6B6B70] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0E6E6E] disabled:cursor-not-allowed disabled:bg-[#F7F7F8] disabled:text-[#5C5C61] aria-invalid:border-[#A02020]',
  {
    variants: {
      size: {
        default: 'min-h-10 rounded-[10px] px-3 text-[13.5px] leading-[1.3]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

type InputStyleOptions = VariantProps<typeof inputVariants>;

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputStyleOptions {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({className, size, type = 'text', ...props}, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(inputVariants({size}), className)}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

export {Input};