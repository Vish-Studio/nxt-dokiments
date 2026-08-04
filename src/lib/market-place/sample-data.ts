import type { DocumentType } from "@/types/template";

const defaultPartyValues = {
  fromAddress: "12 Studio Lane, Port Louis",
  fromName: "Dokiments Studio",
  toAddress: "24 Market Street, Ebene",
  toName: "Acme Co.",
};

/** Realistic dummy content so previews show how a filled document looks. */
export const sampleValues: Record<DocumentType, Record<string, string>> = {
  "change-order": {
    ...defaultPartyValues,
    additionalFee: "$1,450",
    changeOrderNumber: "CO-004",
    changeSummary:
      "Add an additional landing page, revised analytics events, and a second stakeholder review cycle.",
    date: "2026-06-28",
    impact:
      "Timeline extends by 5 business days. Additional fee is due with the next milestone invoice.",
    originalAgreement: "Website Build Agreement dated 2026-06-01",
    recipientSignature: "Amelia Grant",
    senderSignature: "John Smith",
    title: "Ecommerce Feature Change Order",
  },
  "contract-addendum": {
    ...defaultPartyValues,
    effectiveDate: "2026-07-01",
    originalAgreement: "Client Service Agreement dated 2026-06-01",
    recipientSignature: "Amelia Grant",
    senderSignature: "John Smith",
    title: "Payment Terms Addendum",
    unchangedTerms:
      "All confidentiality, ownership, limitation of liability, and termination terms remain unchanged.",
    updatedTerms:
      "Payment will be split into three milestones: 40% on signing, 30% after prototype approval, and 30% on final delivery.",
  },
  "formal-business-letter": {
    ...defaultPartyValues,
    body: "We are writing to confirm renewal of the service arrangement for the upcoming quarter. The attached schedule outlines support hours, reporting cadence, and the updated point of contact.",
    closing: "Sincerely, John Smith",
    date: "2026-06-20",
    salutation: "Dear Amelia,",
    senderSignature: "John Smith, Managing Director",
    subject: "Service Renewal Notice",
    title: "Service Renewal Notice",
  },
  "letter-of-intent": {
    ...defaultPartyValues,
    date: "2026-06-20",
    intentSummary:
      "The parties intend to explore a strategic partnership covering template distribution, joint marketing, and implementation support.",
    nextSteps:
      "Complete financial review, finalize commercial terms, and prepare a definitive agreement by the target date.",
    proposedTerms:
      "Initial pilot period of 90 days, non-exclusive collaboration, and shared reporting on qualified leads.",
    senderSignature: "John Smith",
    timeline: "Due diligence by 2026-07-15",
    title: "Partnership Letter of Intent",
  },
  "meeting-minutes-action-brief": {
    actionItems:
      "Finalize homepage copy — Maya — 2026-06-24\nSend revised invoice template — Jonas — 2026-06-25\nConfirm launch checklist — Priya — 2026-06-27",
    agenda:
      "Review launch status, approve content changes, and assign final owners.",
    attendees: "Amelia Grant, John Smith, Maya Patel, Jonas Reed, Priya Shah",
    decisions:
      "Launch remains targeted for July 1. The team approved the revised onboarding flow.",
    facilitator: "John Smith",
    meetingDate: "2026-06-20",
    nextMeeting: "2026-06-27",
    title: "Client Steering Meeting Brief",
  },
  "project-status-report": {
    ...defaultPartyValues,
    milestones:
      "Design system approved\nMarketplace cards implemented\nAuth flow ready for QA\nTemplate editor in progress",
    nextActions:
      "Complete mobile QA, finalize plan gating copy, and prepare launch support documentation.",
    progress:
      "The project is progressing on schedule. Core dashboard flows are complete and marketplace previews are rendering with sample data.",
    reportDate: "2026-06-20",
    reportingPeriod: "Sprint 04",
    risks:
      "Firebase production keys and billing plan copy still require final stakeholder confirmation.",
    status: "On track",
    title: "Q2 Platform Status Report",
  },
  "purchase-order": {
    ...defaultPartyValues,
    approval: "Approved by Operations",
    date: "2026-06-20",
    deliveryDate: "2026-07-05",
    items:
      "Laptop stands — 8 — $480\nExternal monitors — 4 — $1,200\nUSB-C hubs — 8 — $640",
    poNumber: "PO-2026-118",
    subtotal: "$2,320",
    tax: "$232",
    title: "Hardware Purchase Order",
    total: "$2,552",
  },
  "statement-of-work": {
    ...defaultPartyValues,
    acceptanceCriteria:
      "Work is accepted when listed deliverables are approved in writing and the handover session is complete.",
    deliverables:
      "Discovery workshop\nResponsive dashboard shell\nTemplate marketplace UI\nImplementation handover",
    endDate: "2026-08-15",
    objectives:
      "Launch a reusable document marketplace experience for freelancers and SMEs with clear plan gating.",
    projectFee: "$14,500",
    recipientSignature: "Amelia Grant",
    scope:
      "Design and build the authenticated dashboard, marketplace template browsing, saved templates library, and document creation flow.",
    senderSignature: "John Smith",
    startDate: "2026-07-01",
    title: "CRM Implementation SOW",
  },
  contract: {
    ...defaultPartyValues,
    effectiveDate: "2026-07-01",
    fee: "$8,500",
    legalTerms:
      "Provider retains ownership of pre-existing tools. Client receives a license to final deliverables after full payment. Either party may terminate with 14 days notice.",
    paymentTerms:
      "50% due on signing, 50% on delivery. Invoices are payable within 14 days.",
    recipientSignature: "Amelia Grant",
    scope:
      "Design and develop a five-page marketing website with responsive layouts, CMS handover, and one round of revisions.",
    senderSignature: "John Smith",
    title: "Website Build Agreement",
  },
  invoice: {
    ...defaultPartyValues,
    date: "2026-06-20",
    dueDate: "2026-07-04",
    invoiceNumber: "INV-0042",
    items:
      "Consulting — 10h — $1,500\nDesign — 5h — $600\nPrototype QA — 3h — $450",
    paymentInstructions:
      "Bank transfer to Dokiments Studio. Include invoice number as reference.",
    subtotal: "$2,550",
    tax: "$255",
    title: "Monthly Retainer Invoice",
    total: "$2,805",
  },
  nda: {
    confidentialInformation:
      "Product roadmap, customer data, pricing assumptions, financial projections, and technical implementation notes.",
    effectiveDate: "2026-06-20",
    governingLaw: "Mauritius",
    partyOne: "Dokiments Studio",
    partyOneAddress: "12 Studio Lane, Port Louis",
    partyTwo: "Acme Co.",
    partyTwoAddress: "24 Market Street, Ebene",
    purpose:
      "Evaluating a potential design and product partnership involving confidential business information.",
    recipientSignature: "Amelia Grant",
    senderSignature: "John Smith",
    termLength: "2 years",
    title: "Vendor Discovery NDA",
  },
  proposal: {
    ...defaultPartyValues,
    approach:
      "Run discovery, define a visual direction, prototype priority screens, then deliver a production-ready design system.",
    date: "2026-06-20",
    deliverables:
      "Brand audit\nHomepage redesign\nMarketplace dashboard concept\nReusable UI component direction",
    price: "$12,000",
    senderSignature: "John Smith",
    summary:
      "A focused brand refresh to modernize Acme's identity ahead of the Q3 product launch.",
    timeline: "4 weeks",
    title: "Brand Refresh Proposal",
    validUntil: "2026-07-20",
  },
  quotation: {
    ...defaultPartyValues,
    assumptions:
      "Pricing excludes paid media spend, third-party subscriptions, and rush delivery.",
    date: "2026-06-20",
    items:
      "Logo design — 1 — $1,200\nBrand guide — 1 — $1,800\nLaunch assets — 1 — $900",
    quoteNumber: "Q-1042",
    subtotal: "$3,900",
    tax: "$390",
    title: "Office Fit-Out Quotation",
    total: "$4,290",
    validUntil: "2026-07-10",
  },
  receipt: {
    ...defaultPartyValues,
    amountPaid: "$2,805",
    items: "Monthly retainer invoice INV-0042 — $2,805",
    notes:
      "Payment received in full. No outstanding balance remains for this invoice.",
    paymentDate: "2026-06-21",
    paymentMethod: "Bank transfer",
    receiptNumber: "RCPT-0098",
    reference: "TRX-2026-88421",
    title: "Subscription Payment Receipt",
  },
};

export const getSampleValues = (documentType: DocumentType) =>
  sampleValues[documentType];
