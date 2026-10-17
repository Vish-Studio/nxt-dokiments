import { forwardRef } from "react";

import { DokimentsMark } from "@/components/commons/dokiments-mark/dokiments-mark";
import { cn } from "@/lib/utils";

export interface PdfWatermarkProps {
  className?: string;
  insetClassName?: string;
  pageLabel?: string;
}

// Rendered off-screen and rasterised onto the bottom of every exported PDF page.
// The PDF generator fills the `data-pdf-page-label` slot per page on a detached copy.
export const PdfWatermark = forwardRef<HTMLElement, PdfWatermarkProps>(
  ({ className, insetClassName = "px-8", pageLabel }, ref) => (
    <footer
      className={cn(
        "pdf-watermark grid grid-cols-3 items-center border-t-2 border-nox-noir bg-white py-4 text-nox-noir",
        insetClassName,
        className,
      )}
      ref={ref}
    >
      <div className="flex items-center gap-2">
        {/* Inline mark: an <img> would be fetched during capture and fail the whole PDF if the request fails. */}
        <DokimentsMark className="h-5 w-4.5" />
        <p className="font-title text-xs leading-none text-nox-noir/60">
          Made with{" "}
          <span className="font-logo font-black text-nox-noir">Dokiments</span>
        </p>
      </div>
      <p
        className="text-center font-title text-xs font-medium leading-none text-nox-noir/60"
        data-pdf-page-label
      >
        {pageLabel}
      </p>
      <p className="text-right font-title text-xs font-medium leading-none tracking-wide text-nox-noir/60">
        www.dokiments.com
      </p>
    </footer>
  ),
);

PdfWatermark.displayName = "PdfWatermark";
