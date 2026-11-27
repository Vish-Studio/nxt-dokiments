import { getSampleValues } from "@/lib/market-place";

/** One "why it fits here" point on a local landing page. */
export type LocalPagePoint = {
  /** A short, plain heading. */
  title: string;
  /** One or two sentences. Every claim must be true of the product. */
  body: string;
};

/** A question people in this market actually search, with a direct answer. */
export type LocalPageFaq = { answer: string; question: string };

/**
 * A public landing page aimed at one market's searches ("invoicing in
 * Mauritius"). Rendered by `LocalLanding` at `/<slug>` and listed in the
 * sitemap. Copy is written for the searcher, not for keywords: say what
 * Dokiments does there, plainly, and never claim a feature it lacks.
 */
export type LocalPage = {
  /** The country, as written in copy ("Mauritius"). */
  country: string;
  /** ISO 3166-1 alpha-2 code, for `areaServed` in structured data. */
  countryCode: string;
  /** Meta description, about 150 characters. */
  description: string;
  faqs: LocalPageFaq[];
  /** The page `h1`: the main search phrase, said naturally. */
  heading: string;
  /** One or two sentences under the `h1`. */
  intro: string;
  points: LocalPagePoint[];
  /** Field values for the example invoice in the hero. */
  sampleInvoice: Record<string, string>;
  /** URL path without the leading slash. */
  slug: string;
  /** `<title>`, under 60 characters, brand last (the layout adds it). */
  title: string;
};

export const mauritiusPage: LocalPage = {
  country: "Mauritius",
  countryCode: "MU",
  description:
    "Free invoice maker for businesses in Mauritius. Bill in rupees, add your BRN and VAT, save your clients and download a professional PDF invoice in minutes.",
  faqs: [
    {
      answer:
        "Yes. Creating an account and making invoices is free. The free plan includes unlimited documents; paid plans add more template styles and unlimited saved templates.",
      question: "Is Dokiments free for businesses in Mauritius?",
    },
    {
      answer:
        "Yes. Amounts are written the way you want them, so you can bill in rupees (Rs or MUR), or in another currency for overseas clients.",
      question: "Can I make invoices in Mauritian rupees?",
    },
    {
      answer:
        "Yes. Invoices and quotations have fields for your Business Registration Number (BRN) and your client's, along with a tax line you can use for VAT at 15%.",
      question: "Can I add my BRN and VAT to an invoice?",
    },
    {
      answer:
        "Invoices, quotations, receipts, purchase orders, contracts, NDAs, proposals, letters and CVs, among 15 document types in total.",
      question: "What other documents can I make?",
    },
    {
      answer:
        "Pick an invoice template, choose or add your client so their details fill in automatically, add your items, and download the invoice as a PDF to email or print.",
      question: "How do I make an invoice online?",
    },
  ],
  heading: "Free invoice maker for businesses in Mauritius",
  intro:
    "Make professional invoices and quotations in rupees, with your BRN and VAT, and send them as a polished PDF. Free to start, on your phone or computer.",
  points: [
    {
      body: "Write amounts in Mauritian rupees (Rs) or any other currency, so local and overseas clients each get the right invoice.",
      title: "Bill in rupees",
    },
    {
      body: "Add your Business Registration Number and your client's, plus a tax line for VAT, on every invoice and quotation.",
      title: "BRN and VAT ready",
    },
    {
      body: "Save each client once. Their name, email, phone and address fill in automatically on every new document.",
      title: "Clients filled in for you",
    },
    {
      body: "Download a clean, print-ready PDF to email, print or send on WhatsApp, from your phone or your computer.",
      title: "A PDF in minutes",
    },
  ],
  sampleInvoice: {
    ...getSampleValues("invoice"),
    fromAddress: "Royal Road, Port Louis",
    fromName: "Lagon Bleu Studio Ltd",
    invoiceNumber: "INV-0107",
    items:
      "Website design — 1 — Rs 25,000\nHosting, 12 months — 1 — Rs 6,000\nLogo refresh — 1 — Rs 8,000",
    paymentInstructions:
      "Bank transfer to Lagon Bleu Studio Ltd. Use the invoice number as reference.",
    subtotal: "Rs 39,000",
    tax: "Rs 5,850 (VAT 15%)",
    title: "Website Project Invoice",
    toAddress: "Cybercity, Ebene",
    toBrn: "C12345678",
    toEmail: "accounts@islandtrading.mu",
    toName: "Island Trading Co.",
    toPhone: "+230 5 251 0190",
    total: "Rs 44,850",
  },
  slug: "invoice-maker-mauritius",
  title: "Free Invoice Maker for Mauritius",
};
