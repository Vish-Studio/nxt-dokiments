import { Badge } from "@/components/commons/badge/badge";
import { TemplateCard } from "@/components/commons/template-card/template-card";
import { documentBlueprints } from "@/lib/market-place/documents";
import type { DocumentType, MarketplaceTemplate } from "@/types/template";

interface Props {
  documentType?: DocumentType;
  title?: string;
  templates: MarketplaceTemplate[];
  onPreview: (template: MarketplaceTemplate) => void;
}

const TemplateTypeGroup = ({ documentType, title, templates, onPreview }: Props) => (
  <section
    aria-labelledby={`template-group-${documentType ?? "recent"}`}
    className="template-type-group min-w-0"
  >
    <div className="mb-5 flex items-center gap-3">
      <h2
        className="font-title text-xl font-bold text-nox-noir"
        id={`template-group-${documentType ?? "recent"}`}
      >
        {title ?? (documentType ? documentBlueprints[documentType].name : "Recently Added")}
      </h2>
      <Badge variant="neutral">{templates.length}</Badge>
    </div>
    <div className="grid grid-cols-2 items-start gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          onPreview={() => onPreview(template)}
          saved
          template={template}
          variant="gallery"
        />
      ))}
    </div>
  </section>
);

export default TemplateTypeGroup;
