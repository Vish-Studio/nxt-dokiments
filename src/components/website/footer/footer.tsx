import {
  InstagramLogo,
  LinkedinLogo,
  XLogo,
} from "@phosphor-icons/react/dist/ssr";

const socials = [
  { href: "https://www.linkedin.com/company/vish-studio", icon: LinkedinLogo, label: "LinkedIn" },
  { href: "https://www.instagram.com/vish.studio", icon: InstagramLogo, label: "Instagram" },
  { href: "https://x.com/vishstudio", icon: XLogo, label: "X" },
];

export const Footer = () => {
  return (
    <footer className="bg-nox-noir text-white">
      <div className="px-5 py-18 sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.8fr]">
          <div className="website-reveal">
          <h2 className="max-w-2xl font-title text-4xl font-bold leading-tight text-golden-harvest">
            Build business paperwork from a better starting point.
          </h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              className="inline-flex justify-center rounded-box bg-golden-harvest px-5 py-3 font-title text-sm font-bold text-nox-noir transition hover:brightness-95"
              href="/sign-up"
            >
              Sign up
            </a>
            <a
              className="inline-flex justify-center rounded-box border border-white/20 px-5 py-3 font-title text-sm font-bold text-white"
              href="/sign-in"
            >
              Sign in
            </a>
          </div>
        </div>

          <div className="grid gap-8 sm:grid-cols-2 website-reveal">
            <div>
              <h3 className="font-title text-sm font-bold text-golden-harvest">
                Explore
              </h3>
              <nav className="mt-4 grid gap-3 text-sm text-white/64">
                <a className="transition-colors hover:text-white" href="#overview">
                  Overview
                </a>
                <a className="transition-colors hover:text-white" href="#marketplace">
                  Marketplace
                </a>
                <a className="transition-colors hover:text-white" href="#pricing">
                  Pricing
                </a>
              </nav>
            </div>
            <div>
              <h3 className="font-title text-sm font-bold text-golden-harvest">
                Social
              </h3>
              <div className="mt-4 flex gap-3">
                {socials.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      aria-label={social.label}
                      className="flex size-11 items-center justify-center rounded-full bg-white/8 text-white transition-colors hover:bg-golden-harvest hover:text-nox-noir"
                      href={social.href}
                      key={social.label}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <Icon aria-hidden size={19} weight="bold" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-black px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-white/48 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Dokiments. All rights reserved.</p>
          <p>
            A product of{" "}
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
