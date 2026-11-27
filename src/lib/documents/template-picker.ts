import {
  getDocumentTypeLabel,
  getTemplateDisplayName,
  sortDocumentTypes,
} from "@/lib/market-place/document-labels";
import type {
  DocumentType,
  MarketplaceTemplate,
  UserDocument,
} from "@/types/template";

/** One type section of the template picker's list, e.g. "Invoices · 2". */
export type TemplatePickerGroup = {
  documentType: DocumentType;
  templates: MarketplaceTemplate[];
};

/** What the picker list is narrowed by. */
export type TemplatePickerFilter = {
  /** Free text matched against the name, style and type label. Case-insensitive. */
  search: string;
  /** A document type, or `"all"` for every type. */
  documentType: DocumentType | "all";
};

/**
 * When each template last started a document: the newest `createdAt` among the
 * user's documents made from it, keyed by template id.
 *
 * Templates the user never used are absent, so callers treat a missing entry
 * as "not used yet".
 *
 * @example
 * getTemplateLastUsed(documents)["classic-invoice"]; // 1718870400000
 */
export const getTemplateLastUsed = (
  documents: readonly Pick<UserDocument, "createdAt" | "templateId">[],
): Record<string, number> => {
  const lastUsed: Record<string, number> = {};

  for (const { createdAt, templateId } of documents) {
    if (createdAt > (lastUsed[templateId] ?? 0)) {
      lastUsed[templateId] = createdAt;
    }
  }

  return lastUsed;
};

/**
 * Filters the user's templates and groups them by document type for the
 * picker list.
 *
 * Groups follow {@link sortDocumentTypes} (invoices and quotations first). In a
 * group, the most recently used template comes first, then never-used ones by
 * name, so a repeat document is one row from the top. Empty groups are dropped.
 */
export const buildTemplatePickerGroups = (
  templates: readonly MarketplaceTemplate[],
  { documentType, search }: TemplatePickerFilter,
  lastUsed: Record<string, number> = {},
): TemplatePickerGroup[] => {
  const query = search.trim().toLocaleLowerCase();
  const byType = new Map<DocumentType, MarketplaceTemplate[]>();

  for (const template of templates) {
    if (documentType !== "all" && template.documentType !== documentType) {
      continue;
    }

    const haystack = [
      getTemplateDisplayName(template),
      template.name,
      template.style.name,
      getDocumentTypeLabel(template.documentType),
    ]
      .join(" ")
      .toLocaleLowerCase();

    if (query && !haystack.includes(query)) {
      continue;
    }

    byType.set(template.documentType, [
      ...(byType.get(template.documentType) ?? []),
      template,
    ]);
  }

  return sortDocumentTypes([...byType.keys()]).map((type) => ({
    documentType: type,
    templates: [...(byType.get(type) ?? [])].sort(
      (first, second) =>
        (lastUsed[second.id] ?? 0) - (lastUsed[first.id] ?? 0) ||
        getTemplateDisplayName(first).localeCompare(
          getTemplateDisplayName(second),
        ) ||
        first.style.name.localeCompare(second.style.name),
    ),
  }));
};

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["week", 7 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
];

/**
 * The muted "when" half of a picker row's caption, in plain English.
 *
 * Under a day reads "used today"; older dates round down to days, weeks,
 * months or years. A missing date reads "not used yet".
 *
 * @param usedAt - Epoch ms of the last document made from the template.
 * @param now - Epoch ms to measure from; injectable for tests.
 *
 * @example
 * formatTemplateLastUsed(Date.now() - 2 * 86_400_000); // "used 2 days ago"
 */
export const formatTemplateLastUsed = (
  usedAt: number | undefined,
  now: number = Date.now(),
) => {
  if (!usedAt) return "not used yet";

  const elapsed = Math.max(0, now - usedAt);

  for (const [unit, size] of units) {
    if (elapsed >= size) {
      return `used ${relativeTime.format(-Math.floor(elapsed / size), unit)}`;
    }
  }

  return "used today";
};
