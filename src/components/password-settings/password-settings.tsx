"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { updateAccountPassword } from "@/lib/firebase/rest-auth";
import { useAuthStore } from "@/stores/auth-store";

type PasswordValues = {
  confirmPassword: string;
  password: string;
};

type Feedback = {
  message: string;
  tone: "error" | "success";
};

export const PasswordSettings = () => {
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const form = useForm<PasswordValues>({
    defaultValues: { confirmPassword: "", password: "" },
  });

  const submit = form.handleSubmit(async ({ password }) => {
    setFeedback(null);

    if (!session) {
      setFeedback({ message: "Your session expired. Please sign in again.", tone: "error" });
      return;
    }

    try {
      const updatedSession = await updateAccountPassword(session, password);
      setSession(updatedSession);
      form.reset({ confirmPassword: "", password: "" });
      setFeedback({ message: "Password changed.", tone: "success" });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Unable to change password.",
        tone: "error",
      });
    }
  });

  return (
    <section className="max-w-md">
      <div className="border-b border-steel-mist pb-4">
        <h3 className="font-title text-lg font-bold text-bloodwood-deep">Password</h3>
        <p className="mt-1 text-sm leading-6 text-nox-noir/60">
          Choose a new password with at least 6 characters.
        </p>
      </div>

      <form className="mt-6 grid gap-5" onSubmit={submit}>
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
        <Input
          autoComplete="new-password"
          error={form.formState.errors.password?.message}
          label="New password"
          placeholder="Enter a new password"
          type="password"
          {...form.register("password", {
            required: "Password is required.",
            minLength: { message: "Use at least 6 characters.", value: 6 },
          })}
        />
        <Input
          autoComplete="new-password"
          error={form.formState.errors.confirmPassword?.message}
          label="Confirm new password"
          placeholder="Re-enter the new password"
          type="password"
          {...form.register("confirmPassword", {
            required: "Please confirm your password.",
            validate: (value) =>
              value === form.getValues("password") || "Passwords do not match.",
          })}
        />
        <div>
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Updating..." : "Change password"}
          </Button>
        </div>
      </form>
    </section>
  );
};
