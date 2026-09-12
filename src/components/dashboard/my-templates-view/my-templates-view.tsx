"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { TemplateCardSkeletonGrid } from "@/components/commons/template-card-skeleton/template-card-skeleton";
import TemplateLibraryToolbar, { type TemplateSort } from "@/components/dashboard/template-library-toolbar/template-library-toolbar";
import { ResponsiveHeaderControls } from "@/components/dashboard/responsive-header-controls/responsive-header-controls";
import TemplateTypeGroup from "@/components/dashboard/template-type-group/template-type-group";
import { documentBlueprints } from "@/lib/market-place/documents";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { useSavedTemplatesQuery } from "@/hooks/queries/use-saved-templates";
import { useScrollContentToTopOnMobile } from "@/hooks/use-scroll-content-to-top-on-mobile";
import type { DocumentType, MarketplaceTemplate } from "@/types/template";

interface Props {
  withShell?: boolean;
}

export const MyTemplatesView = ({ withShell = false }: Props) => {
  const { data: saved = [], isLoading } = useSavedTemplatesQuery();
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);

  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState("all");
  const [style, setStyle] = useState("all");
  const [sort, setSort] = useState<TemplateSort>("newest");
  const scrollContentToTop = useScrollContentToTopOnMobile();
  const query = search.trim().toLocaleLowerCase();
  const filtered = saved.filter(({ template }) =>
    (documentType === "all" || template.documentType === documentType) &&
    (style === "all" || template.style.id === style) &&
    `${template.name} ${template.style.name} ${documentBlueprints[template.documentType].name}`.toLocaleLowerCase().includes(query),
  );
  const sorted = [...filtered].sort((first, second) => {
    if (sort === "oldest") return first.savedAt - second.savedAt;
    if (sort === "name") return first.template.name.localeCompare(second.template.name) || first.template.style.name.localeCompare(second.template.style.name);
    if (sort === "style") return first.template.style.name.localeCompare(second.template.style.name) || first.template.name.localeCompare(second.template.name);
    return second.savedAt - first.savedAt;
  });
  const recent = [...filtered].sort((first, second) => second.savedAt - first.savedAt).slice(0, 4);
  const groups = new Map<DocumentType, MarketplaceTemplate[]>();
  for (const { template } of sorted) {
    const group = groups.get(template.documentType) ?? [];
    group.push(template);
    groups.set(template.documentType, group);
  }
  const sortedGroups = [...groups];
  const typeOptions = [...new Set(saved.map(({ template }) => template.documentType))]
    .map((value) => ({ value, label: documentBlueprints[value].name }))
    .sort((first, second) => first.label.localeCompare(second.label));
  const styleOptions = [...new Map(saved.map(({ template }) => [template.style.id, template.style])).values()]
    .map(({ id, name }) => ({ value: id, label: name }))
    .sort((first, second) => first.label.localeCompare(second.label));
  const resetFilters = () => {
    setSearch("");
    setDocumentType("all");
    setStyle("all");
    setSort("newest");
  };

  const toolbar = (
    <TemplateLibraryToolbar
      appearance="compact"
      search={search} documentType={documentType} style={style} sort={sort}
      typeOptions={typeOptions} styleOptions={styleOptions}
      onSearch={setSearch} onDocumentType={setDocumentType} onStyle={setStyle} onSort={setSort} onCollectionChange={scrollContentToTop} onReset={resetFilters}
    />
  );
  const headerSearch = (
    <TemplateLibraryToolbar
      appearance="header-dark"
      layout="header-search"
      search={search} documentType={documentType} style={style} sort={sort}
      typeOptions={typeOptions} styleOptions={styleOptions}
      onSearch={setSearch} onDocumentType={setDocumentType} onStyle={setStyle} onSort={setSort} onCollectionChange={scrollContentToTop} onReset={resetFilters}
    />
  );

  const content = isLoading ? (
    <div className="min-h-72 w-full flex-1 rounded-box border border-steel-mist bg-base-100 p-4 sm:p-6">
      <LoadingStatus message="Loading your templates…" />
      <TemplateCardSkeletonGrid className="grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" />
    </div>
  ) : saved.length === 0 ? (
    <div className="grid min-h-72 w-full flex-1 place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-12 text-center">
      <p className="font-title text-base font-bold text-nox-noir">
        No templates yet
      </p>
      <p className="mt-1 max-w-sm text-sm text-nox-noir/60">
        Save templates from the marketplace and they will appear here, ready
        to use in your documents.
      </p>
      <Link
        className="btn btn-sm btn-primary mt-5 font-title font-semibold tracking-normal"
        href="/marketplace"
      >
        Browse marketplace
      </Link>
    </div>
  ) : (
    <section className="my-templates-view grid w-full min-w-0 gap-6">
      {recent.length > 0 ? (
        <TemplateTypeGroup title="Recently Added" templates={recent.map(({ template }) => template)} onPreview={setPreview} />
      ) : (
        <section className="grid min-h-72 w-full place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-10 text-center">
          <h2 className="font-title text-lg font-bold text-nox-noir">
            No matching templates
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-nox-noir/60">
            Try another search or reset the filters to see your saved templates.
          </p>
        </section>
      )}
      <div className="grid gap-6">
        {sortedGroups.map(([documentType, templates]) => (
          <TemplateTypeGroup
            key={documentType}
            documentType={documentType}
            templates={templates}
            onPreview={setPreview}
          />
        ))}
      </div>

      <TemplatePreviewDialog
        mode="library"
        onClose={() => setPreview(null)}
        saved
        template={preview}
        tone="noir"
        useHref={
          preview ? `/my-documents?template=${preview.id}` : "/my-documents"
        }
      />

    </section>
  );
  return withShell ? (
    <AppShell
      activeItem="My Templates"
      description="Templates saved to your account."
      title="My Templates"
    >
      <div className="template-collection flex min-h-0 w-full flex-1 flex-col gap-2 pt-6">
        <ResponsiveHeaderControls desktopContent={toolbar} desktopHeader={headerSearch}>
          {toolbar}
        </ResponsiveHeaderControls>
        {content}
      </div>
    </AppShell>
  ) : (
    <>
      {!isLoading && saved.length > 0 ? toolbar : null}
      {content}
    </>
  );
};

export default MyTemplatesView;
