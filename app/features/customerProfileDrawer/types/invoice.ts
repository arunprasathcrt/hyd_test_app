export type Invoice = {
  id: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  status: "Paid" | "Due" | "Overdue";
  amount: string;

  detail: {
    terms: string;
    customerNumber: string;
    poNumber: string;
    orderNumber: string;
    netSuiteRef: string;
    salesRep: string;

    billTo: {
      name: string;
      attention: string;
      location: string;
      email: string;
    };

    shipTo: {
      name: string;
      location: string;
      reference: string;
    };

    remitTo: {
      name: string;
      reference: string;
      address: string;
      payment: string;
    };

    items: {
      id: string;
      name: string;
      description: string;
      sizeRun: string;
      quantity: string;
      unitPrice: string;
      amount: string;
      isDecoration?: boolean;
    }[];

    totals: {
      merchandise: string;
      decoration: string;
      artSetup?: string;
      licensingRoyalty: string;
      freight: string;
      tax: string;
      invoiceTotal: string;
      paymentsApplied: string;
      balanceDue: string;
    };


    notes: {
      message: string;
      paymentNotice: string;
    };

    payment: {
      method: string;
      instructions: string;
      salesTaxRate: string;
      paymentDate: string;
      reference: string;
      amount: string;
    };
  };
};
