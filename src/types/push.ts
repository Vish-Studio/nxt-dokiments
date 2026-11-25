/** Longest push endpoint URL we store, in characters. Mirrored in `firestore.rules`. */
export const MAX_PUSH_ENDPOINT = 2048;

/** Longest device label we store, in characters. Mirrored in `firestore.rules`. */
export const MAX_PUSH_DEVICE_LABEL = 100;

/** A browser's `PushSubscription` as sent to `POST /api/push/subscriptions`. */
export type PushSubscriptionInput = {
  /** The push service URL for this browser. Unique per device and browser profile. */
  endpoint: string;
  keys: {
    /** Browser public key used to encrypt the payload (base64url). */
    p256dh: string;
    /** Shared authentication secret (base64url). */
    auth: string;
  };
  /** Short human label such as "Chrome on macOS". Optional, for display only. */
  deviceLabel?: string;
};

/** One stored device subscription for the signed-in user. */
export type StoredPushSubscription = PushSubscriptionInput & {
  /** Document ID: a SHA-256 hash of `endpoint`, so one device is one record. */
  id: string;
  /** Epoch milliseconds when the device first subscribed. */
  createdAt: number;
};

/** What the service worker shows. Built by the server, rendered by `sw.ts`. */
export type PushPayload = {
  title: string;
  body: string;
  /** Same-origin path opened when the notification is clicked, e.g. `/my-documents`. */
  url: string;
  /** Notifications sharing a tag replace each other instead of stacking. */
  tag?: string;
};
