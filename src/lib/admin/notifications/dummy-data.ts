import { daysAgo } from "@/lib/admin/sample-data";

/**
 * Sample push devices and deliveries for the Notifications page.
 *
 * `users/{uid}/pushSubscriptions` holds bearer credentials for each device and
 * stays owner-only on purpose. A real version should keep counts, not
 * endpoints: a server job that writes `pushStats/daily` (devices per platform,
 * sends, failures) for the portal to read. Replace `getSamplePushOverview` then.
 */

export type PushPlatform = "Android" | "iOS" | "Web";

/** One push send and how it went. */
export type PushSend = {
  delivered: number;
  devices: number;
  failed: number;
  id: string;
  kind: "Campaign" | "Test" | "Transactional";
  /** Epoch milliseconds. */
  sentAt: number;
  title: string;
};

/** One registered device, without its endpoint. */
export type PushDevice = {
  appVersion: string;
  email: string;
  id: string;
  /** Epoch milliseconds the device last checked in. */
  lastSeenAt: number;
  name: string;
  platform: string;
  tokenStatus: "Expired" | "Opted out" | "Valid";
};

export type PushOverview = {
  devices: PushDevice[];
  /** Registered devices per platform. */
  platforms: Record<PushPlatform, number>;
  sends: PushSend[];
};

const overview: PushOverview = {
  devices: [
    { appVersion: "0.14.2", email: "maya@laurent.test", id: "d1", lastSeenAt: daysAgo(0, 0.6), name: "Maya Laurent", platform: "iOS 19", tokenStatus: "Valid" },
    { appVersion: "0.14.2", email: "maya@laurent.test", id: "d2", lastSeenAt: daysAgo(0, 1), name: "Maya Laurent", platform: "Web, Chrome", tokenStatus: "Valid" },
    { appVersion: "0.12.0", email: "tomas@rivera.test", id: "d3", lastSeenAt: daysAgo(47), name: "Tomás Rivera", platform: "Android 16", tokenStatus: "Expired" },
    { appVersion: "0.14.1", email: "hana@sato.test", id: "d4", lastSeenAt: daysAgo(3), name: "Hana Sato", platform: "iOS 19", tokenStatus: "Opted out" },
  ],
  platforms: { Android: 2_968, Web: 1_466, iOS: 3_412 },
  sends: [
    { delivered: 213, devices: 214, failed: 1, id: "s1", kind: "Transactional", sentAt: daysAgo(0, 0.1), title: "Your document was signed" },
    { delivered: 6_690, devices: 6_722, failed: 32, id: "s2", kind: "Campaign", sentAt: daysAgo(1), title: "Every template is free during launch" },
    { delivered: 1_036, devices: 1_038, failed: 2, id: "s3", kind: "Transactional", sentAt: daysAgo(1, 2), title: "Reminder: invoice due tomorrow" },
    { delivered: 2, devices: 2, failed: 0, id: "s4", kind: "Test", sentAt: daysAgo(2, -6), title: "Test push" },
  ],
};

/** Sample push data. Swap for a Firestore read when push stats exist. */
export const getSamplePushOverview = (): PushOverview => overview;
