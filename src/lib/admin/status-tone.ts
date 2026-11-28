/**
 * The colours a status pill can take in the admin portal.
 *
 * Mirrors the app's existing status language (`EntryStatusPill`): green for
 * done, golden for waiting, teal for informational, grey for inactive, red for
 * failures. A pill always carries a word, never colour alone.
 *
 * - `error`: failed or destructive, e.g. "Expired token".
 * - `info`: delivered or neutral-positive, e.g. "Received".
 * - `neutral`: inactive or unknown, e.g. "Draft".
 * - `success`: done, e.g. "Signed", "Live".
 * - `warning`: waiting on someone, e.g. "Awaiting signature".
 */
export type AdminStatusTone = "error" | "info" | "neutral" | "success" | "warning";

/** Tailwind classes per tone, shared by every admin pill so they cannot drift. */
export const statusToneClassNames: Record<AdminStatusTone, string> = {
  error: "bg-error/12 text-error",
  info: "bg-play-teal/35 text-nox-noir",
  neutral: "bg-base-200 text-nox-noir/65",
  success: "bg-success/15 text-success",
  warning: "bg-golden-harvest/45 text-nox-noir",
};
