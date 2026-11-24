import "server-only";

/** Web Push (VAPID) settings resolved from the environment. See `docs/push-notifications.md`. */
export type PushConfig = {
  /**
   * `NEXT_PUBLIC_VAPID_PUBLIC_KEY`. Public by design: the browser needs it to
   * create a subscription. Empty when unset.
   */
  publicKey: string;
  /** `VAPID_PRIVATE_KEY`. Server-only secret that signs every push. Empty when unset. */
  privateKey: string;
  /**
   * `VAPID_SUBJECT`, a `mailto:` or `https:` contact the push service can reach
   * if we misbehave. Falls back to {@link DEFAULT_VAPID_SUBJECT}.
   */
  subject: string;
};

/** Contact used when `VAPID_SUBJECT` is unset. */
export const DEFAULT_VAPID_SUBJECT = "mailto:notifications@dokiments.com";

/**
 * Reads the push settings from `process.env`.
 *
 * Reads on every call instead of at import time, so tests can stub env vars.
 */
export const getPushConfig = (): PushConfig => ({
  privateKey: process.env.VAPID_PRIVATE_KEY?.trim() ?? "",
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? "",
  subject: process.env.VAPID_SUBJECT?.trim() || DEFAULT_VAPID_SUBJECT,
});

/**
 * Returns `true` when both VAPID keys are present, so a push can be attempted.
 * Routes check this and answer a clean error instead of an opaque provider failure.
 */
export const hasPushConfig = (): boolean => {
  const { privateKey, publicKey } = getPushConfig();
  return Boolean(privateKey && publicKey);
};
