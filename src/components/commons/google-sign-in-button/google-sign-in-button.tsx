import { cn } from "@/lib/utils";

export type GoogleSignInButtonProps = {
  className?: string;
  /** Label shown next to the Google logo. */
  label?: string;
  /** Path to redirect to after a successful sign-in. Sanitised server-side by `/api/auth/google/start`. */
  next?: string;
};

/** Google's official multi-colour "G" mark, inlined since no brand-icon package is a dependency. */
const GoogleIcon = () => (
  <svg
    aria-hidden
    height="18"
    viewBox="0 0 18 18"
    width="18"
  >
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332A8.997 8.997 0 0 0 9 18Z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.706A5.41 5.41 0 0 1 3.68 9c0-.593.102-1.17.284-1.706V4.962H.96A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.96 4.038l3.004-2.332Z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.581-2.58C13.463.891 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.962l3.004 2.332C4.672 5.167 6.656 3.58 9 3.58Z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * "Continue with Google" link.
 *
 * Deliberately a plain `<a>`, not `next/link` — `/api/auth/google/start`
 * responds with a cross-origin redirect to `accounts.google.com`, and
 * Next's router follows same-origin hrefs via `fetch()` for client-side
 * navigation. `fetch()` enforces CORS on that redirect and fails outright
 * (Google's OAuth endpoint doesn't send CORS headers, nor should it — it's
 * meant to be landed on via a real top-level navigation, which isn't
 * subject to CORS at all). A plain anchor always does a full page load.
 */
export const GoogleSignInButton = ({
  className,
  label = "Continue with Google",
  next = "/dashboard",
}: GoogleSignInButtonProps) => {
  const href = `/api/auth/google/start?next=${encodeURIComponent(next)}`;

  return (
    <a
      className={cn(
        "link-button inline-flex min-h-11 items-center justify-center gap-2 rounded-box border border-steel-mist bg-transparent px-5 py-3 text-sm font-title font-bold text-nox-noir transition hover:bg-base-200",
        className,
      )}
      href={href}
    >
      <GoogleIcon />
      {label}
    </a>
  );
};
