import { X } from "@phosphor-icons/react";
import Link from "next/link";

export type MobileNavItem = {
  href: string;
  label: string;
};

export type MobileNavProps = {
  forceVisible?: boolean;
  isAuthenticated?: boolean;
  isOpen?: boolean;
  items: MobileNavItem[];
  onClose?: () => void;
};

export const MobileNav = ({
  forceVisible = false,
  isAuthenticated = false,
  isOpen = false,
  items,
  onClose,
}: MobileNavProps) => {
  return (
    <div
      aria-hidden={!isOpen}
      className={[
        "fixed inset-0 z-50 bg-nox-noir text-white transition-transform duration-500 ease-out",
        forceVisible ? "" : "md:hidden",
        isOpen ? "translate-x-0" : "translate-x-full",
      ].join(" ")}
      data-testid="mobile-nav"
    >
      <div className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center justify-between">
          <a
            aria-label="Dokiments home"
            className="flex items-center gap-3"
            href="#top"
            onClick={onClose}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-golden-harvest font-logo text-sm font-black text-nox-noir">
              D
            </span>
            <span className="font-logo text-xl font-black text-golden-harvest">
              Dokiments
            </span>
          </a>
          <button
            aria-label="Close navigation"
            className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/16"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden size={20} weight="bold" />
          </button>
        </div>

        <nav className="mt-16 grid gap-4" aria-label="Mobile website navigation">
          {items.map((item, index) => (
            <a
              className="group flex items-center justify-between border-b border-white/12 py-5 font-title text-4xl font-bold text-white transition-colors hover:text-golden-harvest"
              href={item.href}
              key={item.href}
              onClick={onClose}
            >
              <span>{item.label}</span>
              <span className="text-sm text-white/45 transition-colors group-hover:text-golden-harvest">
                0{index + 1}
              </span>
            </a>
          ))}
        </nav>

        <div className="mt-auto grid gap-3">
          {isAuthenticated ? (
            <Link
              className="inline-flex justify-center rounded-box bg-golden-harvest px-5 py-4 font-title text-sm font-bold text-nox-noir"
              href="/dashboard"
              onClick={onClose}
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                className="inline-flex justify-center rounded-box bg-golden-harvest px-5 py-4 font-title text-sm font-bold text-nox-noir"
                href="/sign-up"
                onClick={onClose}
              >
                Sign up
              </Link>
              <Link
                className="inline-flex justify-center rounded-box border border-white/18 px-5 py-4 font-title text-sm font-bold text-white"
                href="/sign-in"
                onClick={onClose}
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
