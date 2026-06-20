"use client";

import Link from "next/link";

import { Button } from "@/components/button/button";
import { SidePanel } from "@/components/side-panel/side-panel";
import { TemplateDocument } from "@/components/template-document/template-document";
import { getSampleValues, tierLabels } from "@/lib/market-place";
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
  return (
    <SidePanel
      ariaLabel={template ? `${template.name} preview` : "Template preview"}
      description={
        template ? `${template.style.name} style · ${tierLabels[template.tier]}` : undefined
      }
      footer={
        template ? (
          <div className="grid w-full grid-cols-[0.78fr_1.22fr] gap-2">
            <Button className="w-full" onClick={onClose} size="sm" variant="outline">
              Close
            </Button>
            {locked ? (
              <Link
                className="btn btn-sm w-full bg-golden-harvest font-title font-semibold tracking-normal text-nox-noir hover:brightness-95"
                href="/subscription"
              >
                Upgrade to use
              </Link>
            ) : saved ? (
              <Link
                className="btn btn-sm w-full border border-steel-mist bg-base-100 font-title font-semibold tracking-normal text-nox-noir hover:bg-base-200"
                href="/my-templates"
              >
                In My Templates
              </Link>
            ) : (
              <Button
                className="w-full"
                onClick={onSave}
                size="sm"
                variant="accent"
              >
                Save template
              </Button>
            )}
          </div>
        ) : undefined
      }
      onClose={onClose}
      open={Boolean(template)}
      title={template?.name}
    >
      {template ? (
        <div className="bg-base-200 p-6">
          <TemplateDocument
            template={template}
            values={getSampleValues(template.documentType)}
          />
        </div>
      ) : null}
    </SidePanel>
  );
};
