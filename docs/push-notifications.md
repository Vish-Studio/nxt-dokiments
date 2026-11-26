# Push notifications

Web Push lets Dokiments alert a user on a device even when the app is closed.
This document covers the **groundwork**: subscribing a device, storing it,
sending to it, and showing it in the service worker. No real application event
pushes yet; the only push today is the **Send test notification** button.
Pushing share and signature events is the follow-up. The bell
([notifications.md](notifications.md)) is unchanged.

## Switching it on

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED` | Build time | Master flag. Off unless exactly `"true"`. Off hides the Settings tab and makes `/api/push/*` answer `404`. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Build time | Public VAPID key browsers subscribe with. |
| `VAPID_PRIVATE_KEY` | Server only | Signs every push. Never commit or log it. |
| `VAPID_SUBJECT` | Server only | Contact (`mailto:` or `https:`) for the push services. Optional. |

Generate the key pair once per environment with `npm run push:setup`. It adds
the public and private keys to `.env.local` without changing other settings;
it refuses to replace existing keys or complete an incomplete pair. The
print-only `npm run push:keys` command remains available for manual setup.
**Changing the public key invalidates every existing subscription**; users
must turn notifications on again. With the flag on but a key missing, the
routes answer `503`.

## Testing locally

You can test against a real (nonprod) Firebase project, or entirely locally with
the Firebase emulators (see [local-firebase.md](local-firebase.md)). The emulator
route needs no cloud project and no `firestore.rules` deploy, because the
emulator loads `firestore.rules` from `firebase.json`.

### With the emulators (recommended)

1. Run `npm run push:setup` to add the public and private VAPID keys to
   `.env.local`. Set `NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED=true` and
   `VAPID_SUBJECT=mailto:you@example.com` there as well.
2. In a terminal, run `npm run emulators` and leave it running. The first time
   (or after wiping `.emulator-data/`), run `npm run emulators:seed` in another.
3. Build and start the app against them. The flag and public key are inlined at
   build time, so a change to either needs a rebuild:
   ```bash
   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
   FIREBASE_PROJECT_ID=demo-dokiments \
   FIREBASE_API_KEY=emulator \
   sh -c 'npm run build && npm start'
   ```
4. Sign up at `http://localhost:3000` with email and password (Google sign-in
   doesn't work in the emulator), or use `admin@dokiments.local` /
   `localadmin123`, then continue from step 5 below.
5. To check the stored subscription, open the emulator UI at
   <http://127.0.0.1:4000> → Firestore → `users/<uid>/pushSubscriptions`.

### With a real Firebase project

Use a production build: the service worker is most reliable there, and
`localhost` counts as a secure context, so no HTTPS is needed.

1. Run `npm run push:setup` to add the public and private VAPID keys to
   `.env.local`.
2. Set the feature flag and contact address in `.env.local`:
   ```
   NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED=true
   VAPID_SUBJECT=mailto:you@example.com
   ```
3. Rebuild and start. The flag and public key are inlined at build time, so a
   change to either needs a rebuild: `rm -rf .next && npm run build && npm start`.
4. Sign in with a real Firebase account at `http://localhost:3000` (not needed if
   you used the emulators above).
   `DEV_AUTH_BYPASS` has no real ID token, so Firestore writes would fail.
5. Open **Settings → Notifications**, click _Turn on notifications_ and allow
   the prompt.
6. Click _Send test notification_. To test the closed-app case, close the tab
   (or the installed PWA window) and send it again; this works while the browser
   is still running. Clicking the notification should open `/settings`.
7. Click _Turn off_ and confirm the `pushSubscriptions` document disappears in
   Firestore. Signing out should remove it too.

Tips:

- Chrome DevTools → Application → Service Workers has a **Push** button to fire
  a raw event, and shows the subscription under Storage.
- After clicking _Block_, Chrome won't ask again. Reset it from the lock icon in
  the address bar → Site settings.
- macOS may silently drop notifications under Focus / Do Not Disturb, or if
  Chrome is disabled in System Settings → Notifications.
- To test the installed PWA, install from Chrome's install button, then repeat
  steps 5–6 in that window.
- iOS needs a real device, the app added to the Home Screen, and an HTTPS URL;
  see "Testing on an iPhone" below.
- With a real Firebase project, deploy `firestore.rules` first, or saving the
  subscription fails with a permission error. The emulators need no deploy.

## Testing on an iPhone

A phone can't reach `localhost`, and iOS only allows service workers and push on
HTTPS, so the app is served through a Cloudflare quick tunnel (no account
needed; the `cloudflared` dev dependency downloads its own binary).

1. Do steps 1–2 of "With the emulators" above: keys in `.env.local`, emulators
   running and seeded. (Or use a real Firebase project and skip the emulators.)
2. `npm run start:phone` builds, starts the server on port 3000 and prints an
   `https://….trycloudflare.com` URL. Pass `-- --skip-build` to reuse the
   existing build, or set `PORT` if 3000 is busy. If you already run the app
   yourself, `npm run tunnel` just opens the tunnel to port 3000. To use the
   emulators, prefix the command with the four variables from step 3 above:
   ```bash
   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 \
   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
   FIREBASE_PROJECT_ID=demo-dokiments \
   FIREBASE_API_KEY=emulator \
   npm run start:phone
   ```
3. Open that URL in **Safari** on the iPhone and sign in with email and password.
   Against the emulators, sign up there (or use the seeded admin). Against a real
   project, Google sign-in also needs the tunnel domain added under Firebase
   Console → Authentication → Settings → Authorized domains.
4. Tap Share → **Add to Home Screen**, then open Dokiments **from the Home Screen
   icon**. Until you do, the Notifications card shows install instructions.
5. Sign in again inside the installed app (it has its own cookie storage), then
   Settings → Notifications → _Turn on notifications_ → allow → _Send test
   notification_. Lock the phone and send it again to test the closed-app case.

Notes:

- iOS 16.4 or later is required.
- The URL changes on every run, and a new URL is a new origin, so reinstall the
  Home Screen app and turn notifications on again each time.
- Tapping _Don't Allow_ is final: fix it in iOS Settings → Notifications →
  Dokiments, or delete and re-add the app.
- Focus modes can silence notifications.

## How it works

1. **Settings → Notifications** (`PushNotificationSettings`) asks for permission
   only when the user taps _Turn on notifications_. Never on page load.
2. The browser subscribes through the Serwist worker's `pushManager`, and the
   subscription is saved with `POST /api/push/subscriptions`.
3. `sendPushToUser` (`src/lib/push/send-push.ts`) encrypts and sends to each of
   the user's devices. It never throws, and deletes subscriptions the push
   service reports as gone (`404`/`410`).
4. The worker (`src/app/sw.ts`) shows the notification on `push` and, on
   `notificationclick`, focuses an open window or opens the target URL.

## Data

`users/{uid}/pushSubscriptions/{deviceId}`: one document per browser. The ID is
a SHA-256 hash of the push endpoint, so subscribing again updates the same
record. Fields: `endpoint`, `p256dh`, `auth`, `deviceLabel`, `createdAt`,
`updatedAt`. The endpoint and keys are a credential for pushing to that device,
so `firestore.rules` lets only the owner read them. Deploy the rules after
pulling this change (`firebase deploy --only firestore:rules`).

## Endpoints

- `POST /api/push/subscriptions`: store this device. Idempotent. `201`.
- `DELETE /api/push/subscriptions`: remove this device. Works even with the
  flag off, so a user can always opt out.
- `POST /api/push/test`: send a test push to the user's devices.
  `409` when none is subscribed.

## Payload

`{ title, body, url, tag? }`. `url` must be a same-origin path; the worker
rejects anything else and opens `/`. A `tag` makes a newer notification replace
an older one with the same tag instead of stacking.

## Browser support

- Chrome, Edge, Firefox, Safari (macOS): work in a tab and as an installed PWA.
- **iOS and iPadOS 16.4+: only for the app added to the Home Screen.** In a
  browser tab the card explains how to install it.
- Anything else: the card says push is unsupported; the bell still works.
- If the user blocks notifications in the browser, the card says so. Only the
  browser's site settings can undo that.

## Things to know

- **Subscriptions belong to the browser, not the account.** Signing out removes
  this device's subscription first (`signOutAndRedirect`), so the next person on
  a shared device does not receive the previous user's notifications.
- **A push can only be sent to the signed-in user's own devices** today:
  subscriptions are readable only by their owner, and the server acts with the
  caller's token. Notifying _another_ user (a recipient of a share) needs a
  decision on how the server may read their subscriptions; that is part of the
  follow-up.
- Notifications are per device. Opting out on one phone does not affect another.
