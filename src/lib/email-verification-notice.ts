/** Seconds the Resend action stays disabled after an email is sent. */
export const VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

/**
 * `sessionStorage` key recording that the user hid the "Verify your email" notice.
 *
 * `sessionStorage` rather than `localStorage` on purpose: the notice guards a real
 * capability (receiving shared documents), so a dismissal should last for the
 * visit, not forever.
 */
export const VERIFY_EMAIL_NOTICE_STORAGE_KEY =
  "dokiments-verify-email-notice-dismissed-v1";

/** Whether the user has hidden the notice in this browser session. */
export const readVerifyEmailNoticeDismissed = (): boolean => {
  try {
    return (
      window.sessionStorage.getItem(VERIFY_EMAIL_NOTICE_STORAGE_KEY) === "true"
    );
  } catch {
    return false;
  }
};

/** Remembers, for this browser session, that the user hid the notice. */
export const writeVerifyEmailNoticeDismissed = () => {
  try {
    window.sessionStorage.setItem(VERIFY_EMAIL_NOTICE_STORAGE_KEY, "true");
  } catch {
    // Storage can be unavailable (private modes); the notice then reappears on reload.
  }
};
