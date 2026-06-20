import type { AuthSession } from "@/types/auth";

export const isDevAuthBypassEnabled =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

export const devAuthSession: AuthSession = {
  expiresAt: Number.MAX_SAFE_INTEGER,
  idToken: "dev-auth-bypass-token",
  refreshToken: "dev-auth-bypass-refresh-token",
  user: {
    displayName: "Dev User",
    email: "dev@dokiments.local",
    role: "special",
    uid: "dev-auth-bypass-user",
  },
};
