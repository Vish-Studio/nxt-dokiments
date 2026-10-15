import "server-only";

import {
  getDocumentId,
  listFirestoreCollection,
  readArray,
  readBoolean,
  readInteger,
  readMap,
  readString,
  readTimestamp,
  type FirestoreDocument,
} from "@/lib/firebase/server-firestore";
import type {
  DocumentType,
  MarketplaceTemplate,
  TemplateField,
  TemplateStyle,
  TemplateTier,
} from "@/types/template";

const TEMPLATES_COLLECTION = "templates";
const TEMPLATE_STYLES_COLLECTION = "templateStyles";

/** Reads a document's `sortOrder` field, defaulting to the end of the list if absent. */
const readSortOrder = (document: FirestoreDocument): number =>
  readInteger(document.fields?.sortOrder) ?? Number.MAX_SAFE_INTEGER;

/** Sorts documents by their `sortOrder` field, ascending. */
const bySortOrder = (a: FirestoreDocument, b: FirestoreDocument) =>
  readSortOrder(a) - readSortOrder(b);

/** Narrows an arbitrary string to the `TemplateTier` union, falling back to `"free"`. */
const toTemplateTier = (value: string | undefined): TemplateTier =>
  value === "silver" || value === "gold" ? value : "free";

/** Deserialises a `templateStyles/{styleId}` document into a `TemplateStyle`. */
const parseTemplateStyle = (document: FirestoreDocument): TemplateStyle => {
  const fields = document.fields ?? {};

  return {
    description: readString(fields.description) ?? "",
    id: getDocumentId(document) as TemplateStyle["id"],
    name: readString(fields.name) ?? "",
    tier: toTemplateTier(readString(fields.tier)),
  };
};

/** Deserialises a `fields` array field into `TemplateField[]`. */
const parseTemplateFields = (document: FirestoreDocument): TemplateField[] =>
  readArray(document.fields?.fields).map((value) => {
    const field = readMap(value);
    return {
      key: readString(field.key) ?? "",
      label: readString(field.label) ?? "",
      placeholder: readString(field.placeholder),
      type: (readString(field.type) ?? "text") as TemplateField["type"],
    };
  });

/**
 * Deserialises a `templates/{templateId}` document into a `MarketplaceTemplate`,
 * resolving its `styleId` reference against the already-fetched style catalog.
 *
 * @param document - Firestore document fetched from `templates/{templateId}`.
 * @param stylesById - Every active style, keyed by ID, used to resolve `styleId`.
 * @returns The `MarketplaceTemplate`, or `null` when its referenced style is missing/inactive.
 */
const parseMarketplaceTemplate = (
  document: FirestoreDocument,
  stylesById: Map<string, TemplateStyle>,
): MarketplaceTemplate | null => {
  const fields = document.fields ?? {};
  const styleId = readString(fields.styleId) ?? "";
  const style = stylesById.get(styleId);

  if (!style) return null;

  const createdAt = readTimestamp(fields.createdAt);

  return {
    ...(createdAt ? { createdAt: Date.parse(createdAt) } : {}),
    description: readString(fields.description) ?? "",
    documentType: (readString(fields.documentType) ?? "") as DocumentType,
    fields: parseTemplateFields(document),
    id: getDocumentId(document),
    name: readString(fields.name) ?? "",
    style,
    tier: toTemplateTier(readString(fields.tier)),
  };
};

interface Catalog {
  styles: TemplateStyle[];
  templates: MarketplaceTemplate[];
}

/** How long the shared catalog is reused before it is re-read from Firestore. */
const CATALOG_TTL_MS = 5 * 60_000;

let catalogCache: { expiresAt: number; value: Promise<Catalog> } | null = null;

/** Reads the whole catalog from Firestore (2 list reads) and joins templates with styles. */
const fetchCatalog = async (idToken: string): Promise<Catalog> => {
  const [templateDocs, styleDocs] = await Promise.all([
    listFirestoreCollection(TEMPLATES_COLLECTION, idToken),
    listFirestoreCollection(TEMPLATE_STYLES_COLLECTION, idToken),
  ]);

  const activeStyleDocs = styleDocs
    .filter((document) => readBoolean(document.fields?.isActive) ?? false)
    .sort(bySortOrder);
  const styles = activeStyleDocs.map(parseTemplateStyle);
  const stylesById = new Map(styles.map((style) => [style.id, style]));

  const templates = templateDocs
    .filter((document) => readBoolean(document.fields?.isActive) ?? false)
    .sort(bySortOrder)
    .map((document) => parseMarketplaceTemplate(document, stylesById))
    .filter((template): template is MarketplaceTemplate => template !== null);

  return { styles, templates };
};

/**
 * Returns the marketplace catalog, shared by every user of this server instance.
 *
 * The catalog is the same for all signed-in users (Firestore rules allow any
 * signed-in user to read it) and changes only when it is re-seeded, so it is
 * reused for `CATALOG_TTL_MS` instead of re-read on every request. Concurrent
 * callers share one in-flight load, and a failed load is not cached.
 */
const getCatalog = (idToken: string): Promise<Catalog> => {
  const now = Date.now();
  if (catalogCache && catalogCache.expiresAt > now) return catalogCache.value;

  const value = fetchCatalog(idToken);
  const entry = { expiresAt: now + CATALOG_TTL_MS, value };
  catalogCache = entry;
  value.catch(() => {
    if (catalogCache === entry) catalogCache = null;
  });
  return value;
};

/**
 * Lists every active marketplace template, joined with its style.
 *
 * Templates whose `styleId` does not resolve to an active style are silently
 * excluded. Served from the shared catalog cache.
 *
 * @param idToken - Firebase ID token used to authorise the Firestore reads on a cache miss.
 * @returns All active templates, each joined with its resolved style.
 * @throws When a Firestore request fails on a cache miss.
 */
export const listActiveTemplates = async (
  idToken: string,
): Promise<MarketplaceTemplate[]> => (await getCatalog(idToken)).templates;

/**
 * Lists every active template style, sorted by the seeded `sortOrder` field.
 * Served from the shared catalog cache.
 *
 * @param idToken - Firebase ID token used to authorise the Firestore reads on a cache miss.
 * @returns All active styles, sorted by `sortOrder`.
 * @throws When a Firestore request fails on a cache miss.
 */
export const listActiveStyles = async (
  idToken: string,
): Promise<TemplateStyle[]> => (await getCatalog(idToken)).styles;

/**
 * Fetches a single marketplace template by ID, joined with its style.
 * Served from the shared catalog cache, so it costs no Firestore reads when warm.
 *
 * @param templateId - ID of the template to fetch.
 * @param idToken - Firebase ID token used to authorise the Firestore reads on a cache miss.
 * @returns The `MarketplaceTemplate`, or `null` when it does not exist, is inactive,
 *   or its style does not exist or is inactive.
 * @throws When a Firestore request fails on a cache miss.
 */
export const getTemplateById = async (
  templateId: string,
  idToken: string,
): Promise<MarketplaceTemplate | null> =>
  (await getCatalog(idToken)).templates.find(
    (template) => template.id === templateId,
  ) ?? null;
