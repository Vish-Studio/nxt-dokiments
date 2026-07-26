"use client";

import Link from "next/link";
import { useState } from "react";

import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { TemplateCard } from "@/components/commons/template-card/template-card";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { useRemoveSavedTemplateMutation, useSavedTemplatesQuery } from "@/hooks/queries/use-saved-templates";
import type { MarketplaceTemplate } from "@/types/template";

export const MyTemplatesView = () => {
  const { data: saved = [] } = useSavedTemplatesQuery();
  const { mutate: removeSavedTemplate } = useRemoveSavedTemplateMutation();
  const [preview, setPreview] = useState<MarketplaceTemplate | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<MarketplaceTemplate | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const confirmRemove = () => {
    if (pendingRemoval) {
      removeSavedTemplate(pendingRemoval.id);
    }
    setPendingRemoval(null);
    setPreview(null);
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
        {saved.map((item) => (
          <TemplateCard
            key={item.templateId}
            onPreview={() => setPreview(item.template)}
            saved
            template={item.template}
          />
        ))}
      </div>

      <TemplatePreviewDialog
        mode="library"
        onClose={() => setPreview(null)}
        onDelete={() => setPendingRemoval(preview)}
        onPrint={handlePrint}
        saved
        template={preview}
        useHref={preview ? `/documents?template=${preview.id}` : "/documents"}
      />

      <ConfirmDialog
        confirmLabel="Remove template"
        confirmVariant="danger"
        description={`Remove "${pendingRemoval?.name}" from your templates? Documents you already created from it are not affected.`}
        onClose={() => setPendingRemoval(null)}
        onConfirm={confirmRemove}
        open={Boolean(pendingRemoval)}
        title="Remove template?"
      />
    </div>
  );
};
