import {
  ArrowUpRightIcon,
  InstagramLogo,
  LinkedinLogo,
  XLogo,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";

import { LinkButton } from "@/components/commons/link-button/link-button";
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
  { href: "https://www.linkedin.com/company/vish-studio", icon: LinkedinLogo, label: "LinkedIn" },
  { href: "https://www.instagram.com/vish.studio", icon: InstagramLogo, label: "Instagram" },
  { href: "https://x.com/vishstudio", icon: XLogo, label: "X" },
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
        <div aria-hidden className="absolute inset-0 -z-10 bg-nox-noir/58" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-r from-nox-noir from-35% via-nox-noir/92 via-58% to-nox-noir/62"
        />

        <div className="mx-auto w-full max-w-8xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_2fr] lg:gap-20">
            <div className="website-reveal">
              <Link aria-label="Dokiments home" href="/">
                <Image
                  src={'/images/svg/logo-white.svg'}
                  width={225}
                  height={225}
                  alt="Dokiments logo" />
              </Link>
              <h2 className="mt-8 max-w-xl font-title text-3xl font-bold leading-tight text-golden-harvest sm:text-2xl">
                Better documents start with a better workspace.
              </h2>
              <p className="max-w-lg text-base leading-7 text-white/62">
                Discover business-ready templates, save the ones that fit, and turn them into polished
                documents from one focused workspace.
              </p>
              <LinkButton
                className="mt-7"
                href="/sign-up"
                icon={<ArrowUpRightIcon aria-hidden size={17} weight="bold" />}
                variant="accent"
              >
                Start creating
              </LinkButton>
            </div>

            <div className="website-reveal grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
              <nav aria-label="Product links">
                <h3 className="font-title text-sm font-bold text-golden-harvest">Product</h3>
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
                <h3 className="font-title text-sm font-bold text-golden-harvest">Account</h3>
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

              <nav aria-label="Legal links" className="col-span-2 sm:col-span-1">
                <h3 className="font-title text-sm font-bold text-golden-harvest">Legal</h3>
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
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-white/12 bg-black/35">
        <div className="mx-auto grid w-full max-w-8xl gap-5 px-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-8 lg:px-10">
          <div className="flex items-center gap-2">
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
                  <Icon aria-hidden size={18} weight="bold" />
                </a>
              );
            })}
          </div>

          <p className="text-sm text-white/45 sm:justify-self-center">
            © {new Date().getFullYear()} Dokiments. All rights reserved.
          </p>
          <p className="text-sm text-white/45 sm:justify-self-end">
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
