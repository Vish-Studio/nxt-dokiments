import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { MarketplaceTemplate, TemplateStyleId } from "@/types/template";
import { partyFieldKeys, TemplateParties } from "./template-parties";
import { CvDocument } from "@/components/commons/cv-document/cv-document";
import { DocumentItems } from "@/components/commons/document-items/document-items";
import { getTemplateDisplayName } from "@/lib/market-place/document-labels";
import { missingFieldClassName } from "./missing-field-class-name";

export type TemplateDocumentProps = {
  className?: string;
  density?: "default" | "compact";
  /** Replaces the rendered value of a field, by key — e.g. an input where the recipient signs. */
  fieldSlots?: Partial<Record<string, ReactNode>>;
  /**
   * Field keys to mark with the yellow "not filled in" highlight, normally the
   * result of `getEmptyDocumentFields` after the author tries to save. Only
   * applied while `showPlaceholders` is on.
   */
  highlightedFields?: ReadonlySet<string>;
  layout?: "print" | "responsive";
  /**
   * Editor preview only: render each empty field's placeholder (e.g. "Client
   * address") in muted italics so the author can see what is still needed.
   * Defaults to `false`, so saved, shared, exported and thumbnail renders leave
   * empty fields blank instead of printing placeholder text.
   */
  showPlaceholders?: boolean;
  template: MarketplaceTemplate;
  values?: Record<string, string>;
};

type StyleConfig = {
  body: string;
  eyebrow: string;
  header: string;
  label: string;
  /**
   * The style's own frame on the sheet (brutalist's black rule). Never
   * rounding, a hairline border or a shadow: the page is square paper, and
   * screens add the shadow with `DocumentPaper` / `TemplateThumbnail`.
   */
  paper: string;
  sectionTitle: string;
  title: string;
};

const styleConfig: Record<TemplateStyleId, StyleConfig> = {
  brutalist: {
    body: "p-6",
    eyebrow:
      "font-title text-xs font-black uppercase tracking-widest text-nox-noir",
    header: "border-b-2 border-nox-noir bg-play-pink px-6 py-6",
    label:
      "font-title text-[11px] font-black uppercase tracking-wide text-nox-noir",
    paper: "border-2 border-nox-noir",
    sectionTitle: "font-title text-sm font-black uppercase text-nox-noir",
    title: "mt-1 font-title text-2xl font-black text-nox-noir",
  },
  classic: {
    body: "p-8 pt-6",
    eyebrow:
      "font-title text-xs font-bold uppercase tracking-widest text-nox-noir",
    header: "border-b-2 border-nox-noir px-8 pb-4 pt-8",
    label:
      "font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45",
    paper: "",
    sectionTitle: "font-title text-sm font-bold text-nox-noir",
    title: "mt-1 font-title text-2xl font-bold text-nox-noir",
  },
  modern: {
    body: "p-6",
    eyebrow:
      "font-title text-xs font-bold uppercase tracking-widest text-golden-harvest",
    header: "bg-nox-noir px-6 py-6 text-white",
    label:
      "font-title text-xs font-semibold uppercase tracking-wide text-nox-noir/45",
    paper: "overflow-hidden",
    sectionTitle: "font-title text-sm font-bold text-nox-noir",
    title: "mt-1 font-title text-2xl font-bold text-white",
  },
  minimalist: {
    body: "px-10 pb-10 pt-4",
    eyebrow:
      "font-title text-[11px] font-semibold uppercase tracking-[0.3em] text-nox-noir/40",
    header: "px-10 pb-6 pt-10",
    label:
      "font-title text-[11px] font-medium uppercase tracking-wider text-nox-noir/40",
    paper: "",
    sectionTitle: "font-title text-sm font-semibold text-nox-noir",
    title: "mt-2 font-title text-3xl font-bold text-nox-noir",
  },
};

// Horizontal inset of each style's body, so attached chrome (e.g. the PDF footer) lines up with the content.
export const templateInsetClassName: Record<TemplateStyleId, string> = {
  brutalist: "px-6",
  classic: "px-8",
  minimalist: "px-10",
  modern: "px-6",
};

export const TemplateDocument = (props: TemplateDocumentProps) =>
  props.template.documentType === "cv" ? (
    <CvDocument {...props} />
  ) : (
    <StandardDocument {...props} />
  );

