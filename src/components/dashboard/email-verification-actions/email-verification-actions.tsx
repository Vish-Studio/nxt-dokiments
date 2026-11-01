"use client";

import { useState } from "react";

import { Button } from "@/components/commons/button/button";
import {
  useRefreshVerificationMutation,
  useSendVerificationMutation,
} from "@/hooks/queries/use-auth";
import { useCooldown } from "@/hooks/use-cooldown";
import { VERIFICATION_RESEND_COOLDOWN_SECONDS } from "@/lib/email-verification-notice";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";

export interface EmailVerificationActionsProps {
  /** Seconds Resend stays disabled after an email is sent. */
  cooldownSeconds?: number;
  /** Address shown in the "link sent" confirmation. */
  email: string;
}

/**
 * Resend and "I've verified" controls shared by the dashboard notice and the
 * profile page, with their own inline feedback and resend cooldown.
 *
 * Resend asks Firebase for another email. "I've verified" forces a token refresh,
 * since the verified claim only changes when a new token is minted, and writes the
 * refreshed user to the auth store so every consumer updates at once.
 */
export const EmailVerificationActions = ({
  cooldownSeconds = VERIFICATION_RESEND_COOLDOWN_SECONDS,
  email,
}: EmailVerificationActionsProps) => {
  const setUser = useAuthStore((state) => state.setUser);
  const showToast = useToastStore((state) => state.showToast);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);
  const { remaining, start } = useCooldown(cooldownSeconds);
  const send = useSendVerificationMutation();
  const check = useRefreshVerificationMutation();
  const isPending = send.isPending || check.isPending;

  const resend = () => {
    setFeedback(null);
    send.mutate(undefined, {
      onError: (error) =>
        setFeedback({ message: error.message, tone: "error" }),
      onSuccess: () => {
        start();
        setFeedback({
          message: `We sent a verification link to ${email}.`,
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
        setUser(refreshed);
        if (refreshed.emailVerified === true) {
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

  return (
    <div className="email-verification-actions grid gap-3">
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
          disabled={isPending || remaining > 0}
          onClick={resend}
          size="sm"
          variant="outline"
        >
          {remaining > 0 ? `Resend in ${remaining}s` : "Resend email"}
        </Button>
        <Button
          disabled={isPending}
          onClick={confirm}
          size="sm"
          variant="primary"
        >
          {check.isPending ? "Checking…" : "I've verified"}
        </Button>
      </div>
    </div>
  );
};
