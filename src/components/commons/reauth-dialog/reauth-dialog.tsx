"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";
import { useReauthenticateMutation } from "@/hooks/queries/use-auth";

type ReauthValues = {
  password: string;
};

export type ReauthDialogProps = {
  onClose: () => void;
  /** Called after the current password has been successfully verified and the session's tokens refreshed. */
  onReauthenticated: () => void;
  open: boolean;
};

/**
 * Prompts for the signed-in user's current password to recover from
 * `ReauthRequiredError` on a sensitive action (Firebase's session-too-old
 * signal). Self-contained — owns its own password field and the
 * `useReauthenticateMutation` call; callers only get notified via
 * `onReauthenticated` once the session's tokens are fresh again, and are
 * responsible for retrying whatever action originally triggered this.
 *
 * A wrong password keeps the dialog open with an inline error so the user
 * can retry without losing their place in the original form.
 */
export const ReauthDialog = ({
  onClose,
  onReauthenticated,
  open,
}: ReauthDialogProps) => {
  const [formError, setFormError] = useState("");
  const { isPending, mutate: reauthenticate } = useReauthenticateMutation();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ReauthValues>({ defaultValues: { password: "" } });

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const submit = handleSubmit(({ password }) => {
    setFormError("");

    reauthenticate(password, {
      onError: (error) => {
        setFormError(
          error instanceof Error
            ? error.message
            : "Unable to verify your password.",
        );
      },
      onSuccess: () => {
        reset({ password: "" });
        onReauthenticated();
      },
    });
  });

  return (
    <div
      aria-label="Confirm your password"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 bg-nox-noir/55"
        disabled={isPending}
        onClick={onClose}
        type="button"
      />

      <form
        className="relative z-10 w-full max-w-sm rounded-box border border-steel-mist bg-base-100 p-6"
        onSubmit={submit}
      >
        <h3 className="font-title text-lg font-bold text-nox-noir">
          Confirm your password
        </h3>
        <p className="mt-2 text-sm leading-6 text-nox-noir/65">
          For your security, please re-enter your current password to continue.
        </p>

        {formError ? (
          <div
            className="mt-4 rounded-box bg-error/10 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <div className="mt-4">
          <Input
            autoComplete="current-password"
            autoFocus
            error={errors.password?.message}
            label="Current password"
            placeholder="Enter your current password"
            type="password"
            {...register("password", { required: "Password is required." })}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            disabled={isPending}
            onClick={onClose}
            size="sm"
            type="button"
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            size="sm"
            type="submit"
          >
            {isPending ? "Verifying..." : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
};
