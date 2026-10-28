"use client";

import { CheckCircleIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";
import { UpgradeDialog } from "@/components/commons/upgrade-dialog/upgrade-dialog";
import { useClientsQuery } from "@/hooks/queries/use-clients";
import {
  type ShareSuggestionSection,
  ShareRecipientSuggestions,
} from "@/components/dashboard/share-recipient-suggestions/share-recipient-suggestions";
import {
  ShareLimitReachedError,
  useShareDocumentMutation,
  useShareRecipientsQuery,
} from "@/hooks/queries/use-share";
import { shareEmailSchema } from "@/lib/sharing/email-schema";

type ShareValues = { email: string };

export interface ShareDialogProps {
  /** The document being shared; `recipientEmail` is the one named on it, offered first. */
  document: { id: string; name: string; recipientEmail?: string };
  onClose: () => void;
  open: boolean;
}

/**
 * Shares one document with a person by email, via `POST /api/documents/:id/share`.
 *
 * Self-contained like `FeedbackDialog`: it owns its field, its submission and its
 * success state, and callers only decide when it is open. A failure keeps the
 * typed address on screen. A plan-limit refusal opens the upgrade dialog on top.
 */
export const ShareDialog = ({
  document: target,
  onClose,
  open,
}: ShareDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<string | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const { isPending, mutate: share } = useShareDocumentMutation();
  const { data: recipients = [] } = useShareRecipientsQuery({ enabled: open });
  const { data: clients = [] } = useClientsQuery({ enabled: open });
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<ShareValues>({ defaultValues: { email: "" } });
  const typedEmail = useWatch({ control, name: "email" });
  const documentRecipient = shareEmailSchema.safeParse(
    target.recipientEmail ?? "",
  );
  const documentRecipientEmail = documentRecipient.success
    ? documentRecipient.data.toLowerCase()
    : null;

  const sections = useMemo((): ShareSuggestionSection[] => {
    const query = typedEmail.trim().toLowerCase();
    // Typing narrows every list, so a client beyond the visible few is reachable.
    const matches = (...values: string[]) =>
      !query || values.some((value) => value.toLowerCase().includes(query));

    const all: ShareSuggestionSection[] = [
      {
        items: documentRecipientEmail
          ? [{ email: documentRecipientEmail }]
          : [],
        label: "Recipient on this document",
      },
      {
        items: clients.flatMap((client) => {
          const result = shareEmailSchema.safeParse(client.email);
          const email = result.success ? result.data.toLowerCase() : null;

          return email && matches(client.name, client.companyName, email)
            ? [{ email, name: client.name || client.companyName }]
            : [];
        }),
        label: "Your clients",
      },
      {
        items: recipients.map((recipient) => ({ email: recipient.email })),
        label: "Recent",
      },
    ];

    return all.map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        matches(item.email, item.name ?? ""),
      ),
    }));
  }, [clients, documentRecipientEmail, recipients, typedEmail]);

  // Pre-fill the address named on the document each time the dialog opens.
  useEffect(() => {
    if (open) {
      reset({ email: documentRecipientEmail ?? "" });
    }
  }, [open, documentRecipientEmail, reset]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isUpgradeOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.document.body.style.overflow = "";
    };
  }, [open, isUpgradeOpen, onClose]);

  if (!open || typeof window.document === "undefined") {
    return null;
  }

  /** Closes and clears everything, so reopening starts fresh. */
  const close = () => {
    reset({ email: "" });
    setErrorMessage(null);
    setSharedWith(null);
    setIsUpgradeOpen(false);
    onClose();
  };

  const submit = handleSubmit((values) => {
    setErrorMessage(null);

    share(
      { documentId: target.id, email: shareEmailSchema.parse(values.email) },
      {
        onError: (error) => {
          if (error instanceof ShareLimitReachedError) {
            setIsUpgradeOpen(true);
            return;
          }

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to share this document right now.",
          );
        },
        onSuccess: (result) => setSharedWith(result.recipient.email),
      },
    );
  });

  return createPortal(
    <div
      aria-label={`Share ${target.name}`}
      aria-modal="true"
      className="share-dialog fixed inset-0 z-80 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-nox-noir/55"
        disabled={isPending}
        onClick={close}
        type="button"
      />

      {sharedWith ? (
        <div className="relative z-10 w-full max-w-md rounded-box border border-steel-mist bg-base-100 p-6 text-center">
          <CheckCircleIcon
            aria-hidden
            className="mx-auto text-success"
            size={40}
            weight="fill"
          />
          <h3 className="mt-3 font-title text-lg font-bold text-nox-noir">
            Document shared
          </h3>
          <p className="mt-2 text-sm leading-6 text-nox-noir/65">
            {sharedWith} can now view and sign{" "}
            <span className="font-semibold text-nox-noir">{target.name}</span>{" "}
            once they sign in with a verified email.
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              autoFocus
              onClick={close}
              size="sm"
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="relative z-10 w-full max-w-md rounded-box border border-steel-mist bg-base-100 p-6"
          noValidate
          onSubmit={submit}
        >
          <h3 className="font-title text-lg font-bold text-nox-noir">
            Share this document
          </h3>
          <p className="mt-2 text-sm leading-6 text-nox-noir/65">
            Send{" "}
            <span className="font-semibold text-nox-noir">{target.name}</span>{" "}
            to someone who needs to view and sign it.
          </p>

          {errorMessage ? (
            <div
              className="mt-4 rounded-box bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-5">
            <Input
              autoComplete="email"
              autoFocus
              disabled={isPending}
              error={errors.email?.message}
              id="share-email"
              label="Recipient email"
              placeholder="name@example.com"
              type="email"
              {...register("email", {
                validate: (value) =>
                  shareEmailSchema.safeParse(value).success ||
                  "Enter a valid email address.",
              })}
            />
            <ShareRecipientSuggestions
              disabled={isPending}
              onSelect={(email) =>
                setValue("email", email, { shouldValidate: true })
              }
              sections={sections}
              selected={typedEmail}
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              disabled={isPending}
              onClick={close}
              size="sm"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              size="sm"
              type="submit"
            >
              {isPending ? "Sharing..." : "Share"}
            </Button>
          </div>
        </form>
      )}

      <UpgradeDialog
        description="You've reached the sharing limit for your plan. Upgrade your account to share with more people."
        onClose={() => setIsUpgradeOpen(false)}
        open={isUpgradeOpen}
        reason="share_limit"
        title="Upgrade to share with more people"
      />
    </div>,
    window.document.body,
  );
};
