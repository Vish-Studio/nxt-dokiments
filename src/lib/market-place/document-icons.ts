import type { Icon } from "@phosphor-icons/react";
import {
  ArrowsClockwiseIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  EnvelopeSimpleIcon,
  FilePlusIcon,
  FileTextIcon,
  HandshakeIcon,
  NotePencilIcon,
  NotepadIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  ShoppingCartSimpleIcon,
  TagIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

import type { DocumentType } from "@/types/template";

/**
 * UI icon per document type, kept out of `documents.ts` so that file stays pure
 * catalog data importable outside a React/bundler context (e.g. `scripts/seed-templates.ts`).
 */
export const documentIcons: Record<DocumentType, Icon> = {
  "change-order": ArrowsClockwiseIcon,
  "contract-addendum": FilePlusIcon,
  "formal-business-letter": EnvelopeSimpleIcon,
  "letter-of-intent": BriefcaseIcon,
  "meeting-minutes-action-brief": NotepadIcon,
  "project-status-report": TrendUpIcon,
  "purchase-order": ShoppingCartSimpleIcon,
  "statement-of-work": FileTextIcon,
  contract: HandshakeIcon,
  invoice: ReceiptIcon,
  nda: ShieldCheckIcon,
  proposal: NotePencilIcon,
  quotation: TagIcon,
  receipt: CurrencyDollarIcon,
};
