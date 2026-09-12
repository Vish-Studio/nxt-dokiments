"use client";

import { useEffect, useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { TemplateCardSkeletonGrid } from "@/components/commons/template-card-skeleton/template-card-skeleton";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { UpgradeDialog } from "@/components/commons/upgrade-dialog/upgrade-dialog";
import { MarketplacePromoBanner } from "@/components/dashboard/marketplace-promo-banner/marketplace-promo-banner";
import { MarketplaceCategoryNav } from "@/components/dashboard/marketplace-category-nav/marketplace-category-nav";
import { ResponsiveHeaderControls } from "@/components/dashboard/responsive-header-controls/responsive-header-controls";
import TemplateLibraryToolbar, {
  type TemplateSort,
} from "@/components/dashboard/template-library-toolbar/template-library-toolbar";
import TemplateTypeGroup from "@/components/dashboard/template-type-group/template-type-group";
import {
  useSaveTemplateMutation,
  useSavedTemplatesQuery,
} from "@/hooks/queries/use-saved-templates";
import { useTemplatesQuery } from "@/hooks/queries/use-templates";
import { useScrollContentToTopOnMobile } from "@/hooks/use-scroll-content-to-top-on-mobile";
import {
  canUseTier,
  getSavedTemplateLimit,
} from "@/lib/market-place";
import { documentBlueprints } from "@/lib/market-place/documents";
import { useAuthStore } from "@/stores/auth-store";
import type {
  DocumentType,
  MarketplaceTemplate,
  TemplateStyle,
} from "@/types/template";

const NO_STYLES: TemplateStyle[] = [];
const NO_TEMPLATES: MarketplaceTemplate[] = [];

export const MarketplaceBrowser = () => {
  const user = useAuthStore((state) => state.user);
  const { data: saved = [] } = useSavedTemplatesQuery();
  const { isPending: isSaveTemplatePending, mutate: saveTemplate } =
    useSaveTemplateMutation();
  const { data: catalog, isLoading: isCatalogLoading } = useTemplatesQuery();
  const templateStyles = catalog?.styles ?? NO_STYLES;
  const allTemplates = catalog?.templates ?? NO_TEMPLATES;
  const limit = getSavedTemplateLimit(user?.role);
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<
    "saved_template_limit" | "tier_locked"
  >("saved_template_limit");
  const [pendingTemplate, setPendingTemplate] =
    useState<MarketplaceTemplate | null>(null);
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState("all");
  const [style, setStyle] = useState("all");
  const [sort, setSort] = useState<TemplateSort>("newest");
  const scrollContentToTop = useScrollContentToTopOnMobile();

  const savedIds = useMemo(
    () => new Set(saved.map((item) => item.templateId)),
    [saved],
  );
  const isFreeTier = !user || user.role === "free";
  const visibleTemplates = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const matches = allTemplates.filter(
      (template) =>
        (documentType === "all" || template.documentType === documentType) &&
        (style === "all" || template.style.id === style) &&
        `${template.name} ${template.style.name} ${documentBlueprints[template.documentType].name}`
          .toLocaleLowerCase()
          .includes(query),
    );

    return matches.sort((first, second) => {
      if (sort === "name") return first.name.localeCompare(second.name);
      if (sort === "style") {
        return first.style.name.localeCompare(second.style.name);
      }
      if (sort === "oldest") return first.id.localeCompare(second.id);
      return 0;
    });
  }, [allTemplates, documentType, search, sort, style]);

  const typeOptions = useMemo(
    () =>
      [...new Set(allTemplates.map((template) => template.documentType))]
        .map((value) => ({ value, label: documentBlueprints[value].name }))
        .sort((first, second) => first.label.localeCompare(second.label)),
    [allTemplates],
  );
  const styleOptions = useMemo(
    () =>
      templateStyles
        .map(({ id, name }) => ({ value: id, label: name }))
        .sort((first, second) => first.label.localeCompare(second.label)),
    [templateStyles],
  );
  const lockedTemplateIds = useMemo(
    () =>
      new Set(
        allTemplates
          .filter((template) => !canUseTier(user?.role, template.tier))
          .map((template) => template.id),
      ),
    [allTemplates, user?.role],
  );
  const templateSections = useMemo(() => {
    if (search.trim()) {
      return visibleTemplates.length > 0
        ? [{ id: "searched", templates: visibleTemplates, title: "Searched templates" }]
        : [];
    }

    return templateStyles
      .map((templateStyle) => ({
        id: `style-${templateStyle.id}`,
        templates: visibleTemplates.filter(
          (template) => template.style.id === templateStyle.id,
        ),
        title: templateStyle.name,
      }))
      .filter((section) => section.templates.length > 0);
  }, [search, templateStyles, visibleTemplates]);

  const resetFilters = () => {
    setSearch("");
    setDocumentType("all");
    setStyle("all");
    setSort("newest");
  };
  const handleCategoryChange = (nextDocumentType: "all" | DocumentType) => {
    setDocumentType(nextDocumentType);
    window.requestAnimationFrame(() => {
      document
        .getElementById("marketplace-template-sections")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const toolbar = (
    <TemplateLibraryToolbar
      appearance="compact"
      documentType={documentType}
      onCollectionChange={scrollContentToTop}
      onDocumentType={setDocumentType}
      onReset={resetFilters}
      onSearch={setSearch}
      onSort={setSort}
      onStyle={setStyle}
      search={search}
      sort={sort}
      style={style}
      styleOptions={styleOptions}
      typeOptions={typeOptions}
    />
  );
  const headerSearch = (
    <TemplateLibraryToolbar
      appearance="header-dark"
      documentType={documentType}
      layout="header-search"
      onCollectionChange={scrollContentToTop}
      onDocumentType={setDocumentType}
      onReset={resetFilters}
      onSearch={setSearch}
      onSort={setSort}
      onStyle={setStyle}
      search={search}
      sort={sort}
      style={style}
      styleOptions={styleOptions}
      typeOptions={typeOptions}
    />
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("template");

    if (!templateId || allTemplates.length === 0) {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("template");
    window.history.replaceState(
      null,
      "",
      `${nextUrl.pathname}${nextUrl.search}`,
    );

    const template = allTemplates.find((item) => item.id === templateId);

    if (!template || savedIds.has(template.id)) {
      return;
    }

    if (!canUseTier(user?.role, template.tier)) {
      window.setTimeout(() => {
        setUpgradeReason("tier_locked");
        setIsUpgradeOpen(true);
      }, 0);
      return;
    }

    window.setTimeout(() => {
      setPreview(null);
      setPendingTemplate(template);
    }, 0);
  }, [allTemplates, savedIds, user?.role]);

  const handleSave = (template: MarketplaceTemplate) => {
    if (!canUseTier(user?.role, template.tier) || savedIds.has(template.id)) {
      return;
    }

    if (saved.length >= limit) {
      setPreview(null);
      setUpgradeReason("saved_template_limit");
      setIsUpgradeOpen(true);
      return;
    }

    // Free accounts get a reminder before committing one of their 2 permanent slots.
    if (isFreeTier) {
      setPreview(null);
      setPendingTemplate(template);
      return;
    }

    saveTemplate(template);
  };

  const confirmAdd = () => {
    const template = pendingTemplate;
    setPendingTemplate(null);

    if (template) {
      saveTemplate(template);
    }
  };

  if (isCatalogLoading) {
    return (
      <div className="marketplace-browser flex min-h-0 w-full flex-1 flex-col gap-6 pt-6">
        <MarketplacePromoBanner />
        <LoadingStatus message="Loading marketplace templates…" />
        <div className="w-full flex-1 rounded-box border border-steel-mist bg-base-100 p-4 sm:p-6">
          <TemplateCardSkeletonGrid className="grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-browser flex min-h-0 w-full flex-1 flex-col gap-6 pt-6">
      <MarketplacePromoBanner />
      <MarketplaceCategoryNav
        categories={typeOptions.map((option) => option.value as DocumentType)}
        onChange={handleCategoryChange}
        value={documentType as "all" | DocumentType}
      />
      <div className="flex min-w-0 flex-col gap-2">
        <ResponsiveHeaderControls desktopContent={toolbar} desktopHeader={headerSearch}>
          {toolbar}
        </ResponsiveHeaderControls>
        <div id="marketplace-template-sections" className="scroll-mt-6">
          {templateSections.length > 0 ? (
            <div className="grid min-w-0 gap-6">
              {templateSections.map(({ id, templates, title }) => (
                <TemplateTypeGroup
                  key={id}
                  lockedTemplateIds={lockedTemplateIds}
                  onPreview={setPreview}
                  savedTemplateIds={savedIds}
                  sectionId={id}
                  templates={templates}
                  title={title}
                />
              ))}
            </div>
          ) : (
            <section className="grid min-h-72 w-full flex-1 place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-10 text-center">
              <div>
                <h2 className="font-title text-lg font-bold text-nox-noir">
                  No matching templates
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-nox-noir/60">
                  Try another search or reset the filters to browse the full
                  marketplace.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>

      <TemplatePreviewDialog
        locked={preview ? !canUseTier(user?.role, preview.tier) : false}
        onClose={() => setPreview(null)}
        onSave={() => {
          if (preview) {
            void handleSave(preview);
          }
        }}
        saveLoading={isSaveTemplatePending}
        saved={preview ? savedIds.has(preview.id) : false}
        template={preview}
        tone="teal"
      />

      <ConfirmDialog
        cancelLabel="Browse later"
        confirmLabel="Add template"
        confirmLoading={isSaveTemplatePending}
        description={
          pendingTemplate
            ? isFreeTier
              ? `Free accounts can keep ${limit} templates and can't remove them later. Add "${pendingTemplate.name}"? You'll have used ${saved.length + 1} of ${limit}.`
              : `Add "${pendingTemplate.name}" to your templates so you can reuse it from your dashboard?`
            : undefined
        }
        onClose={() => setPendingTemplate(null)}
        onConfirm={confirmAdd}
        open={Boolean(pendingTemplate)}
        title="Add to My Templates?"
      />

      <UpgradeDialog
        onClose={() => setIsUpgradeOpen(false)}
        open={isUpgradeOpen}
        reason={upgradeReason}
      />
    </div>
  );
};
