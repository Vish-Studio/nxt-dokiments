import "server-only";

import { fetchUpstream } from "@/lib/http/fetch-upstream";

/** Google OAuth 2.0 credentials for the "Sign in with Google" server-side redirect flow. */
export type GoogleOAuthConfig = {
  /** Google Cloud OAuth 2.0 Web client ID. */
  clientId: string;
  /** Google Cloud OAuth 2.0 Web client secret — server-only, never sent to the browser. */
  clientSecret: string;
};

/** Resolved Google OAuth config from environment variables. */
export const serverGoogleConfig: GoogleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID ?? "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
};

/** Returns `true` when both required Google OAuth env vars are present. */
export const hasServerGoogleConfig = () =>
  Boolean(serverGoogleConfig.clientId && serverGoogleConfig.clientSecret);

/**
 * The redirect URI registered with the Google Cloud OAuth client and sent on
 * both the authorization request and the token exchange — Google requires
 * these to match exactly.
 */
export const googleRedirectUri = () =>
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`;

/**
 * Builds the Google OAuth 2.0 authorization URL that starts the consent flow.
 *
 * @param state - Opaque CSRF token; echoed back by Google on the callback and
 *   compared against the sealed `dokiments-oauth-state` cookie.
 */
export const buildGoogleAuthorizationUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: serverGoogleConfig.clientId,
    prompt: "select_account",
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Exchanges an authorization `code` for a Google-issued `id_token` via
 * Google's OAuth 2.0 token endpoint.
 *
 * @param code - Authorization code from the `?code=` query param on the callback request.
 * @throws When Google rejects the code (expired, already used, or a redirect URI mismatch).
 */
export const exchangeGoogleCode = async (code: string): Promise<{ idToken: string }> => {
  const response = await fetchUpstream("https://oauth2.googleapis.com/token", {
    body: new URLSearchParams({
      client_id: serverGoogleConfig.clientId,
      client_secret: serverGoogleConfig.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: googleRedirectUri(),
    }),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Google rejected the sign-in request.");
  }

  const data = (await response.json()) as { id_token?: string };

  if (!data.id_token) {
    throw new Error("Google did not return an identity token.");
  }

  return { idToken: data.id_token };
};
