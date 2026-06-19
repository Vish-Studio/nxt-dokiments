"use client";

import { List } from "@phosphor-icons/react";
import { useState } from "react";

import { MobileNav } from "@/components/website/mobile-nav/mobile-nav";

const navItems = [
  { href: "#overview", label: "Overview" },
  { href: "#marketplace", label: "Marketplace" },
  { href: "#workflow", label: "Workflow" },
  { href: "#pricing", label: "Pricing" },
];

export const Header = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-nox-noir/72 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
          <a className="flex items-center gap-3" href="#top" aria-label="Dokiments home">
            <span className="flex size-10 items-center justify-center rounded-full bg-golden-harvest font-title text-sm font-bold text-nox-noir transition-transform hover:scale-105">
              D
            </span>
            <span className="font-title text-lg font-bold text-white">
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
            <a
              className="hidden rounded-box px-4 py-2 font-title text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
              href="/sign-in"
            >
              Sign in
            </a>
            <a
              className="hidden rounded-box bg-golden-harvest px-4 py-2 font-title text-sm font-bold text-nox-noir shadow-soft transition-transform hover:-translate-y-0.5 sm:inline-flex"
              href="/sign-up"
            >
              Sign up
            </a>
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
        isOpen={isMobileNavOpen}
        items={navItems}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </>
  );
};
