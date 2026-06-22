"use client";

import { ArrowLeftIcon, EyeIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/commons/button/button";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { FloatingActionButton } from "@/components/commons/floating-action-button/floating-action-button";
import { Input } from "@/components/commons/input/input";
import { SidePanel } from "@/components/commons/side-panel/side-panel";
import { TemplateCard } from "@/components/commons/template-card/template-card";
import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { TemplateForm } from "@/components/commons/template-form/template-form";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { DocumentList } from "@/components/dashboard/document-list/document-list";
import { DocumentExportDialog } from "@/components/dashboard/document-export-dialog/document-export-dialog";
import { getTemplateById } from "@/lib/market-place";
import { useAuthStore } from "@/stores/auth-store";
import { useDocumentsStore, useUserDocuments } from "@/stores/documents-store";
import { useSavedTemplates } from "@/stores/templates-store";
import type { MarketplaceTemplate, UserDocument } from "@/types/template";

type Mode = "list" | "picker" | "editor";

export const DocumentsView = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const saved = useSavedTemplates(user?.uid);
  const documents = useUserDocuments(user?.uid);
  const createDocument = useDocumentsStore((state) => state.createDocument);
  const updateDocument = useDocumentsStore((state) => state.updateDocument);
  const removeDocument = useDocumentsStore((state) => state.removeDocument);

  const [mode, setMode] = useState<Mode>("list");
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [exportDocument, setExportDocument] = useState<UserDocument | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [isSaveConfirmationOpen, setIsSaveConfirmationOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<MarketplaceTemplate | null>(null);
  const [previewDocument, setPreviewDocument] = useState<UserDocument | null>(null);
  const [isEditorPreviewOpen, setIsEditorPreviewOpen] = useState(false);

  const ownedTemplates = useMemo(
    () =>
      saved
        .map((item) => getTemplateById(item.templateId))
        .filter((template): template is MarketplaceTemplate => Boolean(template)),
    [saved],
  );

  const sortedDocuments = useMemo(
    () => [...documents].sort((first, second) => second.createdAt - first.createdAt),
    [documents],
  );

  const goToList = () => {
    setMode("list");
    setActiveTemplateId(null);
    setActiveDocumentId(null);
    setIsDeleteConfirmationOpen(false);
    setIsSaveConfirmationOpen(false);
    setIsEditorPreviewOpen(false);
  };

  const startNewDocument = (template: MarketplaceTemplate) => {
    setActiveTemplateId(template.id);
    setActiveDocumentId(null);
    setDraftName(template.name);
    setDraftValues({});
    setIsDeleteConfirmationOpen(false);
    setIsSaveConfirmationOpen(false);
    setIsEditorPreviewOpen(false);
    setMode("editor");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("template");

    if (!templateId || ownedTemplates.length === 0) {
      return;
    }

    const template = ownedTemplates.find((item) => item.id === templateId);

    if (!template) {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("template");
    window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}`);
    window.setTimeout(() => startNewDocument(template), 0);
  }, [ownedTemplates]);

  const openDocument = (document: UserDocument) => {
    setActiveTemplateId(document.templateId);
    setActiveDocumentId(document.id);
    setDraftName(document.name);
    setDraftValues(document.values);
    setIsDeleteConfirmationOpen(false);
    setIsSaveConfirmationOpen(false);
    setIsEditorPreviewOpen(false);
    setMode("editor");
  };

  const handleRemove = (documentId: string) => {
    if (user) {
      removeDocument(user.uid, documentId);
    }
  };

  const handleSave = () => {
    if (!user || !activeTemplateId) {
      return;
    }

    if (activeDocumentId) {
      updateDocument(user.uid, activeDocumentId, { name: draftName, values: draftValues });
    } else {
      const id = createDocument(user.uid, {
        name: draftName || "Untitled document",
        templateId: activeTemplateId,
        values: draftValues,
      });
      setActiveDocumentId(id);
    }

    setIsSaveConfirmationOpen(true);
  };

  const handleSavedContinue = () => {
    setIsSaveConfirmationOpen(false);
    goToList();
    router.replace("/documents");
  };

  const handleDeleteConfirm = () => {
    if (!activeDocumentId) {
      return;
    }

    handleRemove(activeDocumentId);
    setIsDeleteConfirmationOpen(false);
    goToList();
    router.replace("/documents");
  };

  const handleUsePreviewTemplate = () => {
    const template = previewTemplate;

    if (!template) {
      return;
    }

    setPreviewTemplate(null);
    startNewDocument(template);
  };

  const handlePrintDocument = (document: UserDocument) => {
    setExportDocument(document);
  };

  // --- Editor ---------------------------------------------------------------
  const editorTemplate = activeTemplateId ? getTemplateById(activeTemplateId) : null;

  if (mode === "editor" && editorTemplate) {
    return (
      <div className="w-full">
        <Button
          icon={<ArrowLeftIcon aria-hidden size={16} weight="bold" />}
          iconPosition="left"
          onClick={goToList}
          size="sm"
          variant="outline"
        >
          Back to documents
        </Button>

        <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
          <div className="rounded-box border border-steel-mist bg-base-100 p-6">
            <div className="border-b border-steel-mist pb-4">
              <div>
                <h3 className="font-title text-base font-bold text-nox-noir">
                  {activeDocumentId ? "Edit document" : "New document"}
                </h3>
                <p className="text-xs text-nox-noir/55">
                  {editorTemplate.name} · {editorTemplate.style.name}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              <Input
                label="Document name"
                onChange={(event) => {
                  setDraftName(event.target.value);
                }}
                placeholder="e.g. Acme service contract"
                value={draftName}
              />
              <TemplateForm
                fields={editorTemplate.fields}
                onChange={(key, value) => {
                  setDraftValues((previous) => ({ ...previous, [key]: value }));
                }}
                values={draftValues}
              />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={handleSave} type="button">
                {activeDocumentId ? "Save changes" : "Create document"}
              </Button>
              {activeDocumentId ? (
                <Button
                  icon={<TrashIcon aria-hidden size={16} weight="bold" />}
                  iconPosition="left"
                  onClick={() => setIsDeleteConfirmationOpen(true)}
                  variant="danger"
                >
                  Delete
                </Button>
              ) : null}
            </div>
          </div>

          <div className="hidden lg:sticky lg:top-2 lg:block">
            <TemplateDocument template={editorTemplate} values={draftValues} />
          </div>
        </div>

        <SidePanel
          ariaLabel="Document preview"
          description={`${editorTemplate.name} · ${editorTemplate.style.name}`}
          onClose={() => setIsEditorPreviewOpen(false)}
          open={isEditorPreviewOpen}
          title="Document preview"
        >
          <div className="min-h-full bg-app-panel p-3 sm:p-5">
            <TemplateDocument template={editorTemplate} values={draftValues} />
          </div>
        </SidePanel>

        {isEditorPreviewOpen ? null : (
          <FloatingActionButton
            className="lg:hidden"
            icon={<EyeIcon aria-hidden size={20} weight="bold" />}
            label="Preview document"
            onClick={() => setIsEditorPreviewOpen(true)}
          />
        )}

        <ConfirmDialog
          cancelLabel={null}
          confirmLabel="Continue"
          description={`"${draftValues.title?.trim() || draftName || "Document"}" has been saved successfully.`}
          dismissible={false}
          onClose={handleSavedContinue}
          onConfirm={handleSavedContinue}
          open={isSaveConfirmationOpen}
          title="Document saved"
        />

        <ConfirmDialog
          confirmLabel="Delete document"
          confirmVariant="danger"
          description={`Delete "${draftValues.title?.trim() || draftName || "this document"}"? This action cannot be undone.`}
          onClose={() => setIsDeleteConfirmationOpen(false)}
          onConfirm={handleDeleteConfirm}
          open={isDeleteConfirmationOpen}
          title="Delete document?"
        />
      </div>
    );
  }

  // --- Template picker ------------------------------------------------------
  if (mode === "picker") {
    return (
      <div className="w-full">
        <button
          className="inline-flex items-center gap-2 font-title text-sm font-semibold text-nox-noir/60 transition-colors hover:text-nox-noir"
          onClick={goToList}
          type="button"
        >
          <ArrowLeftIcon aria-hidden size={16} weight="bold" />
          Back to documents
        </button>

        <div className="mt-5 border-b border-steel-mist pb-4">
          <h3 className="font-title text-lg font-bold text-nox-noir">Choose a template</h3>
          <p className="mt-1 text-sm leading-6 text-nox-noir/60">
            Start a new document from one of your saved templates.
          </p>
        </div>

        {ownedTemplates.length === 0 ? (
          <div className="mt-6 grid place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-10 text-center">
            <p className="font-title text-base font-bold text-nox-noir">No templates yet</p>
            <p className="mt-1 max-w-sm text-sm text-nox-noir/60">
              Save a template from the marketplace, then come back to create a document from it.
            </p>
            <Link
              className="btn btn-sm btn-primary mt-5 font-title font-semibold tracking-normal"
              href="/marketplace"
            >
              Browse marketplace
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ownedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                onPreview={() => setPreviewTemplate(template)}
                saved
                template={template}
              />
            ))}
          </div>
        )}

        <TemplatePreviewDialog
          mode="library"
          onClose={() => setPreviewTemplate(null)}
          onPrint={() => window.print()}
          onUse={handleUsePreviewTemplate}
          saved
          template={previewTemplate}
        />
      </div>
    );
  }

  // --- Document list --------------------------------------------------------
  return (
    <div className="w-full">
      {documents.length === 0 ? (
        <div className="grid place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-12 text-center">
          <p className="font-title text-base font-bold text-nox-noir">No documents yet</p>
          <p className="mt-1 max-w-sm text-sm text-nox-noir/60">
            Create a document from one of your saved templates to get started.
          </p>
        </div>
      ) : (
        <DocumentList
          documents={sortedDocuments}
          onEdit={openDocument}
          onPreview={setPreviewDocument}
          onPrint={handlePrintDocument}
        />
      )}

      <TemplatePreviewDialog
        documentName={previewDocument?.values.title?.trim() || previewDocument?.name}
        mode="document"
        onClose={() => setPreviewDocument(null)}
        onDelete={() => {
          if (previewDocument) {
            handleRemove(previewDocument.id);
            setPreviewDocument(null);
          }
        }}
        onEdit={() => {
          if (previewDocument) {
            openDocument(previewDocument);
            setPreviewDocument(null);
          }
        }}
        template={previewDocument ? (getTemplateById(previewDocument.templateId) ?? null) : null}
        values={previewDocument?.values}
      />

      <DocumentExportDialog
        documentName={exportDocument?.values.title?.trim() || exportDocument?.name || "Document"}
        onClose={() => setExportDocument(null)}
        open={Boolean(exportDocument)}
        template={exportDocument ? (getTemplateById(exportDocument.templateId) ?? null) : null}
        values={exportDocument?.values}
      />

      {previewDocument || exportDocument ? null : (
        <FloatingActionButton
          icon={<PlusIcon aria-hidden size={18} weight="bold" />}
          label="New document"
          onClick={() => setMode("picker")}
        />
      )}
    </div>
  );
};
