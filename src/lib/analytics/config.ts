/**
 * Google Analytics 4 configuration resolved from the environment.
 *
 * Mirrors the shape of `firebase/server-config.ts`, but this one is
 * intentionally client-safe: the measurement ID is a public identifier and
 * `NEXT_PUBLIC_` vars are inlined at build time, so it must be read as a
 * static member expression — a dynamic `process.env[key]` lookup is not
 * replaced by the bundler and resolves to `undefined`.
 */
export type AnalyticsConfig = {
  /** GA4 measurement ID, e.g. `G-XXXXXXXXXX`. Empty when unconfigured. */
  measurementId: string;
};

/** Resolved analytics config. Empty string keeps CI builds working without it. */
export const analyticsConfig: AnalyticsConfig = {
  measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
};

/**
 * Returns `true` when a measurement ID is present.
 *
 * Gates the injection of the GA script tags only. `trackEvent` deliberately
 * does not consult this — it always pushes to `dataLayer`, so events stay
 * observable in Storybook, where no measurement ID is ever configured.
 */
export const hasAnalyticsConfig = () => Boolean(analyticsConfig.measurementId);
