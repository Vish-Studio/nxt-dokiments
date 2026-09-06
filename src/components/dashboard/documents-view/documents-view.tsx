"use client";

import {
  ArrowLeftIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/commons/button/button";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { FloatingActionButton } from "@/components/commons/floating-action-button/floating-action-button";
import { Input } from "@/components/commons/input/input";
import { LoadingStatus } from "@/components/commons/loading-status/loading-status";
import { SidePanel } from "@/components/commons/side-panel/side-panel";
import { TemplateCardSkeletonGrid } from "@/components/commons/template-card-skeleton/template-card-skeleton";
import { TemplateCard } from "@/components/commons/template-card/template-card";
import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { TemplateForm } from "@/components/commons/template-form/template-form";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { ClientPicker } from "@/components/dashboard/client-picker/client-picker";
import { DocumentExportDialog } from "@/components/dashboard/document-export-dialog/document-export-dialog";
import { DocumentList } from "@/components/dashboard/document-list/document-list";
import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useDocumentsQuery,
  useUpdateDocumentMutation,
} from "@/hooks/queries/use-documents";
import { useSavedTemplatesQuery } from "@/hooks/queries/use-saved-templates";
import { trackEvent } from "@/lib/analytics/track";
import {
  clientPrefillValues,
  senderPrefillValues,
  sharedContentPrefillValue,
} from "@/lib/market-place/prefill";
import { useAuthStore } from "@/stores/auth-store";
import type { MarketplaceTemplate, UserDocument } from "@/types/template";
import { snapshotToMarketplaceTemplate } from "@/types/template";

type Mode = "list" | "picker" | "editor";

const EMPTY_DOCUMENTS: UserDocument[] = [];

/** Resolves a document's own template, using its `templateSnapshot` — never a live
 * catalog lookup — so a later template edit/deactivation can't affect an existing document. */
const templateOf = (document: UserDocument): MarketplaceTemplate | null =>
  document.templateSnapshot
    ? snapshotToMarketplaceTemplate(
        document.templateSnapshot,
        document.templateId,
      )
    : null;

