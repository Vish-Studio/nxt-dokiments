import type { ReactNode } from "react";

import { AuthMobileIntro } from "@/components/commons/auth-mobile-intro/auth-mobile-intro";
import { AuthValuePanel } from "@/components/commons/auth-value-panel/auth-value-panel";
import { Footer } from "@/components/website/footer/footer";
import { Header } from "@/components/website/header/header";

export type AuthLayoutProps = {
  children: ReactNode;
  description: string;
  footer?: ReactNode;
  title: string;
};

export const AuthLayout = ({ children, description, footer, title }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-nox-noir text-white">
      <Header showAuthActions={false} />
      <main className="grid min-h-dvh bg-nox-noir px-5 pb-8 pt-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10">
        <section className="hidden lg:block">
          <AuthValuePanel />
        </section>

        <section className="grid min-h-[calc(100dvh-8rem)] content-center justify-items-center gap-8 py-4 lg:flex lg:min-h-0 lg:items-center lg:justify-center lg:py-0">
          <div className="mx-auto w-full max-w-xl rounded-box border border-steel-mist bg-white p-6 text-nox-noir shadow-soft sm:p-8">
            <div>
              <h2 className="font-title text-3xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-nox-noir/60">{description}</p>
            </div>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-7 border-t border-steel-mist pt-5">{footer}</div> : null}
          </div>
          <AuthMobileIntro />
        </section>
      </main>
      <Footer />
    </div>
  );
};
