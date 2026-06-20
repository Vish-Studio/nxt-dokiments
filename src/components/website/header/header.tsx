"use client";

import { List } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { MobileNav } from "@/components/website/mobile-nav/mobile-nav";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  { href: "#overview", label: "Overview" },
  { href: "#marketplace", label: "Marketplace" },
  { href: "#workflow", label: "Workflow" },
  { href: "#pricing", label: "Pricing" },
];

export const Header = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.status === "authenticated");

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-nox-noir text-white">
        <div className="mx-auto flex h-20 max-w-8xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
          <a className="flex items-center gap-3" href="#top" aria-label="Dokiments home">
            <span className="flex size-10 items-center justify-center rounded-full bg-golden-harvest font-logo text-sm font-black text-nox-noir transition-transform hover:scale-105">
              D
            </span>
            <span className="font-logo text-lg font-black text-white">
              Dokiments
            </span>
          </a>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Website navigation">
            {navItems.map((item) => (
              <a
                className="font-title text-sm font-semibold text-white/70 transition-colors hover:text-golden-harvest"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                className="hidden rounded-box bg-golden-harvest px-4 py-2 font-title text-sm font-bold text-nox-noir transition hover:brightness-95 sm:inline-flex"
                href="/dashboard"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  className="hidden rounded-box px-4 py-2 font-title text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
                  href="/sign-in"
                >
                  Sign in
                </Link>
                <Link
                  className="hidden rounded-box bg-golden-harvest px-4 py-2 font-title text-sm font-bold text-nox-noir transition hover:brightness-95 sm:inline-flex"
                  href="/sign-up"
                >
                  Sign up
                </Link>
              </>
            )}
            <button
              aria-label="Open navigation"
              className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/16 md:hidden"
              onClick={() => setIsMobileNavOpen(true)}
              type="button"
            >
              <List aria-hidden size={20} weight="bold" />
            </button>
          </div>
        </div>
      </header>
      <MobileNav
        isAuthenticated={isAuthenticated}
        isOpen={isMobileNavOpen}
        items={navItems}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </>
  );
};
