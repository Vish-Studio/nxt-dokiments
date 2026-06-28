"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";
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
  const [formError, setFormError] = useState("");
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
      setUser(data.user);
      const params = new URLSearchParams(window.location.search);
      window.location.assign(params.get("next") || "/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create account.");
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

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-nox-noir/60">
        Already have an account?{" "}
        <Link className="font-title font-bold text-nox-noir hover:text-primary" href="/sign-in">
          Sign in
        </Link>
      </p>
    </form>
  );
};
