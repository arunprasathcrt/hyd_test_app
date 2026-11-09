import type {z} from 'zod';
import {financeAccountSchema} from '../schemas/finance.schema';

export type FinanceAccount = z.infer<typeof financeAccountSchema>;
export type ShippingAddress = FinanceAccount['shippingAddresses'][number];
