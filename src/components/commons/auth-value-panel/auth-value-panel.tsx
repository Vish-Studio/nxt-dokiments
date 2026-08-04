import {
  FileText,
  FolderSimpleStar,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";

import { LinkButton } from "@/components/commons/link-button/link-button";

const authHighlights = [
  {
    description: "Browse invoices, contracts, quotations, and proposals by style and plan tier.",
    icon: Storefront,
    title: "Marketplace templates",
  },
  {
    description: "Save the layouts your business uses often, then keep them ready in your workspace.",
    icon: FolderSimpleStar,
    title: "Reusable library",
  },
  {
    description: "Fill structured fields and preview polished documents before exporting.",
    icon: FileText,
    title: "Guided document flow",
  },
];

export interface AuthValuePanelProps {
  eyebrow?: string;
}

export const AuthValuePanel = ({
  eyebrow = "Dokiments workspace",
}: AuthValuePanelProps) => {
  return (
    <section className="auth-value-panel flex min-h-full flex-col">
      <div className="my-auto py-8">
        <p className="font-title text-sm font-bold uppercase tracking-wide text-golden-harvest">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-2xl font-title text-4xl font-bold leading-tight text-white sm:text-5xl">
          Sign in to turn templates into finished business documents.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-white/68 sm:text-lg sm:leading-8">
          Dokiments connects discovery, saved templates, document creation, and plan access in one focused workspace.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <LinkButton href="/sign-up" size="lg" variant="accent">
            Create free account
          </LinkButton>
          <LinkButton href="/#marketplace" size="lg" variant="outlineDark">
            Browse marketplace
          </LinkButton>
        </div>

        <div className="mt-8 grid gap-3">
          {authHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                className="grid gap-4 rounded-box border border-white/12 bg-white/6 p-5 sm:grid-cols-[2.75rem_1fr]"
                key={item.title}
              >
                <span className="flex size-11 items-center justify-center rounded-box bg-golden-harvest text-nox-noir">
                  <Icon aria-hidden size={22} weight="bold" />
                </span>
                <span>
                  <span className="block font-title text-lg font-bold text-white">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-white/62">
                    {item.description}
                  </span>
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
