import { unsealData } from "iron-session";
import type { NextProxy } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_EXPIRY_COOKIE } from "@/lib/auth/session-expiry";
import {
  isSessionExpired,
  SESSION_MAX_AGE_SECONDS,
  sessionOptions,
  type SessionData,
} from "@/lib/session";

/** Route prefixes that require an authenticated session. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/my-documents",
  "/my-clients",
  "/my-templates",
  "/marketplace",
  "/settings",
  "/subscription",
];

/** Route prefixes that should redirect authenticated users away to the dashboard. */
const AUTH_ONLY_PREFIXES = ["/sign-in", "/sign-up", "/forgot-password"];

/**
 * Server-side route protection layer (Next.js 16 `proxy.ts`).
 *
 * Runs before any route renders. Decrypts the iron-session cookie using
 * `unsealData` — a read-only operation that does not touch the response — to
 * determine auth state without hitting Firebase or any database.
 *
 * Behaviour:
 * - Protected route + no valid session → redirect to `/sign-in?next=<path>`.
 * - Protected route + session past its 1-day deadline → same redirect, plus
 *   `expired=1` so the sign-in page can explain what happened, and both session
 *   cookies are cleared on the way out.
 * - Auth-only route + valid session → redirect to `/dashboard`.
 * - All other routes → pass through unchanged.
 * - Dev auth bypass enabled → always pass through.
 *
 * This is an optimistic check only. Individual Route Handlers and Server
 * Components must perform their own session validation for data access.
 */
export const proxy: NextProxy = async (request) => {
  if (
    process.env.DEV_AUTH_BYPASS === "true" &&
    process.env.NODE_ENV === "development"
  ) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isProtected && !isAuthOnly) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(sessionOptions.cookieName)?.value;
  let session: SessionData | null = null;

  if (cookieValue) {
    try {
      session = await unsealData<SessionData>(cookieValue, {
        password: sessionOptions.password as string,
        ttl: SESSION_MAX_AGE_SECONDS,
      });
    } catch {
      // Tampered or expired seal — treat as unauthenticated
    }
  }

  // A session past its 1-day deadline is not "signed in" as far as routing goes,
  // even though the cookie still decrypts and still carries a user.
  const hasExpired = Boolean(session?.user) && isSessionExpired(session);
  const isAuthenticated = Boolean(session?.user) && !hasExpired;

  if (isProtected && !isAuthenticated) {
    const next = encodeURIComponent(pathname + search);
    const query = hasExpired ? `expired=1&next=${next}` : `next=${next}`;
    const response = NextResponse.redirect(
      new URL(`/sign-in?${query}`, request.url),
    );

    if (hasExpired) {
      response.cookies.delete({ name: sessionOptions.cookieName, path: "/" });
      response.cookies.delete({ name: SESSION_EXPIRY_COOKIE, path: "/" });
    }

    return response;
  }

  if (isAuthOnly && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
