import { Badge } from "@/components/commons/badge/badge";
import { TemplateCard } from "@/components/commons/template-card/template-card";
import { documentBlueprints } from "@/lib/market-place/documents";
import type { DocumentType, MarketplaceTemplate } from "@/types/template";

interface Props {
  documentType?: DocumentType;
  lockedTemplateIds?: ReadonlySet<string>;
  savedTemplateIds?: ReadonlySet<string>;
  sectionId?: string;
  title?: string;
  templates: MarketplaceTemplate[];
  onPreview: (template: MarketplaceTemplate) => void;
}

const TemplateTypeGroup = ({
  documentType,
  lockedTemplateIds,
  onPreview,
  savedTemplateIds,
  sectionId,
  title,
  templates,
}: Props) => {
  const id = sectionId ?? documentType ?? "recent";

  return (
    <section
      aria-labelledby={`template-group-${id}`}
      className="template-type-group min-w-0 rounded-box border border-steel-mist bg-base-100 p-4 sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <h2
          className="font-title text-xl font-bold text-nox-noir"
          id={`template-group-${id}`}
        >
          {title ?? (documentType ? documentBlueprints[documentType].name : "Recently Added")}
        </h2>
        <Badge className="ml-auto" variant="neutral">
          {templates.length} Templates
        </Badge>
      </div>
      <div className="grid grid-cols-2 items-start gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            locked={lockedTemplateIds?.has(template.id)}
            onPreview={() => onPreview(template)}
            saved={savedTemplateIds?.has(template.id) ?? true}
            template={template}
            variant="gallery"
          />
        ))}
      </div>
    </section>
  );
};

export default TemplateTypeGroup;
