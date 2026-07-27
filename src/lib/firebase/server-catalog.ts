import "server-only";

import {
  getDocumentId,
  getFirestoreDocument,
  listFirestoreCollection,
  readArray,
  readBoolean,
  readInteger,
  readMap,
  readString,
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

  return {
    description: readString(fields.description) ?? "",
    documentType: (readString(fields.documentType) ?? "") as DocumentType,
    fields: parseTemplateFields(document),
    id: getDocumentId(document),
    name: readString(fields.name) ?? "",
    style,
    tier: toTemplateTier(readString(fields.tier)),
  };
};

/**
 * Lists every active marketplace template, joined with its style.
 *
 * Templates whose `styleId` does not resolve to an active style are silently
 * excluded — this can only happen if the catalog data itself is inconsistent
 * (e.g. a style was deactivated without deactivating its templates).
 *
 * @param idToken - Firebase ID token used to authorise the Firestore reads.
 * @returns All active templates, each joined with its resolved style.
 * @throws When either Firestore request fails.
 */
export const listActiveTemplates = async (
  idToken: string,
): Promise<MarketplaceTemplate[]> => {
  const [templateDocs, styleDocs] = await Promise.all([
    listFirestoreCollection(TEMPLATES_COLLECTION, idToken),
    listFirestoreCollection(TEMPLATE_STYLES_COLLECTION, idToken),
  ]);

  const stylesById = new Map(
    styleDocs
      .filter((document) => readBoolean(document.fields?.isActive) ?? false)
      .map((document) => [
        getDocumentId(document),
        parseTemplateStyle(document),
      ]),
  );

  return templateDocs
    .filter((document) => readBoolean(document.fields?.isActive) ?? false)
    .sort(bySortOrder)
    .map((document) => parseMarketplaceTemplate(document, stylesById))
    .filter((template): template is MarketplaceTemplate => template !== null);
};

/**
 * Lists every active template style, e.g. for the Marketplace tab bar.
 * Ordering matters here — styles are meant to appear in a stable, intentional
 * sequence (Classic, Modern, Brutalist, Minimalist), not whatever order
 * Firestore happens to return, so this sorts by the seeded `sortOrder` field.
 *
 * @param idToken - Firebase ID token used to authorise the Firestore read.
 * @returns All active styles, sorted by `sortOrder`.
 * @throws When the Firestore request fails.
 */
export const listActiveStyles = async (
  idToken: string,
): Promise<TemplateStyle[]> => {
  const styleDocs = await listFirestoreCollection(
    TEMPLATE_STYLES_COLLECTION,
    idToken,
  );

  return styleDocs
    .filter((document) => readBoolean(document.fields?.isActive) ?? false)
    .sort(bySortOrder)
    .map(parseTemplateStyle);
};

/**
 * Fetches a single marketplace template by ID, joined with its style.
 *
 * @param templateId - ID of the template to fetch.
 * @param idToken - Firebase ID token used to authorise the Firestore reads.
 * @returns The `MarketplaceTemplate`, or `null` when it does not exist, is inactive,
 *   or its style does not exist or is inactive.
 * @throws When either Firestore request fails for a reason other than a 404.
 */
export const getTemplateById = async (
  templateId: string,
  idToken: string,
): Promise<MarketplaceTemplate | null> => {
  const document = await getFirestoreDocument(
    `${TEMPLATES_COLLECTION}/${templateId}`,
    idToken,
  );

  if (!document || !(readBoolean(document.fields?.isActive) ?? false)) {
    return null;
  }

  const styleId = readString(document.fields?.styleId) ?? "";
  const styleDocument = await getFirestoreDocument(
    `${TEMPLATE_STYLES_COLLECTION}/${styleId}`,
    idToken,
  );

  if (
    !styleDocument ||
    !(readBoolean(styleDocument.fields?.isActive) ?? false)
  ) {
    return null;
  }

  const stylesById = new Map([[styleId, parseTemplateStyle(styleDocument)]]);
  return parseMarketplaceTemplate(document, stylesById);
};
