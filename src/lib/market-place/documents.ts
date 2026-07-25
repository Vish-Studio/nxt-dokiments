import type {
  DocumentMeta,
  DocumentType,
  TemplateField,
} from "@/types/template";

const fromToFields: TemplateField[] = [
  {
    key: "fromName",
    label: "From",
    placeholder: "Your company or name",
    type: "text",
  },
  {
    key: "fromAddress",
    label: "From address",
    placeholder: "Your business address",
    type: "text",
  },
  {
    key: "toName",
    label: "To",
    placeholder: "Client or counterparty",
    type: "text",
  },
  {
    key: "toAddress",
    label: "To address",
    placeholder: "Client address",
    type: "text",
  },
];

const signatureFields: TemplateField[] = [
  {
    key: "senderSignature",
    label: "Sender signature",
    placeholder: "Name / signature",
    type: "text",
  },
  {
    key: "recipientSignature",
    label: "Recipient signature",
    placeholder: "Name / signature",
    type: "text",
  },
];

export const contract: DocumentMeta = {
  description:
    "A client service agreement covering scope, fees, terms, responsibilities, and signatures.",
  fields: [
    {
      key: "title",
      label: "Title",
      placeholder: "Client Service Agreement",
      type: "text",
    },
    ...fromToFields,
    { key: "effectiveDate", label: "Effective date", type: "date" },
    {
      key: "scope",
      label: "Scope of services",
      placeholder: "Describe services and deliverables...",
      type: "textarea",
    },
    { key: "fee", label: "Fee", placeholder: "$0.00", type: "text" },
    {
      key: "paymentTerms",
      label: "Payment terms",
      placeholder: "Deposit, milestones, due dates...",
      type: "textarea",
    },
    {
      key: "legalTerms",
      label: "Legal terms",
      placeholder: "IP, confidentiality, liability, termination...",
      type: "textarea",
    },
    ...signatureFields,
  ],
  name: "Client Service Agreement",
  type: "contract",
};

export const proposal: DocumentMeta = {
  description:
    "A business or project pitch with goals, approach, deliverables, timeline, and pricing.",
  fields: [
    {
      key: "title",
      label: "Title",
      placeholder: "Business Proposal",
      type: "text",
    },
    ...fromToFields,
    { key: "date", label: "Date", type: "date" },
    {
      key: "summary",
      label: "Executive summary",
      placeholder: "Overview of the opportunity...",
      type: "textarea",
    },
    {
      key: "approach",
      label: "Approach",
      placeholder: "How the work will be delivered...",
      type: "textarea",
    },
    {
      key: "deliverables",
      label: "Deliverables",
      placeholder: "What is included...",
      type: "textarea",
    },
    {
      key: "timeline",
      label: "Timeline",
      placeholder: "Estimated schedule",
      type: "text",
    },
    { key: "price", label: "Price", placeholder: "$0.00", type: "text" },
    { key: "validUntil", label: "Valid until", type: "date" },
    {
      key: "senderSignature",
      label: "Prepared by",
      placeholder: "Name / signature",
      type: "text",
    },
  ],
  name: "Business Proposal",
  type: "proposal",
};

export const nda: DocumentMeta = {
  description:
    "A non-disclosure agreement for protecting confidential information between parties.",
  fields: [
    {
      key: "title",
      label: "Title",
      placeholder: "Non-Disclosure Agreement",
      type: "text",
    },
    {
      key: "partyOne",
      label: "Disclosing party",
      placeholder: "Party one",
      type: "text",
    },
    {
      key: "partyOneAddress",
      label: "Disclosing party address",
      placeholder: "Party one address",
      type: "text",
    },
    {
      key: "partyTwo",
      label: "Receiving party",
      placeholder: "Party two",
      type: "text",
    },
    {
      key: "partyTwoAddress",
      label: "Receiving party address",
      placeholder: "Party two address",
      type: "text",
    },
    { key: "effectiveDate", label: "Effective date", type: "date" },
    {
      key: "purpose",
      label: "Purpose",
      placeholder: "Purpose of disclosure...",
      type: "textarea",
    },
    {
      key: "confidentialInformation",
      label: "Confidential information",
      placeholder: "Information covered...",
      type: "textarea",
    },
    {
      key: "termLength",
      label: "Term length",
      placeholder: "e.g. 2 years",
      type: "text",
    },
    {
      key: "governingLaw",
      label: "Governing law",
      placeholder: "e.g. Mauritius",
      type: "text",
    },
    ...signatureFields,
  ],
  name: "Non-Disclosure Agreement",
  type: "nda",
};

