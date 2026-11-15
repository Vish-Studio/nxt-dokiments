import {
  FREE_SAVED_TEMPLATE_LIMIT,
  templateStyles,
  tierLabels,
} from "@/lib/market-place";
import { getDocumentTypeLabel } from "@/lib/market-place/document-labels";
import { documentBlueprints } from "@/lib/market-place/documents";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import { isSignableDocument } from "@/lib/sharing/signable";
import { documentTypes, type TemplateTier } from "@/types/template";

export interface ChatIntent {
  id: string;
  /** The question as a user would ask it, shown on suggestion chips. */
  label: string;
  /**
   * Words and phrases that point to this intent. A message scores one point per
   * word covered by a keyword, so keep them distinctive: generic words like
   * "create" belong to the generic intent only.
   */
  keywords: string[];
  /** Markdown. Internal links (`/my-documents`) navigate in-app. */
  answer: string;
  /** Intent ids offered as chips under the answer. */
  followUps: string[];
}

export interface ChatIntentOptions {
  /** Mirrors `documentSharingEnabled`; injectable so tests can cover both. */
  sharingEnabled: boolean;
}

const planTiers: TemplateTier[] = ["free", "silver", "gold"];

/** "Contract, NDA and Scope of Work". */
const listOf = (items: string[]) =>
  items.length > 1
    ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`
    : (items[0] ?? "");

const signableTypeList = listOf(
  documentTypes
    .filter((type) => isSignableDocument(documentBlueprints[type]))
    .map(getDocumentTypeLabel),
);

const documentTypeList = listOf(documentTypes.map(getDocumentTypeLabel));

/** "Classic designs" → "Classic". */
const styleNamesFor = (tier: TemplateTier) =>
  templateStyles
    .filter((style) => style.tier === tier)
    .map((style) => style.name.replace(/\s+designs$/i, ""));

const planLines = planTiers.map((tier, index) => {
  const styles = listOf(styleNamesFor(tier));

  if (index === 0) {
    return `- **${tierLabels[tier]}**: ${styles} templates, up to ${FREE_SAVED_TEMPLATE_LIMIT} saved templates`;
  }

  const savedNote = index === 1 ? ", unlimited saved templates" : "";

  return `- **${tierLabels[tier]}**: adds ${styles} templates${savedNote}`;
});

/** Document type nouns, so "create a contract" leans to creating, not listing types. */
const documentTypeKeywords = [
  "change order",
  "change request",
  "contract",
  "cv",
  "resume",
  "addendum",
  "letter",
  "letter of intent",
  "meeting notes",
  "minutes",
  "nda",
  "status report",
  "report",
  "proposal",
  "purchase order",
  "receipt",
  "scope of work",
  "statement of work",
];

/**
 * Builds Docsy's rules. Order matters: when two intents score the same, the
 * earlier one wins, so specific intents come before generic ones and small
 * talk comes last.
 */
export const buildChatIntents = ({
  sharingEnabled,
}: ChatIntentOptions): ChatIntent[] => [
  {
    answer: [
      "- **Create an account:** choose **[Sign up](/sign-up)** and use your email or Google.",
      "- **Sign in:** go to **[Sign in](/sign-in)**.",
      "- **Forgot your password?** Use **[Forgot password](/forgot-password)** to get a reset link by email.",
    ].join("\n"),
    followUps: ["create-document", "plans"],
    id: "account",
    keywords: [
      "account",
      "sign up",
      "signup",
      "register",
      "sign in",
      "signin",
      "log in",
      "login",
      "log out",
      "logout",
      "sign out",
      "password",
    ],
    label: "How do I sign up or sign in?",
  },
  {
    answer: [
      "I'm an automated assistant, so I can only answer common questions.",
      "",
      "To reach the Dokiments team, sign in and choose **Send feedback** in the sidebar. For privacy questions, email [privacy@dokiments.com](mailto:privacy@dokiments.com).",
    ].join("\n"),
    followUps: ["capabilities"],
    id: "contact",
    keywords: [
      "contact",
      "support",
      "human",
      "person",
      "someone",
      "agent",
      "team",
      "feedback",
      "bug",
      "problem",
      "issue",
      "not working",
      "broken",
      "error",
      "complaint",
    ],
    label: "How do I contact the team?",
  },
  {
    answer: sharingEnabled
      ? [
          "You can ask someone to sign a document right in Dokiments:",
          "",
          `1. Create the document from a template with a **Recipient signature** field: ${signableTypeList}.`,
          "2. Type your name in **Sender signature** and choose **Create document**.",
          "3. In **[My Documents](/my-documents)**, open the **⋯** menu on the document and choose **Share**, then enter their email address.",
          "4. They sign in to Dokiments with that email, find it under **Shared with me**, type their full name and choose **Sign and lock**.",
          "",
          "Once signed, the document is locked for everyone and can't be changed.",
        ].join("\n")
      : [
          "Online signing isn't available in Dokiments yet.",
          "",
          `For now, these documents have **Sender signature** and **Recipient signature** lines: ${signableTypeList}. Type your name in **Sender signature**, choose **Download PDF**, and send the file to the other party to sign.`,
        ].join("\n"),
    followUps: sharingEnabled
      ? ["share-document", "download-pdf"]
      : ["download-pdf", "create-document"],
    id: "sign-document",
    keywords: [
      "sign",
      "signature",
      "signer",
      "signatory",
      "countersign",
      "esign",
      "e sign",
    ],
    label: "How do I sign a document?",
  },
  {
    answer: sharingEnabled
      ? [
          `**Share** sends a document to someone so they can view and sign it. It works for documents with a Recipient signature field: ${signableTypeList}.`,
          "",
          "1. Go to **[My Documents](/my-documents)**.",
          "2. Open the **⋯** menu on the document and choose **Share**.",
          "3. Enter their email address, or pick one of your clients.",
          "",
          "For other documents, like invoices, choose **Download PDF** and email the file to your client.",
        ].join("\n")
      : "To send a document, choose **Download PDF** and attach the file to an email or message to your client.",
    followUps: sharingEnabled
      ? ["sign-document", "download-pdf"]
      : ["download-pdf", "clients"],
    id: "share-document",
    keywords: [
      "share",
      "send",
      "sent",
      "email",
      "forward",
      "recipient",
      "shared with me",
    ],
    label: "How do I send a document?",
  },
  {
    answer: [
      "To download a document as a PDF:",
      "",
      "1. Go to **[My Documents](/my-documents)**.",
      "2. Choose the **print** icon next to the document.",
      "3. When it's ready, choose **Download PDF**.",
      "",
      "The PDF is A4 and contains only the document, ready to send to your client.",
    ].join("\n"),
    followUps: ["share-document", "edit-document"],
    id: "download-pdf",
    keywords: ["download", "pdf", "export", "print", "printer", "save as pdf"],
    label: "How do I download a PDF?",
  },
  {
    answer: [
      "In **[My Documents](/my-documents)**, choose the **pencil** icon on a document to open it. Make your changes and choose **Save changes**.",
      "",
      "To delete it, open it the same way and choose **Delete**. This can't be undone.",
    ].join("\n"),
    followUps: ["download-pdf", "create-document"],
    id: "edit-document",
    keywords: [
      "edit",
      "change",
      "update",
      "modify",
      "rename",
      "mistake",
      "typo",
      "delete",
      "remove",
    ],
    label: "How do I edit or delete a document?",
  },
  {
    answer: [
      "Here's how to create an invoice:",
      "",
      "1. Open the **[Marketplace](/marketplace)**, find an **Invoice** template and choose **Save template**.",
      "2. Go to **[My Documents](/my-documents)**, choose **New document** and pick your saved invoice template.",
      "3. Fill in your details, your client and what you're charging for. Picking a saved client fills in their details for you.",
      "4. Choose **Create document**, then **Download PDF** when it looks right.",
    ].join("\n"),
    followUps: ["clients", "download-pdf", "create-quotation"],
    id: "create-invoice",
    keywords: ["invoice", "bill", "billing"],
    label: "How do I create an invoice?",
  },
  {
    answer: [
      "Here's how to create a quotation:",
      "",
      "1. Open the **[Marketplace](/marketplace)**, find a **Quotation** template and choose **Save template**.",
      "2. Go to **[My Documents](/my-documents)**, choose **New document** and pick your saved quotation template.",
      "3. Fill in your details, your client and the prices you're quoting.",
      "4. Choose **Create document**, then **Download PDF** when it looks right.",
      "",
      "When your client accepts, create an invoice the same way.",
    ].join("\n"),
    followUps: ["create-invoice", "clients", "download-pdf"],
    id: "create-quotation",
    keywords: ["quote", "quotation", "estimate"],
    label: "How do I create a quotation?",
  },
  {
    answer:
      "A **template** is a reusable design you save to your library. A **document** is a copy of it with your own details filled in. One template can create as many documents as you need.",
    followUps: ["templates", "create-document"],
    id: "template-vs-document",
    keywords: ["difference", "different", "versus", "vs"],
    label: "What's the difference between a template and a document?",
  },
  {
    answer: [
      "Templates are ready-made document designs:",
      "",
      "1. Open the **[Marketplace](/marketplace)** to browse templates, grouped by style.",
      "2. Open any template to preview it with example content.",
      "3. Choose **Save template** to add it to **[My Templates](/my-templates)**.",
      "",
      `Each template shows a Free, Silver or Gold badge for the plan it needs. The free plan keeps up to ${FREE_SAVED_TEMPLATE_LIMIT} saved templates.`,
    ].join("\n"),
    followUps: ["create-document", "plans", "template-vs-document"],
    id: "templates",
    keywords: [
      "template",
      "marketplace",
      "design",
      "style",
      "layout",
      "theme",
      "look",
    ],
    label: "How do I find a template?",
  },
  {
    answer: [
      "Save the people and businesses you work with, so you never type their details twice:",
      "",
      "1. In **[My Clients](/my-clients)**, choose **Add client** and enter their details once.",
      "2. When you create a document, pick the client and their details are filled in for you.",
    ].join("\n"),
    followUps: ["create-invoice", "create-quotation"],
    id: "clients",
    keywords: ["client", "customer", "address book"],
    label: "How do I save my clients?",
  },
  {
    answer: [
      "Dokiments is free to start. Plans differ in which template styles you can use and how many templates you can save:",
      "",
      ...planLines,
      "",
      "Every plan can create unlimited documents, download PDFs and save clients. See plans and upgrade in **[Subscription](/subscription)**.",
    ].join("\n"),
    followUps: ["templates", "create-document"],
    id: "plans",
    keywords: [
      "plan",
      "price",
      "pricing",
      "cost",
      "how much",
      "free",
      "pay",
      "paid",
      "subscription",
      "subscribe",
      "upgrade",
      "premium",
      "silver",
      "gold",
      "limit",
    ],
    label: "Is Dokiments free? What do plans include?",
  },
  {
    answer: `Dokiments has ${documentTypes.length} document types: ${documentTypeList}.`,
    followUps: ["create-document", "templates"],
    id: "document-types",
    keywords: [
      "type",
      "kind",
      "which document",
      "what document",
      "support",
      "available",
      ...documentTypeKeywords,
    ],
    label: "Which documents can I create?",
  },
  {
    answer: [
      "Yes. Dokiments can be installed to your home screen like an app, and it keeps working when your connection drops.",
      "",
      "In your browser menu, look for **Install app**, **Install Dokiments** or **Add to Home screen**.",
    ].join("\n"),
    followUps: ["create-document"],
    id: "mobile",
    keywords: [
      "phone",
      "mobile",
      "app",
      "install",
      "offline",
      "android",
      "iphone",
      "ios",
      "tablet",
      "home screen",
      "internet",
    ],
    label: "Can I use Dokiments on my phone?",
  },
  {
    answer: [
      "We don't sell your personal information. Analytics and advertising cookies only run if you accept them, and you can change your choice any time through **Cookie settings** in the footer.",
      "",
      "Read more in our **[Privacy Policy](/privacy)**.",
    ].join("\n"),
    followUps: ["contact"],
    id: "privacy",
    keywords: [
      "privacy",
      "private",
      "data",
      "secure",
      "security",
      "safe",
      "gdpr",
      "cookie",
      "personal information",
    ],
    label: "How is my data handled?",
  },
  {
    answer:
      "Dokiments is a workspace for creating professional business documents, like invoices, quotations and contracts. Pick a template, add your details, and download a polished PDF.",
    followUps: ["create-document", "document-types", "plans"],
    id: "about",
    keywords: ["dokiments", "about", "what is", "who are you"],
    label: "What is Dokiments?",
  },
  {
    answer:
      "I can answer common questions about Dokiments. Pick a topic below or type your question.",
    followUps: [
      "create-invoice",
      "create-quotation",
      sharingEnabled ? "sign-document" : "download-pdf",
      "templates",
      "plans",
      "contact",
    ],
    id: "capabilities",
    keywords: ["help", "what can you do", "option", "menu", "topic"],
    label: "What can you help with?",
  },
  {
    answer: [
      "Here's how to create a document:",
      "",
      "1. Open the **[Marketplace](/marketplace)**, pick a template and choose **Save template**.",
      "2. Go to **[My Documents](/my-documents)**, choose **New document** and pick your saved template.",
      "3. Fill in your details and watch the preview update as you go.",
      "4. Choose **Create document**, then **Download PDF** when it looks right.",
    ].join("\n"),
    followUps: ["document-types", "clients", "download-pdf"],
    id: "create-document",
    keywords: [
      "create",
      "make",
      "new",
      "start",
      "write",
      "draft",
      "generate",
      "prepare",
      "fill",
      "document",
      ...documentTypeKeywords,
    ],
    label: "How do I create a document?",
  },
  {
    answer:
      "Hi! I'm Docsy. Ask me how to create an invoice, sign a document, download a PDF and more.",
    followUps: [
      "create-invoice",
      sharingEnabled ? "sign-document" : "download-pdf",
      "templates",
    ],
    id: "greeting",
    keywords: [
      "hi",
      "hello",
      "hey",
      "hiya",
      "good morning",
      "good afternoon",
      "good evening",
    ],
    label: "Hello",
  },
  {
    answer: "You're welcome! Anything else I can help with?",
    followUps: ["capabilities"],
    id: "thanks",
    keywords: ["thank", "thanks", "thank you", "thx", "cheers"],
    label: "Thanks",
  },
];

export const chatIntents = buildChatIntents({
  sharingEnabled: documentSharingEnabled,
});

/** Sent when no intent matches. */
export const fallbackAnswer =
  "Sorry, I don't have an answer for that yet. Try rephrasing, or pick one of these topics:";

export const fallbackFollowUps = [
  "create-invoice",
  "create-quotation",
  documentSharingEnabled ? "sign-document" : "download-pdf",
  "templates",
  "plans",
  "contact",
];