const StandardDocument = ({
  className,
  density = "default",
  fieldSlots,
  highlightedFields,
  layout = "responsive",
  showPlaceholders = false,
  template,
  values = {},
}: TemplateDocumentProps) => {
  const isCompact = density === "compact";
  const config = styleConfig[template.style.id];
  const title = values.title?.trim() || getTemplateDisplayName(template);
  const isLetter = template.documentType === "formal-business-letter";
  const billing = [
    "invoice",
    "quotation",
    "receipt",
    "purchase-order",
  ].includes(template.documentType);
  const totals = new Set(
    billing ? ["subtotal", "tax", "total", "amountPaid"] : [],
  );
  const endKeys = new Set([
    "senderSignature",
    "recipientSignature",
    "approval",
    ...(isLetter ? ["closing"] : []),
  ]);
  const fields = template.fields.filter(
    (field) => field.key !== "title" && !partyFieldKeys.has(field.key),
  );
  const metaFields = fields.filter(
    (field) =>
      field.type !== "textarea" &&
      !totals.has(field.key) &&
      !endKeys.has(field.key) &&
      !(isLetter && field.key === "salutation"),
  );
  const bodyFields = fields.filter(
    (field) => field.type === "textarea" && !endKeys.has(field.key),
  );
  const totalFields = fields.filter((field) => totals.has(field.key));
  // Preserve free-text line items; never parse or recalculate saved monetary values.
  const contentFields = bodyFields.flatMap((field) =>
    field.key === "items" ? [field, ...totalFields] : [field],
  );
  if (!bodyFields.some((field) => field.key === "items"))
    contentFields.push(...totalFields);
  if (isLetter)
    contentFields.unshift(
      ...fields.filter((field) => field.key === "salutation"),
    );
  contentFields.push(...fields.filter((field) => endKeys.has(field.key)));

  // Empty fields print blank; only the editor preview shows placeholders.
  const valueFor = (key: string, fallback?: string) => {
    const value = values[key]?.trim();

    return {
      isEmpty: !value,
      isHighlighted: showPlaceholders && Boolean(highlightedFields?.has(key)),
      text: value || (showPlaceholders ? fallback || "—" : ""),
    };
  };
  const emptyClassName = showPlaceholders ? "italic text-nox-noir/35" : "";
  const renderText = (text: string, isHighlighted: boolean) =>
    isHighlighted ? (
      <mark className={missingFieldClassName}>{text}</mark>
    ) : (
      text
    );

  return (
    <article
      className={cn(
        "flex flex-col bg-white text-nox-noir",
        config.paper,
        className,
      )}
    >
      <header className={cn(config.header, isCompact && "px-5! py-4!")}>
        <p className={cn(config.eyebrow, isCompact && "text-[11px]!")}>
          {getTemplateDisplayName(template)}
        </p>
        <h2 className={cn(config.title, isCompact && "text-xl!")}>{title}</h2>
      </header>

      <div className={cn(config.body, isCompact && "p-5!")}>
        <TemplateParties
          fields={template.fields}
          highlightedFields={showPlaceholders ? highlightedFields : undefined}
          values={values}
          compact={isCompact}
          labelClassName={cn(config.label, isCompact && "text-[11px]!")}
          showPlaceholders={showPlaceholders}
        />
        <dl
          className={cn(
            "grid gap-4",
            layout === "print" ? "grid-cols-2" : "sm:grid-cols-2",
          )}
        >
          {metaFields.map((field) => {
            if (field.key === "title") {
              return null;
            }
            const { isEmpty, isHighlighted, text } = valueFor(
              field.key,
              field.placeholder,
            );

            return (
              <div
                className="grid gap-1"
                key={field.key}
              >
                <dt className={cn(config.label, isCompact && "text-[11px]!")}>
                  {field.label}
                </dt>
                <dd
                  className={cn(
                    isCompact ? "text-xs" : "text-sm",
                    isEmpty ? emptyClassName : "font-medium",
                  )}
                >
                  {renderText(text, isHighlighted)}
                </dd>
              </div>
            );
          })}
        </dl>

        {contentFields.map((field) => {
          const { isEmpty, isHighlighted, text } = valueFor(
            field.key,
            field.placeholder,
          );
          const isSenderSignature = field.key === "senderSignature";
          if (
            field.key === "items" &&
            ["invoice", "quotation"].includes(template.documentType)
          )
            return (
              <div
                className={cn(
                  isHighlighted &&
                    "-mx-2 rounded-sm bg-golden-harvest/40 px-2 pb-2",
                )}
                key={field.key}
              >
                <DocumentItems value={text} />
              </div>
            );

          if (totals.has(field.key)) {
            return (
              <section
                className={cn(
                  "ml-auto flex w-full max-w-sm items-baseline justify-between gap-6 border-t border-steel-mist py-2.5 wrap-break-word",
                  field.key === totalFields[0]?.key && "mt-6",
                )}
                // Totals stay together on one PDF page.
                data-pdf-keep="totals"
                key={field.key}
              >
                <h3 className={cn(config.sectionTitle, isCompact && "text-xs")}>
                  {field.label}
                </h3>
                <p
                  className={cn(
                    "text-right tabular-nums",
                    isCompact ? "text-xs" : "text-sm",
                    isEmpty ? emptyClassName : "text-nox-noir/80",
                  )}
                >
                  {renderText(text, isHighlighted)}
                </p>
              </section>
            );
          }

          return (
            <section
              className="mt-6 break-words"
              key={field.key}
            >
              <h3
                className={cn(
                  config.sectionTitle,
                  isCompact && "text-xs",
                  isLetter &&
                    [
                      "salutation",
                      "body",
                      "closing",
                      "senderSignature",
                    ].includes(field.key) &&
                    "sr-only",
                )}
              >
                {field.label}
              </h3>
              {fieldSlots?.[field.key] ?? (
                <p
                  className={cn(
                    "mt-2 whitespace-pre-line",
                    isSenderSignature && !isEmpty
                      ? cn(
                          "font-signature text-nox-noir",
                          isCompact
                            ? "text-xl leading-6"
                            : "text-3xl leading-9",
                        )
                      : cn(
                          isCompact ? "text-xs leading-5" : "text-sm leading-6",
                          isEmpty ? emptyClassName : "text-nox-noir/80",
                        ),
                  )}
                >
                  {renderText(text, isHighlighted)}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </article>
  );
};

export default TemplateDocument;
