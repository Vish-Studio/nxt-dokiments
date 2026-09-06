import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Landing point for the OS "Share to Dokiments" action (see `share_target`
 * in `src/app/manifest.ts`). Text and URL shares only — no file handling,
 * since the app has no upload/import pipeline to hand a file to.
 *
 * Combines whatever was shared into one string and forwards it to the
 * existing `?new=1` deep-link (already handled in `documents-view.tsx`),
 * which opens the template picker; the shared text is then offered as a
 * prefill once a template is chosen.
 */
export const GET = (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const text = searchParams.get("text")?.trim();
  const url = searchParams.get("url")?.trim();

  const shared = [text, url].filter(Boolean).join("\n\n");

  const destination = new URL("/my-documents", request.nextUrl.origin);
  destination.searchParams.set("new", "1");
  if (shared) {
    // Read back by documents-view.tsx to prefill the template once one is picked.
    destination.searchParams.set("shared", shared);
  }

  return NextResponse.redirect(destination);
};
