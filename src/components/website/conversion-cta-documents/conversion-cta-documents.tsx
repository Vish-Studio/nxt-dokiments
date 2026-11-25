import { ShowcaseDocument } from "@/components/website/showcase-document/showcase-document";
import { cn } from "@/lib/utils";

export interface ConversionCtaDocumentsProps {
  className?: string;
}

/**
 * Three real catalog documents fanned out (quotation, invoice, and a contract
 * with both signatures), for the right side of the golden conversion banner.
 * The sheets run past the banner's bottom edge, which clips them.
 * Decorative: `inert` and hidden from assistive tech.
 */
export const ConversionCtaDocuments = ({
  className,
}: ConversionCtaDocumentsProps) => (
  <div
    aria-hidden
    className={cn(
      "conversion-cta-documents relative h-full min-h-72",
      className,
    )}
    inert
  >
    <ShowcaseDocument
      className="absolute left-0 top-[18%] w-[42%] -rotate-9"
      templateId="classic-quotation"
    />
    <ShowcaseDocument
      className="absolute left-[29%] top-[6%] w-[44%] -rotate-1"
      templateId="classic-invoice"
    />
    <ShowcaseDocument
      className="absolute right-0 top-[16%] w-[44%] rotate-6"
      templateId="classic-contract"
    />
  </div>
);

export default ConversionCtaDocuments;
