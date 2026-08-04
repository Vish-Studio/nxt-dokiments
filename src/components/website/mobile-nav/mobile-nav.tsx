import { XIcon } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { LinkButton } from "@/components/commons/link-button/link-button";

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
  const isVisible = forceVisible || isOpen;

  return (
    <div
      aria-hidden={!isOpen}
      className={[
        "fixed inset-0 z-50 text-white transition",
        forceVisible ? "" : "md:hidden",
        isVisible ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      data-testid="mobile-nav"
    >
      <button
        aria-label="Close navigation"
        className={[
          "absolute inset-0 bg-nox-noir/62 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
        type="button"
      />

      <aside
        className={[
          "relative flex h-full w-[min(88vw,24rem)] flex-col bg-nox-noir px-5 py-5 shadow-soft transition-transform duration-500 ease-out",
          isVisible ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-start gap-3">
          <button
            aria-label="Close navigation"
            className="flex size-10 items-center justify-center rounded-full  text-white transition-colors hover:bg-white/16"
            onClick={onClose}
            type="button"
          >
            <XIcon
              aria-hidden
              size={22}
              weight="bold"
            />
          </button>

          <Link
            aria-label="Dokiments home"
            className="flex items-center gap-3"
            href="/"
            onClick={onClose}
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
          className="mt-8 grid gap-2"
          aria-label="Mobile website navigation"
        >
          {items.map((item, index) => (
            <a
              className="group flex items-center justify-between border-b border-white/12 py-3 font-title text-2xl font-bold text-white transition-colors hover:text-golden-harvest"
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

        <div className="mt-5 grid gap-3">
          {isAuthenticated ? (
            <LinkButton
              className="w-full"
              href="/dashboard"
              icon={null}
              onClick={onClose}
              size="lg"
              variant="accent"
            >
              Go to dashboard
            </LinkButton>
          ) : (
            <>
              <LinkButton
                className="w-full"
                href="/sign-in"
                icon={null}
                onClick={onClose}
                size="lg"
                variant="accent"
              >
                Sign in
              </LinkButton>
              <LinkButton
                className="w-full"
                href="/sign-up"
                icon={null}
                onClick={onClose}
                size="lg"
                variant="outlineDark"
              >
                Sign up
              </LinkButton>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};
