import type { Invoice } from "~/features/customerProfileDrawer/types/invoice";

export const CUSTOMER_INVOICE_MOCK: Invoice[] = [
  {
    id: "INV-97004",
    customer: "Pebble Beach Resorts",
    issueDate: "May 3, 2026",
    dueDate: "Jun 2, 2026",
    status: "Paid",
    amount: "$13,860.00",

    detail: {
      terms: "Net 30",
      customerNumber: "PEBBLE-001",
      poNumber: "BBLE-2025-0896",
      orderNumber: "ORD-9003",
      netSuiteRef: "NS-97004",
      salesRep: "Jake Torres",

      billTo: {
        name: "Pebble Beach Resorts",
        attention: "Attn: Accounts Payable · Reid Patrick",
        location: "Pebble Beach, CA",
        email: "ap@pebblebeachres.com",
      },

      shipTo: {
        name: "Pebble Beach Resorts",
        location: "Receiving · Pebble Beach, CA",
        reference: "Per PO BBLE-2025-0896",
      },

      remitTo: {
        name: "Unrivaled Teamwear",
        reference: "PNC Bank · Lockbox 774213",
        address: "PO Box 774213, Chicago, IL 60677",
        payment: "ACH · reference INV-97004",
      },

      items: [
        {
          id: "INV-97004-item-1",
          name: "Performance Polo",
          description:
            "PP-2200 · Under Armour · Moisture-Wick Pique",
          sizeRun: "S 7 · M 13 · L 13 · XL 10 · 2XL 6",
          quantity: "49",
          unitPrice: "$38.50",
          amount: "$1,886.50",
        },
        {
          id: "INV-97004-item-2",
          name: "Embroidery · Left Chest",
          description: "",
          sizeRun: "",
          quantity: "49",
          unitPrice: "$3.50",
          amount: "$171.50",
          isDecoration: true,
        },
        {
          id: "INV-97004-item-3",
          name: "Performance Cap",
          description:
            "PC-440 · Under Armour · Structured Twill",
          sizeRun: "One size · 98",
          quantity: "98",
          unitPrice: "$26.00",
          amount: "$2,548.00",
        },
        {
          id: "INV-97004-item-4",
          name: "Heat Press · Cap Front Crown",
          description: "",
          sizeRun: "",
          quantity: "98",
          unitPrice: "$3.50",
          amount: "$343.00",
          isDecoration: true,
        },
        {
          id: "INV-97004-item-5",
          name: "Caddie Towel",
          description:
            "CT-110 · Under Armour · Microfiber",
          sizeRun: "One size · 293",
          quantity: "293",
          unitPrice: "$18.00",
          amount: "$5,274.00",
        },
        {
          id: "INV-97004-item-6",
          name: "Embroidery · Corner",
          description: "",
          sizeRun: "",
          quantity: "293",
          unitPrice: "$3.50",
          amount: "$1,025.50",
          isDecoration: true,
        },
      ],

      totals: {
        merchandise: "$9,708.50",
        decoration: "$1,540.00",
        licensingRoyalty: "$1,124.85",
        freight: "$589.58",
        tax: "$897.07",
        invoiceTotal: "$13,860.00",
        paymentsApplied: "-$13,860.00",
        balanceDue: "$0.00",
      },

      notes: {
        message:
          "ACH or Net-terms payment via PNC · checks to the lockbox at left · reference INV-97004 on all remittances.",
        paymentNotice: "Sales tax: 7.25%.",
      },

      payment: {
        method: "ACH",
        instructions:
          "ACH or Net-terms payment via PNC · checks to the lockbox at left.",
        salesTaxRate: "7.25%",
        paymentDate: "May 27, 2026",
        reference: "ACH-374076",
        amount: "$13,860.00",
      },
    },
  },

  {
    id: "INV-97005",
    customer: "Brighton Supply",
    issueDate: "May 6, 2026",
    dueDate: "Jun 5, 2026",
    status: "Paid",
    amount: "$6,300.00",

    detail: {
      terms: "Net 30",
      customerNumber: "BRIGHT-002",
      poNumber: "BR-2026-1042",
      orderNumber: "ORD-9004",
      netSuiteRef: "NS-97005",
      salesRep: "Sarah Jones",

      billTo: {
        name: "Brighton Supply",
        attention: "Attn: Accounts Payable",
        location: "Detroit, MI",
        email: "ap@brighton.example",
      },

      shipTo: {
        name: "Brighton Supply",
        location: "Receiving · Detroit, MI",
        reference: "Per PO BR-2026-1042",
      },

      remitTo: {
        name: "Unrivaled Teamwear",
        reference: "PNC Bank · Lockbox 774213",
        address: "PO Box 774213, Chicago, IL 60677",
        payment: "Check · reference INV-97005",
      },

      items: [
        {
          id: "INV-97005-item-1",
          name: "Team Polo",
          description: "PP-3100 · Performance Pique",
          sizeRun: "S 10 · M 18 · L 22 · XL 16",
          quantity: "66",
          unitPrice: "$42.00",
          amount: "$2,772.00",
        },
        {
          id: "INV-97005-item-2",
          name: "Left Chest Embroidery",
          description: "",
          sizeRun: "",
          quantity: "66",
          unitPrice: "$4.00",
          amount: "$264.00",
          isDecoration: true,
        },
        {
          id: "INV-97005-item-3",
          name: "Performance Shorts",
          description: "SH-410 · Stretch Woven",
          sizeRun: "S 12 · M 20 · L 24 · XL 10",
          quantity: "66",
          unitPrice: "$36.00",
          amount: "$2,376.00",
        },
        {
          id: "INV-97005-item-4",
          name: "Leg Logo",
          description: "",
          sizeRun: "",
          quantity: "66",
          unitPrice: "$4.00",
          amount: "$264.00",
          isDecoration: true,
        },
      ],

      totals: {
        merchandise: "$4,780.00",
        decoration: "$318.50",
        artSetup: "$60.00",
        licensingRoyalty: "$509.85",
        freight: "$220.69",
        tax: "$410.96",
        invoiceTotal: "$6,300.00",
        paymentsApplied: "-$6,300.00",
        balanceDue: "$0.00",
      },

      notes: {
        message:
          "ACH or Net-terms payment via PNC · checks to the lockbox at left · reference INV-97005 on all remittances.",
        paymentNotice: "Sales tax: 7.25%.",
      },

      payment: {
        method: "Check",
        instructions:
          "ACH or Net-terms payment via PNC. Reference the invoice number with all remittances.",
        salesTaxRate: "7.25%",
        paymentDate: "Apr 28, 2026",
        reference: "CHK-351695",
        amount: "$6,300.00",
      },
    },
  },

  {
    id: "INV-97006",
    customer: "Northstar Apparel",
    issueDate: "May 9, 2026",
    dueDate: "Jun 8, 2026",
    status: "Paid",
    amount: "$18,990.00",

    detail: {
      terms: "Net 30",
      customerNumber: "NORTH-003",
      poNumber: "NS-2026-221",
      orderNumber: "ORD-9005",
      netSuiteRef: "NS-97006",
      salesRep: "Mike Torres",

      billTo: {
        name: "Northstar Apparel",
        attention: "Attn: Accounts Payable",
        location: "Chicago, IL",
        email: "ap@northstar.example",
      },

      shipTo: {
        name: "Northstar Apparel",
        location: "Receiving · Chicago, IL",
        reference: "Per PO NS-2026-221",
      },

      remitTo: {
        name: "Unrivaled Teamwear",
        reference: "PNC Bank · Lockbox 774213",
        address: "PO Box 774213, Chicago, IL 60677",
        payment: "ACH · reference INV-97006",
      },

      items: [
        {
          id: "INV-97006-item-1",
          name: "Performance Tee",
          description: "PT-510 · Moisture-Wick Jersey",
          sizeRun: "S 14 · M 20 · L 18 · XL 10",
          quantity: "62",
          unitPrice: "$31.00",
          amount: "$1,922.00",
        },
        {
          id: "INV-97006-item-2",
          name: "Center Chest Print",
          description: "",
          sizeRun: "",
          quantity: "62",
          unitPrice: "$3.50",
          amount: "$217.00",
          isDecoration: true,
        },
        {
          id: "INV-97006-item-3",
          name: "Quarter Zip",
          description: "QZ-720 · Performance Fleece",
          sizeRun: "S 8 · M 14 · L 16 · XL 8",
          quantity: "46",
          unitPrice: "$68.00",
          amount: "$3,128.00",
        },
        {
          id: "INV-97006-item-4",
          name: "Left Chest Embroidery",
          description: "",
          sizeRun: "",
          quantity: "46",
          unitPrice: "$4.00",
          amount: "$184.00",
          isDecoration: true,
        },
      ],

      totals: {
        merchandise: "$13,588.00",
        decoration: "$1,730.00",
        licensingRoyalty: "$1,531.80",
        freight: "$918.59",
        tax: "$1,221.61",
        invoiceTotal: "$18,990.00",
        paymentsApplied: "-$18,990.00",
        balanceDue: "$0.00",
      },

      notes: {
        message: "Payment received by ACH.",
        paymentNotice: "Paid in full.",
      },

      payment: {
        method: "ACH",
        instructions: "Payment received through PNC.",
        salesTaxRate: "7.25%",
        paymentDate: "Apr 27, 2026",
        reference: "ACH-329314",
        amount: "$18,990.00",
      },
    },
  },

  {
    id: "INV-97007",
    customer: "Peak Outfitters",
    issueDate: "May 12, 2026",
    dueDate: "Jun 11, 2026",
    status: "Paid",
    amount: "$4,780.00",

    detail: {
      terms: "Net 30",
      customerNumber: "PEAK-004",
      poNumber: "PK-2026-441",
      orderNumber: "ORD-9006",
      netSuiteRef: "NS-97007",
      salesRep: "Alex Brown",

      billTo: {
        name: "Peak Outfitters",
        attention: "Attn: Accounts Payable",
        location: "Denver, CO",
        email: "ap@peak.example",
      },

      shipTo: {
        name: "Peak Outfitters",
        location: "Receiving · Denver, CO",
        reference: "Per PO PK-2026-441",
      },

      remitTo: {
        name: "Unrivaled Teamwear",
        reference: "PNC Bank · Lockbox 774213",
        address: "PO Box 774213, Chicago, IL 60677",
        payment: "ACH · reference INV-97007",
      },

      items: [
        {
          id: "INV-97007-item-1",
          name: "Performance Polo",
          description: "PP-2200 · Moisture-Wick Pique",
          sizeRun: "S 8 · M 16 · L 18 · XL 8",
          quantity: "50",
          unitPrice: "$38.50",
          amount: "$1,925.00",
        },
        {
          id: "INV-97007-item-2",
          name: "Left Chest Embroidery",
          description: "",
          sizeRun: "",
          quantity: "50",
          unitPrice: "$3.50",
          amount: "$175.00",
          isDecoration: true,
        },
        {
          id: "INV-97007-item-3",
          name: "Performance Cap",
          description: "PC-440 · Structured Twill",
          sizeRun: "One size · 60",
          quantity: "60",
          unitPrice: "$26.00",
          amount: "$1,560.00",
        },
        {
          id: "INV-97007-item-4",
          name: "Cap Front Heat Press",
          description: "",
          sizeRun: "",
          quantity: "60",
          unitPrice: "$3.50",
          amount: "$210.00",
          isDecoration: true,
        },
      ],

      totals: {
        merchandise: "$3,485.00",
        decoration: "$385.00",
        licensingRoyalty: "$387.00",
        freight: "$150.00",
        tax: "$373.00",
        invoiceTotal: "$4,780.00",
        paymentsApplied: "-$4,780.00",
        balanceDue: "$0.00",
      },

      notes: {
        message: "Payment received by ACH.",
        paymentNotice: "Paid in full.",
      },

      payment: {
        method: "ACH",
        instructions:
          "ACH payment via PNC. Reference the invoice number.",
        salesTaxRate: "7.25%",
        paymentDate: "Jun 1, 2026",
        reference: "ACH-374078",
        amount: "$4,780.00",
      },
    },
  },

  {
    id: "INV-97008",
    customer: "West Coast Goods",
    issueDate: "Apr 15, 2026",
    dueDate: "May 15, 2026",
    status: "Paid",
    amount: "$5,450.00",

    detail: {
      terms: "Net 30",
      customerNumber: "WEST-005",
      poNumber: "WC-2026-118",
      orderNumber: "ORD-9007",
      netSuiteRef: "NS-97008",
      salesRep: "Jake Torres",

      billTo: {
        name: "West Coast Goods",
        attention: "Attn: Accounts Payable",
        location: "Los Angeles, CA",
        email: "ap@westcoast.example",
      },

      shipTo: {
        name: "West Coast Goods",
        location: "Receiving · Los Angeles, CA",
        reference: "Per PO WC-2026-118",
      },

      remitTo: {
        name: "Unrivaled Teamwear",
        reference: "PNC Bank · Lockbox 774213",
        address: "PO Box 774213, Chicago, IL 60677",
        payment: "ACH · reference INV-97008",
      },

      items: [
        {
          id: "INV-97008-item-1",
          name: "Team Jacket",
          description: "TJ-810 · Lightweight Shell",
          sizeRun: "S 8 · M 12 · L 14 · XL 8",
          quantity: "42",
          unitPrice: "$72.00",
          amount: "$3,024.00",
        },
        {
          id: "INV-97008-item-2",
          name: "Left Chest Embroidery",
          description: "",
          sizeRun: "",
          quantity: "42",
          unitPrice: "$4.00",
          amount: "$168.00",
          isDecoration: true,
        },
        {
          id: "INV-97008-item-3",
          name: "Performance Tee",
          description: "PT-510 · Moisture-Wick Jersey",
          sizeRun: "S 10 · M 16 · L 18 · XL 8",
          quantity: "52",
          unitPrice: "$31.00",
          amount: "$1,612.00",
        },
        {
          id: "INV-97008-item-4",
          name: "Center Chest Print",
          description: "",
          sizeRun: "",
          quantity: "52",
          unitPrice: "$3.50",
          amount: "$182.00",
          isDecoration: true,
        },
      ],

      totals: {
        merchandise: "$4,636.00",
        decoration: "$350.00",
        licensingRoyalty: "$498.60",
        freight: "$120.00",
        tax: "-$100.60",
        invoiceTotal: "$5,504.00",
        paymentsApplied: "-$5,504.00",
        balanceDue: "$0.00",
      },

      notes: {
        message: "Payment received by ACH.",
        paymentNotice: "Paid in full.",
      },

      payment: {
        method: "ACH",
        instructions:
          "ACH payment via PNC. Reference the invoice number.",
        salesTaxRate: "7.25%",
        paymentDate: "May 12, 2026",
        reference: "ACH-374079",
        amount: "$5,504.00",
      },
    },
  },

  {
    id: "INV-97009",
    customer: "Harbor Retail",
    issueDate: "Apr 20, 2026",
    dueDate: "May 20, 2026",
    status: "Paid",
    amount: "$7,282.67",

    detail: {
      terms: "Net 30",
      customerNumber: "HARBOR-006",
      poNumber: "HR-2026-882",
      orderNumber: "ORD-9008",
      netSuiteRef: "NS-97009",
      salesRep: "Sarah Jones",

      billTo: {
        name: "Harbor Retail",
        attention: "Attn: Accounts Payable",
        location: "Seattle, WA",
        email: "ap@harbor.example",
      },

      shipTo: {
        name: "Harbor Retail",
        location: "Receiving · Seattle, WA",
        reference: "Per PO HR-2026-882",
      },

      remitTo: {
        name: "Unrivaled Teamwear",
        reference: "PNC Bank · Lockbox 774213",
        address: "PO Box 774213, Chicago, IL 60677",
        payment: "Check · reference INV-97009",
      },

      items: [
        {
          id: "INV-97009-item-1",
          name: "Caddie Towel",
          description: "CT-110 · Microfiber",
          sizeRun: "One size · 240",
          quantity: "240",
          unitPrice: "$18.00",
          amount: "$4,320.00",
        },
        {
          id: "INV-97009-item-2",
          name: "Corner Embroidery",
          description: "",
          sizeRun: "",
          quantity: "240",
          unitPrice: "$3.50",
          amount: "$840.00",
          isDecoration: true,
        },
        {
          id: "INV-97009-item-3",
          name: "Performance Cap",
          description: "PC-440 · Structured Twill",
          sizeRun: "One size · 60",
          quantity: "60",
          unitPrice: "$26.00",
          amount: "$1,560.00",
        },
        {
          id: "INV-97009-item-4",
          name: "Cap Front Heat Press",
          description: "",
          sizeRun: "",
          quantity: "60",
          unitPrice: "$3.50",
          amount: "$210.00",
          isDecoration: true,
        },
      ],

      totals: {
        merchandise: "$5,880.00",
        decoration: "$1,050.00",
        licensingRoyalty: "$693.00",
        freight: "$100.00",
        tax: "$552.67",
        invoiceTotal: "$7,282.67",
        paymentsApplied: "-$7,282.67",
        balanceDue: "$0.00",
      },

      notes: {
        message: "Payment received by check.",
        paymentNotice: "Paid in full.",
      },

      payment: {
        method: "Check",
        instructions:
          "Check payment received. Reference the invoice number.",
        salesTaxRate: "7.25%",
        paymentDate: "Apr 29, 2026",
        reference: "CHK-522987",
        amount: "$7,282.67",
      },
    },
  },
];
