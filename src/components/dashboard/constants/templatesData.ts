export type TemplateStyleCategory = "classic" | "modern" | "brutalist" | "minimalist";

export type TemplateDocumentType =
  | "contract"
  | "proposal"
  | "nda"
  | "statement-of-work"
  | "invoice"
  | "quotation"
  | "receipt"
  | "change-order"
  | "contract-addendum"
  | "letter-of-intent"
  | "project-status-report"
  | "meeting-minutes-action-brief"
  | "formal-business-letter"
  | "purchase-order";

export type TemplateAccessTier = "free" | "silver" | "gold" | "special" | "superadmin";

export interface TemplateLayoutConfig {
  accentClassName: string;
  bannerTreatment: "left-rail" | "top-band" | "stamp" | "quiet-header";
  borderClassName: string;
  cardClassName: string;
  controlClassName: string;
  fontPairing: {
    body: "font-body";
    heading: "font-title";
    logo?: "font-logo";
  };
  previewClassName: string;
  radiusClassName: string;
  surfaceClassName: string;
  wrapperClassName: string;
}

export interface TemplateMarketplaceItem {
  description: string;
  documentType: TemplateDocumentType;
  id: string;
  layoutConfig: TemplateLayoutConfig;
  saved: boolean;
  styleCategory: TemplateStyleCategory;
  tier: TemplateAccessTier;
  title: string;
}

export interface TemplateStyleCategoryMeta {
  description: string;
  id: TemplateStyleCategory;
  layoutConfig: TemplateLayoutConfig;
  name: string;
  tier: TemplateAccessTier;
}

export const commonBusinessTemplateTypes: TemplateDocumentType[] = [
  "contract",
  "proposal",
  "nda",
  "statement-of-work",
  "invoice",
  "quotation",
  "receipt",
  "change-order",
  "contract-addendum",
  "letter-of-intent",
  "project-status-report",
  "meeting-minutes-action-brief",
  "formal-business-letter",
  "purchase-order",
];

export const existingMarketplaceTemplateKeys = [
  "classic:contract",
  "classic:proposal",
  "classic:nda",
  "classic:invoice",
  "classic:quotation",
  "modern:contract",
  "modern:proposal",
  "modern:nda",
  "modern:invoice",
  "modern:quotation",
  "minimalist:contract",
  "minimalist:proposal",
  "minimalist:nda",
  "minimalist:invoice",
  "minimalist:quotation",
] as const;

export const templateLayoutConfigs: Record<TemplateStyleCategory, TemplateLayoutConfig> = {
  brutalist: {
    accentClassName: "bg-play-pink text-nox-noir",
    bannerTreatment: "stamp",
    borderClassName: "border-2 border-nox-noir",
    cardClassName: "bg-white text-nox-noir shadow-none",
    controlClassName: "bg-nox-noir text-white border border-nox-noir",
    fontPairing: {
      body: "font-body",
      heading: "font-title",
    },
    previewClassName: "bg-white text-nox-noir border-2 border-nox-noir",
    radiusClassName: "rounded-md",
    surfaceClassName: "bg-play-pink",
    wrapperClassName: "bg-white text-nox-noir",
  },
  classic: {
    accentClassName: "bg-golden-harvest text-nox-noir",
    bannerTreatment: "left-rail",
    borderClassName: "border border-steel-mist",
    cardClassName: "bg-base-100 text-nox-noir shadow-none",
    controlClassName: "bg-nox-noir text-white border border-nox-noir",
    fontPairing: {
      body: "font-body",
      heading: "font-title",
      logo: "font-logo",
    },
    previewClassName: "bg-base-100 text-nox-noir border border-steel-mist",
    radiusClassName: "rounded-box",
    surfaceClassName: "bg-base-200",
    wrapperClassName: "bg-base-100 text-nox-noir",
  },
  minimalist: {
    accentClassName: "bg-steel-mist text-nox-noir",
    bannerTreatment: "quiet-header",
    borderClassName: "border border-steel-mist",
    cardClassName: "bg-white text-nox-noir shadow-none",
    controlClassName: "bg-base-200 text-nox-noir border border-steel-mist",
    fontPairing: {
      body: "font-body",
      heading: "font-title",
    },
    previewClassName: "bg-white text-nox-noir border border-steel-mist",
    radiusClassName: "rounded-md",
    surfaceClassName: "bg-white",
    wrapperClassName: "bg-base-100 text-nox-noir",
  },
  modern: {
    accentClassName: "bg-play-teal text-nox-noir",
    bannerTreatment: "top-band",
    borderClassName: "border border-nox-noir/15",
    cardClassName: "bg-base-100 text-nox-noir shadow-soft",
    controlClassName: "bg-golden-harvest text-nox-noir border border-golden-harvest",
    fontPairing: {
      body: "font-body",
      heading: "font-title",
    },
    previewClassName: "bg-nox-noir text-white border border-nox-noir",
    radiusClassName: "rounded-box",
    surfaceClassName: "bg-play-teal",
    wrapperClassName: "bg-base-100 text-nox-noir",
  },
};

