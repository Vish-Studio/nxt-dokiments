import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export interface PdfWatermarkProps {
  className?: string;
  insetClassName?: string;
}

// Rendered off-screen and rasterised onto the bottom of every exported PDF page.
export const PdfWatermark = forwardRef<HTMLElement, PdfWatermarkProps>(
  ({ className, insetClassName = "px-8" }, ref) => (
    <footer
      className={cn(
        "pdf-watermark flex items-center justify-between border-t-2 border-nox-noir bg-white py-4 text-nox-noir",
        insetClassName,
        className,
      )}
      ref={ref}
    >
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- html-to-image needs a plain img to inline. */}
        <img
          alt=""
          // The SVG has padding around the glyph; pull it back onto the content edge.
          className="-ml-0.5 size-5"
          src="/images/svg/icon-black.svg"
        />
        <p className="font-title text-xs leading-none text-nox-noir/60">
          Made with{" "}
          <span className="font-logo font-black text-nox-noir">Dokiments</span>
        </p>
      </div>
      <p className="font-title text-xs font-medium leading-none tracking-wide text-nox-noir/60">
        www.dokiments.com
      </p>
    </footer>
  ),
);

PdfWatermark.displayName = "PdfWatermark";
