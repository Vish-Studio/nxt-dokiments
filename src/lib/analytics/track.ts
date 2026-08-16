import type {
  AnalyticsEventMap,
  AnalyticsEventName,
} from "@/lib/analytics/events";
import { pushGtag } from "@/lib/analytics/gtag";

/** GA4 truncates string params past this length; do it ourselves so the
 * value that lands in reports is predictable rather than silently clipped. */
const MAX_STRING_PARAM_LENGTH = 100;

const truncateStringParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      typeof value === "string"
        ? value.slice(0, MAX_STRING_PARAM_LENGTH)
        : value,
    ]),
  );

/**
 * Sends a typed GA4 event.
 *
 * Deliberately does NOT check `hasAnalyticsConfig()`. Events are always
 * pushed onto `dataLayer`; when no measurement ID is configured the gtag
 * script is never injected, so the queue is simply never drained. That keeps
 * the push observable in Storybook `play` functions, which is the only test
 * harness this repo has for non-component logic.
 *
 * `transport_type: "beacon"` is set on every event because several flows
 * (sign-in, sign-up, sign-out) call `window.location.assign()` immediately
 * after, and an in-flight request would otherwise be cancelled by the
 * unload. This is best-effort only: under `analytics_storage: "denied"`
 * nothing is sent at all.
 */
export const trackEvent = <TName extends AnalyticsEventName>(
  name: TName,
  params: AnalyticsEventMap[TName],
) => {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", name, params);
  }

  pushGtag("event", name, {
    ...truncateStringParams(params),
    transport_type: "beacon",
  });
};
