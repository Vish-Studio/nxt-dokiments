import { unsealData } from "iron-session";
import { NextResponse } from "next/server";
import type { NextProxy } from "next/server";

import { sessionOptions, type SessionData } from "@/lib/session";

/** Route prefixes that require an authenticated session. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/documents",
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
 * - Auth-only route + valid session → redirect to `/dashboard`.
 * - All other routes → pass through unchanged.
 * - Dev auth bypass enabled → always pass through.
 *
 * This is an optimistic check only. Individual Route Handlers and Server
 * Components must perform their own session validation for data access.
 */
export const proxy: NextProxy = async (request) => {
  if (process.env.DEV_AUTH_BYPASS === "true" && process.env.NODE_ENV === "development") {
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
      });
    } catch {
      // Tampered or expired seal — treat as unauthenticated
    }
  }

  if (isProtected && !session?.user) {
    const next = encodeURIComponent(pathname + search);
    return NextResponse.redirect(new URL(`/sign-in?next=${next}`, request.url));
  }

  if (isAuthOnly && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
