import { cn } from "@/lib/utils";
import type { MarketplaceTemplate, TemplateStyleId } from "@/types/template";

export type TemplateDocumentProps = {
  className?: string;
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
  classic: {
    body: "p-8 pt-6",
    eyebrow: "font-title text-xs font-bold uppercase tracking-widest text-bloodwood-deep",
    header: "border-b-2 border-bloodwood-deep px-8 pb-4 pt-8",
    label: "font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45",
    paper: "rounded-box border border-steel-mist",
    sectionTitle: "font-title text-sm font-bold text-bloodwood-deep",
    title: "mt-1 font-title text-2xl font-bold text-nox-noir",
  },
  modern: {
    body: "p-6",
    eyebrow: "font-title text-xs font-bold uppercase tracking-widest text-golden-harvest",
    header: "bg-bloodwood-deep px-6 py-6 text-white",
    label: "font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45",
    paper: "overflow-hidden rounded-box border border-steel-mist",
    sectionTitle: "font-title text-sm font-bold text-bloodwood-deep",
    title: "mt-1 font-title text-2xl font-bold text-white",
  },
  minimal: {
    body: "px-10 pb-10 pt-4",
    eyebrow: "font-title text-[11px] font-semibold uppercase tracking-[0.3em] text-nox-noir/40",
    header: "px-10 pb-6 pt-10",
    label: "font-title text-[11px] font-medium uppercase tracking-wider text-nox-noir/40",
    paper: "rounded-box border border-steel-mist",
    sectionTitle: "font-title text-sm font-semibold text-nox-noir",
    title: "mt-2 font-title text-3xl font-bold text-nox-noir",
  },
};

export const TemplateDocument = ({ className, template, values = {} }: TemplateDocumentProps) => {
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
      <header className={config.header}>
        <p className={config.eyebrow}>{template.name}</p>
        <h2 className={config.title}>{title}</h2>
      </header>

      <div className={config.body}>
        <dl className="grid gap-4 sm:grid-cols-2">
          {metaFields.map((field) => {
            if (field.key === "title") {
              return null;
            }
            const { isEmpty, text } = valueFor(field.key, field.placeholder);

            return (
              <div className="grid gap-1" key={field.key}>
                <dt className={config.label}>{field.label}</dt>
                <dd className={cn("text-sm", isEmpty ? "italic text-nox-noir/35" : "font-medium")}>
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
              <h3 className={config.sectionTitle}>{field.label}</h3>
              <p
                className={cn(
                  "mt-2 whitespace-pre-line text-sm leading-6",
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
