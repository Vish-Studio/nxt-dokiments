"use client";

import {
  BuildingsIcon,
  EyeIcon,
  PlusIcon,
  ShareNetworkIcon,
  TrashIcon,
  UserListIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/commons/button/button";
import CollectionToolbar from "@/components/commons/collection-toolbar/collection-toolbar";
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
import { CompanyDocumentsGrid } from "@/components/dashboard/company-documents-grid/company-documents-grid";
import { CompanyDocumentsGridSkeleton } from "@/components/dashboard/company-documents-grid/company-documents-grid-skeleton";
import { DashboardListSkeleton } from "@/components/dashboard/dashboard-list-skeleton/dashboard-list-skeleton";
import { DocumentExportDialog } from "@/components/dashboard/document-export-dialog/document-export-dialog";
import { DocumentSavedModal } from "@/components/dashboard/document-saved-modal/document-saved-modal";
import {
  DocumentList,
  documentListColumns,
  documentSkeletonRow,
} from "@/components/dashboard/document-list/document-list";
import { ShareDialog } from "@/components/dashboard/share-dialog/share-dialog";
import { SharedCopyStatus } from "@/components/dashboard/shared-copy-status/shared-copy-status";
import { ResponsiveHeaderControls } from "@/components/dashboard/responsive-header-controls/responsive-header-controls";
import {
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useDocumentsQuery,
  useDuplicateDocumentMutation,
  useUpdateDocumentMutation,
} from "@/hooks/queries/use-documents";
import { useClientsQuery } from "@/hooks/queries/use-clients";
import { useSavedTemplatesQuery } from "@/hooks/queries/use-saved-templates";
import { usePageHeader } from "@/hooks/use-page-header";
import { useScrollContentToTopOnMobile } from "@/hooks/use-scroll-content-to-top-on-mobile";
import { trackEvent } from "@/lib/analytics/track";
import {
  buildCompanyEntries,
  type CompanyEntry,
  type CompanyGroupSort,
  getDocumentCompanyName,
  getSharedCompanyName,
  groupEntriesByCompany,
  sortCompanyGroups,
} from "@/lib/documents/company-groups";
import { buildDuplicateDraft } from "@/lib/documents/duplicate-draft";
import { getEmptyDocumentFields } from "@/lib/documents/empty-fields";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import {
  senderSignatureOf,
  withSenderSignature,
} from "@/lib/sharing/signatures";
import { activeRecipient } from "@/lib/sharing/share-activity";
import { useShareDocumentMutation } from "@/hooks/queries/use-share";
import {
  useRevokeSharedDocumentMutation,
  useSharedByMeQuery,
  useSharedDocumentsQuery,
} from "@/hooks/queries/use-shared-documents";
import { useToastStore } from "@/stores/toast-store";
import {
  SharedDocumentList,
  sharedDocumentListColumns,
  sharedDocumentSkeletonRow,
} from "@/components/dashboard/shared-document-list/shared-document-list";
import { TabMenu } from "@/components/commons/tab-menu/tab-menu";
import type { SharedDocument } from "@/types/sharing";
import {
  isSignableDocument,
  RECIPIENT_SIGNATURE_KEY,
  requiresSenderSignature,
} from "@/lib/sharing/signable";
import { documentBlueprints } from "@/lib/market-place/documents";
import {
  clientPrefillValues,
  senderPrefillValues,
  sharedContentPrefillValue,
} from "@/lib/market-place/prefill";
import { useAuthStore } from "@/stores/auth-store";
import type { Client } from "@/types/client";
import type { MarketplaceTemplate, UserDocument } from "@/types/template";
import { snapshotToMarketplaceTemplate } from "@/types/template";
import {
  getDocumentTypeLabel,
  getTemplateDisplayName,
} from "@/lib/market-place/document-labels";
import { iconSize, navIconWeight } from "@/lib/icons";

type Mode = "list" | "picker" | "editor";

const EMPTY_DOCUMENTS: UserDocument[] = [];
const EMPTY_SHARED_DOCUMENTS: SharedDocument[] = [];
const EMPTY_CLIENTS: Client[] = [];

/** Resolves a document's own template, using its `templateSnapshot` — never a live
 * catalog lookup — so a later template edit/deactivation can't affect an existing document. */
const templateOf = (document: UserDocument): MarketplaceTemplate | null =>
  document.templateSnapshot
    ? snapshotToMarketplaceTemplate(
        document.templateSnapshot,
        document.templateId,
      )
    : null;

/**
 * Switches tab while the URL says `?tab=shared` (the bell's link) or
 * `?tab=mine` (back from a company page). Reads the router's search params
 * rather than `window.location` so following the link while already on this
 * page still triggers it. Renders nothing.
 */
const ListTabLink = ({
  onOpen,
}: {
  onOpen: (tab: "mine" | "shared") => void;
}) => {
  const tab = useSearchParams().get("tab");

  useEffect(() => {
    if (tab === "shared" || tab === "mine") {
      onOpen(tab);
    }
  }, [tab, onOpen]);

  return null;
};

export const DocumentsView = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.status);
  const { data: saved = [], isLoading: isSavedLoading } =
    useSavedTemplatesQuery();
  const { data: documents = EMPTY_DOCUMENTS, isLoading: isDocumentsLoading } =
    useDocumentsQuery();
  // Same cache as My Clients and the editor's ClientPicker: matches documents
  // to client records for the "By company" view.
  const { data: clients = EMPTY_CLIENTS } = useClientsQuery();
  const { isPending: isCreatePending, mutate: createDocument } =
    useCreateDocumentMutation();
  const { isPending: isDuplicatePending, mutate: duplicateDocument } =
    useDuplicateDocumentMutation();
  const {
    data: sharedDocuments = EMPTY_SHARED_DOCUMENTS,
    isLoading: isSharedLoading,
  } = useSharedDocumentsQuery({ enabled: documentSharingEnabled });
  const { data: sharedByMe = EMPTY_SHARED_DOCUMENTS } = useSharedByMeQuery({
    enabled: documentSharingEnabled,
  });
  const showToast = useToastStore((state) => state.showToast);
  const { isPending: isResending, mutate: resendShare } =
    useShareDocumentMutation();
  const { isPending: isRevoking, mutate: revokeShare } =
    useRevokeSharedDocumentMutation();
  const { mutate: updateDocument } = useUpdateDocumentMutation();
  const { mutate: deleteDocument } = useDeleteDocumentMutation();

  const [mode, setMode] = useState<Mode>("list");
  const [activeTemplate, setActiveTemplate] =
    useState<MarketplaceTemplate | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  // The saved document an unsaved duplicate draft was started from. Nothing is
  // written until the user confirms with "Duplicate document".
  const [duplicateSource, setDuplicateSource] = useState<UserDocument | null>(
    null,
  );
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
  // Turned on by a save attempt with empty fields: the editor preview then
  // highlights them until they are filled or the editor closes.
  const [isEmptyFieldsHighlighted, setIsEmptyFieldsHighlighted] =
    useState(false);
  const [isEmptyFieldsDialogOpen, setIsEmptyFieldsDialogOpen] = useState(false);
  // The PDF export opened from the "Document saved" dialog's next step.
  const [isEditorExportOpen, setIsEditorExportOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] =
    useState<MarketplaceTemplate | null>(null);
  const [previewDocument, setPreviewDocument] = useState<UserDocument | null>(
    null,
  );
  const [isEditorPreviewOpen, setIsEditorPreviewOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<{
    id: string;
    name: string;
    recipientEmail?: string;
    senderSignature?: { value: string };
    signable: boolean;
  } | null>(null);
  // "Companies" (both directions, grouped) is the default way in; "My
  // documents" and "Shared with me" are the flat lists.
  const [listTab, setListTab] = useState<"companies" | "mine" | "shared">(
    "companies",
  );
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState("all");
  const [sort, setSort] = useState("newest");
  // Companies tab only: who created the documents shown.
  const [source, setSource] = useState<"all" | "created" | "received">("all");
  // From the company page's "New document" (`?new=1&client=` / `&company=`):
  // prefilled once a template is picked.
  const [pendingPrefill, setPendingPrefill] = useState<{
    clientId?: string;
    companyName?: string;
  } | null>(null);
  const scrollContentToTop = useScrollContentToTopOnMobile();

  const ownedTemplates = useMemo(
    () => saved.map((item) => item.template),
    [saved],
  );

  const sharedCopyIds = useMemo(
    () =>
      Object.fromEntries(
        sharedByMe.map((shared) => [shared.sourceDocumentId, shared.id]),
      ),
    [sharedByMe],
  );

  const sharedByMeBySource = useMemo(
    () =>
      Object.fromEntries(
        sharedByMe.map((shared) => [shared.sourceDocumentId, shared]),
      ),
    [sharedByMe],
  );

  /**
   * A document's values for display and export: once it has been shared, the
   * sender signature is the one recorded with the share, not the editable draft.
   */
  const valuesWithSignedSender = (document: UserDocument) => {
    const shared = sharedByMeBySource[document.id];
    return shared
      ? withSenderSignature(document.values, senderSignatureOf(shared))
      : document.values;
  };

  const activeSharedCopy = activeDocumentId
    ? sharedByMe.find((shared) => shared.sourceDocumentId === activeDocumentId)
    : undefined;

  const documentTypeOptions = useMemo(
    () =>
      [
        ...new Set(
          documents
            .map((document) => templateOf(document)?.documentType)
            .filter((value): value is keyof typeof documentBlueprints =>
              Boolean(value),
            ),
        ),
      ]
        .map((value) => ({ value, label: getDocumentTypeLabel(value) }))
        .sort((first, second) => first.label.localeCompare(second.label)),
    [documents],
  );

  const visibleDocuments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const matches = documents.filter((document) => {
      const template = templateOf(document);
      return (
        (documentType === "all" || template?.documentType === documentType) &&
        `${document.name} ${template?.name ?? ""} ${template?.style.name ?? ""}`
          .toLocaleLowerCase()
          .includes(query)
      );
    });

    return matches.sort((first, second) => {
      if (sort === "oldest") return first.createdAt - second.createdAt;
      if (sort === "name") return first.name.localeCompare(second.name);
      return second.createdAt - first.createdAt;
    });
  }, [documentType, documents, search, sort]);

  // Both directions, grouped by company, with the same search, type filter and
  // sort as the list plus a source filter. Search also matches company names.
  const companyGroups = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const entries = buildCompanyEntries(
      documents,
      documentSharingEnabled ? sharedDocuments : [],
      sharedByMe,
    ).filter((entry: CompanyEntry) => {
      const company = entry.document
        ? getDocumentCompanyName(entry.document)
        : entry.shared
          ? getSharedCompanyName(entry.shared)
          : "";
      return (
        (source === "all" || entry.source === source) &&
        (documentType === "all" || entry.documentType === documentType) &&
        `${entry.title} ${company ?? ""}`.toLocaleLowerCase().includes(query)
      );
    });

    return sortCompanyGroups(
      groupEntriesByCompany(entries, clients),
      sort as CompanyGroupSort,
    );
  }, [
    clients,
    documentType,
    documents,
    search,
    sharedByMe,
    sharedDocuments,
    sort,
    source,
  ]);

  const resetControls = () => {
    setSearch("");
    setDocumentType("all");
    setSort("newest");
    setSource("all");
  };

  const toolbar = (
    <CollectionToolbar
      ariaLabel="Search, sort, and filter documents"
      appearance="compact"
      canReset={Boolean(
        search ||
          documentType !== "all" ||
          sort !== "newest" ||
          source !== "all",
      )}
      endAction={
        <Button
          icon={
            <PlusIcon
              aria-hidden
              size={16}
              weight="bold"
            />
          }
          iconPosition="left"
          onClick={() => setMode("picker")}
          size="sm"
          variant="accent"
        >
          New document
        </Button>
      }
      filters={[
        {
          id: "type",
          label: "Document type",
          value: documentType,
          defaultValue: "all",
          options: [
            { label: "All document types", value: "all" },
            ...documentTypeOptions,
          ],
          onChange: setDocumentType,
        },
        ...(listTab === "companies" && documentSharingEnabled
          ? [
              {
                id: "source",
                label: "Source",
                value: source,
                defaultValue: "all",
                options: [
                  { label: "All documents", value: "all" },
                  { label: "Created by you", value: "created" },
                  { label: "Shared with you", value: "received" },
                ],
                onChange: (value: string) =>
                  setSource(
                    value === "created" || value === "received" ? value : "all",
                  ),
              },
            ]
          : []),
      ]}
      onReset={resetControls}
      onCollectionChange={scrollContentToTop}
      onSearch={setSearch}
      onSort={setSort}
      resultLabel={
        listTab === "companies" && companyGroups.length > 0
          ? `${companyGroups.filter((group) => group.name !== null).length} companies · ${companyGroups.reduce((total, group) => total + group.entries.length, 0)} documents`
          : undefined
      }
      search={search}
      searchLabel="Search documents"
      searchPlaceholder="Search documents…"
      sort={sort}
      sortOptions={[
        { label: "Recently created", value: "newest" },
        { label: "Oldest created", value: "oldest" },
        { label: "Name: A–Z", value: "name" },
      ]}
    />
  );
  const headerSearch = (
    <CollectionToolbar
      appearance="header-dark"
      ariaLabel="Search documents"
      layout="header-search"
      onReset={resetControls}
      onCollectionChange={scrollContentToTop}
      onSearch={setSearch}
      onSort={setSort}
      search={search}
      searchLabel="Search documents"
      searchPlaceholder="Search documents…"
      sort={sort}
      sortOptions={[]}
    />
  );

  const goToList = () => {
    setMode("list");
    setPendingPrefill(null);
    setActiveTemplate(null);
    setActiveDocumentId(null);
    setDuplicateSource(null);
    setIsDeleteConfirmationOpen(false);
    setIsSaveConfirmationOpen(false);
    setIsEmptyFieldsHighlighted(false);
    setIsEmptyFieldsDialogOpen(false);
    setIsEditorExportOpen(false);
    setIsEditorPreviewOpen(false);
  };

  // The client details for a document started from a company page: the
  // client-book record when there is one, else just the company's name.
  const prefillForCompany = useCallback(
    (template: MarketplaceTemplate): Record<string, string> => {
      const client = pendingPrefill?.clientId
        ? clients.find((candidate) => candidate.id === pendingPrefill.clientId)
        : undefined;
      if (client) return clientPrefillValues(client, template.fields);

      const name = pendingPrefill?.companyName?.trim();
      const key = template.fields.find((field) =>
        ["toName", "partyTwo"].includes(field.key),
      )?.key;
      return name && key ? { [key]: name } : {};
    },
    [clients, pendingPrefill],
  );

  const startNewDocument = useCallback(
    (template: MarketplaceTemplate) => {
      setActiveTemplate(template);
      setActiveDocumentId(null);
      setDuplicateSource(null);
      setDraftName(getTemplateDisplayName(template));
      // Seeds the sender block from the user's own profile — identical on every
      // document they create, so there's nothing to pick. Only on a new document:
      // `openDocument` must keep the saved values untouched.
      setDraftValues({
        ...senderPrefillValues(user, template.fields),
        ...sharedContentPrefillValue(sharedContent, template.fields),
        ...prefillForCompany(template),
      });
      setSharedContent("");
      setPendingPrefill(null);
      setIsDeleteConfirmationOpen(false);
      setIsSaveConfirmationOpen(false);
      setIsEmptyFieldsHighlighted(false);
      setIsEmptyFieldsDialogOpen(false);
      setIsEditorExportOpen(false);
      setIsEditorPreviewOpen(false);
      setMode("editor");
    },
    [user, sharedContent, prefillForCompany],
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
    const clientId = params.get("client");
    const companyName = params.get("company");

    // Strip the params — unconditionally, before the `?template=` check below — so
    // a refresh or a back-navigation returns to the plain list instead of
    // reopening the picker from a stale URL.
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("new");
    nextUrl.searchParams.delete("shared");
    nextUrl.searchParams.delete("client");
    nextUrl.searchParams.delete("company");
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
      if (clientId || companyName) {
        setPendingPrefill({
          clientId: clientId ?? undefined,
          companyName: companyName ?? undefined,
        });
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

  const openListTab = useCallback(
    (tab: "mine" | "shared") =>
      setListTab(tab === "shared" && !documentSharingEnabled ? "mine" : tab),
    [],
  );

  // Mirrors the tab into the URL so the page can remount (e.g. once auth settles)
  // without losing it, and so the bell's link changes the URL again after a manual switch.
  const selectListTab = (tab: "companies" | "mine" | "shared") => {
    setListTab(tab);
    if (tab !== "companies") setSource("all");

    const nextUrl = new URL(window.location.href);
    if (tab === "companies") {
      nextUrl.searchParams.delete("tab");
    } else {
      nextUrl.searchParams.set("tab", tab);
    }
    window.history.replaceState(
      null,
      "",
      `${nextUrl.pathname}${nextUrl.search}`,
    );
  };

  const openDocument = (document: UserDocument) => {
    setActiveTemplate(templateOf(document));
    setActiveDocumentId(document.id);
    setDuplicateSource(null);
    setDraftName(document.name);
    setDraftValues(valuesWithSignedSender(document));
    setIsDeleteConfirmationOpen(false);
    setIsSaveConfirmationOpen(false);
    setIsEmptyFieldsHighlighted(false);
    setIsEmptyFieldsDialogOpen(false);
    setIsEditorExportOpen(false);
    setIsEditorPreviewOpen(false);
    setMode("editor");
  };

  // Deep link from a company page's "Edit": `/my-documents?edit=<id>`. Waits
  // for the documents, then strips the param so a refresh returns to the list.
  const editId =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("edit");
  const editTarget = editId
    ? documents.find((document) => document.id === editId)
    : undefined;
  useEffect(() => {
    if (!editTarget) return;

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("edit");
    window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}`);
    // Deferred like the other deep links: no setState in the effect body.
    window.setTimeout(() => openDocument(editTarget), 0);
  }, [editTarget]);

  // Opens the editor on an unsaved copy. No request is made here, so leaving
  // the editor discards the draft and nothing is created behind the user's back.
  const handleDuplicate = (document: UserDocument) => {
    const template = templateOf(document);

    if (!template) {
      return;
    }

    const draft = buildDuplicateDraft(document);

    setActiveTemplate(template);
    setActiveDocumentId(null);
    setDuplicateSource(document);
    setDraftName(draft.name);
    setDraftValues(draft.values);
    setIsDeleteConfirmationOpen(false);
    setIsSaveConfirmationOpen(false);
    setIsEmptyFieldsHighlighted(false);
    setIsEmptyFieldsDialogOpen(false);
    setIsEditorExportOpen(false);
    setIsEditorPreviewOpen(false);
    setMode("editor");
  };

  const handleRemove = (documentId: string) => {
    deleteDocument(documentId);
  };

  /**
   * Saves the draft. With empty required fields it first highlights them in the
   * preview, shows a warning toast and asks to "Save anyway" or "Fix document";
   * `force` is that "Save anyway" answer. Empty fields are saved blank.
   */
  const handleSave = (force = false) => {
    if (!activeTemplate) {
      return;
    }

    const emptyFields = getEmptyDocumentFields(
      activeTemplate.fields,
      draftValues,
    );

    if (!force && emptyFields.length > 0) {
      setIsEmptyFieldsHighlighted(true);
      setIsEmptyFieldsDialogOpen(true);
      showToast({
        message:
          emptyFields.length === 1
            ? "1 field is still empty. It's highlighted in the preview."
            : `${emptyFields.length} fields are still empty. They're highlighted in the preview.`,
        tone: "warning",
      });
      return;
    }

    setIsEmptyFieldsDialogOpen(false);

    if (activeDocumentId) {
      updateDocument({
        documentId: activeDocumentId,
        patch: { name: draftName, values: draftValues },
      });
      setIsSaveConfirmationOpen(true);
      return;
    }

    if (duplicateSource) {
      if (isDuplicatePending) {
        return;
      }

      duplicateDocument(
        {
          documentId: duplicateSource.id,
          name: draftName || "Untitled document",
          values: draftValues,
        },
        {
          onError: (error) =>
            showToast({
              message: error.message || "Unable to duplicate this document.",
              tone: "error",
            }),
          onSuccess: (document) => {
            setActiveDocumentId(document.id);
            setDuplicateSource(null);
            setIsSaveConfirmationOpen(true);
          },
        },
      );
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

  // The editor and template picker are sub-pages of My Documents: the top bar
  // shows a back arrow and their title instead of a button in the content.
  usePageHeader(
    mode === "list"
      ? null
      : {
          back: { label: "My Documents", onClick: goToList },
          title:
            mode === "picker"
              ? "Choose a template"
              : activeDocumentId
                ? "Edit document"
                : duplicateSource
                  ? "Duplicate document"
                  : "New document",
        },
  );

  // --- Editor ---------------------------------------------------------------
  const editorTemplate = activeTemplate;

  if (mode === "editor" && editorTemplate) {
    const emptyEditorFields = getEmptyDocumentFields(
      editorTemplate.fields,
      draftValues,
    );
    // Recomputed from the live draft, so a field loses its highlight as soon
    // as it is filled in.
    const highlightedFields = isEmptyFieldsHighlighted
      ? new Set(emptyEditorFields.map((field) => field.key))
      : undefined;

    const isEditorSignable = isSignableDocument(editorTemplate);
    const editorSenderSignature = requiresSenderSignature(editorTemplate)
      ? { value: draftValues.senderSignature ?? "" }
      : undefined;
    // Where the owner follows the share: in place of the recipient signature
    // when the document has one, below the form for a view-only share.
    const sharedCopyStatus = activeSharedCopy ? (
      <SharedCopyStatus
        document={activeSharedCopy}
        isResending={isResending}
        isRevoking={isRevoking}
        onResend={() => {
          const email = activeRecipient(activeSharedCopy)?.email;
          if (!email) {
            return;
          }
          resendShare(
            {
              documentId: activeSharedCopy.sourceDocumentId,
              email,
            },
            {
              onError: (error) =>
                showToast({
                  message: error.message,
                  tone: "error",
                }),
              onSuccess: () =>
                showToast({
                  message: `Email sent to ${email}.`,
                  tone: "success",
                }),
            },
          );
        }}
        onRevoke={() =>
          revokeShare(activeSharedCopy.id, {
            onError: (error) =>
              showToast({
                message: error.message,
                tone: "error",
              }),
            onSuccess: () =>
              showToast({
                message: "Access revoked.",
                tone: "success",
              }),
          })
        }
        label={
          isEditorSignable
            ? (editorTemplate.fields.find(
                (field) => field.key === RECIPIENT_SIGNATURE_KEY,
              )?.label ?? "Recipient signature")
            : "Sharing"
        }
        onView={() =>
          router.push(`/my-documents/shared/${activeSharedCopy.id}`)
        }
        signable={isEditorSignable}
      />
    ) : null;

    return (
      <div className="w-full pt-6">
        <div className="grid items-start gap-4 lg:grid-cols-2">
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
              <TemplateForm
                documentNameField={
                  <Input
                    label="Document name"
                    onChange={(event) => {
                      setDraftName(event.target.value);
                    }}
                    placeholder="e.g. Acme service contract"
                    value={draftName}
                  />
                }
                recipientPicker={
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
                }
                fieldSlots={
                  activeSharedCopy && isEditorSignable
                    ? { [RECIPIENT_SIGNATURE_KEY]: sharedCopyStatus }
                    : undefined
                }
                fields={editorTemplate.fields}
                onChange={(key, value) => {
                  setDraftValues((previous) => ({ ...previous, [key]: value }));
                }}
                values={draftValues}
              />
              {isEditorSignable ? null : sharedCopyStatus}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button
                disabled={
                  !activeDocumentId && (isCreatePending || isDuplicatePending)
                }
                onClick={() => handleSave()}
                type="button"
                variant="accent"
              >
                {activeDocumentId
                  ? "Save changes"
                  : duplicateSource
                    ? isDuplicatePending
                      ? "Duplicating…"
                      : "Duplicate document"
                    : isCreatePending
                      ? "Creating…"
                      : "Create document"}
              </Button>
              {activeDocumentId && documentSharingEnabled ? (
                <Button
                  icon={
                    <ShareNetworkIcon
                      aria-hidden
                      size={16}
                      weight="bold"
                    />
                  }
                  iconPosition="left"
                  onClick={() =>
                    setShareTarget({
                      id: activeDocumentId,
                      name: draftValues.title?.trim() || draftName,
                      recipientEmail: draftValues.toEmail,
                      senderSignature: editorSenderSignature,
                      signable: isEditorSignable,
                    })
                  }
                  variant="outline"
                >
                  Share
                </Button>
              ) : null}
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
              density="compact"
              highlightedFields={highlightedFields}
              showPlaceholders
              template={editorTemplate}
              values={draftValues}
            />
          </div>
        </div>

        <ShareDialog
          document={shareTarget ?? { id: "", name: "" }}
          onClose={() => setShareTarget(null)}
          open={Boolean(shareTarget)}
        />

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
              density="compact"
              highlightedFields={highlightedFields}
              showPlaceholders
              template={editorTemplate}
              values={draftValues}
            />
          </div>
        </SidePanel>

        {isEditorPreviewOpen || isEditorExportOpen ? null : (
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
          cancelLabel="Fix document"
          confirmLabel="Save anyway"
          description="If you save now, these fields stay blank in the document. They're highlighted in yellow in the preview."
          onClose={() => setIsEmptyFieldsDialogOpen(false)}
          onConfirm={() => handleSave(true)}
          open={isEmptyFieldsDialogOpen}
          title="Some fields are empty"
          tone="warning"
        >
          <ul
            aria-label="Empty fields"
            className="flex flex-wrap gap-2"
          >
            {emptyEditorFields.map((field) => (
              <li
                className="rounded-field bg-golden-harvest/30 px-2.5 py-1 text-xs font-semibold text-nox-noir"
                key={field.key}
              >
                {field.label}
              </li>
            ))}
          </ul>
        </ConfirmDialog>

        <DocumentSavedModal
          documentName={draftValues.title?.trim() || draftName || "Document"}
          onClose={() => setIsSaveConfirmationOpen(false)}
          onDone={handleSavedContinue}
          onDownload={() => {
            setIsSaveConfirmationOpen(false);
            setIsEditorExportOpen(true);
          }}
          onShare={
            activeDocumentId && documentSharingEnabled
              ? () => {
                  setIsSaveConfirmationOpen(false);
                  setShareTarget({
                    id: activeDocumentId,
                    name: draftValues.title?.trim() || draftName,
                    recipientEmail: draftValues.toEmail,
                    senderSignature: editorSenderSignature,
                    signable: isEditorSignable,
                  });
                }
              : undefined
          }
          open={isSaveConfirmationOpen}
        />

        <DocumentExportDialog
          documentName={draftValues.title?.trim() || draftName || "Document"}
          onClose={() => setIsEditorExportOpen(false)}
          open={isEditorExportOpen}
          template={editorTemplate}
          values={draftValues}
        />

        <ConfirmDialog
          confirmLabel="Delete document"
          confirmVariant="danger"
          icon={TrashIcon}
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
      <div className="w-full pt-6">
        <div className="border-b border-steel-mist pb-4">
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
  const showSharedTab = documentSharingEnabled && listTab === "shared";

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-2 pt-6">
      <Suspense fallback={null}>
        <ListTabLink onOpen={openListTab} />
      </Suspense>
      <TabMenu
        ariaLabel="Document lists"
        className="mb-1"
        items={[
          {
            icon: (isActive: boolean) => (
              <BuildingsIcon
                aria-hidden
                size={iconSize.tab}
                weight={navIconWeight(isActive)}
              />
            ),
            id: "companies",
            label: "Companies",
          },
          {
            icon: (isActive: boolean) => (
              // Optical correction: Phosphor's one-person glyph fills ~13px of
              // its box while the two-person glyph beside it fills ~10px, so
              // it is drawn 3px smaller inside the same tab-size slot to look
              // equal and keep the label spacing identical.
              <span className="inline-flex size-4 items-center justify-center">
                <UserListIcon
                  aria-hidden
                  size={iconSize.tab - 3}
                  weight={navIconWeight(isActive)}
                />
              </span>
            ),
            id: "mine",
            label: "My documents",
          },
          ...(documentSharingEnabled
            ? [
                {
                  icon: (isActive: boolean) => (
                    <UsersThreeIcon
                      aria-hidden
                      size={iconSize.tab}
                      weight={navIconWeight(isActive)}
                    />
                  ),
                  badge:
                    sharedDocuments.length > 0 ? (
                      <span className="text-xs opacity-70">
                        {sharedDocuments.length}
                      </span>
                    ) : undefined,
                  id: "shared",
                  label: "Shared with me",
                },
              ]
            : []),
        ]}
        onChange={(id) =>
          selectListTab(
            id === "shared" ? "shared" : id === "mine" ? "mine" : "companies",
          )
        }
        value={listTab}
      />
      {showSharedTab ? null : (
        <ResponsiveHeaderControls
          desktopContent={toolbar}
          desktopHeader={headerSearch}
        >
          {toolbar}
        </ResponsiveHeaderControls>
      )}
      {showSharedTab ? (
        isSharedLoading ? (
          <DashboardListSkeleton
            columns={sharedDocumentListColumns}
            message="Loading documents shared with you…"
            ordered
            row={sharedDocumentSkeletonRow}
          />
        ) : (
          <SharedDocumentList
            documents={sharedDocuments}
            onOpen={(shared) =>
              router.push(`/my-documents/shared/${shared.id}`)
            }
            userEmail={user?.email}
          />
        )
      ) : isDocumentsLoading ? (
        listTab === "companies" ? (
          <CompanyDocumentsGridSkeleton />
        ) : (
          <DashboardListSkeleton
            columns={documentListColumns}
            message="Loading your documents…"
            ordered
            row={documentSkeletonRow}
          />
        )
      ) : documents.length === 0 &&
        (listTab === "mine" || companyGroups.length === 0) &&
        !(search || documentType !== "all" || source !== "all") ? (
        <div className="grid min-h-72 w-full place-items-center rounded-box border border-dashed border-steel-mist bg-base-100 p-12 text-center">
          <p className="font-title text-base font-bold text-nox-noir">
            No documents yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-nox-noir/60">
            Create a document from one of your saved templates to get started.
          </p>
        </div>
      ) : listTab === "companies" ? (
        <CompanyDocumentsGrid
          groups={companyGroups}
          onOpenEntry={(entry) => {
            if (entry.document) setPreviewDocument(entry.document);
            else if (entry.shared)
              router.push(`/my-documents/shared/${entry.shared.id}`);
          }}
        />
      ) : (
        <DocumentList
          documents={visibleDocuments}
          onDuplicate={handleDuplicate}
          onEdit={openDocument}
          onPreview={setPreviewDocument}
          onPrint={handlePrintDocument}
          onViewShared={(sharedId) =>
            router.push(`/my-documents/shared/${sharedId}`)
          }
          sharedCopyIds={sharedCopyIds}
          onShare={
            documentSharingEnabled
              ? (document) =>
                  setShareTarget({
                    id: document.id,
                    name: document.values.title?.trim() || document.name,
                    recipientEmail: document.values.toEmail,
                    senderSignature: requiresSenderSignature(
                      document.templateSnapshot,
                    )
                      ? {
                          value:
                            senderSignatureOf(sharedByMeBySource[document.id])
                              ?.value ??
                            document.values.senderSignature ??
                            "",
                        }
                      : undefined,
                    signable: isSignableDocument(document.templateSnapshot),
                  })
              : undefined
          }
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
        values={
          previewDocument ? valuesWithSignedSender(previewDocument) : undefined
        }
      />

      <ShareDialog
        document={shareTarget ?? { id: "", name: "" }}
        onClose={() => setShareTarget(null)}
        open={Boolean(shareTarget)}
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
        values={
          exportDocument ? valuesWithSignedSender(exportDocument) : undefined
        }
      />

      {previewDocument || exportDocument ? null : (
        <FloatingActionButton
          className="lg:hidden"
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
