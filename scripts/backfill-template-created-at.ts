/**
 * Adds `createdAt` to `templates` documents that don't have one, so the
 * notification center can tell when a template was added (see
 * docs/notifications.md). Documents that already have `createdAt` are never
 * touched, and only that one field is written (`updateMask`), so the script is
 * safe to re-run.
 *
 * By default the timestamp is 30 days ago — older than the 14-day notification
 * window — so backfilling the existing catalog does NOT announce every template
 * as new. To trigger notifications on purpose (e.g. to test the bell), narrow it:
 *
 *   BACKFILL_TEMPLATE_IDS=modern-invoice,classic-nda BACKFILL_CREATED_AT=now \
 *     npm run backfill:template-created-at
 *
 * Env:
 *   SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD  superadmin account (same as seed:templates)
 *   FIREBASE_API_KEY / FIREBASE_PROJECT_ID
 *   BACKFILL_TEMPLATE_IDS   optional comma-separated template IDs; default: all missing one
 *   BACKFILL_CREATED_AT     optional ISO 8601 timestamp or "now"; default: 30 days ago
 *   BACKFILL_FORCE          set to "1" to also overwrite an existing createdAt (only
 *                           together with BACKFILL_TEMPLATE_IDS; for re-testing)
 */

const FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1";
const AUTH_BASE_URL = "https://identitytoolkit.googleapis.com/v1";

type FirestoreDocument = {
  fields?: Record<string, unknown>;
  name?: string;
};

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const resolveCreatedAt = (): Date => {
  const raw = process.env.BACKFILL_CREATED_AT;
  if (!raw) return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (raw === "now") return new Date();

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`BACKFILL_CREATED_AT is not a valid date: ${raw}`);
  }
  return parsed;
};

const signInAsAdmin = async (email: string, password: string) => {
  const response = await fetch(
    `${AUTH_BASE_URL}/accounts:signInWithPassword?key=${requireEnv("FIREBASE_API_KEY")}`,
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

const documentsUrl = (path: string) =>
  `${FIRESTORE_BASE_URL}/projects/${requireEnv("FIREBASE_PROJECT_ID")}/databases/(default)/documents/${path}`;

const listTemplates = async (idToken: string) => {
  const documents: FirestoreDocument[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(documentsUrl("templates"));
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    const page = (await response.json()) as {
      documents?: FirestoreDocument[];
      error?: { message?: string };
      nextPageToken?: string;
    };

    if (!response.ok) {
      throw new Error(
        `Listing templates failed: ${page.error?.message ?? response.statusText}`,
      );
    }
    documents.push(...(page.documents ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);

  return documents;
};

const setCreatedAt = async (id: string, createdAt: Date, idToken: string) => {
  const response = await fetch(
    `${documentsUrl(`templates/${id}`)}?updateMask.fieldPaths=createdAt`,
    {
      body: JSON.stringify({
        fields: { createdAt: { timestampValue: createdAt.toISOString() } },
      }),
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
    },
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(
      `Write to templates/${id} failed: ${data?.error?.message ?? response.statusText}`,
    );
  }
};

const main = async () => {
  const createdAt = resolveCreatedAt();
  const onlyIds = process.env.BACKFILL_TEMPLATE_IDS?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  console.log(`Signing in as ${requireEnv("SEED_ADMIN_EMAIL")}...`);
  const idToken = await signInAsAdmin(
    requireEnv("SEED_ADMIN_EMAIL"),
    requireEnv("SEED_ADMIN_PASSWORD"),
  );

  const documents = await listTemplates(idToken);
  const known = new Set(documents.map((doc) => doc.name?.split("/").pop()));
  for (const id of onlyIds ?? []) {
    if (!known.has(id)) console.warn(`  ! templates/${id} does not exist`);
  }

  const force = process.env.BACKFILL_FORCE === "1";
  if (force && !onlyIds) {
    throw new Error("BACKFILL_FORCE requires BACKFILL_TEMPLATE_IDS.");
  }

  const targets = documents
    .map((doc) => ({ doc, id: doc.name?.split("/").pop() ?? "" }))
    .filter(({ doc, id }) => id && (force || !doc.fields?.createdAt))
    .filter(({ id }) => !onlyIds || onlyIds.includes(id));

  console.log(
    `Setting createdAt=${createdAt.toISOString()} on ${targets.length} of ${documents.length} templates...`,
  );
  for (const { id } of targets) {
    await setCreatedAt(id, createdAt, idToken);
    console.log(`  templates/${id}`);
  }
  console.log("Done.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
