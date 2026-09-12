import CollectionToolbar from "@/components/commons/collection-toolbar/collection-toolbar";
import type { SelectOption } from "@/components/commons/select/select";

export type TemplateSort = "newest" | "oldest" | "name" | "style";

interface Props {
  appearance?: "default" | "header-dark" | "compact";
  embedded?: boolean;
  layout?: "standard" | "header" | "header-search";
  search: string;
  documentType: string;
  style: string;
  sort: TemplateSort;
  typeOptions: SelectOption[];
  styleOptions: SelectOption[];
  onSearch: (value: string) => void;
  onDocumentType: (value: string) => void;
  onStyle: (value: string) => void;
  onSort: (value: TemplateSort) => void;
  onCollectionChange?: () => void;
  onReset: () => void;
}

const TemplateLibraryToolbar = ({
  appearance, embedded = false, layout, search, documentType, style, sort, typeOptions, styleOptions,
  onSearch, onDocumentType, onStyle, onSort, onCollectionChange, onReset,
}: Props) => (
  <CollectionToolbar
    variant={embedded ? "embedded" : "surface"}
    appearance={appearance}
    layout={layout}
    ariaLabel="Filter and sort templates"
    searchLabel="Search templates"
    searchPlaceholder="Search templates…"
    search={search}
    onSearch={onSearch}
    onCollectionChange={onCollectionChange}
    sort={sort}
    onSort={(value) => onSort(value as TemplateSort)}
    sortOptions={[
      { label: "Recently added", value: "newest" },
      { label: "Oldest added", value: "oldest" },
      { label: "Title: A–Z", value: "name" },
      { label: "Style: A–Z", value: "style" },
    ]}
    filters={[
      { id: "type", label: "Document type", value: documentType, defaultValue: "all", options: [{ label: "All document types", value: "all" }, ...typeOptions], onChange: onDocumentType },
      { id: "style", label: "Style", value: style, defaultValue: "all", options: [{ label: "All styles", value: "all" }, ...styleOptions], onChange: onStyle },
    ]}
    canReset={Boolean(search || documentType !== "all" || style !== "all" || sort !== "newest")}
    onReset={onReset}
  />
);

export default TemplateLibraryToolbar;
