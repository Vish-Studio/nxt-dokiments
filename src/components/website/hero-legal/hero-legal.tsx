import Link from "next/link";

import { cn } from "@/lib/utils";

export interface HeroLegalProps {
  className?: string;
}

export const HeroLegal = ({ className }: HeroLegalProps) => {
  return (
    <div
      className={cn(
        "hero-legal flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-nox-noir/64 lg:justify-start",
        className,
      )}
    >
      <p>© {new Date().getFullYear()} Dokiments. All rights reserved.</p>
      <nav aria-label="Hero legal links" className="flex items-center gap-5">
        <Link className="underline underline-offset-4 hover:text-nox-noir" href="/privacy">
          Privacy Policy
        </Link>
        <Link className="underline underline-offset-4 hover:text-nox-noir" href="/terms">
          Terms of Use
        </Link>
      </nav>
    </div>
  );
};
