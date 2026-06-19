"use client";

import { LockIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { TemplateCard } from "@/components/template-card/template-card";
import { TemplatePreviewDialog } from "@/components/template-preview-dialog/template-preview-dialog";
import {
  canUseTier,
  listTemplatesByStyle,
  templateStyles,
  tierLabels,
} from "@/lib/market-place";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useSavedTemplates, useTemplatesStore } from "@/stores/templates-store";
import type { MarketplaceTemplate } from "@/types/template";

export const MarketplaceBrowser = () => {
  const user = useAuthStore((state) => state.user);
  const saveTemplate = useTemplatesStore((state) => state.saveTemplate);
  const saved = useSavedTemplates(user?.uid);
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);

  const savedIds = useMemo(() => new Set(saved.map((item) => item.templateId)), [saved]);

  const handleSave = (template: MarketplaceTemplate) => {
    if (!user || !canUseTier(user.role, template.tier)) {
      return;
    }
    saveTemplate(user.uid, template.id);
  };

  return (
    <div className="w-full">
      <div className="border-b border-steel-mist pb-4">
        <h3 className="font-title text-lg font-bold text-bloodwood-deep">Template styles</h3>
        <p className="mt-1 text-sm leading-6 text-nox-noir/60">
          Browse business documents by style. Preview any template and save the ones you need to
          My Templates.
        </p>
      </div>

      <div className="mt-8 grid gap-10">
        {templateStyles.map((style) => {
          const locked = !canUseTier(user?.role, style.tier);
          const templates = listTemplatesByStyle(style.id);

          return (
            <section key={style.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-title text-base font-bold text-nox-noir">{style.name}</h4>
                  <p className="mt-0.5 text-sm text-nox-noir/60">{style.description}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-field px-2.5 py-1 font-title text-xs font-semibold",
                    locked ? "bg-bloodwood-deep/10 text-bloodwood-deep" : "bg-base-200 text-nox-noir/60",
                  )}
                >
                  {locked ? <LockIcon aria-hidden size={12} weight="bold" /> : null}
                  {tierLabels[style.tier]}
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    locked={locked}
                    onPreview={() => setPreview(template)}
                    onSave={() => handleSave(template)}
                    saved={savedIds.has(template.id)}
                    template={template}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <TemplatePreviewDialog
        locked={preview ? !canUseTier(user?.role, preview.tier) : false}
        onClose={() => setPreview(null)}
        onSave={() => {
          if (preview) {
            handleSave(preview);
          }
        }}
        saved={preview ? savedIds.has(preview.id) : false}
        template={preview}
      />
    </div>
  );
};
