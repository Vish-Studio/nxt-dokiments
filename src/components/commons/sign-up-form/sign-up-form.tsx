"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/commons/button/button";
import { GoogleSignInButton } from "@/components/commons/google-sign-in-button/google-sign-in-button";
import { Input } from "@/components/commons/input/input";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { PromoCodeCallout } from "@/components/commons/promo-code-callout/promo-code-callout";
import { trackEvent } from "@/lib/analytics/track";
import { withPromoStatus } from "@/lib/promo/promo-status";
import { queryKeys } from "@/lib/query/keys";
import { useAuthStore } from "@/stores/auth-store";

type SignUpFields = {
  displayName: string;
  email: string;
  password: string;
};

type SignUpValues = SignUpFields & {
  /** Optional launch promo code; blank means the user simply doesn't have one. */
  promoCode: string;
};

export type SignUpFormProps = {
  onSubmit?: (values: SignUpValues) => Promise<void>;
};

export const SignUpForm = ({ onSubmit }: SignUpFormProps) => {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState("");
  const [next, setNext] = useState("/dashboard");
  /**
   * Held as plain state rather than a `react-hook-form` field. The field has no
   * validation for that library to run, and `GoogleSignInButton` is a real anchor
   * whose `href` must already carry the code when clicked — which needs a re-render
   * per keystroke. `watch()` would do that too, but it makes React Compiler skip
   * memoising this entire component (`react-hooks/incompatible-library`).
   */
  const [promoCode, setPromoCode] = useState("");

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

  const submitForm = handleSubmit(async (fields) => {
    setFormError("");
    const values: SignUpValues = { ...fields, promoCode };

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
      // Reported via the URL rather than inline: this navigates away immediately.
      // `PromoStatusBanner` renders the outcome on the destination page.
      window.location.assign(
        withPromoStatus(params.get("next") || "/dashboard", data.promo),
      );
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

      <PromoCodeCallout />
      <Input
        autoCapitalize="characters"
        autoComplete="off"
        label="Promo code (optional)"
        name="promoCode"
        onChange={(event) => setPromoCode(event.target.value)}
        placeholder="Enter your promo code"
        spellCheck={false}
        value={promoCode}
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
        promoCode={promoCode}
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
