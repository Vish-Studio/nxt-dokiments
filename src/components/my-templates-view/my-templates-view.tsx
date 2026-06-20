"use client";

import Link from "next/link";
import { useState } from "react";

import { TemplateCard } from "@/components/template-card/template-card";
import { TemplatePreviewDialog } from "@/components/template-preview-dialog/template-preview-dialog";
import { getTemplateById } from "@/lib/market-place";
import { useTemplateLibrary } from "@/stores/templates-store";
import type { MarketplaceTemplate } from "@/types/template";

export const MyTemplatesView = () => {
  const { saved } = useTemplateLibrary();
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);

  const handlePrint = () => {
    window.print();
  };

  if (saved.length === 0) {
    return (
      <div className="grid w-full place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-12 text-center">
        <p className="font-title text-base font-bold text-nox-noir">No templates yet</p>
        <p className="mt-1 max-w-sm text-sm text-nox-noir/60">
          Save templates from the marketplace and they will appear here, ready to use in your
          documents.
        </p>
        <Link
          className="btn btn-sm btn-primary mt-5 font-title font-semibold tracking-normal"
          href="/marketplace"
        >
          Browse marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {saved.map((item) => {
          const template = getTemplateById(item.templateId);

          if (!template) {
            return null;
          }

          return (
            <TemplateCard
              key={item.savedId}
              onPreview={() => setPreview(template)}
              saved
              template={template}
            />
          );
        })}
      </div>

      <TemplatePreviewDialog
        mode="library"
        onClose={() => setPreview(null)}
        onPrint={handlePrint}
        saved
        template={preview}
        useHref={preview ? `/documents?template=${preview.id}` : "/documents"}
      />
    </div>
  );
};
