import {
  ArrowUpRightIcon,
  InstagramLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

import { InstallAppButton } from "@/components/commons/install-app-button/install-app-button";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { NewsletterForm } from "@/components/commons/newsletter-form/newsletter-form";
import { CookieSettingsButton } from "@/components/website/cookie-settings-button/cookie-settings-button";

const productLinks = [
  { href: "/#overview", label: "Overview" },
  { href: "/#marketplace", label: "Marketplace" },
  { href: "/#workflow", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
];

const accountLinks = [
  { href: "/sign-up", label: "Create account" },
  { href: "/sign-in", label: "Sign in" },
  { href: "/dashboard", label: "Dashboard" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/terms", label: "Terms of Use" },
];

const socials = [
  {
    href: "https://www.linkedin.com/company/vish-studio",
    icon: LinkedinLogoIcon,
    label: "LinkedIn",
  },
  {
    href: "https://www.instagram.com/vish.studio",
    icon: InstagramLogoIcon,
    label: "Instagram",
  },
  { href: "https://x.com/vishstudio", icon: XLogoIcon, label: "X" },
];

export const Footer = () => {
  return (
    <footer className="footer overflow-hidden bg-nox-noir text-white">
      <div className="relative isolate w-full overflow-hidden">
        <Image
          alt=""
          className="-z-20 hidden object-cover object-right sm:block"
          fill
          sizes="100vw"
          src="https://images.unsplash.com/photo-1752137666154-34d38ba92dd7?auto=format&fit=crop&fm=webp&q=82&w=2600"
          unoptimized
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-nox-noir/58"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-r from-nox-noir from-35% via-nox-noir/92 via-58% to-nox-noir/62"
        />

        <div className="mx-auto w-full max-w-8xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div className="website-reveal">
              <Link
                aria-label="Dokiments home"
                href="/"
              >
                <span
                  aria-hidden
                  className="footer-logo block h-7 w-44"
                />
              </Link>
              <h2 className="mt-8 max-w-xl font-title text-3xl font-bold leading-tight text-white sm:text-4xl">
                Better documents start with a better workspace.
              </h2>
              <p className="max-w-lg text-base leading-7 text-white/62">
                Discover business-ready templates, save the ones that fit, and
                turn them into polished documents from one focused workspace.
              </p>
              <LinkButton
                className="mt-7"
                href="/sign-up"
                icon={
                  <ArrowUpRightIcon
                    aria-hidden
                    size={17}
                    weight="bold"
                  />
                }
                iconMotion="up-right"
                variant="accent"
              >
                Start creating
              </LinkButton>
            </div>

            <div className="website-reveal border border-white/15 bg-black/20 p-6 sm:p-8 lg:self-start">
              <p className="font-title text-sm font-bold uppercase tracking-wide text-golden-harvest">
                Dokiments dispatch
              </p>
              <h3 className="font-title text-lg font-bold text-white">
                Stay in the loop
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/62">
                A considered monthly note on templates, workflows, and business
                document craft.
              </p>
              <NewsletterForm
                appearance="dark"
                className="mt-6"
              />
            </div>
          </div>

          <div className="website-reveal mt-14 grid gap-10 border-t border-white/15 pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <nav aria-label="Product links">
              <h3 className="font-title text-sm font-bold text-golden-harvest">
                Product
              </h3>
              <div className="mt-5 grid gap-3">
                {productLinks.map((item) => (
                  <Link
                    className="text-sm text-white/62 transition-colors hover:text-white"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <nav aria-label="Account links">
              <h3 className="font-title text-sm font-bold text-golden-harvest">
                Account
              </h3>
              <div className="mt-5 grid gap-3">
                {accountLinks.map((item) => (
                  <Link
                    className="text-sm text-white/62 transition-colors hover:text-white"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <nav aria-label="Legal links">
              <h3 className="font-title text-sm font-bold text-golden-harvest">
                Legal
              </h3>
              <div className="mt-5 grid justify-items-start gap-3">
                {legalLinks.map((item) => (
                  <Link
                    className="text-sm text-white/62 transition-colors hover:text-white"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
                <CookieSettingsButton className="h-auto! min-h-0! justify-start px-0! py-0! text-sm font-normal! text-white/62 hover:bg-transparent hover:text-white" />
              </div>
            </nav>

            <div>
              <h3 className="font-title text-sm font-bold text-golden-harvest">
                Follow along
              </h3>
              <div className="mt-5 flex items-center gap-2">
                {socials.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      aria-label={social.label}
                      className="flex size-10 items-center justify-center rounded-full border border-white/14 text-white/70 transition-colors hover:border-golden-harvest hover:bg-golden-harvest hover:text-nox-noir"
                      href={social.href}
                      key={social.label}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon
                        aria-hidden
                        size={18}
                        weight="bold"
                      />
                    </a>
                  );
                })}
              </div>

              {/*
                No heading or caption alongside it on purpose: the button removes
                itself entirely on a browser that cannot install, or one where
                Dokiments already is, and anything the footer rendered around it
                would be left stranded.
              */}
              <InstallAppButton
                className="mt-6 border border-white/25 text-white hover:bg-white/10 hover:text-white"
                surface="footer"
                variant="ghost"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-white/12 bg-black/35">
        <div className="mx-auto flex w-full max-w-8xl flex-col gap-3 px-5 py-5 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>© {new Date().getFullYear()} Dokiments. All rights reserved.</p>
          <p>
            Designed and built by{" "}
            <a
              className="font-semibold text-golden-harvest hover:underline"
              href="https://www.vish.studio"
              rel="noreferrer"
              target="_blank"
            >
              VISH studio
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
