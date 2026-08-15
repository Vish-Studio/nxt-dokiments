"use client";

import {
  CheckCircleIcon,
  DownloadSimpleIcon,
  SpinnerGapIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/commons/button/button";
import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { trackEvent } from "@/lib/analytics/track";
import { generateDocumentPdf } from "@/lib/pdf/generate-document-pdf";
import type { MarketplaceTemplate } from "@/types/template";

type ExportStatus = "error" | "generating" | "ready";

export interface DocumentExportDialogProps {
  documentName: string;
  generatePdf?: (element: HTMLElement) => Promise<Blob>;
  onClose: () => void;
  open: boolean;
  template: MarketplaceTemplate | null;
  values?: Record<string, string>;
}

const getFileName = (documentName: string) => {
  const safeName = documentName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${safeName || "document"}.pdf`;
};

export const DocumentExportDialog = ({
  documentName,
  generatePdf = generateDocumentPdf,
  onClose,
  open,
  template,
  values,
}: DocumentExportDialogProps) => {
  const exportRef = useRef<HTMLDivElement>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [status, setStatus] = useState<ExportStatus>("generating");

  useEffect(() => {
    if (!open || !template || !exportRef.current) {
      return;
    }

    const exportElement =
      exportRef.current.querySelector<HTMLElement>("article");

    if (!exportElement) {
      setStatus("error");
      trackEvent("pdf_export_error", {
        error_message: "Export element not found in the DOM.",
        failure_stage: "missing_element",
        template_id: template.id,
      });
      return;
    }

    let cancelled = false;
    const frameId = window.requestAnimationFrame(() => {
      setPdfBlob(null);
      setStatus("generating");

      generatePdf(exportElement)
        .then((blob) => {
          if (!cancelled) {
            setPdfBlob(blob);
            setStatus("ready");
            trackEvent("pdf_export_success", {
              file_size_bytes: blob.size,
              template_id: template.id,
            });
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setStatus("error");
            trackEvent("pdf_export_error", {
              error_message:
                error instanceof Error ? error.message : "Unknown error.",
              failure_stage: "generate",
              template_id: template.id,
            });
          }
        });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [generatePdf, open, retryCount, template, values]);

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !template) {
    return null;
  }

  const handleDownload = () => {
    if (!pdfBlob) {
      return;
    }

    const downloadUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement("a");
    downloadLink.download = getFileName(documentName);
    downloadLink.href = downloadUrl;
    downloadLink.click();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    trackEvent("pdf_export_download", { template_id: template.id });
  };

  return (
    <div
      aria-label={`Prepare ${documentName}`}
      aria-modal="true"
      className="document-export-dialog fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close export dialog"
        className="absolute inset-0 bg-nox-noir/55"
        onClick={onClose}
        type="button"
      />

      <div className="relative z-10 w-full max-w-sm rounded-box border border-steel-mist bg-base-100 p-6 text-center">
        {status === "generating" ? (
          <>
            <SpinnerGapIcon
              aria-hidden
              className="mx-auto animate-spin text-golden-harvest"
              size={40}
              weight="bold"
            />
            <h3 className="mt-4 font-title text-lg font-bold text-nox-noir">
              Preparing your document
            </h3>
            <p
              aria-live="polite"
              className="mt-2 text-sm leading-6 text-nox-noir/60"
            >
              Creating a print-ready PDF of {documentName}.
            </p>
          </>
        ) : null}

        {status === "ready" ? (
          <>
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success text-success-content">
              <CheckCircleIcon
                aria-hidden
                size={26}
                weight="bold"
              />
            </span>
            <h3 className="mt-4 font-title text-lg font-bold text-nox-noir">
              Document ready
            </h3>
            <p
              aria-live="polite"
              className="mt-2 text-sm leading-6 text-nox-noir/60"
            >
              Your PDF contains only the document and is ready to save to this
              device.
            </p>
            <Button
              className="mt-6 w-full"
              icon={
                <DownloadSimpleIcon
                  aria-hidden
                  size={18}
                  weight="bold"
                />
              }
              iconPosition="left"
              onClick={handleDownload}
            >
              Download PDF
            </Button>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-error text-error-content">
              <WarningCircleIcon
                aria-hidden
                size={26}
                weight="bold"
              />
            </span>
            <h3 className="mt-4 font-title text-lg font-bold text-nox-noir">
              PDF could not be created
            </h3>
            <p
              aria-live="assertive"
              className="mt-2 text-sm leading-6 text-nox-noir/60"
            >
              Keep this dialog open and try generating the document again.
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => {
                const nextRetryCount = retryCount + 1;
                setRetryCount(nextRetryCount);
                trackEvent("pdf_export_retry", {
                  retry_count: nextRetryCount,
                  template_id: template.id,
                });
              }}
            >
              Try again
            </Button>
          </>
        ) : null}

        <Button
          className="mt-2 w-full"
          onClick={onClose}
          size="sm"
          variant="ghost"
        >
          {status === "generating" ? "Cancel" : "Close"}
        </Button>
      </div>

      <div
        aria-hidden
        className="fixed top-0 bg-white"
        ref={exportRef}
        style={{ left: "-10000px", width: "794px" }}
      >
        <TemplateDocument
          className="rounded-none border-0"
          layout="print"
          template={template}
          values={values}
        />
      </div>
    </div>
  );
};
