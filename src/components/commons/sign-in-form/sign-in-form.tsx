"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import { GoogleSignInButton } from "@/components/commons/google-sign-in-button/google-sign-in-button";
import { Input } from "@/components/commons/input/input";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/stores/auth-store";

type SignInValues = {
  email: string;
  password: string;
};

export type SignInFormProps = {
  onSubmit?: (values: SignInValues) => Promise<void>;
};

export const SignInForm = ({ onSubmit }: SignInFormProps) => {
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
  } = useForm<SignInValues>({
    defaultValues: {
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

      const res = await fetch("/api/auth/sign-in", {
        body: JSON.stringify(values),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to sign in.");
      queryClient.setQueryData(queryKeys.session(), data.user);
      setUser(data.user);
      const params = new URLSearchParams(window.location.search);
      window.location.assign(params.get("next") || "/dashboard");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to sign in.",
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
        autoComplete="current-password"
        error={errors.password?.message}
        label="Password"
        placeholder="Enter your password"
        type="password"
        {...register("password", {
          required: "Password is required.",
        })}
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <Link
          className="font-title font-bold text-nox-noir hover:text-primary"
          href="/forgot-password"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        className="w-full"
        disabled={isSubmitting}
        type="submit"
        variant="accent"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <div className="flex items-center gap-3 text-xs font-title uppercase text-nox-noir/40">
        <span className="h-px flex-1 bg-steel-mist" />
        or
        <span className="h-px flex-1 bg-steel-mist" />
      </div>

      <GoogleSignInButton
        className="w-full"
        next={next}
      />
    </form>
  );
};
