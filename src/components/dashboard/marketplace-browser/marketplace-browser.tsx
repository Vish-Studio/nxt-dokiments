"use client";

import { LockIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { Carousel } from "@/components/commons/carousel/carousel";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { TemplateCard } from "@/components/commons/template-card/template-card";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { UpgradeDialog } from "@/components/commons/upgrade-dialog/upgrade-dialog";
import {
  canUseTier,
  getTemplateById,
  listTemplatesByStyle,
  templateStyles,
  tierBadgeClasses,
  tierLabels,
} from "@/lib/market-place";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useTemplateLibrary } from "@/stores/templates-store";
import type { MarketplaceTemplate } from "@/types/template";

export const MarketplaceBrowser = () => {
  const user = useAuthStore((state) => state.user);
  const { addTemplate, limit, saved } = useTemplateLibrary();
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<MarketplaceTemplate | null>(null);

  const savedIds = useMemo(() => new Set(saved.map((item) => item.templateId)), [saved]);
  const isFreeTier = !user || user.role === "free";

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

    void addTemplate(template.id);
  };

  const confirmAdd = () => {
    const template = pendingTemplate;
    setPendingTemplate(null);

    if (template) {
      void addTemplate(template.id);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-10 md:gap-18 lg:gap-24 mt-10">
      {templateStyles.map((style) => {
          const locked = !canUseTier(user?.role, style.tier);
          const templates = [...listTemplatesByStyle(style.id)].sort((a, b) => {
            const aSaved = savedIds.has(a.id);
            const bSaved = savedIds.has(b.id);

            if (aSaved === bSaved) {
              return a.name.localeCompare(b.name);
            }

            return aSaved ? -1 : 1;
          });

          return (
            <Carousel
              ariaLabel={`${style.name} templates`}
              header={
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-title text-2xl font-bold text-nox-noir">{style.name}</h4>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-field px-2.5 py-1 font-title text-xs font-semibold",
                        tierBadgeClasses[style.tier],
                      )}
                    >
                      {locked ? <LockIcon aria-hidden size={12} weight="bold" /> : null}
                      {tierLabels[style.tier]}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-nox-noir/60">{style.description}</p>
                </div>
              }
              key={style.id}
            >
              {templates.map((template) => (
                <div className="flex w-76 shrink-0" key={template.id}>
                  <TemplateCard
                    locked={locked}
                    onPreview={() => setPreview(template)}
                    saved={savedIds.has(template.id)}
                    template={template}
                  />
                </div>
              ))}
            </Carousel>
          );
        })}

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
