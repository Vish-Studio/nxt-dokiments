import { LinkButton } from "@/components/commons/link-button/link-button";

export interface AuthMobileIntroProps {
  title?: string;
}

export const AuthMobileIntro = ({
  title = "Templates, saved libraries, and polished documents in one workspace.",
}: AuthMobileIntroProps) => {
  return (
    <section className="auth-mobile-intro lg:hidden">
      <div>
        <p className="font-title text-sm font-bold uppercase tracking-wide text-golden-harvest">
          Dokiments workspace
        </p>
        <h1 className="mt-3 font-title text-2xl font-bold leading-tight text-white sm:text-3xl">
          {title}
        </h1>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <LinkButton href="/sign-in" icon={null} size="sm" variant="accent">
            Sign in
          </LinkButton>
          <LinkButton href="/#marketplace" icon={null} size="sm" variant="outlineDark">
            Marketplace
          </LinkButton>
        </div>
      </div>
    </section>
  );
};
