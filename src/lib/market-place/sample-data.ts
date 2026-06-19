import type { DocumentType } from "@/types/template";

/** Realistic dummy content so previews show how a filled document looks. */
export const sampleValues: Record<DocumentType, Record<string, string>> = {
  contract: {
    title: "Website Build Agreement",
    providerName: "Dokiments Studio",
    clientName: "Acme Co.",
    effectiveDate: "2026-07-01",
    scope:
      "Design and develop a five-page marketing website with responsive layouts, a CMS handover, and one round of revisions.",
    fee: "$8,500",
    terms: "50% due on signing, 50% on delivery. Invoices are payable within 14 days.",
  },
  proposal: {
    title: "Brand Refresh Proposal",
    clientName: "Acme Co.",
    date: "2026-06-19",
    summary:
      "A focused brand refresh to modernise Acme's identity ahead of the Q3 product launch.",
    deliverables:
      "New logo suite, colour and type system, a 24-page brand guide, and social templates.",
    price: "$12,000",
    validUntil: "2026-07-19",
  },
  quotation: {
    quoteNumber: "Q-1042",
    clientName: "Acme Co.",
    date: "2026-06-19",
    items: "Logo design — 1 — $1,200\nBrand guide — 1 — $1,800",
    subtotal: "$3,000",
    tax: "$300",
    total: "$3,300",
    validUntil: "2026-07-10",
  },
  invoice: {
    invoiceNumber: "INV-0042",
    billTo: "Acme Co., 12 Market Street, Lisbon",
    date: "2026-06-19",
    dueDate: "2026-07-03",
    items: "Consulting — 10h — $1,500\nDesign — 5h — $600",
    subtotal: "$2,100",
    tax: "$210",
    total: "$2,310",
  },
  nda: {
    partyOne: "Dokiments Studio",
    partyTwo: "Acme Co.",
    effectiveDate: "2026-06-19",
    purpose:
      "Evaluating a potential design partnership and sharing confidential product and business information.",
    termLength: "2 years",
    governingLaw: "Portugal",
  },
};

export const getSampleValues = (documentType: DocumentType) => sampleValues[documentType];
