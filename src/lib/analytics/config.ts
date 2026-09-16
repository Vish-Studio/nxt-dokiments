/**
 * Analytics configuration resolved from the environment.
 *
 * Mirrors the shape of `firebase/server-config.ts`, but this one is
 * intentionally client-safe: every ID here is a public identifier and
 * `NEXT_PUBLIC_` vars are inlined at build time, so each must be read as a
 * static member expression — a dynamic `process.env[key]` lookup is not
 * replaced by the bundler and resolves to `undefined`.
 */
export type AnalyticsConfig = {
  /** GA4 measurement ID, e.g. `G-XXXXXXXXXX`. Empty when unconfigured. */
  measurementId: string;
  /** Microsoft Clarity project ID. Empty when Clarity is unconfigured. */
  clarityProjectId: string;
  /** Meta Pixel (Events Manager dataset) ID. Empty when unconfigured. */
  metaPixelId: string;
};

/** Resolved analytics config. Empty string keeps CI builds working without it. */
export const analyticsConfig: AnalyticsConfig = {
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "",
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
};

/**
 * Returns `true` when a measurement ID is present.
 *
 * Gates the injection of the GA script tags only. `trackEvent` deliberately
 * does not consult this — it always pushes to `dataLayer`, so events stay
 * observable in Storybook, where no measurement ID is ever configured.
 */
export const hasAnalyticsConfig = () => Boolean(analyticsConfig.measurementId);

/** Gates Clarity's consent-controlled client-side loader. */
export const hasClarityConfig = () => Boolean(analyticsConfig.clarityProjectId);

/**
 * Gates the Meta Pixel's consent-controlled client-side loader.
 *
 * Unlike `hasAnalyticsConfig`, this one *is* consulted before any pixel event
 * is sent: `fbq` is a real remote-backed queue rather than a passive array,
 * so there is nothing to observe in Storybook when the pixel was never
 * loaded, and nothing worth queueing for a drain that will never happen.
 */
export const hasMetaPixelConfig = () => Boolean(analyticsConfig.metaPixelId);
