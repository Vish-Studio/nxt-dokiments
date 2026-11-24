import type { PushPayload } from "@/types/push";

/**
 * Resolves a notification's target to a same-origin path.
 *
 * Runs in the service worker on every click, and the payload is data we do not
 * fully control once it is on a device, so anything that is not a plain
 * same-origin path (`https://evil.test`, `//evil.test`, `javascript:`) falls
 * back to the app root rather than being opened.
 *
 * @example
 * safeNotificationPath("/my-documents?tab=shared"); // "/my-documents?tab=shared"
 * safeNotificationPath("//evil.test");              // "/"
 */
export const safeNotificationPath = (value: unknown): string => {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  if (value.includes("\\")) return "/";
  return value;
};

/**
 * Parses the JSON a push arrived with into a displayable payload.
 *
 * Never throws: a push must always show something, because browsers may
 * penalise or revoke a service worker that receives a push and shows nothing.
 * Missing or malformed data degrades to a generic notification.
 */
export const parsePushPayload = (raw: string | undefined): PushPayload => {
  const fallback: PushPayload = {
    body: "Open Dokiments to see what's new.",
    title: "Dokiments",
    url: "/",
  };

  if (!raw) return fallback;

  try {
    const data = JSON.parse(raw) as Partial<PushPayload> | null;

    return {
      body: typeof data?.body === "string" ? data.body : fallback.body,
      tag: typeof data?.tag === "string" ? data.tag : undefined,
      title:
        typeof data?.title === "string" && data.title
          ? data.title
          : fallback.title,
      url: safeNotificationPath(data?.url),
    };
  } catch {
    return fallback;
  }
};
