"use client";

import {
  BookmarkSimpleIcon,
  PrinterIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

import { Badge } from "@/components/commons/badge/badge";
import { Button } from "@/components/commons/button/button";
import type { SidePanelTone } from "@/components/commons/side-panel/side-panel";
import { SidePanel } from "@/components/commons/side-panel/side-panel";
import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { getSampleValues, tierLabels } from "@/lib/market-place";
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
  saveLoading?: boolean;
  saved?: boolean;
  template: MarketplaceTemplate | null;
  tone?: SidePanelTone;
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
  saveLoading = false,
  saved = false,
  template,
  tone,
  useHref = "/my-documents",
  values,
}: TemplatePreviewDialogProps) => {
  const resolvedValues =
    values ?? (template ? getSampleValues(template.documentType) : undefined);

  return (
    <SidePanel
      ariaLabel={template ? `${template.name} preview` : "Template preview"}
      description={
        template
          ? `${template.style.name} style · ${tierLabels[template.tier]}`
          : undefined
      }
      footer={
        template ? (
          mode === "document" ? (
            <div className="grid w-full grid-cols-[0.8fr_1.2fr] gap-2">
              <Button
                className="w-full"
                onClick={onDelete}
                size="sm"
                variant="outline"
              >
                Delete
              </Button>
              <Button
                className="w-full"
                onClick={onEdit}
                size="sm"
              >
                Edit document
              </Button>
            </div>
          ) : mode === "library" ? (
            <div className="grid w-full grid-cols-2 gap-2">
              {onPrint ? (
                <Button
                  className="w-full"
                  icon={
                    <PrinterIcon
                      aria-hidden
                      size={17}
                      weight="bold"
                    />
                  }
                  iconPosition="left"
                  onClick={onPrint}
                  size="sm"
                  variant="outline"
                >
                  Print template
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={onClose}
                  size="sm"
                  variant="outline"
                >
                  Close
                </Button>
              )}
              {onUse ? (
                <Button
                  className="w-full"
                  onClick={onUse}
                  size="sm"
                >
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
              <Button
                className="w-full"
                onClick={onClose}
                size="sm"
                variant="outline"
              >
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
                  disabled={saveLoading}
                  icon={
                    saveLoading ? (
                      <SpinnerGapIcon
                        aria-hidden
                        className="animate-spin"
                        size={17}
                        weight="bold"
                      />
                    ) : (
                      <BookmarkSimpleIcon
                        aria-hidden
                        size={17}
                        weight="bold"
                      />
                    )
                  }
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
      tone={tone}
      onClose={onClose}
      open={Boolean(template)}
      title={documentName ?? template?.name}
    >
      {template && resolvedValues ? (
        <div className="template-preview-document bg-base-200 p-3">
          <section className="mb-4 rounded-box border border-steel-mist bg-base-100 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={template.tier}>{tierLabels[template.tier]}</Badge>
              <Badge variant="neutral">{template.style.name} style</Badge>
              <Badge variant="neutral">{template.documentType}</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-nox-noir/65">
              {template.description}
            </p>
          </section>

          <TemplateDocument
            className="template-preview-paper"
            density="compact"
            template={template}
            values={resolvedValues}
          />
        </div>
      ) : null}
    </SidePanel>
  );
};
