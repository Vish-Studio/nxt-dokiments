import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

export type InviteNoticeKind = "expired" | "invalid" | "mismatch";

export interface InviteNoticeProps {
  /**
   * Why the invite cannot be used.
   *
   * - `expired`: the 14-day window has passed.
   * - `invalid`: unknown, replaced or revoked. Not told apart on purpose.
   * - `mismatch`: signed in with an account the invitation was not sent to.
   */
  kind: InviteNoticeKind;
  /** The invited address with its middle masked. Used by `mismatch` only. */
  invitedEmail?: string;
  /** Follow-up actions, such as a sign-out button. */
  children?: ReactNode;
}

const copy: Record<InviteNoticeKind, { title: string; body: string }> = {
  expired: {
    body: "This invitation link has expired. Ask the sender to share the document again and you will get a new one.",
    title: "This invitation has expired",
  },
  invalid: {
    body: "This link is no longer valid. It may have been replaced by a newer email or withdrawn. If you have an account, sign in and look under Shared with me, or ask the sender to share the document again.",
    title: "This invitation is no longer valid",
  },
  mismatch: {
    body: "You are signed in with a different account. Sign out, then sign in or sign up with the address the invitation was sent to.",
    title: "This invitation is for someone else",
  },
};

/** Explains why an invite link cannot be opened, with room for a next step. */
export const InviteNotice = ({
  kind,
  invitedEmail,
  children,
}: InviteNoticeProps) => (
  <section
    className="invite-notice rounded-box border border-steel-mist bg-white p-6"
    role="alert"
  >
    <WarningCircleIcon
      aria-hidden="true"
      size={28}
      weight="bold"
    />
    <h2 className="mt-3 font-title text-xl font-bold">{copy[kind].title}</h2>
    <p className="mt-2 text-sm leading-6 text-nox-noir/70">{copy[kind].body}</p>
    {kind === "mismatch" && invitedEmail ? (
      <p className="mt-2 text-sm font-bold break-all">
        Invited address: {invitedEmail}
      </p>
    ) : null}
    {children ? (
      <div className="mt-6 flex flex-col gap-3">{children}</div>
    ) : null}
  </section>
);
