import {z} from 'zod';

export const ACCOUNT_ORDER_STATUSES = [
  'fulfilled',
  'processing',
  'pending',
  'cancelled',
] as const;

export const accountOrderStatusSchema = z.enum(ACCOUNT_ORDER_STATUSES);

export const ACCOUNT_ORDER_PAYMENT_STATUSES = [
  'paid',
  'due',
  'pastDue',
  'held',
] as const;

export const accountOrderPaymentStatusSchema = z.enum(
  ACCOUNT_ORDER_PAYMENT_STATUSES,
);

export const accountOrderSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1),
  date: z.string(),
  status: accountOrderStatusSchema,
  total: z.number(),
  poNumber: z.string().nullable().optional(),
  shipByDate: z.string().nullable().optional(),
  paymentStatus: accountOrderPaymentStatusSchema.nullable().optional(),
});

export type AccountOrderStatus = z.infer<typeof accountOrderStatusSchema>;
export type AccountOrderPaymentStatus = z.infer<
  typeof accountOrderPaymentStatusSchema
>;
export type AccountOrder = z.infer<typeof accountOrderSchema>;

export const ACCOUNT_INVOICE_STATUSES = ['paid', 'due', 'overdue'] as const;

export const accountInvoiceStatusSchema = z.enum(ACCOUNT_INVOICE_STATUSES);

export const accountInvoiceSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1),
  date: z.string(),
  dueDate: z.string(),
  status: accountInvoiceStatusSchema,
  total: z.number(),
  balance: z.number(),
  terms: z.string().nullable().optional(),
});

export type AccountInvoiceStatus = z.infer<typeof accountInvoiceStatusSchema>;
export type AccountInvoice = z.infer<typeof accountInvoiceSchema>;
