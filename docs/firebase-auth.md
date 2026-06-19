# Firebase Auth Setup

Dokiments uses Firebase Auth and Firestore through Firebase REST APIs. The Firebase SDK could not be installed in this workspace because the local disk is full, so there is no `firebase` package dependency required by the current implementation.

## Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="your-web-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
```

Then restart `npm run dev`.

## Firebase Console

1. Open Firebase Console.
2. Enable Authentication > Sign-in method > Email/Password.
3. Enable Firestore Database.
4. Create a `users` collection. User profile documents are written to `users/{uid}` after registration/sign-in.

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
