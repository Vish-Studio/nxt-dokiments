import { TemplateStripItem } from "@/components/website/template-strip-item/template-strip-item";
import {
  getTemplateById,
  marketplaceTemplates,
  templateStyles,
} from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

const STRIP_DOCUMENTS = ["invoice", "quotation", "contract"];

// Documents outer, styles inner, so neighbouring thumbnails differ in style.
const stripTemplates = STRIP_DOCUMENTS.flatMap((documentType) =>
  templateStyles.map((style) => getTemplateById(`${style.id}-${documentType}`)),
).filter((template): template is MarketplaceTemplate => Boolean(template));

export const TemplateStrip = () => {
  return (
    <section
      aria-label="A sample of the template catalog"
      className="template-strip overflow-hidden bg-play-blue py-16 text-nox-noir"
    >
      <h2 className="website-reveal px-5 text-center font-title text-3xl font-bold tracking-tight sm:text-4xl">
        {marketplaceTemplates.length} templates, and counting.
      </h2>

      <div className="template-strip-viewport mt-10">
        <div className="template-strip-track flex w-max">
          {stripTemplates.map((template) => (
            <TemplateStripItem
              key={template.id}
              template={template}
            />
          ))}
          <div
            aria-hidden
            className="flex"
          >
            {stripTemplates.map((template) => (
              <TemplateStripItem
                key={template.id}
                template={template}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
