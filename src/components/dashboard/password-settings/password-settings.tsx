"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";
import { ReauthDialog } from "@/components/commons/reauth-dialog/reauth-dialog";
import {
  ReauthRequiredError,
  useUpdatePasswordMutation,
} from "@/hooks/queries/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { credentialFieldLimits } from "@/types/auth";

type PasswordValues = {
  confirmPassword: string;
  password: string;
};

type Feedback = {
  message: string;
  tone: "error" | "success";
};

export const PasswordSettings = () => {
  const user = useAuthStore((state) => state.user);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isReauthOpen, setIsReauthOpen] = useState(false);
  const { isPending, mutate: updatePassword } = useUpdatePasswordMutation();

  const form = useForm<PasswordValues>({
    defaultValues: { confirmPassword: "", password: "" },
    mode: "onChange",
  });

  const passwordField = form.register("password", {
    required: "Password is required.",
    minLength: { message: "Use at least 6 characters.", value: 6 },
  });

  const attemptUpdate = (password: string) => {
    updatePassword(password, {
      onError: (error) => {
        if (error instanceof ReauthRequiredError) {
          setIsReauthOpen(true);
          return;
        }

        setFeedback({
          message:
            error instanceof Error
              ? error.message
              : "Unable to change password.",
          tone: "error",
        });
      },
      onSuccess: () => {
        form.reset({ confirmPassword: "", password: "" });
        setFeedback({ message: "Password changed.", tone: "success" });
      },
    });
  };

  const submit = form.handleSubmit(({ password }) => {
    setFeedback(null);
    attemptUpdate(password);
  });

  const handleReauthenticated = () => {
    setIsReauthOpen(false);
    attemptUpdate(form.getValues("password"));
  };

  if (user?.provider === "google") {
    return (
      <section className="max-w-md">
        <div className="border-b border-steel-mist pb-4">
          <h3 className="font-title text-lg font-bold text-nox-noir">
            Password
          </h3>
        </div>
        <p className="mt-6 text-sm leading-6 text-nox-noir/60">
          You sign in with Google, so there&apos;s no password to manage for
          this account.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-md">
      <div className="border-b border-steel-mist pb-4">
        <h3 className="font-title text-lg font-bold text-nox-noir">Password</h3>
        <p className="mt-1 text-sm leading-6 text-nox-noir/60">
          Choose a new password with at least 6 characters.
        </p>
        {user?.linkedGoogle ? (
          <p className="mt-2 text-sm leading-6 text-nox-noir/60">
            Google is also connected to this account.
          </p>
        ) : null}
      </div>

      <form
        className="mt-6 grid gap-5"
        onSubmit={submit}
      >
        {feedback ? (
          <div
            className={
              feedback.tone === "success"
                ? "rounded-box bg-success/10 px-4 py-3 text-sm text-success"
                : "rounded-box bg-error/10 px-4 py-3 text-sm text-error"
            }
            role="status"
          >
            {feedback.message}
          </div>
        ) : null}
        {/* Both fields are capped at what `UpdatePasswordSchema` accepts. This is a
            password being *set*, so the ceiling applies — the `ReauthDialog` that may
            follow asks for the existing one and deliberately has none. */}
        <Input
          autoComplete="new-password"
          error={form.formState.errors.password?.message}
          label="New password"
          maxLength={credentialFieldLimits.password}
          placeholder="Enter a new password"
          type="password"
          {...passwordField}
          onChange={(event) => {
            void passwordField.onChange(event);
            if (form.getFieldState("confirmPassword").isTouched) {
              void form.trigger("confirmPassword");
            }
          }}
        />
        <Input
          autoComplete="new-password"
          error={form.formState.errors.confirmPassword?.message}
          label="Confirm new password"
          maxLength={credentialFieldLimits.password}
          placeholder="Re-enter the new password"
          type="password"
          {...form.register("confirmPassword", {
            required: "Please confirm your password.",
            validate: (value) =>
              value === form.getValues("password") || "Passwords do not match.",
          })}
        />
        <div>
          <Button
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Updating..." : "Change password"}
          </Button>
        </div>
      </form>

      <ReauthDialog
        onClose={() => setIsReauthOpen(false)}
        onReauthenticated={handleReauthenticated}
        open={isReauthOpen}
      />
    </section>
  );
};
