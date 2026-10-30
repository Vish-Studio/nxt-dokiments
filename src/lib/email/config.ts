import "server-only";

/**
 * How `sendEmail` behaves in the current environment. Derived by
 * {@link resolveEmailMode}, never set directly.
 *
 * - `live`: sends to any recipient. Vercel Production only.
 * - `restricted`: sends only to recipients on `EMAIL_PREVIEW_ALLOW_LIST`.
 *   Preview deployments and local development, so a test can't email a real user.
 * - `disabled`: no API key, so nothing is sent and the app keeps working.
 */
export type EmailMode = "live" | "restricted" | "disabled";

/** Email settings resolved from the environment. See `docs/email.md`. */
export type EmailConfig = {
  /** `RESEND_API_KEY`. Empty when unset, which puts email in `disabled` mode. */
  apiKey: string;
  /**
   * `EMAIL_FROM`, as `Name <address>`. The address must be on the domain verified
   * in Resend or the provider rejects the send with a 403.
   */
  from: string;
  /**
   * `EMAIL_REPLY_TO`, when set. The sending subdomain can't receive mail, so
   * without this, replies bounce.
   */
  replyTo: string | undefined;
  mode: EmailMode;
  /**
   * `EMAIL_PREVIEW_ALLOW_LIST`, lower-cased. Only enforced in `restricted` mode
   * and ignored in `live`.
   */
  allowList: string[];
};

/** Sender used when `EMAIL_FROM` is unset. Matches the domain verified in Resend. */
export const DEFAULT_EMAIL_FROM =
  "Dokiments <notifications@mail.dokiments.com>";

/**
 * Parses a comma-separated env value into trimmed, lower-cased, non-empty items.
 * Lower-casing makes allow-list matching case-insensitive.
 *
 * @example
 * parseAllowList(" You@Gmail.com, ,team@x.com,"); // ["you@gmail.com", "team@x.com"]
 */
export const parseAllowList = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

/**
 * Resolves the {@link EmailMode} from the API key and the Vercel environment.
 *
 * Production is the only environment that sends to real recipients. Anything
 * else (`preview`, `development`, or unset locally) is `restricted`, so a test
 * share can't email a real customer. The allow-list is ignored in `live` mode,
 * so a stray value there can never block real mail.
 */
export const resolveEmailMode = ({
  apiKey,
  vercelEnv,
}: {
  apiKey: string;
  vercelEnv: string | undefined;
}): EmailMode => {
  if (!apiKey) return "disabled";
  return vercelEnv === "production" ? "live" : "restricted";
};

/**
 * Reads the email settings from `process.env`.
 *
 * Reads on every call instead of at import time, so tests can stub env vars and
 * a changed variable never needs a module reload.
 */
export const getEmailConfig = (): EmailConfig => {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";

  return {
    apiKey,
    from: process.env.EMAIL_FROM?.trim() || DEFAULT_EMAIL_FROM,
    replyTo: process.env.EMAIL_REPLY_TO?.trim() || undefined,
    mode: resolveEmailMode({ apiKey, vercelEnv: process.env.VERCEL_ENV }),
    allowList: parseAllowList(process.env.EMAIL_PREVIEW_ALLOW_LIST),
  };
};

/** Returns `true` when an API key is present and email can be attempted. */
export const hasEmailConfig = () => getEmailConfig().mode !== "disabled";
