import type { PushSubscriptionInput } from "@/types/push";

/**
 * Whether this browser can receive web push.
 *
 * - `supported`: service workers, the Push API and notifications all exist.
 * - `install-required`: iOS or iPadOS in a normal browser tab. Apple only offers
 *   push to an app added to the Home Screen, so the user has to install first.
 * - `unsupported`: anything else (older browsers, in-app browsers, insecure
 *   origins). The settings UI explains this instead of showing a dead toggle.
 */
export type PushSupport = "supported" | "install-required" | "unsupported";

const isIosDevice = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  // iPadOS reports itself as a Mac with a touch screen.
  (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** Detects {@link PushSupport}. Browser-only: call from an effect, never during render on the server. */
export const detectPushSupport = (): PushSupport => {
  if (isIosDevice() && !isStandalone()) return "install-required";

  const supported =
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  return supported ? "supported" : "unsupported";
};

/**
 * Converts the base64url VAPID public key into the bytes `pushManager.subscribe`
 * requires. Returns an `ArrayBuffer`-backed array to satisfy the DOM typings.
 */
export const urlBase64ToUint8Array = (
  value: string,
): Uint8Array<ArrayBuffer> => {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));

  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }

  return bytes;
};

/** A short label for this device, such as "Chrome on macOS", shown nowhere critical. */
export const describeDevice = (): string => {
  const agent = navigator.userAgent;
  const browser = /Edg\//.test(agent)
    ? "Edge"
    : /Firefox\//.test(agent)
      ? "Firefox"
      : /Chrome\//.test(agent)
        ? "Chrome"
        : /Safari\//.test(agent)
          ? "Safari"
          : "Browser";
  const system = /iPhone|iPad|iPod/.test(agent)
    ? "iOS"
    : /Android/.test(agent)
      ? "Android"
      : /Mac OS X|Macintosh/.test(agent)
        ? "macOS"
        : /Windows/.test(agent)
          ? "Windows"
          : /Linux/.test(agent)
            ? "Linux"
            : "";

  return system ? `${browser} on ${system}` : browser;
};

/** Converts a browser `PushSubscription` into the body `POST /api/push/subscriptions` expects. */
export const toSubscriptionInput = (
  subscription: PushSubscription,
): PushSubscriptionInput => {
  const json = subscription.toJSON();

  return {
    deviceLabel: describeDevice(),
    endpoint: subscription.endpoint,
    keys: {
      auth: json.keys?.auth ?? "",
      p256dh: json.keys?.p256dh ?? "",
    },
  };
};

/**
 * Removes this browser's push subscription, locally and on the server, without
 * ever throwing.
 *
 * Used by sign-out: a subscription belongs to the browser, not the account, so
 * leaving it behind would keep delivering the previous user's notifications to
 * whoever signs in next on the same device.
 */
export const dropPushSubscription = async (): Promise<void> => {
  try {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();

    if (!subscription) return;

    await fetch("/api/push/subscriptions", {
      body: JSON.stringify({ endpoint: subscription.endpoint }),
      headers: { "Content-Type": "application/json" },
      method: "DELETE",
    }).catch(() => undefined);
    await subscription.unsubscribe();
  } catch {
    // Best effort: failing to clean up must never block signing out.
  }
};
