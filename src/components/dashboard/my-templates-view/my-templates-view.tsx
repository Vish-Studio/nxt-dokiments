"use client";

import { MagnifyingGlassIcon, StackIcon, StorefrontIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/dashboard/app-shell/app-shell";
import { Button } from "@/components/commons/button/button";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { FloatingActionButton } from "@/components/commons/floating-action-button/floating-action-button";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { TemplateCardSkeletonGrid } from "@/components/commons/template-card-skeleton/template-card-skeleton";
import TemplateLibraryToolbar, { type TemplateSort } from "@/components/dashboard/template-library-toolbar/template-library-toolbar";
import { ResponsiveHeaderControls } from "@/components/dashboard/responsive-header-controls/responsive-header-controls";
import TemplateTypeGroup from "@/components/dashboard/template-type-group/template-type-group";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { useSavedTemplatesQuery } from "@/hooks/queries/use-saved-templates";
import { useScrollContentToTopOnMobile } from "@/hooks/use-scroll-content-to-top-on-mobile";
import { iconSize } from "@/lib/icons";
import type { DocumentType, MarketplaceTemplate } from "@/types/template";
import { getDocumentTypeLabel, getTemplateDisplayName } from "@/lib/market-place/document-labels";

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
    `${getTemplateDisplayName(template)} ${template.name} ${template.style.name} ${getDocumentTypeLabel(template.documentType)}`.toLocaleLowerCase().includes(query),
  );
  const sorted = [...filtered].sort((first, second) => {
    if (sort === "oldest") return first.savedAt - second.savedAt;
    if (sort === "name") return getTemplateDisplayName(first.template).localeCompare(getTemplateDisplayName(second.template)) || first.template.style.name.localeCompare(second.template.style.name);
    if (sort === "style") return first.template.style.name.localeCompare(second.template.style.name) || getTemplateDisplayName(first.template).localeCompare(getTemplateDisplayName(second.template));
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
    .map((value) => ({ value, label: getDocumentTypeLabel(value) }))
    .sort((first, second) => first.label.localeCompare(second.label));
  const styleOptions = [...new Map(saved.map(({ template }) => [template.style.id, template.style])).values()]
    .map(({ id, name }) => ({ value: id, label: name }))
    .sort((first, second) => first.label.localeCompare(second.label));
  const resetFilters = () => {
    setSearch("");
    setDocumentType("all");
    setStyle("all");
  };
  const router = useRouter();
  const countLabel = `${sorted.length} ${sorted.length === 1 ? "template" : "templates"}`;
  // The page's one primary action: find more templates.
  const browseMarketplace = (
    <LinkButton
      href="/marketplace"
      icon={<StorefrontIcon aria-hidden size={iconSize.control} weight="bold" />}
      iconPosition="left"
      size="sm"
      variant="accent"
    >
      Browse marketplace
    </LinkButton>
  );

  const toolbar = (
    <TemplateLibraryToolbar
      appearance="compact"
      endAction={browseMarketplace}
      resultLabel={countLabel}
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
    <EmptyState
      action={browseMarketplace}
      description="Save templates from the marketplace and they will appear here, ready to use in your documents."
      icon={<StackIcon aria-hidden size={iconSize.feature} weight="bold" />}
      title="No templates yet"
    />
  ) : (
    <section className="my-templates-view grid w-full min-w-0 gap-6">
      {recent.length > 0 ? (
        <TemplateTypeGroup title="Recently Added" templates={recent.map(({ template }) => template)} onPreview={setPreview} />
      ) : (
        <EmptyState
          action={
            <Button onClick={resetFilters} size="sm" variant="outline">
              Clear filters
            </Button>
          }
          description="Try another search, or clear the filters to see all your saved templates."
          icon={<MagnifyingGlassIcon aria-hidden size={iconSize.feature} weight="bold" />}
          title="No templates match"
        />
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
        {saved.length > 0 ? (
          <FloatingActionButton
            className="lg:hidden"
            icon={<StorefrontIcon aria-hidden size={18} weight="bold" />}
            label="Browse marketplace"
            onClick={() => router.push("/marketplace")}
          />
        ) : null}
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
