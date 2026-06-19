"use client";

import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/button/button";
import { ButtonIcon } from "@/components/button-icon/button-icon";
import { Input } from "@/components/input/input";
import { TemplateDocument } from "@/components/template-document/template-document";
import { TemplateForm } from "@/components/template-form/template-form";
import { TemplateThumbnail } from "@/components/template-thumbnail/template-thumbnail";
import { getTemplateById } from "@/lib/market-place";
import { useAuthStore } from "@/stores/auth-store";
import { useDocumentsStore, useUserDocuments } from "@/stores/documents-store";
import { useSavedTemplates } from "@/stores/templates-store";
import type { MarketplaceTemplate, UserDocument } from "@/types/template";

type Mode = "list" | "picker" | "editor";

export const DocumentsView = () => {
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
  const [isSavedFlash, setIsSavedFlash] = useState(false);

  const ownedTemplates = saved
    .map((item) => getTemplateById(item.templateId))
    .filter((template): template is MarketplaceTemplate => Boolean(template));

  const goToList = () => {
    setMode("list");
    setActiveTemplateId(null);
    setActiveDocumentId(null);
    setIsSavedFlash(false);
  };

  const startNewDocument = (template: MarketplaceTemplate) => {
    setActiveTemplateId(template.id);
    setActiveDocumentId(null);
    setDraftName(template.name);
    setDraftValues({});
    setIsSavedFlash(false);
    setMode("editor");
  };

  const openDocument = (document: UserDocument) => {
    setActiveTemplateId(document.templateId);
    setActiveDocumentId(document.id);
    setDraftName(document.name);
    setDraftValues(document.values);
    setIsSavedFlash(false);
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

    setIsSavedFlash(true);
  };

  // --- Editor ---------------------------------------------------------------
  const editorTemplate = activeTemplateId ? getTemplateById(activeTemplateId) : null;

  if (mode === "editor" && editorTemplate) {
    return (
      <div className="w-full">
        <button
          className="inline-flex items-center gap-2 font-title text-sm font-semibold text-nox-noir/60 transition-colors hover:text-bloodwood-deep"
          onClick={goToList}
          type="button"
        >
          <ArrowLeftIcon aria-hidden size={16} weight="bold" />
          Back to documents
        </button>

        <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
          <div className="rounded-box border border-steel-mist bg-base-100 p-6">
            <div className="flex items-center justify-between gap-3 border-b border-steel-mist pb-4">
              <div>
                <h3 className="font-title text-base font-bold text-nox-noir">
                  {activeDocumentId ? "Edit document" : "New document"}
                </h3>
                <p className="text-xs text-nox-noir/55">
                  {editorTemplate.name} · {editorTemplate.style.name}
                </p>
              </div>
              {activeDocumentId ? (
                <Button
                  icon={<TrashIcon aria-hidden size={16} weight="bold" />}
                  iconPosition="left"
                  onClick={() => {
                    handleRemove(activeDocumentId);
                    goToList();
                  }}
                  size="sm"
                  variant="outline"
                >
                  Delete
                </Button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-5">
              <Input
                label="Document name"
                onChange={(event) => {
                  setDraftName(event.target.value);
                  setIsSavedFlash(false);
                }}
                placeholder="e.g. Acme service contract"
                value={draftName}
              />
              <TemplateForm
                fields={editorTemplate.fields}
                onChange={(key, value) => {
                  setDraftValues((previous) => ({ ...previous, [key]: value }));
                  setIsSavedFlash(false);
                }}
                values={draftValues}
              />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={handleSave} type="button">
                {activeDocumentId ? "Save changes" : "Create document"}
              </Button>
              {isSavedFlash ? <span className="text-sm font-medium text-success">Saved.</span> : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-2">
            <TemplateDocument template={editorTemplate} values={draftValues} />
          </div>
        </div>
      </div>
    );
  }

  // --- Template picker ------------------------------------------------------
  if (mode === "picker") {
    return (
      <div className="w-full">
        <button
          className="inline-flex items-center gap-2 font-title text-sm font-semibold text-nox-noir/60 transition-colors hover:text-bloodwood-deep"
          onClick={goToList}
          type="button"
        >
          <ArrowLeftIcon aria-hidden size={16} weight="bold" />
          Back to documents
        </button>

        <div className="mt-5 border-b border-steel-mist pb-4">
          <h3 className="font-title text-lg font-bold text-bloodwood-deep">Choose a template</h3>
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
              <article
                className="flex flex-col rounded-box border border-steel-mist bg-base-100 p-4"
                key={template.id}
              >
                <TemplateThumbnail template={template} />
                <h4 className="mt-4 font-title text-base font-bold text-nox-noir">
                  {template.name}
                </h4>
                <p className="text-xs text-nox-noir/55">{template.style.name}</p>
                <Button
                  className="mt-4"
                  onClick={() => startNewDocument(template)}
                  size="sm"
                >
                  Use this template
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Document list --------------------------------------------------------
  return (
    <div className="w-full">
      <div className="flex justify-end">
        <Button
          icon={<PlusIcon aria-hidden size={16} weight="bold" />}
          iconPosition="left"
          onClick={() => setMode("picker")}
          size="sm"
        >
          New document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="mt-6 grid place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-12 text-center">
          <p className="font-title text-base font-bold text-nox-noir">No documents yet</p>
          <p className="mt-1 max-w-sm text-sm text-nox-noir/60">
            Create a document from one of your saved templates to get started.
          </p>
          <Button className="mt-5" onClick={() => setMode("picker")} size="sm">
            New document
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => {
            const template = getTemplateById(document.templateId);

            if (!template) {
              return null;
            }

            return (
              <article
                className="flex flex-col rounded-box border border-steel-mist bg-base-100 p-4"
                key={document.id}
              >
                <TemplateThumbnail template={template} values={document.values} />

                <div className="mt-4 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="truncate font-title text-base font-bold text-nox-noir">
                      {document.name}
                    </h4>
                    <p className="text-xs text-nox-noir/55">{template.name}</p>
                  </div>
                  <ButtonIcon
                    aria-label={`Delete ${document.name}`}
                    icon={<TrashIcon aria-hidden size={16} weight="bold" />}
                    onClick={() => handleRemove(document.id)}
                    shape="square"
                    size="sm"
                    variant="outline"
                  />
                </div>

                <Button className="mt-4" onClick={() => openDocument(document)} size="sm">
                  Open
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
