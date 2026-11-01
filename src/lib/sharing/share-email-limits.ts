import type { SharedDocument } from "@/types/sharing";

/** Minimum gap between two emails to the same recipient about the same document. */
export const SHARE_EMAIL_COOLDOWN_MS = 10 * 60 * 1000;

/** Window the daily cap is counted over. */
export const SHARE_EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Most share emails one sender can trigger inside `SHARE_EMAIL_WINDOW_MS`. */
export const SHARE_EMAIL_DAILY_CAP = 20;

/** `send`, or the limit that stopped the email. */
export type ShareEmailDecision = "send" | "cooldown" | "daily-cap";

export type DecideShareEmailInput = {
  /** Epoch milliseconds, injected so tests don't depend on the clock. */
  now: number;
  /** Address the email would go to, in any casing. */
  recipientEmail: string;
  /** ID of the share being emailed about. */
  sharedDocumentId: string;
  /** Every document the sender has shared, including this one. */
  shares: readonly SharedDocument[];
};

/** Sends to `email` recorded on `share` inside the window. */
const recentSends = (
  share: SharedDocument,
  email: string,
  now: number,
): number[] =>
  (
    share.recipients.find((recipient) => recipient.email === email)
      ?.emailedAt ?? []
  ).filter((at) => at > now - SHARE_EMAIL_WINDOW_MS);

/**
 * Decides whether a share email may go out. The cooldown is per recipient per
 * document; the cap counts every share email the sender triggered in the last 24
 * hours across all their documents. The cooldown is checked first because it is
 * the more specific reason.
 *
 * Both limits read the sends recorded on the recipient (`emailedAt`), so no
 * extra storage is needed.
 *
 * @example
 * decideShareEmail({ now, recipientEmail: "bob@example.com", sharedDocumentId, shares });
 * // "send" | "cooldown" | "daily-cap"
 */
export const decideShareEmail = ({
  now,
  recipientEmail,
  sharedDocumentId,
  shares,
}: DecideShareEmailInput): ShareEmailDecision => {
  const email = recipientEmail.trim().toLowerCase();

  const sentForThisShare = shares
    .filter((share) => share.id === sharedDocumentId)
    .flatMap((share) => recentSends(share, email, now));
  const lastSent = Math.max(0, ...sentForThisShare);
  if (lastSent > now - SHARE_EMAIL_COOLDOWN_MS) {
    return "cooldown";
  }

  const sentToday = shares.reduce(
    (total, share) =>
      total +
      share.recipients.reduce(
        (sum, recipient) =>
          sum + recentSends(share, recipient.email, now).length,
        0,
      ),
    0,
  );

  return sentToday >= SHARE_EMAIL_DAILY_CAP ? "daily-cap" : "send";
};
