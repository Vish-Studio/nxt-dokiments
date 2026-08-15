"use client";

import { ListIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { LinkButton } from "@/components/commons/link-button/link-button";
import { MobileNav } from "@/components/website/mobile-nav/mobile-nav";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  { href: "/#overview", label: "Overview" },
  { href: "/#marketplace", label: "Marketplace" },
  { href: "/#use-cases", label: "Use cases" },
  { href: "/#workflow", label: "Workflow" },
  { href: "/#pricing", label: "Pricing" },
];

export interface HeaderProps {
  showAuthActions?: boolean;
}

export const Header = ({ showAuthActions = true }: HeaderProps) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isAuthenticated = useAuthStore(
    (state) => state.status === "authenticated",
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-nox-noir text-white">
        <div className="mx-auto flex h-20 max-w-8xl items-center justify-between gap-3 md:gap-6 px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              className="flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/16 lg:hidden"
              onClick={() => setIsMobileNavOpen(true)}
              type="button"
            >
              <ListIcon
                aria-hidden
                size={22}
                weight="bold"
              />
            </button>

            <Link
              className="flex items-center gap-3"
              href="/"
              aria-label="Dokiments home"
            >
              <Image
                src={"/images/svg/logo-white.svg"}
                width={150}
                height={150}
                alt="Dokiments logo"
              />
            </Link>
          </div>
          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Website navigation"
          >
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

          {showAuthActions ? (
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <LinkButton
                  className="hidden! sm:inline-flex!"
                  href="/dashboard"
                  icon={null}
                  size="sm"
                  variant="accent"
                >
                  Dashboard
                </LinkButton>
              ) : (
                <>
                  <LinkButton
                    analytics={{
                      event: "cta_click",
                      params: { placement: "header_mobile" },
                    }}
                    className="lg:hidden!"
                    href="/sign-in"
                    icon={null}
                    size="sm"
                    variant="accent"
                  >
                    Sign in
                  </LinkButton>
                  <LinkButton
                    analytics={{
                      event: "cta_click",
                      params: { placement: "header_desktop" },
                    }}
                    className="hidden! lg:inline-flex!"
                    href="/sign-in"
                    icon={null}
                    size="sm"
                    variant="accent"
                  >
                    Sign in
                  </LinkButton>
                  <LinkButton
                    analytics={{
                      event: "cta_click",
                      params: { placement: "header_desktop_sign_up" },
                    }}
                    className="!hidden lg:inline-flex!"
                    href="/sign-up"
                    icon={null}
                    size="sm"
                    variant="outlineDark"
                  >
                    Sign up
                  </LinkButton>
                </>
              )}
            </div>
          ) : null}
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