export const templateStyleCategories: TemplateStyleCategoryMeta[] = [
  {
    description: "Traditional business layouts with structured sections and conservative hierarchy.",
    id: "classic",
    layoutConfig: templateLayoutConfigs.classic,
    name: "Classic",
    tier: "free",
  },
  {
    description: "Confident layouts with accent bands, stronger cards, and product-led rhythm.",
    id: "modern",
    layoutConfig: templateLayoutConfigs.modern,
    name: "Modern",
    tier: "silver",
  },
  {
    description: "High-contrast, editorial layouts with assertive borders and bold blocks.",
    id: "brutalist",
    layoutConfig: templateLayoutConfigs.brutalist,
    name: "Brutalist",
    tier: "gold",
  },
  {
    description: "Spacious, restrained layouts for premium documentation and executive review.",
    id: "minimalist",
    layoutConfig: templateLayoutConfigs.minimalist,
    name: "Minimalist",
    tier: "special",
  },
];

export const templatesData: TemplateMarketplaceItem[] = [
  {
    description:
      "Defines project phases, deliverables, owners, assumptions, acceptance criteria, timeline, and operational handoff requirements.",
    documentType: "statement-of-work",
    id: "classic-statement-of-work",
    layoutConfig: templateLayoutConfigs.classic,
    saved: true,
    styleCategory: "classic",
    tier: "free",
    title: "CRM Implementation SOW",
  },
  {
    description:
      "Confirms completed payment with payer details, transaction reference, allocation notes, and reconciliation context for finance teams.",
    documentType: "receipt",
    id: "classic-proof-of-payment",
    layoutConfig: templateLayoutConfigs.classic,
    saved: false,
    styleCategory: "classic",
    tier: "free",
    title: "Subscription Payment Receipt",
  },
  {
    description:
      "Documents approved scope amendments, cost impact, timeline shifts, and stakeholder sign-off after project requirements change.",
    documentType: "change-order",
    id: "classic-scope-amendment",
    layoutConfig: templateLayoutConfigs.classic,
    saved: false,
    styleCategory: "classic",
    tier: "free",
    title: "Ecommerce Feature Change Order",
  },
  {
    description:
      "Updates existing contract terms without replacing the original agreement, keeping legal, account, and delivery teams aligned.",
    documentType: "contract-addendum",
    id: "classic-terms-update",
    layoutConfig: templateLayoutConfigs.classic,
    saved: false,
    styleCategory: "classic",
    tier: "free",
    title: "Payment Terms Addendum",
  },
  {
    description:
      "Captures early deal intent, commercial direction, decision timelines, exclusivity notes, and pre-contract commitments.",
    documentType: "letter-of-intent",
    id: "classic-letter-of-intent",
    layoutConfig: templateLayoutConfigs.classic,
    saved: false,
    styleCategory: "classic",
    tier: "free",
    title: "Partnership Letter of Intent",
  },
  {
    description:
      "Summarizes project health, risks, milestones, blockers, budget movement, and owner updates for leadership and delivery teams.",
    documentType: "project-status-report",
    id: "classic-project-status-report",
    layoutConfig: templateLayoutConfigs.classic,
    saved: true,
    styleCategory: "classic",
    tier: "free",
    title: "Q2 Platform Status Report",
  },
  {
    description:
      "Records decisions, discussion points, action owners, deadlines, and follow-up context from internal or client meetings.",
    documentType: "meeting-minutes-action-brief",
    id: "classic-meeting-minutes-action-brief",
    layoutConfig: templateLayoutConfigs.classic,
    saved: false,
    styleCategory: "classic",
    tier: "free",
    title: "Client Steering Meeting Brief",
  },
  {
    description:
      "Formats formal notices, policy messages, vendor correspondence, and executive communications with clear official structure.",
    documentType: "formal-business-letter",
    id: "classic-official-notice",
    layoutConfig: templateLayoutConfigs.classic,
    saved: false,
    styleCategory: "classic",
    tier: "free",
    title: "Service Renewal Notice",
  },
  {
    description:
      "Standardizes purchase requests with vendor details, itemized costs, approval references, delivery notes, and finance controls.",
    documentType: "purchase-order",
    id: "classic-purchase-order",
    layoutConfig: templateLayoutConfigs.classic,
    saved: false,
    styleCategory: "classic",
    tier: "free",
    title: "Hardware Purchase Order",
  },
  {
    description:
      "Defines project phases, deliverables, owners, assumptions, acceptance criteria, timeline, and operational handoff requirements.",
    documentType: "statement-of-work",
    id: "modern-statement-of-work",
    layoutConfig: templateLayoutConfigs.modern,
    saved: false,
    styleCategory: "modern",
    tier: "silver",
    title: "Mobile App Delivery SOW",
  },
  {
    description:
      "Confirms completed payment with payer details, transaction reference, allocation notes, and reconciliation context for finance teams.",
    documentType: "receipt",
    id: "modern-proof-of-payment",
    layoutConfig: templateLayoutConfigs.modern,
    saved: false,
    styleCategory: "modern",
    tier: "silver",
    title: "Workshop Booking Receipt",
  },
  {
    description:
      "Documents approved scope amendments, cost impact, timeline shifts, and stakeholder sign-off after project requirements change.",
    documentType: "change-order",
    id: "modern-scope-amendment",
    layoutConfig: templateLayoutConfigs.modern,
    saved: false,
    styleCategory: "modern",
    tier: "silver",
    title: "Campaign Landing Page Change Order",
  },
  {
    description:
      "Updates existing contract terms without replacing the original agreement, keeping legal, account, and delivery teams aligned.",
    documentType: "contract-addendum",
    id: "modern-terms-update",
    layoutConfig: templateLayoutConfigs.modern,
    saved: false,
    styleCategory: "modern",
    tier: "silver",
    title: "Support Scope Addendum",
  },
  {
    description:
      "Captures early deal intent, commercial direction, decision timelines, exclusivity notes, and pre-contract commitments.",
    documentType: "letter-of-intent",
    id: "modern-letter-of-intent",
    layoutConfig: templateLayoutConfigs.modern,
    saved: false,
    styleCategory: "modern",
    tier: "silver",
    title: "Pilot Program Letter of Intent",
  },
  {
    description:
      "Summarizes project health, risks, milestones, blockers, budget movement, and owner updates for leadership and delivery teams.",
    documentType: "project-status-report",
    id: "modern-project-status-report",
    layoutConfig: templateLayoutConfigs.modern,
    saved: false,
    styleCategory: "modern",
    tier: "silver",
    title: "Product Roadmap Status Report",
  },
  {
    description:
      "Records decisions, discussion points, action owners, deadlines, and follow-up context from internal or client meetings.",
    documentType: "meeting-minutes-action-brief",
    id: "modern-meeting-minutes-action-brief",
    layoutConfig: templateLayoutConfigs.modern,
    saved: true,
    styleCategory: "modern",
    tier: "silver",
    title: "Weekly Delivery Action Brief",
  },
  {
    description:
      "Formats formal notices, policy messages, vendor correspondence, and executive communications with clear official structure.",
    documentType: "formal-business-letter",
    id: "modern-official-notice",
    layoutConfig: templateLayoutConfigs.modern,
    saved: false,
    styleCategory: "modern",
    tier: "silver",
    title: "Vendor Onboarding Notice",
  },
  {
    description:
      "Standardizes purchase requests with vendor details, itemized costs, approval references, delivery notes, and finance controls.",
    documentType: "purchase-order",
    id: "modern-purchase-order",
    layoutConfig: templateLayoutConfigs.modern,
    saved: false,
    styleCategory: "modern",
    tier: "silver",
    title: "Software License Purchase Order",
  },
  {
    description:
      "Sets commercial terms, responsibilities, deliverables, approvals, and payment expectations for client-facing service work across sales, operations, and finance.",
    documentType: "contract",
    id: "brutalist-client-service-agreement",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Studio Services Agreement",
  },
  {
    description:
      "Frames project goals, commercial approach, scope options, and next steps for teams pitching cross-functional business or project work.",
    documentType: "proposal",
    id: "brutalist-business-project-pitch",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Rebrand Sprint Proposal",
  },
  {
    description:
      "Protects confidential information shared during vendor evaluation, hiring, partnership, finance, or product discovery conversations.",
    documentType: "nda",
    id: "brutalist-non-disclosure-agreement",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Investor Preview NDA",
  },
  {
    description:
      "Defines project phases, deliverables, owners, assumptions, acceptance criteria, timeline, and operational handoff requirements.",
    documentType: "statement-of-work",
    id: "brutalist-statement-of-work",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: true,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Brand System SOW",
  },
  {
    description:
      "Creates a standard billing sheet with customer details, line items, tax handling, totals, due dates, and payment instructions.",
    documentType: "invoice",
    id: "brutalist-standard-billing-sheet",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Campaign Production Invoice",
  },
  {
    description:
      "Presents estimated pricing, assumptions, validity dates, optional add-ons, and acceptance details for sales and procurement teams.",
    documentType: "quotation",
    id: "brutalist-price-estimate",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Studio Retainer Quotation",
  },
  {
    description:
      "Confirms completed payment with payer details, transaction reference, allocation notes, and reconciliation context for finance teams.",
    documentType: "receipt",
    id: "brutalist-proof-of-payment",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Event Deposit Receipt",
  },
  {
    description:
      "Documents approved scope amendments, cost impact, timeline shifts, and stakeholder sign-off after project requirements change.",
    documentType: "change-order",
    id: "brutalist-scope-amendment",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Identity System Change Order",
  },
  {
    description:
      "Updates existing contract terms without replacing the original agreement, keeping legal, account, and delivery teams aligned.",
    documentType: "contract-addendum",
    id: "brutalist-terms-update",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Usage Rights Addendum",
  },
  {
    description:
      "Captures early deal intent, commercial direction, decision timelines, exclusivity notes, and pre-contract commitments.",
    documentType: "letter-of-intent",
    id: "brutalist-letter-of-intent",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Creative Partnership LOI",
  },
  {
    description:
      "Summarizes project health, risks, milestones, blockers, budget movement, and owner updates for leadership and delivery teams.",
    documentType: "project-status-report",
    id: "brutalist-project-status-report",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: true,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Launch War Room Status Report",
  },
  {
    description:
      "Records decisions, discussion points, action owners, deadlines, and follow-up context from internal or client meetings.",
    documentType: "meeting-minutes-action-brief",
    id: "brutalist-meeting-minutes-action-brief",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Creative Review Action Brief",
  },
  {
    description:
      "Formats formal notices, policy messages, vendor correspondence, and executive communications with clear official structure.",
    documentType: "formal-business-letter",
    id: "brutalist-official-notice",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Campaign Rights Notice",
  },
  {
    description:
      "Standardizes purchase requests with vendor details, itemized costs, approval references, delivery notes, and finance controls.",
    documentType: "purchase-order",
    id: "brutalist-purchase-order",
    layoutConfig: templateLayoutConfigs.brutalist,
    saved: false,
    styleCategory: "brutalist",
    tier: "gold",
    title: "Production Vendor Purchase Order",
  },
  {
    description:
      "Defines project phases, deliverables, owners, assumptions, acceptance criteria, timeline, and operational handoff requirements.",
    documentType: "statement-of-work",
    id: "minimalist-statement-of-work",
    layoutConfig: templateLayoutConfigs.minimalist,
    saved: false,
    styleCategory: "minimalist",
    tier: "special",
    title: "Leadership Workshop SOW",
  },
  {
    description:
      "Confirms completed payment with payer details, transaction reference, allocation notes, and reconciliation context for finance teams.",
    documentType: "receipt",
    id: "minimalist-proof-of-payment",
    layoutConfig: templateLayoutConfigs.minimalist,
    saved: false,
    styleCategory: "minimalist",
    tier: "special",
    title: "Board Session Payment Receipt",
  },
  {
    description:
      "Documents approved scope amendments, cost impact, timeline shifts, and stakeholder sign-off after project requirements change.",
    documentType: "change-order",
    id: "minimalist-scope-amendment",
    layoutConfig: templateLayoutConfigs.minimalist,
    saved: false,
    styleCategory: "minimalist",
    tier: "special",
    title: "Advisory Scope Change Order",
  },
  {
    description:
      "Updates existing contract terms without replacing the original agreement, keeping legal, account, and delivery teams aligned.",
    documentType: "contract-addendum",
    id: "minimalist-terms-update",
    layoutConfig: templateLayoutConfigs.minimalist,
    saved: false,
    styleCategory: "minimalist",
    tier: "special",
    title: "Confidential Terms Addendum",
  },
  {
    description:
      "Captures early deal intent, commercial direction, decision timelines, exclusivity notes, and pre-contract commitments.",
    documentType: "letter-of-intent",
    id: "minimalist-letter-of-intent",
    layoutConfig: templateLayoutConfigs.minimalist,
    saved: false,
    styleCategory: "minimalist",
    tier: "special",
    title: "Acquisition Letter of Intent",
  },
  {
    description:
      "Summarizes project health, risks, milestones, blockers, budget movement, and owner updates for leadership and delivery teams.",
    documentType: "project-status-report",
    id: "minimalist-project-status-report",
    layoutConfig: templateLayoutConfigs.minimalist,
    saved: false,
    styleCategory: "minimalist",
    tier: "special",
    title: "Executive Program Status Report",
  },
  {
    description:
      "Records decisions, discussion points, action owners, deadlines, and follow-up context from internal or client meetings.",
    documentType: "meeting-minutes-action-brief",
    id: "minimalist-meeting-minutes-action-brief",
    layoutConfig: templateLayoutConfigs.minimalist,
    saved: false,
    styleCategory: "minimalist",
    tier: "special",
    title: "Board Meeting Action Brief",
  },
  {
    description:
      "Formats formal notices, policy messages, vendor correspondence, and executive communications with clear official structure.",
    documentType: "formal-business-letter",
    id: "minimalist-official-notice",
    layoutConfig: templateLayoutConfigs.minimalist,
    saved: false,
    styleCategory: "minimalist",
    tier: "special",
    title: "Executive Policy Notice",
  },
  {
    description:
      "Standardizes purchase requests with vendor details, itemized costs, approval references, delivery notes, and finance controls.",
    documentType: "purchase-order",
    id: "minimalist-purchase-order",
    layoutConfig: templateLayoutConfigs.minimalist,
    saved: false,
    styleCategory: "minimalist",
    tier: "superadmin",
    title: "Strategic Vendor Purchase Order",
  },
];