export const statementOfWork: DocumentMeta = {
  description:
    "A statement of work defining project scope, deliverables, assumptions, timeline, and acceptance.",
  fields: [
    {
      key: "title",
      label: "Title",
      placeholder: "Statement of Work",
      type: "text",
    },
    ...fromToFields,
    { key: "startDate", label: "Start date", type: "date" },
    { key: "endDate", label: "Target end date", type: "date" },
    {
      key: "objectives",
      label: "Objectives",
      placeholder: "Project objectives...",
      type: "textarea",
    },
    {
      key: "scope",
      label: "Scope",
      placeholder: "Included work...",
      type: "textarea",
    },
    {
      key: "deliverables",
      label: "Deliverables",
      placeholder: "Deliverable list...",
      type: "textarea",
    },
    {
      key: "acceptanceCriteria",
      label: "Acceptance criteria",
      placeholder: "How completion is accepted...",
      type: "textarea",
    },
    {
      key: "projectFee",
      label: "Project fee",
      placeholder: "$0.00",
      type: "text",
    },
    ...signatureFields,
  ],
  name: "Statement of Work",
  type: "statement-of-work",
};

export const invoice: DocumentMeta = {
  description:
    "A standard billing sheet with seller, client, line items, due date, totals, and payment notes.",
  fields: [
    { key: "title", label: "Title", placeholder: "Invoice", type: "text" },
    {
      key: "invoiceNumber",
      label: "Invoice number",
      placeholder: "INV-0001",
      type: "text",
    },
    ...fromToFields,
    { key: "date", label: "Issue date", type: "date" },
    { key: "dueDate", label: "Due date", type: "date" },
    {
      key: "items",
      label: "Line items",
      placeholder: "Item — qty — price (one per line)",
      type: "textarea",
    },
    { key: "subtotal", label: "Subtotal", placeholder: "$0.00", type: "text" },
    { key: "tax", label: "Tax", placeholder: "$0.00", type: "text" },
    { key: "total", label: "Total", placeholder: "$0.00", type: "text" },
    {
      key: "paymentInstructions",
      label: "Payment instructions",
      placeholder: "Bank, card, or payment link...",
      type: "textarea",
    },
  ],
  name: "Standard Invoice",
  type: "invoice",
};

export const quotation: DocumentMeta = {
  description:
    "A price estimate with itemized costs, assumptions, validity date, and acceptance details.",
  fields: [
    { key: "title", label: "Title", placeholder: "Quotation", type: "text" },
    {
      key: "quoteNumber",
      label: "Quote number",
      placeholder: "Q-0001",
      type: "text",
    },
    ...fromToFields,
    { key: "date", label: "Date", type: "date" },
    {
      key: "items",
      label: "Items",
      placeholder: "Item — qty — price (one per line)",
      type: "textarea",
    },
    {
      key: "assumptions",
      label: "Assumptions",
      placeholder: "Pricing assumptions...",
      type: "textarea",
    },
    { key: "subtotal", label: "Subtotal", placeholder: "$0.00", type: "text" },
    { key: "tax", label: "Tax", placeholder: "$0.00", type: "text" },
    { key: "total", label: "Total", placeholder: "$0.00", type: "text" },
    { key: "validUntil", label: "Valid until", type: "date" },
  ],
  name: "Price Quotation",
  type: "quotation",
};

export const receipt: DocumentMeta = {
  description:
    "A proof of payment for recording payer, payee, payment method, reference, and received amount.",
  fields: [
    { key: "title", label: "Title", placeholder: "Receipt", type: "text" },
    {
      key: "receiptNumber",
      label: "Receipt number",
      placeholder: "RCPT-0001",
      type: "text",
    },
    ...fromToFields,
    { key: "paymentDate", label: "Payment date", type: "date" },
    {
      key: "paymentMethod",
      label: "Payment method",
      placeholder: "Card / bank transfer",
      type: "text",
    },
    {
      key: "reference",
      label: "Reference",
      placeholder: "Transaction reference",
      type: "text",
    },
    {
      key: "items",
      label: "Paid items",
      placeholder: "Item — amount (one per line)",
      type: "textarea",
    },
    {
      key: "amountPaid",
      label: "Amount paid",
      placeholder: "$0.00",
      type: "text",
    },
    {
      key: "notes",
      label: "Notes",
      placeholder: "Payment notes...",
      type: "textarea",
    },
  ],
  name: "Payment Receipt",
  type: "receipt",
};

