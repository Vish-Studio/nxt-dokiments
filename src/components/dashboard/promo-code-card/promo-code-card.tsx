"use client";

import { GiftIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/commons/badge/badge";
import { Button } from "@/components/commons/button/button";
import { Input } from "@/components/commons/input/input";
import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { ProfileFeedbackBanner } from "@/components/dashboard/profile-feedback-banner/profile-feedback-banner";
import {
  usePromoRedemptionsQuery,
  useRedeemPromoCodeMutation,
} from "@/hooks/queries/use-promo-redemptions";
import { activePromoCode, promoMessages } from "@/lib/promo/promo-codes";

type PromoValues = {
  promoCode: string;
};

type Feedback = {
  message: string;
  tone: "error" | "success";
};

/** Matches the date presentation `DocumentListItem` already uses in the dashboard. */
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Shared card chrome, so the loading, redeemed and entry states can't drift apart. */
const cardClasses =
  "rounded-box border border-steel-mist bg-base-100 p-6 promo-code-card";

/**
 * Launch Promo status for the signed-in account, shown in Settings → Profile.
 *
 * Renders one of two states off a single question — does a redemption record exist
 * for the active campaign? — which is why an account created before this feature
 * shipped needs no special handling: it simply has no record, so it sees the entry
 * form exactly as a new account that skipped the field at sign-up does.
 *
 * The form is shown even when the redemption list failed to load. Nothing is lost
 * by being optimistic there: the server is the authority on whether a redemption is
 * allowed, so a code submitted against an already-redeemed account comes back as a
 * clear message rather than a wrong success.
 */
export const PromoCodeCard = () => {
  const { data: redemptions, isLoading } = usePromoRedemptionsQuery();
  const { isPending, mutate: redeemPromoCode } = useRedeemPromoCodeMutation();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const form = useForm<PromoValues>({
    defaultValues: { promoCode: "" },
  });

  const redemption = redemptions?.find(
    (item) => item.promoId === activePromoCode.id,
  );

  const submit = form.handleSubmit(({ promoCode }) => {
    setFeedback(null);

    redeemPromoCode(promoCode, {
      onError: (error) => {
        setFeedback({
          message:
            error instanceof Error
              ? error.message
              : "Unable to apply this promo code.",
          tone: "error",
        });
      },
      onSuccess: () => {
        form.reset({ promoCode: "" });
        setFeedback({ message: promoMessages.applied, tone: "success" });
      },
    });
  });

  const header = (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-box bg-nox-noir text-golden-harvest">
        <GiftIcon
          aria-hidden
          size={20}
          weight="fill"
        />
      </span>
      <h3 className="font-title text-lg font-bold text-nox-noir">
        {activePromoCode.label}
      </h3>
      {redemption ? <Badge variant="success">Applied</Badge> : null}
    </div>
  );

  if (isLoading) {
    return (
      <section className={cardClasses}>
        <LoadingStatus message="Loading your promo code status…" />
        <div
          aria-hidden
          className="space-y-3"
        >
          <div className="skeleton h-5 w-1/3 rounded-field" />
          <div className="skeleton h-3 w-full rounded-field" />
          <div className="skeleton h-3 w-2/3 rounded-field" />
        </div>
      </section>
    );
  }

  if (redemption) {
    return (
      <section className={cardClasses}>
        {header}
        <p className="mt-4 text-sm leading-6 text-nox-noir/70">
          Promo code{" "}
          <span className="font-title font-bold text-nox-noir">
            {redemption.code}
          </span>{" "}
          has been applied to your account.
        </p>
        {/* `redeemedAt` is 0 when the stored timestamp couldn't be parsed, which
            would otherwise print as 1 Jan 1970. */}
        {redemption.redeemedAt ? (
          <p className="mt-1 text-sm text-nox-noir/55">
            Applied on {dateFormatter.format(redemption.redeemedAt)}.
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section className={cardClasses}>
      {header}
      <p className="mt-4 text-sm leading-6 text-nox-noir/70">
        Have a launch promo code? Enter it below to apply it to your account.
      </p>

      <form
        className="mt-4 grid gap-4"
        onSubmit={submit}
      >
        <ProfileFeedbackBanner feedback={feedback} />
        <Input
          // The code is printed publicly on the sign-in page, so showing it as the
          // placeholder gives nothing away — and it's the only way an already
          // signed-in user, who never sees that page, learns what to type.
          autoCapitalize="characters"
          autoComplete="off"
          error={form.formState.errors.promoCode?.message}
          label="Promo code"
          placeholder={activePromoCode.code}
          spellCheck={false}
          {...form.register("promoCode", {
            required: "Enter a promo code.",
          })}
        />
        <div>
          <Button
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Applying…" : "Apply promo code"}
          </Button>
        </div>
      </form>
    </section>
  );
};
