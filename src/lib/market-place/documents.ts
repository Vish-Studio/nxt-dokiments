import {
  HandshakeIcon,
  NotePencilIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  TagIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

import type { DocumentMeta, DocumentType } from "@/types/template";

/**
 * Base document blueprints (the fields each document type collects). Styles
 * reuse these; per-style template files live under `market-place/<style>/`.
 */
export const contract: DocumentMeta = {
  description: "A service agreement between a provider and a client.",
  name: "Contract",
  type: "contract",
  fields: [
    { key: "title", label: "Title", placeholder: "Service Agreement", type: "text" },
    { key: "providerName", label: "Provider", placeholder: "Your company", type: "text" },
    { key: "clientName", label: "Client", placeholder: "Client name", type: "text" },
    { key: "effectiveDate", label: "Effective date", type: "date" },
    { key: "scope", label: "Scope of work", placeholder: "Describe the services...", type: "textarea" },
    { key: "fee", label: "Fee", placeholder: "$0.00", type: "text" },
    { key: "terms", label: "Terms", placeholder: "Payment terms, duration...", type: "textarea" },
  ],
};

export const proposal: DocumentMeta = {
  description: "Pitch your services, scope, and price to a prospect.",
  name: "Proposal",
  type: "proposal",
  fields: [
    { key: "title", label: "Title", placeholder: "Project proposal", type: "text" },
    { key: "clientName", label: "Client", placeholder: "Client name", type: "text" },
    { key: "date", label: "Date", type: "date" },
    { key: "summary", label: "Summary", placeholder: "Overview of the engagement...", type: "textarea" },
    { key: "deliverables", label: "Deliverables", placeholder: "What you will deliver...", type: "textarea" },
    { key: "price", label: "Price", placeholder: "$0.00", type: "text" },
    { key: "validUntil", label: "Valid until", type: "date" },
  ],
};

export const quotation: DocumentMeta = {
  description: "An itemized price quote with totals and validity.",
  name: "Quotation",
  type: "quotation",
  fields: [
    { key: "quoteNumber", label: "Quote number", placeholder: "Q-0001", type: "text" },
    { key: "clientName", label: "Client", placeholder: "Client name", type: "text" },
    { key: "date", label: "Date", type: "date" },
    { key: "items", label: "Items", placeholder: "Item — qty — price (one per line)", type: "textarea" },
    { key: "subtotal", label: "Subtotal", placeholder: "$0.00", type: "text" },
    { key: "tax", label: "Tax", placeholder: "$0.00", type: "text" },
    { key: "total", label: "Total", placeholder: "$0.00", type: "text" },
    { key: "validUntil", label: "Valid until", type: "date" },
  ],
};

export const invoice: DocumentMeta = {
  description: "Bill a client with line items, totals, and a due date.",
  name: "Invoice",
  type: "invoice",
  fields: [
    { key: "invoiceNumber", label: "Invoice number", placeholder: "INV-0001", type: "text" },
    { key: "billTo", label: "Bill to", placeholder: "Client name & address", type: "text" },
    { key: "date", label: "Issue date", type: "date" },
    { key: "dueDate", label: "Due date", type: "date" },
    { key: "items", label: "Items", placeholder: "Item — qty — price (one per line)", type: "textarea" },
    { key: "subtotal", label: "Subtotal", placeholder: "$0.00", type: "text" },
    { key: "tax", label: "Tax", placeholder: "$0.00", type: "text" },
    { key: "total", label: "Total", placeholder: "$0.00", type: "text" },
  ],
};

export const nda: DocumentMeta = {
  description: "A mutual non-disclosure agreement to protect information.",
  name: "NDA",
  type: "nda",
  fields: [
    { key: "partyOne", label: "Party one", placeholder: "Disclosing party", type: "text" },
    { key: "partyTwo", label: "Party two", placeholder: "Receiving party", type: "text" },
    { key: "effectiveDate", label: "Effective date", type: "date" },
    { key: "purpose", label: "Purpose", placeholder: "Purpose of disclosure...", type: "textarea" },
    { key: "termLength", label: "Term length", placeholder: "e.g. 2 years", type: "text" },
    { key: "governingLaw", label: "Governing law", placeholder: "e.g. Portugal", type: "text" },
  ],
};

export const documentBlueprints: Record<DocumentType, DocumentMeta> = {
  contract,
  proposal,
  quotation,
  invoice,
  nda,
};

export const documentIcons: Record<DocumentType, Icon> = {
  contract: HandshakeIcon,
  proposal: NotePencilIcon,
  quotation: TagIcon,
  invoice: ReceiptIcon,
  nda: ShieldCheckIcon,
};
