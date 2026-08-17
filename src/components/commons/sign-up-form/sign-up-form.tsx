"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import { GoogleSignInButton } from "@/components/commons/google-sign-in-button/google-sign-in-button";
import { Input } from "@/components/commons/input/input";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { trackEvent } from "@/lib/analytics/track";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/stores/auth-store";

type SignUpValues = {
  displayName: string;
  email: string;
  password: string;
};

export type SignUpFormProps = {
  onSubmit?: (values: SignUpValues) => Promise<void>;
};

export const SignUpForm = ({ onSubmit }: SignUpFormProps) => {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState("");
  const [next, setNext] = useState("/dashboard");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      setNext(params.get("next") || "/dashboard");
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SignUpValues>({
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  const submitForm = handleSubmit(async (values) => {
    setFormError("");

    try {
      if (onSubmit) {
        await onSubmit(values);
        return;
      }

      const res = await fetch("/api/auth/sign-up", {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to create account.");
      queryClient.setQueryData(queryKeys.session(), data.user);
      setUser(data.user);
      trackEvent("sign_up", { method: "email" });
      const params = new URLSearchParams(window.location.search);
      window.location.assign(params.get("next") || "/dashboard");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    }
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={submitForm}
    >
      {formError ? (
        <div
          className="rounded-box bg-error/10 px-4 py-3 text-sm text-error"
          role="alert"
        >
          {formError}
        </div>
      ) : null}

      <Input
        autoComplete="name"
        error={errors.displayName?.message}
        label="Full name"
        placeholder="Anthony Alverizko"
        {...register("displayName", {
          required: "Full name is required.",
        })}
      />
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
      <Input
        autoComplete="new-password"
        error={errors.password?.message}
        label="Password"
        placeholder="Create a password"
        type="password"
        {...register("password", {
          minLength: {
            message: "Use at least 6 characters.",
            value: 6,
          },
          required: "Password is required.",
        })}
      />

      <Button
        className="w-full"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <div className="flex items-center gap-3 text-xs font-title uppercase text-nox-noir/40">
        <span className="h-px flex-1 bg-steel-mist" />
        or
        <span className="h-px flex-1 bg-steel-mist" />
      </div>

      <GoogleSignInButton
        className="w-full"
        label="Sign up with Google"
        next={next}
      />

      <div className="grid gap-3 border-t border-steel-mist pt-5 text-center">
        <p className="text-sm text-nox-noir/60">Already have an account?</p>
        <LinkButton
          className="w-full"
          href="/sign-in"
          variant="outline"
        >
          Sign in
        </LinkButton>
      </div>
    </form>
  );
};
