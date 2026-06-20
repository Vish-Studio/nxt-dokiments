import Link from "next/link";
import type { ReactNode } from "react";

export type AuthLayoutProps = {
  children: ReactNode;
  description: string;
  footer?: ReactNode;
  title: string;
};

export const AuthLayout = ({ children, description, footer, title }: AuthLayoutProps) => {
  return (
    <main className="grid min-h-dvh bg-nox-noir px-5 py-8 text-white sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <section className="flex min-h-full flex-col">
        <Link aria-label="Dokiments home" className="flex items-center gap-3" href="/">
          <span className="flex size-10 items-center justify-center rounded-full bg-golden-harvest font-logo text-sm font-black text-nox-noir">
            D
          </span>
          <span className="font-logo text-lg font-black">Dokiments</span>
        </Link>

        <div className="my-auto max-w-xl py-14">
          <h1 className="font-title text-4xl font-bold leading-tight sm:text-6xl">
            Documents that start with the right access.
          </h1>
          <p className="mt-6 text-base leading-7 text-white/64 sm:text-lg sm:leading-8">
            Sign in to manage templates, browse business documents, and keep your account role in sync with your plan.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-xl rounded-box border border-steel-mist bg-white p-6 text-nox-noir sm:p-8">
          <div>
            <h2 className="font-title text-3xl font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-nox-noir/60">{description}</p>
          </div>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-7 border-t border-steel-mist pt-5">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
};
