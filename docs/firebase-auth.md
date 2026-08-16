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
