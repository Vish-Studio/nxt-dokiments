"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/button/button";
import { Input } from "@/components/input/input";
import { signInWithFirebase } from "@/lib/firebase/rest-auth";
import { useAuthStore } from "@/stores/auth-store";

type SignInValues = {
  email: string;
  password: string;
};

export type SignInFormProps = {
  onSubmit?: (values: SignInValues) => Promise<void>;
};

export const SignInForm = ({ onSubmit }: SignInFormProps) => {
  const setSession = useAuthStore((state) => state.setSession);
  const [formError, setFormError] = useState("");
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

      const session = await signInWithFirebase(values);
      setSession(session);
      const params = new URLSearchParams(window.location.search);
      window.location.assign(params.get("next") || "/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to sign in.");
    }
  });

  return (
    <form className="grid gap-5" onSubmit={submitForm}>
      {formError ? (
        <div className="rounded-box bg-error/10 px-4 py-3 text-sm text-error" role="alert">
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
        <Link className="font-title font-bold text-nox-noir hover:text-primary" href="/forgot-password">
          Forgot password?
        </Link>
      </div>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
};
