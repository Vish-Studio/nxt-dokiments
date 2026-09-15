import { analyticsConfig, hasMetaPixelConfig } from "@/lib/analytics/config";
import type {
  AnalyticsEventMap,
  AnalyticsEventName,
} from "@/lib/analytics/events";

/**
 * Meta Pixel loader and event bridge.
 *
 * Deliberately shaped like Clarity's loader in `analytics-provider.tsx` rather
 * than like GA: the pixel is an *advertising* tag that sets a first-party
 * `_fbp` cookie and reads `fbclid`, so the remote script is never requested
 * until a visitor has chosen "Accept all". Nothing here runs from the root
 * layout, and there is no `<noscript>` tracking image — Meta's copy-paste
 * snippet includes one, but it would fire with no consent gate at all.
 *
 * The pre-consent queue is created at load time, not at import time, so
 * events sent before consent are dropped rather than replayed afterwards.
 */

/**
 * The `fbq` command queue. Meta's official snippet is a minified IIFE that
 * assigns exactly these members; `push`, `loaded`, `version` and `queue` are
 * all read by `fbevents.js` when it drains the queue, so none of them are
 * decorative.
 */
type FbqCommand = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: unknown;
  queue?: unknown[][];
  version?: string;
};

declare global {
  interface Window {
    fbq?: FbqCommand;
    _fbq?: FbqCommand;
  }
}

const FBEVENTS_SRC = "https://connect.facebook.net/en_US/fbevents.js";
const LOADER_SELECTOR = 'script[data-meta-pixel-loader="true"]';

/**
 * Returns the `fbq` command queue, creating it if the remote script has not
 * arrived yet so that `init` and the first `PageView` are replayed once it
 * does.
 *
 * Fidelity note: the canonical snippet pushes an `arguments` object onto
 * `queue`; this pushes a real array to stay within the repo's
 * arrow-function conventions — the same trade-off `gtag.ts` documents. Verify
 * in Events Manager → Test Events if events ever appear to vanish silently.
 */
const getFbq = (): FbqCommand => {
  if (window.fbq) {
    return window.fbq;
  }

  const fbq: FbqCommand = (...args) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }

    fbq.queue = fbq.queue ?? [];
    fbq.queue.push(args);
  };

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  window.fbq = fbq;
  window._fbq = window._fbq ?? fbq;

  return fbq;
};

/**
 * Injects `fbevents.js` and initialises the pixel. Idempotent — guarded on the
 * injected script tag rather than on module state, so a hot reload cannot
 * double-initialise and double-count every `PageView`.
 *
 * Does not send `PageView` itself. The provider owns that, because App Router
 * client navigations need one per route and the base snippet only ever fires
 * on a full document load.
 */
export const loadMetaPixel = () => {
  if (!hasMetaPixelConfig()) {
    return;
  }

  const fbq = getFbq();

  // Re-grants after a "Reject non-essential" earlier in this same page life.
  // A no-op on a fresh queue, where granted is already the default.
  fbq("consent", "grant");

  if (document.querySelector(LOADER_SELECTOR)) {
    return;
  }

  fbq("init", analyticsConfig.metaPixelId);

  const script = document.createElement("script");
  script.async = true;
  script.src = FBEVENTS_SRC;
  script.dataset.metaPixelLoader = "true";
  document.head.append(script);
};

/**
 * Stops an already-loaded pixel from sending anything further, for a visitor
 * who downgrades from "Accept all" mid-session.
 *
 * A no-op when the pixel was never loaded, which is the common case — there is
 * no consent to revoke when no script was ever requested.
 */
export const revokeMetaPixelConsent = () => {
  window.fbq?.("consent", "revoke");
};

/** Sends a `PageView`. Silent unless consent has already loaded the pixel. */
export const trackMetaPageView = () => {
  window.fbq?.("track", "PageView");
};

type MetaEventMapping = {
  /** The Meta event name, PascalCase per Meta's spec. */
  name: string;
  /** `false` routes through `trackCustom`, for events Meta has no name for. */
  isStandard: boolean;
  /** Allowlisted GA param keys to forward. Every other param is dropped. */
  forwardParams: readonly string[];
};

/**
 * The GA4 → Meta event mapping, and the whole of it.
 *
 * Deliberately a small subset rather than a mirror of `AnalyticsEventMap`:
 * only moments worth optimising an ad campaign against belong here, and every
 * addition is another event's worth of user behaviour sent to Meta. An event
 * absent from this map is GA-only, which is the default.
 *
 * `forwardParams` is an allowlist, not a filter of known-bad keys. Internal
 * identifiers (`document_id`, `template_id`) and anything derived from
 * document content stay out of Meta by construction — the same rule
 * `feedback_submitted` documents for GA4.
 */
const META_EVENT_MAP: Partial<Record<AnalyticsEventName, MetaEventMapping>> = {
  document_created: {
    name: "DocumentCreated",
    isStandard: false,
    forwardParams: ["document_type"],
  },
  pdf_export_success: {
    name: "DocumentExported",
    isStandard: false,
    forwardParams: [],
  },
  sign_up: {
    name: "CompleteRegistration",
    isStandard: true,
    forwardParams: ["method"],
  },
};

/**
 * Mirrors a tracked GA4 event to the Meta Pixel when the map covers it.
 *
 * Called from `trackEvent`, the single choke point every tracked event already
 * passes through. Returns early when `window.fbq` is absent, which is how
 * consent is enforced: no consent means no loaded pixel means nothing sent.
 */
export const mirrorToMetaPixel = <TName extends AnalyticsEventName>(
  name: TName,
  params: AnalyticsEventMap[TName],
) => {
  if (typeof window === "undefined" || !window.fbq) {
    return;
  }

  const mapping = META_EVENT_MAP[name];

  if (!mapping) {
    return;
  }

  const forwarded = Object.fromEntries(
    Object.entries(params as Record<string, unknown>).filter(([key]) =>
      mapping.forwardParams.includes(key),
    ),
  );

  window.fbq(
    mapping.isStandard ? "track" : "trackCustom",
    mapping.name,
    forwarded,
  );
};
