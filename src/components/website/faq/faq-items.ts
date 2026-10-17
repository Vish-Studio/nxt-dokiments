import { documentTypes } from "@/types/template";

export interface FaqEntry {
  answer: string;
  question: string;
}

export const faqItems: FaqEntry[] = [
  {
    answer:
      "Dokiments is a workspace for creating professional business documents, like invoices, quotations and contracts. Pick a template, add your details, and download a polished PDF.",
    question: "What is Dokiments?",
  },
  {
    answer: `Dokiments has ${documentTypes.length} document types, including invoices, quotations, contracts, proposals, NDAs, and more.`,
    question: "Which document types does Dokiments support?",
  },
  {
    answer:
      "Sign in, open the Marketplace and save a template. Then go to My Documents, choose New document, pick your saved template and fill in the details. Choose Download PDF when it looks right.",
    question: "How do I create my first document?",
  },
  {
    answer:
      "A template is a reusable design you save to your library. A document is a copy of it with your own details filled in. One template can create as many documents as you need.",
    question: "What is the difference between a template and a document?",
  },
  {
    answer:
      "Templates come in several visual styles, from clean and traditional to bold and minimal. Preview any template in the Marketplace to see it filled with example content. New styles are added over time.",
    question: "What template styles are available?",
  },
  {
    answer:
      "Yes. Add a client once in My Clients, then pick them when creating a document and their details are filled in for you.",
    question: "Can I save my clients' details?",
  },
  {
    answer:
      "Yes. Download it as an A4 PDF containing only the document, ready to send to your client.",
    question: "Can I download my document?",
  },
  {
    answer:
      "Yes. You can edit or delete any of your documents from My Documents.",
    question: "Can I edit or delete a document later?",
  },
  {
    answer:
      "Yes, you can start for free. Plans and what each includes are shown under Subscription.",
    question: "Is Dokiments free to start?",
  },
  {
    answer:
      "Yes. Dokiments can be installed to your home screen like an app, and it keeps working when your connection drops.",
    question: "Can I use Dokiments on my phone or offline?",
  },
  {
    answer:
      "We don't sell your personal information. Analytics and advertising cookies only run if you accept them, and you can change your choice any time through Cookie settings in the footer.",
    question: "How is my data handled?",
  },
];
