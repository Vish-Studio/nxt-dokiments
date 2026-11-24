/**
 * Creates (or promotes) a superadmin account in the LOCAL Firebase emulators, so
 * `npm run seed:templates` has someone to sign in as. See `docs/local-firebase.md`.
 *
 * Refuses to run unless the emulator env vars are set: it writes `role:
 * "superadmin"` with the emulator's admin bypass, which must never be pointed at a
 * real project.
 *
 * Usage (normally via `npm run emulators:seed`):
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=... \
 *   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
 *     node .scratch-seed/scripts/seed-emulator-admin.js
 */

import { resolveFirebaseEndpoints } from "../src/lib/firebase/endpoints";

const endpoints = resolveFirebaseEndpoints();

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

/** The emulator accepts this literal bearer token as an admin that bypasses rules. */
const EMULATOR_ADMIN = { Authorization: "Bearer owner" };

type AuthResponse = { error?: { message?: string }; localId?: string };

const post = async (url: string, body: unknown): Promise<AuthResponse> => {
  const response = await fetch(url, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...EMULATOR_ADMIN },
    method: "POST",
  });
  return (await response.json()) as AuthResponse;
};

const main = async () => {
  if (
    !endpoints.emulating ||
    !process.env.FIRESTORE_EMULATOR_HOST ||
    !process.env.FIREBASE_AUTH_EMULATOR_HOST
  ) {
    throw new Error(
      "Refusing to run: set FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST. This script is for the local emulators only.",
    );
  }

  const email = requireEnv("SEED_ADMIN_EMAIL");
  const password = requireEnv("SEED_ADMIN_PASSWORD");
  const apiKey = process.env.FIREBASE_API_KEY || "emulator";
  const projectId = requireEnv("FIREBASE_PROJECT_ID");

  let account = await post(
    `${endpoints.identity}/accounts:signUp?key=${apiKey}`,
    {
      email,
      password,
      returnSecureToken: true,
    },
  );

  if (account.error?.message === "EMAIL_EXISTS") {
    account = await post(
      `${endpoints.identity}/accounts:signInWithPassword?key=${apiKey}`,
      { email, password, returnSecureToken: true },
    );
  }

  if (!account.localId) {
    throw new Error(
      `Could not create the admin account: ${account.error?.message ?? "unknown error"}`,
    );
  }

  // Verified, so the account can use features gated on a verified address.
  await post(`${endpoints.identity}/accounts:update?key=${apiKey}`, {
    emailVerified: true,
    localId: account.localId,
  });

  const response = await fetch(
    `${endpoints.firestore}/projects/${projectId}/databases/(default)/documents/users/${account.localId}`,
    {
      body: JSON.stringify({
        fields: {
          displayName: { stringValue: "Local Admin" },
          email: { stringValue: email },
          role: { stringValue: "superadmin" },
        },
      }),
      headers: { "Content-Type": "application/json", ...EMULATOR_ADMIN },
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error(`Could not write the admin profile: ${response.status}`);
  }

  console.log(`Superadmin ready in the emulators: ${email}`);
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
