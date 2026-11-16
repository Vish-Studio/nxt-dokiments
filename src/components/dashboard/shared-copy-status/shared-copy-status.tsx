"use client";

import { EyeIcon, LockSimpleIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/commons/button/button";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { ShareStatusBadge } from "@/components/dashboard/share-status-badge/share-status-badge";
import { ShareTimeline } from "@/components/dashboard/share-timeline/share-timeline";
import {
  activeRecipient,
  currentRecipient,
  resolveRecipientStatus,
  shareTimeline,
} from "@/lib/sharing/share-activity";
import { SHARE_EMAIL_COOLDOWN_MS } from "@/lib/sharing/share-email-limits";
import type { SharedDocument } from "@/types/sharing";

export interface SharedCopyStatusProps {
  /** The shared copy of the document being edited. */
  document: SharedDocument;
  /** True while a revoke request is in flight. */
  isRevoking?: boolean;
  /** True while a resend request is in flight. */
  isResending?: boolean;
  /** The field's own label, e.g. "Recipient signature". */
  label: string;
  /** Epoch milliseconds treated as "now" for the resend cooldown. Defaults to the current time. */
  now?: number;
  /** Takes the recipient's access away. Omit to hide the action. */
  onRevoke?: () => void;
  /** Emails the recipient again. Omit to hide the action. */
  onResend?: () => void;
  /** Opens the shared copy, where the signature lives. */
  onView: () => void;
  /**
   * `false` for a view-only share (no recipient signature): the summary then
   * tracks whether the recipient has opened it instead of signed it.
   */
  signable?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Stands in for the recipient signature input in the owner's editor once the
 * document has been shared: only the recipient can sign, so the owner sees where
 * the share stands (waiting, viewed, signed or revoked), its activity timeline,
 * and, while it is still open, Resend and Revoke.
 *
 * Resend is disabled during the same cooldown the server applies, so the owner
 * is told to wait instead of getting a silent no-op. Revoke asks for
 * confirmation because it cannot be undone, only replaced by a new share.
 *
 * For a view-only share it sits below the owner's form instead, and "viewed" is
 * as far as the share goes.
 */
export const SharedCopyStatus = ({
  document,
  isResending = false,
  isRevoking = false,
  label,
  now: nowOverride,
  onResend,
  onRevoke,
  onView,
  signable = true,
}: SharedCopyStatusProps) => {
  const [isConfirmingRevoke, setIsConfirmingRevoke] = useState(false);
  const [clock, setClock] = useState(() => Date.now());
  const now = nowOverride ?? clock;

  const signature = Object.values(document.signatures)[0];
  const active = activeRecipient(document);
  const recipient = active ?? currentRecipient(document);
  const status = recipient
    ? resolveRecipientStatus(recipient, document).status
    : "pending";
  const isOpen = Boolean(active) && !document.locked;

  const lastEmailed = Math.max(0, ...(active?.emailedAt ?? []));
  const cooldownMinutes = Math.ceil(
    (lastEmailed + SHARE_EMAIL_COOLDOWN_MS - now) / 60_000,
  );
  const inCooldown = cooldownMinutes > 0;

  useEffect(() => {
    if (nowOverride !== undefined || !inCooldown) {
      return;
    }
    const timer = setTimeout(
      () => setClock(Date.now()),
      Math.max(1000, lastEmailed + SHARE_EMAIL_COOLDOWN_MS - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [inCooldown, lastEmailed, nowOverride]);

  const firstView = active
    ? shareTimeline(document).find(
        (event) => event.kind === "viewed" && event.email === active.email,
      )
    : undefined;

  const summary = signature
    ? `Signed by ${signature.email} on ${dateFormatter.format(signature.signedAt)}`
    : !active
      ? `Access revoked for ${recipient?.email}. Share again to invite someone.`
      : signable
        ? `Waiting for ${active.email} to sign`
        : firstView
          ? `Viewed by ${active.email} on ${dateFormatter.format(firstView.at)}`
          : `Waiting for ${active.email} to view`;
  const SummaryIcon = signable ? LockSimpleIcon : EyeIcon;

  return (
    <div className="shared-copy-status grid gap-2">
      <span className="font-title text-sm font-semibold text-nox-noir">
        {label}
      </span>
      <div className="grid gap-3 rounded-field border border-steel-mist bg-base-200 px-3 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-2 text-sm text-nox-noir/70">
            <SummaryIcon
              aria-hidden
              className="shrink-0"
              size={16}
              weight="bold"
            />
            <span className="min-w-0 wrap-break-word">{summary}</span>
          </p>
          <ShareStatusBadge
            signable={signable}
            status={status}
          />
        </div>

        <ShareTimeline events={shareTimeline(document)} />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={onView}
            size="sm"
            type="button"
            variant="outline"
          >
            View shared copy
          </Button>
          {isOpen && onResend ? (
            <Button
              disabled={inCooldown || isResending}
              onClick={onResend}
              size="sm"
              type="button"
              variant="outline"
            >
              Resend email
            </Button>
          ) : null}
          {isOpen && onRevoke ? (
            <Button
              disabled={isRevoking}
              onClick={() => setIsConfirmingRevoke(true)}
              size="sm"
              type="button"
              variant="danger"
            >
              Revoke access
            </Button>
          ) : null}
        </div>
        {isOpen && onResend && inCooldown ? (
          <p className="text-xs text-nox-noir/60">
            You can resend in {cooldownMinutes} min.
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        confirmLabel="Revoke access"
        confirmLoading={isRevoking}
        confirmVariant="danger"
        description={`${active?.email ?? "The recipient"} will no longer be able to open${signable ? " or sign" : ""} this document. You can share it again later.`}
        onClose={() => setIsConfirmingRevoke(false)}
        onConfirm={() => {
          onRevoke?.();
          setIsConfirmingRevoke(false);
        }}
        open={isConfirmingRevoke}
        title="Revoke access?"
      />
    </div>
  );
};
