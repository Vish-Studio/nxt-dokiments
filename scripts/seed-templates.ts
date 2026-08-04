/**
 * One-time seed script: writes the app's static template catalog
 * (`src/lib/market-place/documents.ts` × `styles.ts`) into the Firestore
 * `templates` and `templateStyles` collections, with IDs matching the scheme
 * already used by `savedTemplates` records today (`{styleId}-{documentType}`),
 * so nothing a user has already saved dangles after this runs.
 *
 * Authenticates as a real Firebase user with `role: "superadmin"` via the
 * Identity Toolkit REST API — the same trust model the rest of this app uses.
 * `firestore.rules` grants write access to `templates`/`templateStyles` only to
 * that role (see the `isSuperadmin()` rule), so this script cannot run as a
 * regular user even with valid credentials.
 *
 * Usage:
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=... \
 *     npm run seed:templates
 *
 * This file is plain TypeScript compiled ad hoc by `npm run seed:templates`
 * (see package.json) — there is no `ts-node`/`tsx` in this project, so it is
 * NOT executed directly with `node scripts/seed-templates.ts`.
 */

import { documentBlueprints } from "../src/lib/market-place/documents";
import { templateStyles } from "../src/lib/market-place/styles";
import type { DocumentMeta, TemplateStyle } from "../src/types/template";

const FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1";
const AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/** Minimal Firestore REST value constructors — duplicated from server-firestore.ts
 * on purpose: this script runs outside the Next.js/TypeScript-path-alias build,
 * so it cannot import "@/lib/firebase/server-firestore" without its own bundler. */
const stringValue = (value: string) => ({ stringValue: value });
const booleanValue = (value: boolean) => ({ booleanValue: value });
const integerValue = (value: number) => ({ integerValue: String(value) });
const arrayValue = (values: unknown[]) => ({ arrayValue: { values } });
const mapValue = (fields: Record<string, unknown>) => ({
  mapValue: { fields },
});

const signInAsAdmin = async (email: string, password: string) => {
  const apiKey = requireEnv("FIREBASE_API_KEY");
  const response = await fetch(
    `${AUTH_BASE_URL}/accounts:signInWithPassword?key=${apiKey}`,
    {
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );

  const data = (await response.json()) as {
    error?: { message?: string };
    idToken?: string;
  };

  if (!response.ok || !data.idToken) {
    throw new Error(
      `Sign-in failed: ${data.error?.message ?? response.statusText}`,
    );
  }

  return data.idToken;
};

const putDocument = async (
  path: string,
  fields: Record<string, unknown>,
  idToken: string,
) => {
  const projectId = requireEnv("FIREBASE_PROJECT_ID");
  const url = `${FIRESTORE_BASE_URL}/projects/${projectId}/databases/(default)/documents/${path}`;

  const response = await fetch(url, {
    body: JSON.stringify({ fields }),
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(
      `Write to ${path} failed: ${data?.error?.message ?? response.statusText}`,
    );
  }
};

const seedStyle = async (
  style: TemplateStyle,
  sortOrder: number,
  idToken: string,
) => {
  await putDocument(
    `templateStyles/${style.id}`,
    {
      description: stringValue(style.description),
      isActive: booleanValue(true),
      name: stringValue(style.name),
      sortOrder: integerValue(sortOrder),
      tier: stringValue(style.tier),
    },
    idToken,
  );
  console.log(`  templateStyles/${style.id}`);
};

const seedTemplate = async (
  templateId: string,
  blueprint: DocumentMeta,
  style: TemplateStyle,
  sortOrder: number,
  idToken: string,
) => {
  await putDocument(
    `templates/${templateId}`,
    {
      description: stringValue(blueprint.description),
      documentType: stringValue(blueprint.type),
      fields: arrayValue(
        blueprint.fields.map((field) =>
          mapValue({
            key: stringValue(field.key),
            label: stringValue(field.label),
            ...(field.placeholder
              ? { placeholder: stringValue(field.placeholder) }
              : {}),
            type: stringValue(field.type),
          }),
        ),
      ),
      isActive: booleanValue(true),
      name: stringValue(blueprint.name),
      sortOrder: integerValue(sortOrder),
      styleId: stringValue(style.id),
      tier: stringValue(style.tier),
    },
    idToken,
  );
  console.log(`  templates/${templateId}`);
};

const main = async () => {
  const email = requireEnv("SEED_ADMIN_EMAIL");
  const password = requireEnv("SEED_ADMIN_PASSWORD");

  console.log(`Signing in as ${email}...`);
  const idToken = await signInAsAdmin(email, password);

  console.log("Seeding templateStyles...");
  await Promise.all(
    templateStyles.map((style, index) => seedStyle(style, index, idToken)),
  );

  console.log("Seeding templates...");
  const blueprints = Object.values(documentBlueprints);
  let sortOrder = 0;
  for (const style of templateStyles) {
    for (const blueprint of blueprints) {
      const templateId = `${style.id}-${blueprint.type}`;
      await seedTemplate(templateId, blueprint, style, sortOrder, idToken);
      sortOrder += 1;
    }
  }

  console.log(
    `Done. Seeded ${templateStyles.length} styles and ${templateStyles.length * blueprints.length} templates.`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
