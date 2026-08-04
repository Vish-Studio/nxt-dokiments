import "server-only";

/**
 * Firebase project credentials for server-side use only.
 *
 * Unlike the old `NEXT_PUBLIC_FIREBASE_*` vars these are never bundled into the
 * client, so they cannot be scraped from the browser.
 */
export type FirebaseServerConfig = {
  /** Firebase Web API key — used as the `?key=` query param on Auth REST calls. */
  apiKey: string;
  /** Firebase project ID — used to build Firestore document URLs. */
  projectId: string;
};

/** Resolved Firebase server config from environment variables. */
export const serverFirebaseConfig: FirebaseServerConfig = {
  apiKey: process.env.FIREBASE_API_KEY ?? "",
  projectId: process.env.FIREBASE_PROJECT_ID ?? "",
};

/**
 * Returns `true` when both required Firebase env vars are present.
 * Route handlers call this before making any Firebase REST requests so they
 * can throw a clear error rather than an opaque 400 from the Firebase API.
 */
export const hasServerFirebaseConfig = () =>
  Boolean(serverFirebaseConfig.apiKey && serverFirebaseConfig.projectId);
