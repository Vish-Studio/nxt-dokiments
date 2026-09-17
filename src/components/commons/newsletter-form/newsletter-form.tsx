"use client";

import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";
import { writeNewsletterStatus } from "@/lib/newsletter";
import { cn } from "@/lib/utils";

export interface NewsletterFormProps {
  appearance?: "light" | "dark";
  className?: string;
  onSubscribed?: () => void;
}

export const NewsletterForm = ({
  appearance = "light",
  className,
  onSubscribed,
}: NewsletterFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const email = new FormData(event.currentTarget).get("email");
      const response = await fetch("/api/newsletter", {
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(body?.error ?? "Unable to subscribe right now. Please try again.");
      }

      writeNewsletterStatus("subscribed");
      setIsSubscribed(true);
      onSubscribed?.();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to subscribe right now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <p
        aria-live="polite"
        className={cn(
          "font-title text-sm font-semibold",
          appearance === "dark" ? "text-golden-harvest" : "text-nox-noir",
          className,
        )}
      >
        You&apos;re on the list. Watch your inbox for the next issue.
      </p>
    );
  }

  return (
    <form className={cn("newsletter-form grid gap-3 sm:grid-cols-[1fr_auto]", className)} onSubmit={handleSubmit}>
      <Input
        aria-label="Email address"
        autoComplete="email"
        className={cn(
          "h-11",
          appearance === "dark"
            ? "border-white/20 bg-white/10 text-white placeholder:text-white/45 focus:border-golden-harvest focus:bg-white/15 focus:ring-golden-harvest/20"
            : undefined,
        )}
        name="email"
        placeholder="Your email address"
        required
        type="email"
      />
      <Button
        disabled={isSubmitting}
        icon={<PaperPlaneTiltIcon aria-hidden size={17} weight="bold" />}
        iconPosition="left"
        type="submit"
        variant="accent"
      >
        {isSubmitting ? "Subscribing…" : "Subscribe"}
      </Button>
      {error ? (
        <p aria-live="polite" className="sm:col-span-2 text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
    </form>
  );
};
