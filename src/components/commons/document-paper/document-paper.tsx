import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface DocumentPaperProps {
  /** The rendered document, usually a `TemplateDocument`. It stretches to the sheet's height. */
  children: ReactNode;
  /** Extra classes for the wrapper, e.g. a narrower `max-w-*` or `mx-*` inset. */
  className?: string;
  /**
   * Short line under the sheet, e.g. "A4". Omit when the page count is
   * unknown; never guess one.
   */
  caption?: string;
}

/**
 * Shows a document as a real sheet of paper: square corners, no border, a
 * soft `shadow-paper` beneath, at least one A4 page tall (210:297).
 *
 * Put it on a grey desk (`bg-base-200` with padding) so the page lifts off
 * the panel, and never inside a card: a rounded, bordered box around it reads
 * as another card. Screen only: PDF export renders the document bare, so the
 * shadow never reaches a printed page.
 *
 * @example
 * <div className="bg-base-200 p-4 sm:p-6">
 *   <DocumentPaper>
 *     <TemplateDocument template={template} values={values} />
 *   </DocumentPaper>
 * </div>
 */
export const DocumentPaper = ({
  caption,
  children,
  className,
}: DocumentPaperProps) => (
  <figure className={cn("document-paper mx-auto m-0 w-full", className)}>
    <div className="document-paper-sheet flex flex-col rounded-none bg-white shadow-paper *:flex-1">
      {children}
    </div>
    {caption ? (
      <figcaption className="mt-3 text-center text-xs font-medium text-nox-noir/60">
        {caption}
      </figcaption>
    ) : null}
  </figure>
);

export default DocumentPaper;
