"use client";

import { EnvelopeSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/commons/button/button";
import { ButtonIcon } from "@/components/commons/button-icon/button-icon";
import { useCooldown } from "@/hooks/use-cooldown";
import {
  useRefreshVerificationMutation,
  useSendVerificationMutation,
} from "@/hooks/queries/use-auth";
import {
  readVerifyEmailNoticeDismissed,
  VERIFICATION_RESEND_COOLDOWN_SECONDS,
  writeVerifyEmailNoticeDismissed,
} from "@/lib/email-verification-notice";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";

export interface VerifyEmailNoticeProps {
  /** Seconds Resend stays disabled after an email is sent. */
  cooldownSeconds?: number;
}

type Feedback = { message: string; tone: "error" | "success" };

/**
 * Asks a signed-in user whose email is unverified to confirm it.
 *
 * Shows only for an explicit `emailVerified === false`, so it never appears for
 * Google accounts, the dev bypass user, or a session sealed before the field
 * existed. Never blocks anything: it can be hidden for the browser session, and
 * reappears on the next visit while the address is still unverified.
 *
 * Resend sends another email and starts a cooldown. "I've verified" forces a token
 * refresh, since the verified claim only updates when a new token is minted; on
 * success the notice disappears because the store now holds a verified user.
 *
 * Gating on the document-sharing flag belongs to the caller (`AppShell`), because
 * that flag is fixed at build time and would otherwise make this unrenderable in
 * Storybook.
 */
export const VerifyEmailNotice = ({
  cooldownSeconds = VERIFICATION_RESEND_COOLDOWN_SECONDS,
}: VerifyEmailNoticeProps) => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const showToast = useToastStore((state) => state.showToast);
  const [isDismissed, setIsDismissed] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { remaining, start } = useCooldown(cooldownSeconds);
  const send = useSendVerificationMutation();
  const check = useRefreshVerificationMutation();

  // Read after mount so server and client markup match.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsDismissed(readVerifyEmailNoticeDismissed());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!user || user.emailVerified !== false || isDismissed) {
    return null;
  }

  const resend = () => {
    setFeedback(null);
    send.mutate(undefined, {
      onError: (error) =>
        setFeedback({ message: error.message, tone: "error" }),
      onSuccess: () => {
        start();
        setFeedback({
          message: `We sent a verification link to ${user.email}.`,
          tone: "success",
        });
      },
    });
  };

  const confirm = () => {
    setFeedback(null);
    check.mutate(undefined, {
      onError: (error) =>
        setFeedback({ message: error.message, tone: "error" }),
      onSuccess: (refreshed) => {
        if (refreshed.emailVerified === true) {
          setUser(refreshed);
          showToast({ message: "Email verified.", tone: "success" });
          return;
        }

        setFeedback({
          message:
            "Not verified yet. Open the link in your email, then try again.",
          tone: "error",
        });
      },
    });
  };

  const dismiss = () => {
    writeVerifyEmailNoticeDismissed();
    setIsDismissed(true);
  };

  return (
    <div
      className="verify-email-notice mb-4 flex items-start gap-3 rounded-2xl border border-golden-harvest/40 bg-golden-harvest/10 p-4 text-sm text-nox-noir"
      role="status"
    >
      <EnvelopeSimpleIcon
        aria-hidden
        className="mt-0.5 shrink-0 text-golden-harvest"
        size={20}
        weight="fill"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="leading-6">
          Verify <strong className="font-semibold">{user.email}</strong> to
          receive documents shared with you. Open the link in your email, or
          resend it.
        </p>
        {feedback ? (
          <p
            className={
              feedback.tone === "success" ? "text-success" : "text-error"
            }
            role={feedback.tone === "success" ? "status" : "alert"}
          >
            {feedback.message}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={send.isPending || remaining > 0}
            onClick={resend}
            size="sm"
            variant="outline"
          >
            {remaining > 0 ? `Resend in ${remaining}s` : "Resend email"}
          </Button>
          <Button
            disabled={check.isPending}
            onClick={confirm}
            size="sm"
            variant="primary"
          >
            {check.isPending ? "Checking…" : "I've verified"}
          </Button>
        </div>
      </div>
      <ButtonIcon
        aria-label="Dismiss verification notice"
        icon={
          <XIcon
            aria-hidden
            size={16}
            weight="bold"
          />
        }
        onClick={dismiss}
        size="sm"
        variant="ghost"
      />
    </div>
  );
};