export const changeOrder: DocumentMeta = {
  description:
    "A scope amendment documenting approved changes, impact, cost, timeline, and authorization.",
  fields: [
    { key: "title", label: "Title", placeholder: "Change Order", type: "text" },
    {
      key: "changeOrderNumber",
      label: "Change order number",
      placeholder: "CO-0001",
      type: "text",
    },
    ...fromToFields,
    { key: "date", label: "Date", type: "date" },
    {
      key: "originalAgreement",
      label: "Original agreement",
      placeholder: "Agreement reference",
      type: "text",
    },
    {
      key: "changeSummary",
      label: "Change summary",
      placeholder: "What is changing...",
      type: "textarea",
    },
    {
      key: "impact",
      label: "Schedule and cost impact",
      placeholder: "Timeline, fee, risk impact...",
      type: "textarea",
    },
    {
      key: "additionalFee",
      label: "Additional fee",
      placeholder: "$0.00",
      type: "text",
    },
    ...signatureFields,
  ],
  name: "Change Order",
  type: "change-order",
};

export const contractAddendum: DocumentMeta = {
  description:
    "A contract addendum for updating terms without replacing the original agreement.",
  fields: [
    {
      key: "title",
      label: "Title",
      placeholder: "Contract Addendum",
      type: "text",
    },
    ...fromToFields,
    { key: "effectiveDate", label: "Effective date", type: "date" },
    {
      key: "originalAgreement",
      label: "Original agreement",
      placeholder: "Agreement reference",
      type: "text",
    },
    {
      key: "updatedTerms",
      label: "Updated terms",
      placeholder: "Terms being added or changed...",
      type: "textarea",
    },
    {
      key: "unchangedTerms",
      label: "Unchanged terms",
      placeholder: "Terms that remain in force...",
      type: "textarea",
    },
    ...signatureFields,
  ],
  name: "Contract Addendum",
  type: "contract-addendum",
};

export const letterOfIntent: DocumentMeta = {
  description:
    "A letter of intent capturing deal direction, intent, proposed terms, timeline, and next steps.",
  fields: [
    {
      key: "title",
      label: "Title",
      placeholder: "Letter of Intent",
      type: "text",
    },
    ...fromToFields,
    { key: "date", label: "Date", type: "date" },
    {
      key: "intentSummary",
      label: "Intent summary",
      placeholder: "Purpose of the intended transaction...",
      type: "textarea",
    },
    {
      key: "proposedTerms",
      label: "Proposed terms",
      placeholder: "Commercial terms...",
      type: "textarea",
    },
    {
      key: "timeline",
      label: "Timeline",
      placeholder: "Due diligence and closing timeline",
      type: "text",
    },
    {
      key: "nextSteps",
      label: "Next steps",
      placeholder: "Actions required...",
      type: "textarea",
    },
    {
      key: "senderSignature",
      label: "Sender signature",
      placeholder: "Name / signature",
      type: "text",
    },
  ],
  name: "Letter of Intent",
  type: "letter-of-intent",
};

export const projectStatusReport: DocumentMeta = {
  description:
    "A status report summarizing progress, milestones, blockers, risks, budget, and next actions.",
  fields: [
    {
      key: "title",
      label: "Title",
      placeholder: "Project Status Report",
      type: "text",
    },
    ...fromToFields,
    { key: "reportDate", label: "Report date", type: "date" },
    {
      key: "reportingPeriod",
      label: "Reporting period",
      placeholder: "Week / month / sprint",
      type: "text",
    },
    {
      key: "status",
      label: "Overall status",
      placeholder: "On track / at risk / delayed",
      type: "text",
    },
    {
      key: "progress",
      label: "Progress summary",
      placeholder: "Work completed...",
      type: "textarea",
    },
    {
      key: "milestones",
      label: "Milestones",
      placeholder: "Completed and upcoming milestones...",
      type: "textarea",
    },
    {
      key: "risks",
      label: "Risks and blockers",
      placeholder: "Risks, owners, mitigations...",
      type: "textarea",
    },
    {
      key: "nextActions",
      label: "Next actions",
      placeholder: "Next steps and owners...",
      type: "textarea",
    },
  ],
  name: "Project Status Report",
  type: "project-status-report",
};

