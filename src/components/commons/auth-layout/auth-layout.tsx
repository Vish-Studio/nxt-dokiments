import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { AuthFooter } from "@/components/commons/auth-footer/auth-footer";
import { AuthShowcase } from "@/components/commons/auth-showcase/auth-showcase";

export type AuthLayoutProps = {
  children: ReactNode;
  description: string;
  footer?: ReactNode;
  title: string;
};

export const AuthLayout = ({ children, description, footer, title }: AuthLayoutProps) => {
  return (
    <div className="auth-layout min-h-dvh bg-base-100 text-nox-noir lg:grid lg:grid-cols-[1.15fr_1fr] xl:grid-cols-2">
      <aside className="hidden p-3 lg:sticky lg:top-0 lg:block lg:h-dvh">
        <AuthShowcase />
      </aside>

      <main className="flex min-h-dvh flex-col p-3 lg:px-8 lg:py-8">
        <div className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-md lg:justify-center lg:py-8">
          {/* Below `lg` the showcase is hidden, so the intro takes its place as a
              golden panel with the same gutter and radius; on desktop it is plain. */}
          <header className="rounded-box bg-golden-harvest px-6 pt-10 pb-8 text-center lg:rounded-none lg:bg-transparent lg:p-0">
            <Link
              aria-label="Dokiments home"
              className="mx-auto block size-14 rounded-field focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-nox-noir"
              href="/"
            >
              <Image
                alt=""
                className="size-14"
                height={56}
                preload
                src="/images/svg/icon-black.svg"
                width={56}
              />
            </Link>

            <h1 className="mt-6 font-title text-4xl font-bold tracking-tight lg:mt-8">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-nox-noir/70 lg:text-nox-noir/60">
              {description}
            </p>
          </header>

          <div className="mx-auto w-full max-w-md px-2 pt-8 sm:px-0 lg:pt-10">
            {children}
            {footer ? <div className="mt-8 text-center text-sm">{footer}</div> : null}
          </div>
        </div>

        {/* `mt-auto`: pinned to the bottom of the column, on mobile too. */}
        <AuthFooter className="mt-auto pt-10 pb-2" />
      </main>
    </div>
  );
};
