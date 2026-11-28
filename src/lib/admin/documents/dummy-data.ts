import { daysAgo } from "@/lib/admin/sample-data";

/**
 * Sample document volume for the Documents and Overview pages.
 *
 * Replace `getDocumentStats` with a Firestore aggregation once per-user
 * documents can be counted across accounts (a collection-group query on
 * `documents`, plus a `{path=**}/documents` rule for superadmins).
 */

/** Documents created on one day. */
export type DailyDocumentCount = {
  count: number;
  /** Epoch milliseconds at the start of the day. */
  day: number;
};

/** How many documents of one type were created in the period. */
export type DocumentTypeCount = {
  count: number;
  /** Plain-language name, e.g. "Invoice". */
  label: string;
};

/** How far documents got, as one count per stage. */
export type DocumentStageCount = {
  count: number;
  label: "Completed" | "Draft" | "Shared" | "Signed";
};

/** One template ranked by how many documents it produced. */
export type TemplateUsage = {
  /** Change against the previous 30 days, as a fraction (`0.041` is +4.1%). */
  change: number;
  count: number;
  label: string;
  type: string;
};

export type DocumentStats = {
  /** Documents created per day for the last 30 days, oldest first. */
  daily: DailyDocumentCount[];
  /** Documents exported as PDF in the last 30 days. */
  exported: number;
  stages: DocumentStageCount[];
  topTemplates: TemplateUsage[];
  /** Documents ever created. */
  total: number;
  types: DocumentTypeCount[];
};

const dailyCounts = [
  884, 962, 1010, 612, 540, 931, 1024, 998, 1057, 973, 598, 512, 948, 1082, 1031,
  1003, 990, 640, 566, 1012, 1103, 1066, 1040, 1001, 655, 590, 1094, 1164, 1088, 1047,
];

const documentStats: DocumentStats = {
  daily: dailyCounts.map((count, index) => ({
    count,
    day: daysAgo(dailyCounts.length - 1 - index),
  })),
  exported: 17_930,
  stages: [
    { count: 11_402, label: "Completed" },
    { count: 9_120, label: "Draft" },
    { count: 5_310, label: "Shared" },
    { count: 2_772, label: "Signed" },
  ],
  topTemplates: [
    { change: 0.041, count: 6_120, label: "Classic invoice", type: "Invoice" },
    { change: 0.012, count: 3_488, label: "Itemised quotation", type: "Quotation" },
    { change: -0.028, count: 2_104, label: "Freelance contract", type: "Contract" },
    { change: 0.006, count: 1_972, label: "Simple receipt", type: "Receipt" },
    { change: 0.079, count: 1_310, label: "Mutual NDA", type: "NDA" },
    { change: -0.05, count: 822, label: "Modern CV", type: "CV" },
  ],
  total: 412_906,
  types: [
    { count: 9_812, label: "Invoice" },
    { count: 5_904, label: "Quotation" },
    { count: 3_770, label: "Contract" },
    { count: 3_212, label: "Receipt" },
    { count: 1_980, label: "NDA" },
    { count: 1_544, label: "Scope of Work" },
    { count: 1_328, label: "Meeting Notes" },
    { count: 1_054, label: "CV" },
  ],
};

/** Sample document volume. Swap for a Firestore read when the data exists. */
export const getDocumentStats = (): DocumentStats => documentStats;