export const DocumentsView = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const { data: saved = [], isLoading: isSavedLoading } =
    useSavedTemplatesQuery();
  const { data: documents = EMPTY_DOCUMENTS, isLoading: isDocumentsLoading } =
    useDocumentsQuery();
  const { isPending: isCreatePending, mutate: createDocument } =
    useCreateDocumentMutation();
  const { mutate: updateDocument } = useUpdateDocumentMutation();
  const { mutate: deleteDocument } = useDeleteDocumentMutation();

  const [mode, setMode] = useState<Mode>("list");
  const [activeTemplate, setActiveTemplate] =
    useState<MarketplaceTemplate | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  // Set by the `?shared=` deep link from `/share-target`; consumed once by
  // `startNewDocument` and cleared so a later template pick in the same
  // session doesn't reapply stale shared text.
  const [sharedContent, setSharedContent] = useState("");
  const [exportDocument, setExportDocument] = useState<UserDocument | null>(
    null,
  );
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [isSaveConfirmationOpen, setIsSaveConfirmationOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] =
    useState<MarketplaceTemplate | null>(null);
  const [previewDocument, setPreviewDocument] = useState<UserDocument | null>(
    null,
  );
  const [isEditorPreviewOpen, setIsEditorPreviewOpen] = useState(false);

  const ownedTemplates = useMemo(
    () => saved.map((item) => item.template),
    [saved],
  );

  const sortedDocuments = useMemo(
    () =>
      [...documents].sort(
        (first, second) => second.createdAt - first.createdAt,
      ),
    [documents],
  );

  const goToList = () => {
    setMode("list");
    setActiveTemplate(null);
    setActiveDocumentId(null);
    setIsDeleteConfirmationOpen(false);
    setIsSaveConfirmationOpen(false);
    setIsEditorPreviewOpen(false);
  };

  const startNewDocument = useCallback(
    (template: MarketplaceTemplate) => {
      setActiveTemplate(template);
      setActiveDocumentId(null);
      setDraftName(template.name);
      // Seeds the sender block from the user's own profile — identical on every
      // document they create, so there's nothing to pick. Only on a new document:
      // `openDocument` must keep the saved values untouched.
      setDraftValues({
        ...senderPrefillValues(user, template.fields),
        ...sharedContentPrefillValue(sharedContent, template.fields),
      });
      setSharedContent("");
      setIsDeleteConfirmationOpen(false);
      setIsSaveConfirmationOpen(false);
      setIsEditorPreviewOpen(false);
      setMode("editor");
    },
    [user, sharedContent],
  );

  // Deep link from the dashboard's floating action button, or from the
  // `/share-target` redirect (which adds `&shared=`): open the template
  // picker straight away. Kept separate from the `?template=` effect below,
  // which bails out when the user owns no templates — here the picker's own
  // "No templates yet" state is exactly what we want them to land on.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (!params.get("new")) {
      return;
    }

    const shared = params.get("shared");

    // Strip the params — unconditionally, before the `?template=` check below — so
    // a refresh or a back-navigation returns to the plain list instead of
    // reopening the picker from a stale URL.
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("new");
    nextUrl.searchParams.delete("shared");
    window.history.replaceState(
      null,
      "",
      `${nextUrl.pathname}${nextUrl.search}`,
    );

    // `?template=` wins: it lands on the editor, a step past the picker.
    if (params.get("template")) {
      return;
    }

    // Deferred rather than set synchronously, matching the `?template=` effect
    // below: a setState in an effect body triggers a cascading render.
    window.setTimeout(() => {
      if (shared) {
        setSharedContent(shared);
      }
      setMode("picker");
    }, 0);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("template");

    // Wait for the session before starting the document. `useAuthStore` begins as
    // `{ status: "loading", user: null }` and is populated by `AuthProvider` in its
    // own effect, so on this deep-linked path (`/my-documents?template=…` from the
    // marketplace) that fetch races the saved-templates fetch below. Starting early
    // would hand `startNewDocument` a null user and silently skip sender prefill.
    // Safe to re-run: this effect strips `?template` from the URL before starting,
    // so the pass that happens once `status` resolves finds nothing to do.
    if (
      authStatus === "loading" ||
      !templateId ||
      ownedTemplates.length === 0
    ) {
      return;
    }

    const template = ownedTemplates.find((item) => item.id === templateId);

    if (!template) {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("template");
    window.history.replaceState(
      null,
      "",
      `${nextUrl.pathname}${nextUrl.search}`,
    );
    window.setTimeout(() => startNewDocument(template), 0);
  }, [authStatus, ownedTemplates, startNewDocument]);

  const openDocument = (document: UserDocument) => {
    setActiveTemplate(templateOf(document));
    setActiveDocumentId(document.id);
    setDraftName(document.name);
    setDraftValues(document.values);
    setIsDeleteConfirmationOpen(false);
    setIsSaveConfirmationOpen(false);
    setIsEditorPreviewOpen(false);
    setMode("editor");
  };

  const handleRemove = (documentId: string) => {
    deleteDocument(documentId);
  };

  const handleSave = () => {
    if (!activeTemplate) {
      return;
    }

    if (activeDocumentId) {
      updateDocument({
        documentId: activeDocumentId,
        patch: { name: draftName, values: draftValues },
      });
      setIsSaveConfirmationOpen(true);
      return;
    }

    createDocument(
      {
        name: draftName || "Untitled document",
        templateId: activeTemplate.id,
        values: draftValues,
      },
      {
        onSuccess: (document) => {
          setActiveDocumentId(document.id);
          setIsSaveConfirmationOpen(true);
        },
      },
    );
  };

  const handleSavedContinue = () => {
    setIsSaveConfirmationOpen(false);
    goToList();
    router.replace("/my-documents");
  };

  const handleDeleteConfirm = () => {
    if (!activeDocumentId) {
      return;
    }

    handleRemove(activeDocumentId);
    setIsDeleteConfirmationOpen(false);
    goToList();
    router.replace("/my-documents");
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
    trackEvent("pdf_export_open", {
      document_id: document.id,
      template_id: document.templateId,
    });
  };

  // --- Editor ---------------------------------------------------------------
  const editorTemplate = activeTemplate;

  if (mode === "editor" && editorTemplate) {
    return (
      <div className="w-full">
        <Button
          icon={
            <ArrowLeftIcon
              aria-hidden
              size={16}
              weight="bold"
            />
          }
          iconPosition="left"
          iconMotion="left"
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
              <ClientPicker
                fields={editorTemplate.fields}
                onSelect={(client) => {
                  setDraftValues((previous) => ({
                    ...previous,
                    ...clientPrefillValues(client, editorTemplate.fields),
                  }));
                  trackEvent("document_client_prefilled", {
                    document_type: editorTemplate.documentType,
                  });
                }}
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
              <Button
                disabled={!activeDocumentId && isCreatePending}
                onClick={handleSave}
                type="button"
              >
                {activeDocumentId
                  ? "Save changes"
                  : isCreatePending
                    ? "Creating…"
                    : "Create document"}
              </Button>
              {activeDocumentId ? (
                <Button
                  icon={
                    <TrashIcon
                      aria-hidden
                      size={16}
                      weight="bold"
                    />
                  }
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
            <TemplateDocument
              template={editorTemplate}
              values={draftValues}
            />
          </div>
        </div>

        <SidePanel
          ariaLabel="Document preview"
          description={`${editorTemplate.name} · ${editorTemplate.style.name}`}
          onClose={() => setIsEditorPreviewOpen(false)}
          open={isEditorPreviewOpen}
          title="Document preview"
          tone="purple"
        >
          <div className="min-h-full bg-app-panel p-3 sm:p-5">
            <TemplateDocument
              template={editorTemplate}
              values={draftValues}
            />
          </div>
        </SidePanel>

        {isEditorPreviewOpen ? null : (
          <FloatingActionButton
            className="lg:hidden"
            icon={
              <EyeIcon
                aria-hidden
                size={20}
                weight="bold"
              />
            }
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
          className="group inline-flex items-center gap-2 font-title text-sm font-semibold text-nox-noir/60 transition-colors hover:text-nox-noir"
          onClick={goToList}
          type="button"
        >
          <ArrowLeftIcon
            aria-hidden
            className="arrow-cta-icon"
            data-direction="left"
            size={16}
            weight="bold"
          />
          Back to documents
        </button>

        <div className="mt-5 border-b border-steel-mist pb-4">
          <h3 className="font-title text-lg font-bold text-nox-noir">
            Choose a template
          </h3>
          <p className="mt-1 text-sm leading-6 text-nox-noir/60">
            Start a new document from one of your saved templates.
          </p>
        </div>

        {isSavedLoading ? (
          <div className="mt-6 w-full">
            <LoadingStatus message="Loading your templates…" />
            <TemplateCardSkeletonGrid />
          </div>
        ) : ownedTemplates.length === 0 ? (
          <div className="mt-6 grid place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-10 text-center">
            <p className="font-title text-base font-bold text-nox-noir">
              No templates yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-nox-noir/60">
              Save a template from the marketplace, then come back to create a
              document from it.
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
          tone="purple"
        />
      </div>
    );
  }

  // --- Document list --------------------------------------------------------
  return (
    <div className="w-full">
      {isDocumentsLoading ? (
        <div className="overflow-hidden rounded-box border border-steel-mist bg-base-100">
          <LoadingStatus message="Loading your documents…" />
          <div
            aria-hidden
            className="divide-y divide-steel-mist/70 p-4"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                key={index}
              >
                <div className="skeleton size-10 shrink-0 rounded-field" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/3 rounded-field" />
                  <div className="skeleton h-3 w-1/4 rounded-field" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : documents.length === 0 ? (
        <div className="grid place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-12 text-center">
          <p className="font-title text-base font-bold text-nox-noir">
            No documents yet
          </p>
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
        documentName={
          previewDocument?.values.title?.trim() || previewDocument?.name
        }
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
        template={previewDocument ? templateOf(previewDocument) : null}
        tone="purple"
        values={previewDocument?.values}
      />

      <DocumentExportDialog
        documentName={
          exportDocument?.values.title?.trim() ||
          exportDocument?.name ||
          "Document"
        }
        onClose={() => setExportDocument(null)}
        open={Boolean(exportDocument)}
        template={exportDocument ? templateOf(exportDocument) : null}
        values={exportDocument?.values}
      />

      {previewDocument || exportDocument ? null : (
        <FloatingActionButton
          icon={
            <PlusIcon
              aria-hidden
              size={18}
              weight="bold"
            />
          }
          label="New document"
          onClick={() => setMode("picker")}
        />
      )}
    </div>
  );
};
