import type {Account} from '../../accounts/types/account';
import type {FinanceAccount} from '../types/finance';
import {CUSTOMER_PROFILE_FINANCE_MOCK} from '../../../../mocks/customer-profile/finance';
import {financeAccountSchema} from '../schemas/finance.schema';

export function financeAccountFor(account: Account): FinanceAccount {
  return financeAccountSchema.parse({
    ...CUSTOMER_PROFILE_FINANCE_MOCK,
    customerNumber: account.id,
    classification: {
      ...CUSTOMER_PROFILE_FINANCE_MOCK.classification,
      customerType:
        account.segment ?? CUSTOMER_PROFILE_FINANCE_MOCK.classification.customerType,
    },
  });
}
