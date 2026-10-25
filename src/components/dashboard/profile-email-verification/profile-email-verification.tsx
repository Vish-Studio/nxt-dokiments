"use client";

import { CheckCircleIcon, EnvelopeSimpleIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/commons/badge/badge";
import { EmailVerificationActions } from "@/components/dashboard/email-verification-actions/email-verification-actions";
import { SettingsCard } from "@/components/dashboard/settings-card/settings-card";
import { useAuthStore } from "@/stores/auth-store";

export interface ProfileEmailVerificationProps {
  /** Seconds Resend stays disabled after an email is sent. */
  cooldownSeconds?: number;
}

/**
 * Settings → My profile card showing whether the sign-in email is verified.
 *
 * Always available, independent of the document-sharing flag and of the dashboard
 * notice's dismissal, so accounts created long ago can verify at any time. A badge
 * appears only for a known status; an unknown one (older session) shows none but
 * still offers the actions, which resolve it.
 */
export const ProfileEmailVerification = ({
  cooldownSeconds,
}: ProfileEmailVerificationProps) => {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div className="profile-email-verification min-w-0">
      <SettingsCard
        description="Confirm ownership of your sign-in email to receive shared documents."
        icon={EnvelopeSimpleIcon}
        title="Email verification"
        tone="golden"
      >
        <div className="grid gap-4 text-sm">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="min-w-0 break-all font-medium text-nox-noir">
              {user.email}
            </span>
            {user.emailVerified !== undefined ? (
              <Badge
                icon={
                  user.emailVerified ? (
                    <CheckCircleIcon
                      aria-hidden
                      size={14}
                      weight="fill"
                    />
                  ) : undefined
                }
                variant={user.emailVerified ? "success" : "accent"}
              >
                {user.emailVerified ? "Verified" : "Not verified"}
              </Badge>
            ) : null}
          </div>
          {user.emailVerified !== true ? (
            <>
              <p className="text-nox-noir/60">
                {user.emailVerified === false
                  ? "Open the verification link in your email, or request a new one below."
                  : "Your verification status has not been checked yet. Check it below, or request a verification email."}
              </p>
              <EmailVerificationActions
                cooldownSeconds={cooldownSeconds}
                email={user.email}
              />
            </>
          ) : null}
        </div>
      </SettingsCard>
    </div>
  );
};