export const meetingMinutesActionBrief: DocumentMeta = {
  description:
    "Meeting minutes and action brief with attendees, decisions, action owners, and deadlines.",
  fields: [
    {
      key: "title",
      label: "Title",
      placeholder: "Meeting Minutes & Action Brief",
      type: "text",
    },
    { key: "meetingDate", label: "Meeting date", type: "date" },
    {
      key: "attendees",
      label: "Attendees",
      placeholder: "Names and roles",
      type: "textarea",
    },
    {
      key: "facilitator",
      label: "Facilitator",
      placeholder: "Meeting lead",
      type: "text",
    },
    {
      key: "agenda",
      label: "Agenda",
      placeholder: "Discussion topics...",
      type: "textarea",
    },
    {
      key: "decisions",
      label: "Decisions",
      placeholder: "Decisions made...",
      type: "textarea",
    },
    {
      key: "actionItems",
      label: "Action items",
      placeholder: "Action — owner — due date",
      type: "textarea",
    },
    { key: "nextMeeting", label: "Next meeting", type: "date" },
  ],
  name: "Meeting Minutes & Action Brief",
  type: "meeting-minutes-action-brief",
};

export const formalBusinessLetter: DocumentMeta = {
  description:
    "A formal business letter for notices, requests, policy updates, and official correspondence.",
  fields: [
    {
      key: "title",
      label: "Title",
      placeholder: "Official Notice",
      type: "text",
    },
    ...fromToFields,
    { key: "date", label: "Date", type: "date" },
    {
      key: "subject",
      label: "Subject",
      placeholder: "Letter subject",
      type: "text",
    },
    {
      key: "salutation",
      label: "Salutation",
      placeholder: "Dear...",
      type: "text",
    },
    {
      key: "body",
      label: "Letter body",
      placeholder: "Formal letter content...",
      type: "textarea",
    },
    {
      key: "closing",
      label: "Closing",
      placeholder: "Sincerely...",
      type: "text",
    },
    {
      key: "senderSignature",
      label: "Sender signature",
      placeholder: "Name / title",
      type: "text",
    },
  ],
  name: "Formal Business Letter",
  type: "formal-business-letter",
};

export const purchaseOrder: DocumentMeta = {
  description:
    "A purchase order for vendor, buyer, itemized goods or services, totals, approvals, and delivery.",
  fields: [
    {
      key: "title",
      label: "Title",
      placeholder: "Purchase Order",
      type: "text",
    },
    {
      key: "poNumber",
      label: "PO number",
      placeholder: "PO-0001",
      type: "text",
    },
    ...fromToFields,
    { key: "date", label: "Date", type: "date" },
    { key: "deliveryDate", label: "Delivery date", type: "date" },
    {
      key: "items",
      label: "Items",
      placeholder: "Item — qty — unit price",
      type: "textarea",
    },
    { key: "subtotal", label: "Subtotal", placeholder: "$0.00", type: "text" },
    { key: "tax", label: "Tax", placeholder: "$0.00", type: "text" },
    { key: "total", label: "Total", placeholder: "$0.00", type: "text" },
    {
      key: "approval",
      label: "Approval",
      placeholder: "Approved by / department",
      type: "text",
    },
  ],
  name: "Purchase Order",
  type: "purchase-order",
};

export const documentBlueprints: Record<DocumentType, DocumentMeta> = {
  "change-order": changeOrder,
  "contract-addendum": contractAddendum,
  "formal-business-letter": formalBusinessLetter,
  "letter-of-intent": letterOfIntent,
  "meeting-minutes-action-brief": meetingMinutesActionBrief,
  "project-status-report": projectStatusReport,
  "purchase-order": purchaseOrder,
  "statement-of-work": statementOfWork,
  contract,
  invoice,
  nda,
  proposal,
  quotation,
  receipt,
};
