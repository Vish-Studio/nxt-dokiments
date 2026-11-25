# Local Firebase (emulators)

Run Auth and Firestore on your machine instead of the cloud project. Nothing you
do here touches real users or data, and your `firestore.rules` are enforced
exactly as in the cloud.

## How it works

The app talks to Firebase only over REST, and the base URLs come from one
module, `src/lib/firebase/endpoints.ts`. Two standard variables redirect them:

| Variable | Redirects |
| --- | --- |
| `FIRESTORE_EMULATOR_HOST` | Firestore reads and writes |
| `FIREBASE_AUTH_EMULATOR_HOST` | Sign in, sign up, account lookup, token refresh |

They are **ignored on Vercel Production** (`VERCEL_ENV=production`), so a stray
value can never redirect a live deployment. The seed scripts share the same
module.

## Run it

You need Java (the emulators are a Java process; `npm run test:rules` already
needs it) and `firebase-tools`, which the script fetches with `npx`.

1. Start the emulators and leave them running:
   ```bash
   npm run emulators
   ```
   Auth is on `127.0.0.1:9099`, Firestore on `8080`, and the UI on
   <http://127.0.0.1:4000>. Data is saved to `.emulator-data/` (git-ignored) when
   you stop them with Ctrl+C, and loaded again next time.
2. Seed a superadmin and the template catalog (first run, or after wiping
   `.emulator-data/`):
   ```bash
   npm run emulators:seed
   ```
   This creates `admin@dokiments.local` / `localadmin123`. These are local-only
   credentials that exist nowhere else.
3. Start the app against them:
   ```bash
   npm run dev:emulated
   ```
   It sets the two host variables plus `FIREBASE_PROJECT_ID=demo-dokiments` and
   a dummy `FIREBASE_API_KEY`. Process variables win over `.env.local`, so your
   cloud credentials are not used and need no editing.

Sign up at `/sign-up` and use the app as normal. To start clean, stop the
emulators and delete `.emulator-data/`.

To point another command at the emulators, set the same variables on it:
`FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 FIREBASE_PROJECT_ID=demo-dokiments <command>`.

## Limits

- **Google sign-in doesn't work.** The emulator can't run the real OAuth flow.
  Use email and password.
- **No real email.** Verification links are not sent. Open the Auth emulator UI
  (Authentication tab) to see the accounts and verification codes, or mark an
  account verified there. The seeded admin is already verified.
- **Port clashes.** `npm run test:rules` starts its own Firestore emulator on
  the same port, so stop `npm run emulators` before running it.
- **Phone testing.** For a phone, run the app with the same variables and tunnel
  it as described in [push-notifications.md](push-notifications.md); the emulators
  stay on your machine because only the app server talks to them.
- Rules are checked against emulator tokens, which are unsigned. That is fine
  for testing the rules' logic, but it is not a security test of Google's
  token verification.
