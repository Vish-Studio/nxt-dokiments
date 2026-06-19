"use client";

import { LockIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { Carousel } from "@/components/carousel/carousel";
import { TemplateCard } from "@/components/template-card/template-card";
import { TemplatePreviewDialog } from "@/components/template-preview-dialog/template-preview-dialog";
import { UpgradeDialog } from "@/components/upgrade-dialog/upgrade-dialog";
import {
  canUseTier,
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
  const { addTemplate, saved } = useTemplateLibrary();
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const savedIds = useMemo(() => new Set(saved.map((item) => item.templateId)), [saved]);

  const handleSave = async (template: MarketplaceTemplate) => {
    if (!canUseTier(user?.role, template.tier)) {
      return;
    }

    const result = await addTemplate(template.id);

    if (!result.ok && result.reason === "limit") {
      setPreview(null);
      setIsUpgradeOpen(true);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-10">
      {templateStyles.map((style) => {
          const locked = !canUseTier(user?.role, style.tier);
          const templates = listTemplatesByStyle(style.id);

          return (
            <Carousel
              ariaLabel={`${style.name} templates`}
              header={
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-title text-base font-bold text-nox-noir">{style.name}</h4>
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
                <div className="w-72 shrink-0" key={template.id}>
                  <TemplateCard
                    locked={locked}
                    onPreview={() => setPreview(template)}
                    onSave={() => handleSave(template)}
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

      <UpgradeDialog onClose={() => setIsUpgradeOpen(false)} open={isUpgradeOpen} />
    </div>
  );
};
