"use client";

import { BookmarkSimpleIcon, PrinterIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { Button } from "@/components/commons/button/button";
import { SidePanel } from "@/components/commons/side-panel/side-panel";
import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { getSampleValues, tierBadgeClasses, tierLabels } from "@/lib/market-place";
import { cn } from "@/lib/utils";
import type { MarketplaceTemplate } from "@/types/template";

export type TemplatePreviewDialogProps = {
  documentName?: string;
  locked?: boolean;
  mode?: "document" | "marketplace" | "library";
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onPrint?: () => void;
  onSave?: () => void;
  onUse?: () => void;
  saved?: boolean;
  template: MarketplaceTemplate | null;
  useHref?: string;
  values?: Record<string, string>;
};

export const TemplatePreviewDialog = ({
  documentName,
  locked = false,
  mode = "marketplace",
  onClose,
  onDelete,
  onEdit,
  onPrint,
  onSave,
  onUse,
  saved = false,
  template,
  useHref = "/documents",
  values,
}: TemplatePreviewDialogProps) => {
  const resolvedValues = values ?? (template ? getSampleValues(template.documentType) : undefined);

  return (
    <SidePanel
      ariaLabel={template ? `${template.name} preview` : "Template preview"}
      description={
        template ? `${template.style.name} style · ${tierLabels[template.tier]}` : undefined
      }
      footer={
        template ? (
          mode === "document" ? (
            <div className="grid w-full grid-cols-[0.8fr_1.2fr] gap-2">
              <Button className="w-full" onClick={onDelete} size="sm" variant="outline">
                Delete
              </Button>
              <Button className="w-full" onClick={onEdit} size="sm">
                Edit document
              </Button>
            </div>
          ) : mode === "library" ? (
            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                className="w-full"
                icon={<PrinterIcon aria-hidden size={17} weight="bold" />}
                iconPosition="left"
                onClick={onPrint}
                size="sm"
                variant="outline"
              >
                Print template
              </Button>
              {onUse ? (
                <Button className="w-full" onClick={onUse} size="sm">
                  Use document
                </Button>
              ) : (
                <Link
                  className="btn btn-sm w-full btn-primary font-title font-semibold tracking-normal"
                  href={useHref}
                >
                  Use document
                </Link>
              )}
            </div>
          ) : (
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
                  icon={<BookmarkSimpleIcon aria-hidden size={17} weight="bold" />}
                  iconPosition="left"
                  onClick={onSave}
                  size="sm"
                  variant="accent"
                >
                  Save template
                </Button>
              )}
            </div>
          )
        ) : undefined
      }
      onClose={onClose}
      open={Boolean(template)}
      title={documentName ?? template?.name}
    >
      {template && resolvedValues ? (
        <div className="bg-base-200 p-3">
          <section className="mb-4 rounded-box border border-steel-mist bg-base-100 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-field px-2.5 py-1 font-title text-xs font-semibold",
                  tierBadgeClasses[template.tier],
                )}
              >
                {tierLabels[template.tier]}
              </span>
              <span className="rounded-field bg-base-200 px-2.5 py-1 font-title text-xs font-semibold text-nox-noir/65">
                {template.style.name} style
              </span>
              <span className="rounded-field bg-base-200 px-2.5 py-1 font-title text-xs font-semibold text-nox-noir/65">
                {template.documentType}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-nox-noir/65">{template.description}</p>
          </section>

          <TemplateDocument template={template} values={resolvedValues} />
        </div>
      ) : null}
    </SidePanel>
  );
};
