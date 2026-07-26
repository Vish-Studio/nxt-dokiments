"use client";

import { LockIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/commons/badge/badge";
import { Carousel } from "@/components/commons/carousel/carousel";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import { TemplateCard } from "@/components/commons/template-card/template-card";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { UpgradeDialog } from "@/components/commons/upgrade-dialog/upgrade-dialog";
import { useSaveTemplateMutation, useSavedTemplatesQuery } from "@/hooks/queries/use-saved-templates";
import { canUseTier, getSavedTemplateLimit, getTemplateById, listTemplatesByStyle, templateStyles, tierLabels } from "@/lib/market-place";
import { useAuthStore } from "@/stores/auth-store";
import type { MarketplaceTemplate } from "@/types/template";
import type { TemplateStyleId } from "@/types/template";

export const MarketplaceBrowser = () => {
  const user = useAuthStore((state) => state.user);
  const { data: saved = [] } = useSavedTemplatesQuery();
  const { mutate: saveTemplate } = useSaveTemplateMutation();
  const limit = getSavedTemplateLimit(user?.role);
  const [activeStyleId, setActiveStyleId] = useState<TemplateStyleId>(templateStyles[0].id);
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<MarketplaceTemplate | null>(null);

  const savedIds = useMemo(() => new Set(saved.map((item) => item.templateId)), [saved]);
  const isFreeTier = !user || user.role === "free";
  const activeStyle = templateStyles.find((style) => style.id === activeStyleId) ?? templateStyles[0];
  const activeStyleLocked = !canUseTier(user?.role, activeStyle.tier);
  const activeTemplates = useMemo(
    () =>
      [...listTemplatesByStyle(activeStyle.id)].sort((a, b) => {
        const aSaved = savedIds.has(a.id);
        const bSaved = savedIds.has(b.id);

        if (aSaved === bSaved) {
          return a.name.localeCompare(b.name);
        }

        return aSaved ? -1 : 1;
      }),
    [activeStyle.id, savedIds],
  );

  const tabItems = templateStyles.map((style) => {
    const locked = !canUseTier(user?.role, style.tier);

    return {
      badge: (
        <Badge
          icon={locked ? <LockIcon aria-hidden size={12} weight="bold" /> : null}
          variant={style.tier}
        >
          {tierLabels[style.tier]}
        </Badge>
      ),
      id: style.id,
      label: style.name,
    };
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("template");

    if (!templateId) {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("template");
    window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}`);

    const template = getTemplateById(templateId);

    if (!template || savedIds.has(template.id)) {
      return;
    }

    window.setTimeout(() => setActiveStyleId(template.style.id), 0);

    if (!canUseTier(user?.role, template.tier)) {
      window.setTimeout(() => setIsUpgradeOpen(true), 0);
      return;
    }

    window.setTimeout(() => {
      setPreview(null);
      setPendingTemplate(template);
    }, 0);
  }, [savedIds, user?.role]);

  const handleSave = (template: MarketplaceTemplate) => {
    if (!canUseTier(user?.role, template.tier) || savedIds.has(template.id)) {
      return;
    }

    if (saved.length >= limit) {
      setPreview(null);
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

  return (
    <div className="flex w-full min-w-0 flex-col gap-14">
      <TabMenu
        ariaLabel="Template style categories"
        items={tabItems}
        onChange={(styleId) => setActiveStyleId(styleId as TemplateStyleId)}
        value={activeStyleId}
      />

      <Carousel
        ariaLabel={`${activeStyle.name} templates`}
        header={
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-title text-2xl font-bold text-nox-noir">{activeStyle.name}</h4>
              <Badge
                icon={activeStyleLocked ? <LockIcon aria-hidden size={12} weight="bold" /> : null}
                variant={activeStyle.tier}
              >
                {tierLabels[activeStyle.tier]}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-sm text-nox-noir/60">{activeStyle.description}</p>
          </div>
        }
        key={activeStyle.id}
      >
        {activeTemplates.map((template) => (
          <div className="flex w-56 shrink-0 sm:w-64 lg:w-72" key={template.id}>
            <TemplateCard
              className="w-56 sm:w-64 lg:w-72"
              locked={activeStyleLocked}
              onPreview={() => setPreview(template)}
              saved={savedIds.has(template.id)}
              template={template}
            />
          </div>
        ))}
      </Carousel>

      <TemplatePreviewDialog
        locked={preview ? !canUseTier(user?.role, preview.tier) : false}
        onClose={() => setPreview(null)}
        onSave={() => {
          if (preview) {
            void handleSave(preview);
          }
        }}
        saved={preview ? savedIds.has(preview.id) : false}
        template={preview}
      />

      <ConfirmDialog
        cancelLabel="Browse later"
        confirmLabel="Add template"
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

      <UpgradeDialog onClose={() => setIsUpgradeOpen(false)} open={isUpgradeOpen} />
    </div>
  );
};
