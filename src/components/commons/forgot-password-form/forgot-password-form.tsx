"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";

type ForgotPasswordValues = {
  email: string;
};

export type ForgotPasswordFormProps = {
  onSubmit?: (values: ForgotPasswordValues) => Promise<void>;
};

export const ForgotPasswordForm = ({ onSubmit }: ForgotPasswordFormProps) => {
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: "",
    },
  });

  const submitForm = handleSubmit(async (values) => {
    setFormError("");
    setSuccessMessage("");

    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        const res = await fetch("/api/auth/forgot-password", {
          body: JSON.stringify({ email: values.email }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Unable to send reset email.");
        }
      }

      setSuccessMessage("Password reset email sent. Check your inbox.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to send reset email.");
    }
  });

  return (
    <form className="grid gap-5" onSubmit={submitForm}>
      {formError ? (
        <div className="rounded-box bg-error/10 px-4 py-3 text-sm text-error" role="alert">
          {formError}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-box bg-success/10 px-4 py-3 text-sm text-success" role="status">
          {successMessage}
        </div>
      ) : null}

      <Input
        autoComplete="email"
        error={errors.email?.message}
        label="Email"
        placeholder="you@company.com"
        type="email"
        {...register("email", {
          required: "Email is required.",
          pattern: {
            message: "Enter a valid email address.",
            value: /\S+@\S+\.\S+/,
          },
        })}
      />

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Sending..." : "Send reset link"}
      </Button>

      <Link className="text-center font-title text-sm font-bold text-nox-noir hover:text-primary" href="/sign-in">
        Back to sign in
      </Link>
    </form>
  );
};
