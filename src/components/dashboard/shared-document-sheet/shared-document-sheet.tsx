"use client";

import {
  ArrowLeftIcon,
  LockSimpleIcon,
  PrinterIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/commons/button/button";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { DocumentExportDialog } from "@/components/dashboard/document-export-dialog/document-export-dialog";
import { ShareTimeline } from "@/components/dashboard/share-timeline/share-timeline";
import { ShareStatusBadge } from "@/components/dashboard/share-status-badge/share-status-badge";
import { SignatureField } from "@/components/dashboard/signature-field/signature-field";
import { SignedSignature } from "@/components/dashboard/signed-signature/signed-signature";
import {
  currentRecipient,
  resolveRecipientStatus,
  shareTimeline,
} from "@/lib/sharing/share-activity";
import { RECIPIENT_SIGNATURE_KEY } from "@/lib/sharing/signable";
import { snapshotToMarketplaceTemplate } from "@/types/template";
import type { SharedDocument } from "@/types/sharing";

export interface SharedDocumentSheetProps {
  document: SharedDocument;
  /** Shown under the signing bar when the last attempt failed. */
  errorMessage?: string | null;
  /** True while the signature is being submitted. */
  isSigning?: boolean;
  /** Called with the trimmed signature once the recipient confirms. */
  onSign: (signature: string) => void;
  /** The owner only watches; a recipient can sign while the copy is unlocked. */
  viewer: "owner" | "recipient";
}

/**
 * A shared copy of a document, read-only for everyone. A recipient signs it in
 * place of the signature field; once signed the copy is locked and both parties
 * see the signature, who signed and when.
 */
export const SharedDocumentSheet = ({
  document,
  errorMessage,
  isSigning = false,
  onSign,
  viewer,
}: SharedDocumentSheetProps) => {
  const router = useRouter();
  const [typed, setTyped] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { templateSnapshot, templateId } = document;
  const template = useMemo(
    () =>
      templateSnapshot
        ? snapshotToMarketplaceTemplate(templateSnapshot, templateId)
        : null,
    [templateSnapshot, templateId],
  );

  const title = document.values.title?.trim() || document.name;
  const signature = Object.values(document.signatures)[0];
  const canExportSigned = document.locked && Boolean(signature) && template;
  const headerRecipient = currentRecipient(document);
  const canSign = viewer === "recipient" && !document.locked;
  const trimmed = typed.trim();
  const backHref =
    viewer === "recipient" ? "/my-documents?tab=shared" : "/my-documents";

  const fieldSlots = signature
    ? { [RECIPIENT_SIGNATURE_KEY]: <SignedSignature signature={signature} /> }
    : canSign
      ? {
          [RECIPIENT_SIGNATURE_KEY]: (
            <SignatureField
              disabled={isSigning}
              onChange={setTyped}
              value={typed}
            />
          ),
        }
      : undefined;

  return (
    <div className="shared-document-sheet w-full">
      <Button
        icon={
          <ArrowLeftIcon
            aria-hidden
            size={16}
            weight="bold"
          />
        }
        iconMotion="left"
        iconPosition="left"
        onClick={() => router.push(backHref)}
        size="sm"
        variant="outline"
      >
        {viewer === "recipient"
          ? "Back to shared with me"
          : "Back to documents"}
      </Button>

      <div className="mx-auto mt-5 flex w-full max-w-3xl flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-title text-xl font-bold text-nox-noir">
              {title}
            </h2>
            <p className="mt-1 text-sm text-nox-noir/60">
              {viewer === "recipient"
                ? `Shared by ${document.ownerName || document.ownerEmail}`
                : `Shared copy of your document — ${headerRecipient?.email ?? ""}`}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <ShareStatusBadge
              status={
                document.locked
                  ? "signed"
                  : headerRecipient
                    ? resolveRecipientStatus(headerRecipient, document).status
                    : "pending"
              }
            />
            {canExportSigned ? (
              <Button
                icon={
                  <PrinterIcon
                    aria-hidden
                    size={16}
                    weight="bold"
                  />
                }
                iconPosition="left"
                onClick={() => setIsExporting(true)}
                size="sm"
                variant="outline"
              >
                Download signed PDF
              </Button>
            ) : null}
          </div>
        </div>

        {document.locked ? (
          <p className="flex items-start gap-2 rounded-box border border-steel-mist bg-base-100 p-3 text-sm text-nox-noir/70">
            <LockSimpleIcon
              aria-hidden
              className="mt-0.5 shrink-0"
              size={16}
              weight="bold"
            />
            This copy is signed and locked. It can no longer be changed.
          </p>
        ) : null}

        {document.locked ? (
          <section
            aria-label="Activity"
            className="rounded-box border border-steel-mist bg-base-100 p-3"
          >
            <ShareTimeline events={shareTimeline(document)} />
          </section>
        ) : null}

        {template ? (
          <TemplateDocument
            className="rounded-box border border-steel-mist"
            fieldSlots={fieldSlots}
            template={template}
            values={document.values}
          />
        ) : (
          <p className="rounded-box border border-dashed border-steel-mist bg-base-100 p-6 text-center text-sm text-nox-noir/60">
            This document&apos;s layout is no longer available.
          </p>
        )}

        {canSign ? (
          <div className="flex flex-col items-end gap-2">
            {errorMessage ? (
              <p
                className="text-sm text-error"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}
            <Button
              disabled={!trimmed || isSigning}
              onClick={() => setIsConfirming(true)}
            >
              Sign document
            </Button>
          </div>
        ) : null}

        <ConfirmDialog
          confirmLabel="Sign and lock"
          confirmLoading={isSigning}
          description="Signing locks this document for everyone. This can't be undone."
          onClose={() => setIsConfirming(false)}
          onConfirm={() => {
            setIsConfirming(false);
            onSign(trimmed);
          }}
          open={isConfirming}
          title="Sign this document?"
        />

        {canExportSigned && signature ? (
          <DocumentExportDialog
            documentName={`${title} (signed)`}
            fieldSlots={{
              [RECIPIENT_SIGNATURE_KEY]: (
                <SignedSignature signature={signature} />
              ),
            }}
            onClose={() => setIsExporting(false)}
            open={isExporting}
            template={template}
            values={document.values}
          />
        ) : null}
      </div>
    </div>
  );
};
