/**
 * Where the Firebase REST APIs live: Google's cloud, or the local Firebase
 * Emulator Suite when it is switched on. See `docs/local-firebase.md`.
 *
 * Deliberately free of `server-only` and `@/` imports so the seed scripts, which
 * run outside the Next.js build, can share it with the app.
 */
export type FirebaseEndpoints = {
  /** Firestore REST base, ending in `/v1`. */
  firestore: string;
  /** Identity Toolkit (sign in, sign up, account lookup) base, ending in `/v1`. */
  identity: string;
  /** Secure Token Service (token refresh) base, ending in `/v1`. */
  token: string;
  /** `true` when at least one of the services points at an emulator. */
  emulating: boolean;
};

const CLOUD: FirebaseEndpoints = {
  emulating: false,
  firestore: "https://firestore.googleapis.com/v1",
  identity: "https://identitytoolkit.googleapis.com/v1",
  token: "https://securetoken.googleapis.com/v1",
};

/** Accepts `127.0.0.1:8080`, `http://localhost:8080/` and the like; returns `host:port`. */
const normalizeHost = (value: string | undefined): string | undefined => {
  const host = value
    ?.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");

  return host || undefined;
};

/**
 * Resolves the Firebase REST base URLs from the environment.
 *
 * - `FIRESTORE_EMULATOR_HOST` redirects Firestore to the local emulator.
 * - `FIREBASE_AUTH_EMULATOR_HOST` redirects sign in, sign up and token refresh.
 *   The Auth emulator serves each Google API under its original hostname as the
 *   first path segment, hence the `identitytoolkit.googleapis.com/` infix.
 *
 * These are the variable names the Firebase tooling itself uses, so
 * `firebase emulators:exec` sets them with no extra wiring. Each service is
 * switched independently.
 *
 * **Ignored on Vercel Production** (`VERCEL_ENV === "production"`), so a stray
 * variable can never redirect a live deployment's sign-ins and data to a
 * non-existent local host. The same guard keeps `sendEmail` from going live
 * outside Production.
 *
 * Reads the environment on every call so tests can stub it.
 *
 * @example
 * resolveFirebaseEndpoints({ FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080" }).firestore;
 * // "http://127.0.0.1:8080/v1"
 */
export const resolveFirebaseEndpoints = (
  env: Record<string, string | undefined> = process.env,
): FirebaseEndpoints => {
  if (env.VERCEL_ENV === "production") return CLOUD;

  const firestoreHost = normalizeHost(env.FIRESTORE_EMULATOR_HOST);
  const authHost = normalizeHost(env.FIREBASE_AUTH_EMULATOR_HOST);

  if (!firestoreHost && !authHost) return CLOUD;

  return {
    emulating: true,
    firestore: firestoreHost ? `http://${firestoreHost}/v1` : CLOUD.firestore,
    identity: authHost
      ? `http://${authHost}/identitytoolkit.googleapis.com/v1`
      : CLOUD.identity,
    token: authHost
      ? `http://${authHost}/securetoken.googleapis.com/v1`
      : CLOUD.token,
  };
};
