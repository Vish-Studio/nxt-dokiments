"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { Button } from "@/components/commons/button/button";
import { InviteNotice } from "@/components/commons/invite-notice/invite-notice";
import { InvitePreview } from "@/components/commons/invite-preview/invite-preview";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import {
  InviteMismatchError,
  useAcceptInviteMutation,
  useInvitePreviewQuery,
} from "@/hooks/queries/use-shared-invites";
import { useSessionQuery } from "@/hooks/queries/use-session";
import { withNext } from "@/lib/auth/auth-link";
import { signOutAndRedirect } from "@/lib/auth/sign-out";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";

export interface InviteLandingProps {
  /** The invite token from the link. Sent to the API, never logged. */
  token: string;
}

/**
 * The page body behind an emailed invite link.
 *
 * A visitor who is not signed in sees the document preview with sign-up and
 * sign-in buttons that return here afterwards. A signed-in visitor is linked to
 * the document straight away and taken to it. The wrong account, an expired
 * link and a replaced link each get their own explanation.
 */
export const InviteLanding = ({ token }: InviteLandingProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const showToast = useToastStore((state) => state.showToast);
  const session = useSessionQuery();
  const preview = useInvitePreviewQuery(token);
  const accept = useAcceptInviteMutation(token);
  const { mutate } = accept;
  const started = useRef(false);

  const state = preview.data?.state;
  const signedIn = Boolean(session.data);

  useEffect(() => {
    // Accepting is a write, so it must run exactly once per visit.
    if (started.current || state !== "valid" || !signedIn) return;
    started.current = true;

    mutate(undefined, {
      onSuccess: (sharedDocumentId) => {
        showToast({
          message: "A document is waiting for your signature",
          tone: "success",
        });
        router.replace(`/my-documents/shared/${sharedDocumentId}`);
      },
    });
  }, [mutate, router, showToast, signedIn, state]);

  if (preview.isPending || session.isPending) {
    return (
      <p
        className="text-center text-sm text-nox-noir/60"
        role="status"
      >
        Opening your invitation…
      </p>
    );
  }

  if (preview.isError || !preview.data) {
    return (
      <InviteNotice kind="invalid">
        <Button
          onClick={() => preview.refetch()}
          variant="outline"
        >
          Try again
        </Button>
      </InviteNotice>
    );
  }

  if (preview.data.state !== "valid") {
    return <InviteNotice kind={preview.data.state} />;
  }

  if (accept.error instanceof InviteMismatchError) {
    return (
      <InviteNotice
        invitedEmail={accept.error.invitedEmail}
        kind="mismatch"
      >
        <Button
          onClick={() =>
            signOutAndRedirect(
              queryClient,
              clearSession,
              withNext("/sign-in", `/shared/${token}`),
            )
          }
        >
          Sign out
        </Button>
      </InviteNotice>
    );
  }

  if (accept.isError) {
    return (
      <InviteNotice kind="invalid">
        <LinkButton
          href="/my-documents?tab=shared"
          variant="outline"
        >
          Go to Shared with me
        </LinkButton>
      </InviteNotice>
    );
  }

  const { invite } = preview.data;

  return (
    <InvitePreview
      documentName={invite.name}
      senderEmail={invite.ownerEmail}
      senderName={invite.ownerName}
    >
      {signedIn ? (
        <LoadingStatus message="Linking the document to your account" />
      ) : (
        <>
          <LinkButton
            href={withNext("/sign-up", `/shared/${token}`)}
            variant="primary"
          >
            Sign up to sign
          </LinkButton>
          <LinkButton
            href={withNext("/sign-in", `/shared/${token}`)}
            variant="outline"
          >
            Sign in
          </LinkButton>
        </>
      )}
    </InvitePreview>
  );
};
