# Firebase Auth Setup

Dokiments uses Firebase Auth and Firestore through Firebase REST APIs, called
server-only from Route Handlers — the `firebase` client SDK is not used
anywhere in `src/`, and no auth tokens are ever sent to the browser.

## Environment Variables

Create `.env.local` in the project root:

```bash
FIREBASE_API_KEY=your-web-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
SESSION_SECRET=your-session-secret # openssl rand -base64 32
```

Then restart `npm run dev`.

## Firebase Console

1. Open Firebase Console.
2. Enable Authentication > Sign-in method > Email/Password.
3. Enable Firestore Database.
4. Create a `users` collection. User profile documents are written to `users/{uid}` after registration/sign-in.

## Google Sign-In Setup

Google sign-in reuses the same REST-only approach: a server-side OAuth 2.0
authorization-code redirect (`/api/auth/google/start` → Google → `/api/auth/google/callback`),
which exchanges the resulting Google identity token with Firebase's
`accounts:signInWithIdp` endpoint. No Google JS SDK runs in the browser.

```bash
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

If someone signs in with Google using the same email as an existing
password account, Firebase auto-links the identities — both sign-in methods
resolve to the same `uid`. A user's `provider` field on `users/{uid}` (`"password"`
or `"google"`) is set once, at profile creation, and reflects how the account
was originally created — it is what gates the password-change UI in Settings.
When a password account is auto-linked this way, `linkedGoogle` is set to
`true` on that same document (purely informational — it powers a "Google is
also connected" note in Settings and never gates access).

## Session lifetime

A session lives for **24 hours from sign-in, absolutely**. This is a hard cap, not
an idle timeout: using the app does not extend it, so every user re-authenticates
at least once a day. It is separate from — and always wins over — the ~1 hour
Firebase `idToken` lifetime, which is still refreshed transparently in the
background.

The deadline is stored as `absoluteExpiresAt` on `SessionData`
(`src/lib/session.ts`), stamped once by `startSession` and never moved.

`absoluteExpiresAt` is deliberately **not** on `AuthSession` in
`src/types/auth.ts`. Every token-rotation path assigns a freshly-built
`AuthSession` over the session object, so keeping the field off that type makes it
structurally impossible for a refresh to reset the clock. Don't move it.

Two helpers in `src/lib/api/session-cookie.ts` own all cookie writes:

- `startSession` — sign-in, sign-up and the Google callback only. Starts the clock.
- `saveSession` — token rotation. Requires the caller to carry `absoluteExpiresAt`
  over, and re-seals with only the *remaining* time as the `ttl`.
- `destroySession` — sign-out and any expiry rejection.

The deadline is enforced independently in four places, so no single miss leaves a
session usable:

| Where | On expiry |
| --- | --- |
| `proxy.ts` | Redirect to `/sign-in?expired=1&next=…`, clearing both cookies |
| `withSession` (`src/lib/api/with-session.ts`) | `401` on every data route, before Firestore is touched |
| `GET /api/auth/me` | `401`, checked *before* any refresh attempt |
| `useSessionTimeout` (`src/hooks/use-session-timeout.ts`) | Client-side sign-out so an idle open tab doesn't sit there looking signed in |

### Cookies

| Cookie | Contents | Flags |
| --- | --- | --- |
| `dokiments-session` | Sealed session (tokens, user, `absoluteExpiresAt`) | `HttpOnly`, `SameSite=Lax`, `Secure` in prod, `ttl` 24 h (iron-session derives `Max-Age` = `ttl - 60`) |
| `dokiments-session-expiry` | `absoluteExpiresAt` as plain epoch-ms | **No** `HttpOnly` — the client reads it to schedule its own sign-out |

The plaintext cookie is a scheduling hint only. It is trivially editable, so every
authorisation decision reads the sealed cookie instead. Its name and reader live in
`src/lib/auth/session-expiry.ts` because `src/lib/session.ts` is `server-only`.

### Notes

- Sessions sealed before `absoluteExpiresAt` existed are treated as expired, so
  deploying this signs existing users out once.
- Under `DEV_AUTH_BYPASS`, the deadline is pinned to a far-future sentinel and the
  seal `ttl` is disabled, so local development is never interrupted.
- Sign-out still only drops cookies; it does **not** revoke the Firebase refresh
  token, which would need an Admin SDK call.

## Roles

Supported roles are:

- `superadmin`
- `free`
- `silver`
- `gold`
- `special`

New sign-ups are always created with the `free` role. Do not let clients promote themselves. Use the Firebase Console, Admin SDK, or a trusted Cloud Function to update a user's `role` field.

## Suggested Firestore Rules

These rules let users create/read their own profile, keep new accounts on the `free` role, and only let superadmins update roles.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isOwner(uid) {
      return signedIn() && request.auth.uid == uid;
    }

    function currentUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }

    function isSuperadmin() {
      return signedIn() && currentUserRole() == 'superadmin';
    }

    match /users/{uid} {
      allow read: if isOwner(uid) || isSuperadmin();

      allow create: if isOwner(uid)
        && request.resource.data.role == 'free'
        && request.resource.data.email is string
        && request.resource.data.displayName is string;

      allow update: if isOwner(uid)
        && request.resource.data.role == resource.data.role
        && request.resource.data.email == resource.data.email;

      allow update: if isSuperadmin();
    }
  }
}
```

For stronger production RBAC, mirror roles into Firebase custom claims with the Admin SDK and verify those claims in backend endpoints or Firestore rules.
