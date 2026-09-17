import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { trackEvent } from "@/lib/analytics/track";
import { queryKeys } from "@/lib/query/keys";
import type { PromoRedemption } from "@/types/promo";

/** Error shape returned by the promo API on a non-2xx response. */
type PromoApiError = { error: string };

/** Why the server refused a redemption, classified from the response status. */
export type PromoFailureReason = "already_redeemed" | "invalid";

/**
 * Thrown when the server *refuses* a redemption — an unrecognised code, or one
 * this account has already used — as opposed to failing to answer at all.
 *
 * The distinction exists so the outcome can be reported to analytics with a
 * reason: a `500`/network failure says nothing about the code and should not be
 * counted as a rejected promo. Callers rendering the message don't need to
 * inspect `reason`; `message` is already the exact copy to display, composed
 * server-side so the wording lives in one place.
 *
 * Mirrors `ReauthRequiredError` in `use-auth.ts` — the established way this
 * codebase gives a specific server rejection its own catchable type.
 */
export class PromoRedemptionError extends Error {
  /** Which refusal this was. */
  readonly reason: PromoFailureReason;

  constructor(message: string, reason: PromoFailureReason) {
    super(message);
    this.name = "PromoRedemptionError";
    this.reason = reason;
  }
}

const fetchPromoRedemptions = async (): Promise<PromoRedemption[]> => {
  const response = await fetch("/api/promo-redemptions");

  if (!response.ok) {
    throw new Error("Unable to load your promo code status.");
  }

  const data = (await response.json()) as {
    redemptions: PromoRedemption[];
  };
  return data.redemptions;
};

/**
 * The promo codes the signed-in user has redeemed.
 *
 * An empty array is the normal state for most accounts — including every account
 * that predates this feature — so consumers should treat "no record" as "not
 * redeemed" rather than as missing data.
 */
export const usePromoRedemptionsQuery = () =>
  useQuery({
    queryKey: queryKeys.promoRedemptions.all(),
    queryFn: fetchPromoRedemptions,
    staleTime: 60_000,
  });

const postRedeemPromoCode = async (
  promoCode: string,
): Promise<PromoRedemption> => {
  const response = await fetch("/api/promo-redemptions", {
    body: JSON.stringify({ promoCode }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const data = (await response.json()) as {
    redemption: PromoRedemption;
  } & Partial<PromoApiError>;

  if (!response.ok) {
    // Classified by status rather than by a code in the body: the statuses are
    // already this route's documented contract (409 = this account has used it,
    // 400 = the code is not valid), so there is nothing extra to agree on.
    if (response.status === 409 || response.status === 400) {
      throw new PromoRedemptionError(
        data.error ?? "Unable to apply this promo code.",
        response.status === 409 ? "already_redeemed" : "invalid",
      );
    }

    throw new Error(data.error ?? "Unable to apply this promo code.");
  }

  return data.redemption;
};

/**
 * Applies a promo code to the signed-in user's account.
 *
 * Deliberately **not** optimistic, unlike `useSaveTemplateMutation`: whether a
 * redemption is allowed is the entire question this request exists to ask, and
 * only the server can answer it. Showing it as applied before the server agrees
 * would flash a success the user may not have earned.
 *
 * `surface: "settings"` is fixed because this is the only mutation path — a code
 * submitted during sign-in/sign-up is redeemed by the auth route itself, and the
 * banner there reports its own analytics.
 */
export const useRedeemPromoCodeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRedeemPromoCode,
    onError: (error) => {
      // Only a refusal is a promo outcome. An outage or a bug is not, and
      // counting it as one would overstate how often codes are rejected.
      if (error instanceof PromoRedemptionError) {
        trackEvent("promo_code_failed", {
          reason: error.reason,
          surface: "settings",
        });
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.promoRedemptions.all(),
      });
    },
    onSuccess: (redemption) => {
      // Written straight into the cache so the card flips to its redeemed state
      // immediately, rather than waiting for the refetch `onSettled` triggers.
      queryClient.setQueryData<PromoRedemption[]>(
        queryKeys.promoRedemptions.all(),
        (current) => [
          ...(current ?? []).filter(
            (item) => item.promoId !== redemption.promoId,
          ),
          redemption,
        ],
      );
      trackEvent("promo_code_applied", {
        promo_id: redemption.promoId,
        surface: "settings",
      });
    },
  });
};
