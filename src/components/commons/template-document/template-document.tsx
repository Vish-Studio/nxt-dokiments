import { cn } from "@/lib/utils";
import type { MarketplaceTemplate, TemplateStyleId } from "@/types/template";

export type TemplateDocumentProps = {
  className?: string;
  density?: "default" | "compact";
  layout?: "print" | "responsive";
  template: MarketplaceTemplate;
  values?: Record<string, string>;
};

type StyleConfig = {
  body: string;
  eyebrow: string;
  header: string;
  label: string;
  paper: string;
  sectionTitle: string;
  title: string;
};

const styleConfig: Record<TemplateStyleId, StyleConfig> = {
  brutalist: {
    body: "p-6",
    eyebrow: "font-title text-xs font-black uppercase tracking-widest text-nox-noir",
    header: "border-b-2 border-nox-noir bg-play-pink px-6 py-6",
    label: "font-title text-[11px] font-black uppercase tracking-wide text-nox-noir",
    paper: "rounded-md border-2 border-nox-noir",
    sectionTitle: "font-title text-sm font-black uppercase text-nox-noir",
    title: "mt-1 font-title text-2xl font-black text-nox-noir",
  },
  classic: {
    body: "p-8 pt-6",
    eyebrow: "font-title text-xs font-bold uppercase tracking-widest text-nox-noir",
    header: "border-b-2 border-nox-noir px-8 pb-4 pt-8",
    label: "font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45",
    paper: "rounded-box border border-steel-mist",
    sectionTitle: "font-title text-sm font-bold text-nox-noir",
    title: "mt-1 font-title text-2xl font-bold text-nox-noir",
  },
  modern: {
    body: "p-6",
    eyebrow: "font-title text-xs font-bold uppercase tracking-widest text-golden-harvest",
    header: "bg-nox-noir px-6 py-6 text-white",
    label: "font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45",
    paper: "overflow-hidden rounded-box border border-steel-mist",
    sectionTitle: "font-title text-sm font-bold text-nox-noir",
    title: "mt-1 font-title text-2xl font-bold text-white",
  },
  minimalist: {
    body: "px-10 pb-10 pt-4",
    eyebrow: "font-title text-[11px] font-semibold uppercase tracking-[0.3em] text-nox-noir/40",
    header: "px-10 pb-6 pt-10",
    label: "font-title text-[11px] font-medium uppercase tracking-wider text-nox-noir/40",
    paper: "rounded-box border border-steel-mist",
    sectionTitle: "font-title text-sm font-semibold text-nox-noir",
    title: "mt-2 font-title text-3xl font-bold text-nox-noir",
  },
};

export const TemplateDocument = ({
  className,
  density = "default",
  layout = "responsive",
  template,
  values = {},
}: TemplateDocumentProps) => {
  const isCompact = density === "compact";
  const config = styleConfig[template.style.id];
  const title = values.title?.trim() || template.name;
  const metaFields = template.fields.filter((field) => field.type !== "textarea");
  const bodyFields = template.fields.filter((field) => field.type === "textarea");

  const valueFor = (key: string, fallback?: string) => ({
    isEmpty: !values[key]?.trim(),
    text: values[key]?.trim() || fallback || "—",
  });

  return (
    <article className={cn("flex flex-col bg-white text-nox-noir", config.paper, className)}>
      <header className={cn(config.header, isCompact && "px-5! py-4!")}>
        <p className={cn(config.eyebrow, isCompact && "text-[11px]!")}>{template.name}</p>
        <h2 className={cn(config.title, isCompact && "text-xl!")}>{title}</h2>
      </header>

      <div className={cn(config.body, isCompact && "p-5!")}>
        <dl className={cn("grid gap-4", layout === "print" ? "grid-cols-2" : "sm:grid-cols-2")}>
          {metaFields.map((field) => {
            if (field.key === "title") {
              return null;
            }
            const { isEmpty, text } = valueFor(field.key, field.placeholder);

            return (
              <div className="grid gap-1" key={field.key}>
                <dt className={cn(config.label, isCompact && "text-[11px]!")}>{field.label}</dt>
                <dd className={cn(isCompact ? "text-xs" : "text-sm", isEmpty ? "italic text-nox-noir/35" : "font-medium")}>
                  {text}
                </dd>
              </div>
            );
          })}
        </dl>

        {bodyFields.map((field) => {
          const { isEmpty, text } = valueFor(field.key, field.placeholder);

          return (
            <section className="mt-6" key={field.key}>
              <h3 className={cn(config.sectionTitle, isCompact && "text-xs")}>{field.label}</h3>
              <p
                className={cn(
                  "mt-2 whitespace-pre-line",
                  isCompact ? "text-xs leading-5" : "text-sm leading-6",
                  isEmpty ? "italic text-nox-noir/35" : "text-nox-noir/80",
                )}
              >
                {text}
              </p>
            </section>
          );
        })}
      </div>
    </article>
  );
};
