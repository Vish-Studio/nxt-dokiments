/**
 * The single source of truth for every GA4 event Dokiments sends, mapping
 * each event name to the exact parameters it accepts.
 *
 * Constraints enforced by review rather than by types:
 * - names are snake_case, <= 40 chars, and never use a reserved prefix
 *   (`google_`, `ga_`, `firebase_`);
 * - <= 25 params per event, param names <= 40 chars;
 * - string values are truncated to 100 chars by `trackEvent`.
 *
 * `login` and `sign_up` are GA4 *recommended* events, deliberately named to
 * match Google's spec so they populate built-in reports instead of requiring
 * custom dimensions.
 */

/** Shape for events that carry no parameters. GA4 still requires an object. */
export type EmptyAnalyticsParams = Record<string, never>;

export type AnalyticsEventMap = {
  client_created: {
    has_address: boolean;
  };
  client_deleted: EmptyAnalyticsParams;
  client_updated: {
    fields_updated: string;
  };
  cta_click: {
    placement: string;
  };
  document_client_prefilled: {
    document_type: string;
  };
  document_created: {
    document_id: string;
    document_type: string;
    template_id: string;
  };
  document_deleted: {
    document_id: string;
    template_id: string;
  };
  document_updated: {
    document_id: string;
    name_changed: boolean;
    values_changed: boolean;
  };
  login: {
    method: "email";
  };
  password_reset_requested: EmptyAnalyticsParams;
  password_updated: EmptyAnalyticsParams;
  pdf_export_download: {
    template_id: string;
  };
  pdf_export_error: {
    error_message: string;
    failure_stage: "generate" | "missing_element";
    template_id: string;
  };
  pdf_export_open: {
    document_id: string;
    template_id: string;
  };
  pdf_export_retry: {
    retry_count: number;
    template_id: string;
  };
  pdf_export_success: {
    file_size_bytes: number;
    template_id: string;
  };
  profile_updated: {
    fields_updated: string;
  };
  /**
   * A promo code was successfully applied to an account.
   *
   * `surface` is only `"auth"` or `"settings"` because those are the two places
   * that can *observe* the outcome client-side. A redemption that rode along with
   * authentication is reported by the post-sign-in banner, which cannot know
   * whether the user arrived via the password form or the Google redirect — and
   * doesn't need to, since GA4 already receives `login`/`sign_up` separately and
   * those carry the method.
   */
  promo_code_applied: {
    promo_id: string;
    surface: "auth" | "settings";
  };
  /**
   * A promo code was refused. Deliberately carries no `promo_id`: an unrecognised
   * code belongs to no campaign, so there would be nothing truthful to report.
   */
  promo_code_failed: {
    reason: "already_redeemed" | "invalid";
    surface: "auth" | "settings";
  };
  sign_up: {
    method: "email";
  };
  template_removed: {
    document_type: string;
    style_id: string;
    template_id: string;
    tier: string;
  };
  template_saved: {
    document_type: string;
    style_id: string;
    template_id: string;
    tier: string;
  };
  upgrade_dialog_opened: {
    reason: "saved_template_limit" | "tier_locked";
  };
};

/** Union of every valid event name. */
export type AnalyticsEventName = keyof AnalyticsEventMap;

/**
 * A serializable tracking instruction. Exists so Server Components can
 * declare analytics as plain data on `Button`/`LinkButton` — a Server
 * Component cannot pass a function across the client boundary, but it can
 * pass this.
 */
export type AnalyticsTrigger<
  TName extends AnalyticsEventName = AnalyticsEventName,
> = {
  event: TName;
  params: AnalyticsEventMap[TName];
};

/**
 * Serializes a trigger into the `data-analytics-*` attributes that
 * `AnalyticsProvider`'s delegated click listener reads back. Used by
 * `Button`/`LinkButton` so they can accept analytics as a plain prop without
 * needing `"use client"` themselves.
 */
export const toAnalyticsAttributes = (trigger?: AnalyticsTrigger) =>
  trigger
    ? {
        "data-analytics-event": trigger.event,
        "data-analytics-params": JSON.stringify(trigger.params),
      }
    : {};
