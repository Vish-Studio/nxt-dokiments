import Link from "next/link";

import { cn } from "@/lib/utils";

export interface AuthFooterProps {
  className?: string;
}

/**
 * The legal footer along the bottom of the auth column, spanning its full width
 * inside the column's padding: Dokiments copyright and legal links on the left,
 * the studio credit on the right. Below `sm` the two stack, centred.
 */
export const AuthFooter = ({ className }: AuthFooterProps) => {
  return (
    <footer
      className={cn(
        "auth-footer flex w-full flex-col items-center gap-3 px-2 text-center text-xs text-nox-noir/64 sm:flex-row sm:items-end sm:justify-between sm:px-0 sm:text-left",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} Dokiments. All rights reserved.</p>
        <nav
          aria-label="Legal links"
          className="flex items-center justify-center gap-5 sm:justify-start"
        >
          <Link
            className="underline underline-offset-4 hover:text-nox-noir"
            href="/privacy"
          >
            Privacy Policy
          </Link>
          <Link
            className="underline underline-offset-4 hover:text-nox-noir"
            href="/terms"
          >
            Terms of Use
          </Link>
        </nav>
      </div>
      <p className="shrink-0 text-xs">
        Made by{" "}
        <a
          className="font-title font-bold text-nox-noir underline-offset-4 hover:underline"
          href="https://www.vish.studio"
          rel="noopener"
          target="_blank"
        >
          vish.studio
        </a>
      </p>
    </footer>
  );
};

export default AuthFooter;
