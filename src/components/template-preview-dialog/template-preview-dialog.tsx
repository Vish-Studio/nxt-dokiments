"use client";

import { XIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/button/button";
import { ButtonIcon } from "@/components/button-icon/button-icon";
import { TemplateDocument } from "@/components/template-document/template-document";
import { tierLabels } from "@/lib/market-place";
import type { MarketplaceTemplate } from "@/types/template";

export type TemplatePreviewDialogProps = {
  locked?: boolean;
  onClose: () => void;
  onSave: () => void;
  saved?: boolean;
  template: MarketplaceTemplate | null;
};

export const TemplatePreviewDialog = ({
  locked = false,
  onClose,
  onSave,
  saved = false,
  template,
}: TemplatePreviewDialogProps) => {
  useEffect(() => {
    if (!template) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [template, onClose]);

  if (!template) {
    return null;
  }

  return (
    <div
      aria-label={`${template.name} preview`}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close preview"
        className="absolute inset-0 bg-nox-noir/55"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-box border border-steel-mist bg-base-100">
        <header className="flex items-center justify-between gap-4 border-b border-steel-mist p-4">
          <div className="min-w-0">
            <h3 className="truncate font-title text-base font-bold text-nox-noir">
              {template.name}
            </h3>
            <p className="text-xs text-nox-noir/55">
              {template.style.name} style · {tierLabels[template.tier]}
            </p>
          </div>
          <ButtonIcon
            aria-label="Close preview"
            icon={<XIcon aria-hidden size={18} weight="bold" />}
            onClick={onClose}
            size="sm"
            variant="ghost"
          />
        </header>

        <div className="overflow-y-auto bg-base-200 p-6">
          <TemplateDocument template={template} />
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-steel-mist p-4">
          <Button onClick={onClose} size="sm" variant="outline">
            Close
          </Button>
          {locked ? (
            <Link
              className="btn btn-sm btn-primary font-title font-semibold tracking-normal"
              href="/subscription"
            >
              Upgrade to use
            </Link>
          ) : saved ? (
            <Link
              className="btn btn-sm border border-steel-mist bg-base-100 font-title font-semibold tracking-normal text-nox-noir hover:bg-base-200"
              href="/my-templates"
            >
              Open in My Templates
            </Link>
          ) : (
            <Button onClick={onSave} size="sm">
              Save to my templates
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
};
