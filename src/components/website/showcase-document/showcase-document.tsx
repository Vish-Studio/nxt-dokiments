import { TemplateThumbnail } from "@/components/commons/template-thumbnail/template-thumbnail";
import { getTemplateById } from "@/lib/market-place";
import { cn } from "@/lib/utils";

export interface ShowcaseDocumentProps {
  /**
   * Position, width and rotation, e.g.
   * `"absolute left-1/2 top-6 w-3/5 -translate-x-1/2 -rotate-3"`.
   */
  className?: string;
  /**
   * Render the page at 4× and scale it to a quarter instead of 2× and half.
   * Use it below about 160px wide, where the default lays the page out too
   * narrow and its text wraps.
   */
  compact?: boolean;
  /** A catalog template id, `${styleId}-${documentType}` (`"classic-nda"`). */
  templateId: string;
  /**
   * Field values to show instead of the template's sample content, for a
   * document told for a particular reader (a student's CV, say).
   */
  values?: Record<string, string>;
}

/**
 * A real catalog document, rendered small, as a sheet of paper on a marketing
 * illustration: the same `TemplateThumbnail` the marketplace uses, filled with
 * its sample content (or `values`), with a hairline edge and the soft shadow.
 *
 * Renders nothing for an unknown id, so a renamed template never breaks the
 * page.
 */
export const ShowcaseDocument = ({
  className,
  compact = false,
  templateId,
  values,
}: ShowcaseDocumentProps) => {
  const template = getTemplateById(templateId);

  if (!template) {
    return null;
  }

  return (
    <div className={cn("showcase-document", className)}>
      <TemplateThumbnail
        compact={compact}
        template={template}
        values={values}
      />
    </div>
  );
};

export default ShowcaseDocument;
