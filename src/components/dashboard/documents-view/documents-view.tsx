"use client";

import {
  BuildingsIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
  IdentificationCardIcon,
  PlusIcon,
  StackIcon,
  StorefrontIcon,
  TrashIcon,
  UserIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/commons/button/button";
import CollectionToolbar from "@/components/commons/collection-toolbar/collection-toolbar";
import { ConfirmDialog } from "@/components/commons/confirm-dialog/confirm-dialog";
import { DocumentPaper } from "@/components/commons/document-paper/document-paper";
import { EmptyState } from "@/components/commons/empty-state/empty-state";
import { FloatingActionButton } from "@/components/commons/floating-action-button/floating-action-button";
import { Input } from "@/components/commons/input/input";
import { SidePanel } from "@/components/commons/side-panel/side-panel";
import { LinkButton } from "@/components/commons/link-button/link-button";
import { TemplateDocument } from "@/components/commons/template-document/template-document";
import { TemplateForm } from "@/components/commons/template-form/template-form";
import { TemplatePreviewDialog } from "@/components/commons/template-preview-dialog/template-preview-dialog";
import { ClientPicker } from "@/components/dashboard/client-picker/client-picker";
import { CompanyDocumentGroups } from "@/components/dashboard/company-document-groups/company-document-groups";
import { CompanyDocumentGroupsSkeleton } from "@/components/dashboard/company-document-groups/company-document-groups-skeleton";
import { DashboardListSkeleton } from "@/components/dashboard/dashboard-list-skeleton/dashboard-list-skeleton";
import { DocumentExportDialog } from "@/components/dashboard/document-export-dialog/document-export-dialog";
import { DocumentEditorActions } from "@/components/dashboard/document-editor-actions/document-editor-actions";
import { DocumentSavedModal } from "@/components/dashboard/document-saved-modal/document-saved-modal";
import {
  DocumentList,
  documentListColumns,
  documentSkeletonRow,
} from "@/components/dashboard/document-list/document-list";
import { TemplatePicker } from "@/components/dashboard/template-picker/template-picker";
import { TemplatePickerSkeleton } from "@/components/dashboard/template-picker/template-picker-skeleton";
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
  type EntryStatus,
  entryStatusLabels,
  getDocumentCompanyName,
  getEntryStatus,
  getSharedCompanyName,
  groupEntriesByCompany,
  sortCompanyGroups,
} from "@/lib/documents/company-groups";
import { getTemplateLastUsed } from "@/lib/documents/template-picker";
import { buildDuplicateDraft } from "@/lib/documents/duplicate-draft";
import { getDocumentDetails } from "@/lib/documents/document-details";
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

/**
 * Marks the history entry pushed when the picker or editor opens, so the
 * top-bar back arrow knows it can go back through it instead of stacking a
 * second list entry.
 */
const subPageHistoryKey = "dokimentsSubPage";

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

type ListTab = "companies" | "cvs" | "mine" | "shared";

/** CVs are about the user, not a client, so they get their own tab. */
const isCvDocument = (document: UserDocument) =>
  templateOf(document)?.documentType === "cv";

/**
 * Switches tab while the URL says `?tab=shared` (the bell's link),
 * `?tab=mine` (back from a company page) or `?tab=cvs`. Reads the router's search params
 * rather than `window.location` so following the link while already on this
 * page still triggers it. Renders nothing.
 */
const ListTabLink = ({
  onOpen,
}: {
  onOpen: (tab: Exclude<ListTab, "companies">) => void;
}) => {
  const tab = useSearchParams().get("tab");

  useEffect(() => {
    if (tab === "shared" || tab === "mine" || tab === "cvs") {
      onOpen(tab);
    }
  }, [tab, onOpen]);

  return null;
};

/** "1 document" / "3 documents"; pass `plural` for irregular words. */
const pluralize = (count: number, word: string, plural = `${word}s`) =>
  `${count} ${count === 1 ? word : plural}`;

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
  // A document whose row menu asked to delete it, awaiting confirmation.
  const [deleteTarget, setDeleteTarget] = useState<UserDocument | null>(null);
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
  // documents", "Shared with me" and "CVs" are flat lists.
  const [listTab, setListTab] = useState<ListTab>("companies");
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState("all");
  const [sort, setSort] = useState("newest");
  // Companies tab only: where each document stands.
  const [status, setStatus] = useState<EntryStatus | "all">("all");
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

  // Orders each picker group by what the user reached for last.
  const templateLastUsed = useMemo(
    () => getTemplateLastUsed(documents),
    [documents],
  );

  // The picker's "For: …" chip: the client-book record when the company page
  // passed one, else the bare company name.
  const pickerContextLabel = pendingPrefill
    ? (() => {
        const client = pendingPrefill.clientId
          ? clients.find(
              (candidate) => candidate.id === pendingPrefill.clientId,
            )
          : undefined;
        return (
          client?.companyName?.trim() ||
          client?.name?.trim() ||
          pendingPrefill.companyName?.trim() ||
          undefined
        );
      })()
    : undefined;

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

  // Each own document's status for the list rows ("Awaiting signature"…).
  const documentStatuses = useMemo(
    () =>
      Object.fromEntries(
        buildCompanyEntries(documents, [], sharedByMe).map((entry) => [
          entry.document?.id ?? entry.id,
          getEntryStatus(entry),
        ]),
      ),
    [documents, sharedByMe],
  );

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
              Boolean(value && value !== "cv"),
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
        // "My documents" leaves CVs to their own tab.
        (listTab === "cvs") === isCvDocument(document) &&
        (listTab === "cvs" ||
          documentType === "all" ||
          template?.documentType === documentType) &&
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
  }, [documentType, documents, listTab, search, sort]);
  const cvCount = useMemo(
    () => documents.filter(isCvDocument).length,
    [documents],
  );

  // Both directions, grouped by company, with the same search, type filter and
  // sort as the list plus a status filter. Search also matches company names.
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
        entry.documentType !== "cv" &&
        (status === "all" || getEntryStatus(entry) === status) &&
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
    status,
  ]);

  // "Clear filters" clears search and filters; the sort is a preference, not
  // a filter, so it stays.
  const resetControls = () => {
    setSearch("");
    setDocumentType("all");
    setStatus("all");
  };
  const hasActiveFilters = Boolean(
    search || documentType !== "all" || status !== "all",
  );
  const isCompaniesTab = listTab === "companies";
  const namedCompanyCount = companyGroups.filter(
    (group) => group.name !== null,
  ).length;
  const companyDocumentCount = companyGroups.reduce(
    (total, group) => total + group.entries.length,
    0,
  );

  const showSharedTab = documentSharingEnabled && listTab === "shared";

  const toolbar = (
    <CollectionToolbar
      ariaLabel="Search, sort, and filter documents"
      appearance="compact"
      canReset={hasActiveFilters}
      // Shared with me has its own list; the controls stay (disabled) so the
      // phone header keeps the same height on every tab.
      disabled={showSharedTab}
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
      filterStyle="chips"
      filters={[
        ...(isCompaniesTab
          ? [
              {
                id: "status",
                label: "Status",
                value: status,
                defaultValue: "all",
                options: [
                  { label: "Any status", value: "all" },
                  ...(["awaiting", "signed", "not-shared"] as const).map(
                    (value) => ({ label: entryStatusLabels[value], value }),
                  ),
                  ...(documentSharingEnabled
                    ? [{ label: entryStatusLabels.received, value: "received" }]
                    : []),
                ],
                onChange: (value: string) =>
                  setStatus(
                    value === "awaiting" ||
                      value === "signed" ||
                      value === "not-shared" ||
                      value === "received"
                      ? value
                      : "all",
                  ),
              },
            ]
          : []),
        ...(listTab === "cvs"
          ? []
          : [
              {
                id: "type",
                label: "Type",
                value: documentType,
                defaultValue: "all",
                options: [
                  { label: "Any type", value: "all" },
                  ...documentTypeOptions,
                ],
                onChange: setDocumentType,
              },
            ]),
      ]}
      onReset={resetControls}
      onCollectionChange={scrollContentToTop}
      onSearch={setSearch}
      onSort={setSort}
      resultLabel={
        showSharedTab
          ? undefined
          : isCompaniesTab
            ? companyGroups.length > 0
              ? `${pluralize(namedCompanyCount, "company", "companies")} · ${pluralize(companyDocumentCount, "document")}`
              : undefined
            : listTab === "cvs"
              ? pluralize(visibleDocuments.length, "CV")
              : pluralize(visibleDocuments.length, "document")
      }
      search={search}
      searchLabel="Search documents"
      searchPlaceholder="Search documents…"
      sort={sort}
      sortOptions={
        isCompaniesTab
          ? [
              { label: "Latest activity", value: "newest" },
              { label: "Oldest activity", value: "oldest" },
              { label: "Company: A–Z", value: "name" },
            ]
          : [
              { label: "Recently created", value: "newest" },
              { label: "Oldest created", value: "oldest" },
              { label: "Name: A–Z", value: "name" },
            ]
      }
    />
  );
  const headerSearch = (
    <CollectionToolbar
      appearance="header-dark"
      ariaLabel="Search documents"
      disabled={showSharedTab}
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
    setIsSaveConfirmationOpen(false);
    setIsEmptyFieldsHighlighted(false);
    setIsEmptyFieldsDialogOpen(false);
    setIsEditorExportOpen(false);
    setIsEditorPreviewOpen(false);
  };

  // The picker and editor are sub-pages without a URL of their own. One
  // history entry is pushed on the way in, so the browser back button and the
  // phone back gesture return to the list instead of leaving My Documents.
  const isSubPage = mode !== "list";
  const onHistoryBack = useEffectEvent(() => goToList());
  useEffect(() => {
    if (!isSubPage) return;

    if (!window.history.state?.[subPageHistoryKey]) {
      // Keeps Next's own state (the router tree) so its popstate handler can
      // restore this same route rather than reload it.
      window.history.pushState(
        { ...window.history.state, [subPageHistoryKey]: true },
        "",
      );
    }

    const handlePopState = () => onHistoryBack();
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isSubPage]);

  // The top bar's back arrow. Goes back through the pushed entry when there is
  // one, so a later Back doesn't land on the same list a second time.
  const leaveSubPage = () => {
    if (window.history.state?.[subPageHistoryKey]) {
      window.history.back();
    } else {
      goToList();
    }
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
    (tab: Exclude<ListTab, "companies">) =>
      setListTab(tab === "shared" && !documentSharingEnabled ? "mine" : tab),
    [],
  );

  // Mirrors the tab into the URL so the page can remount (e.g. once auth settles)
  // without losing it, and so the bell's link changes the URL again after a manual switch.
  const selectListTab = (tab: ListTab) => {
    setListTab(tab);
    if (tab !== "companies") setStatus("all");

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
  // Always opens with the latest editor state, without re-running the effect
  // every render just because `openDocument` is a fresh function.
  const openEditTarget = useEffectEvent((document: UserDocument) =>
    openDocument(document),
  );
  useEffect(() => {
    if (!editTarget) return;

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("edit");
    window.history.replaceState(
      null,
      "",
      `${nextUrl.pathname}${nextUrl.search}`,
    );
    // Deferred like the other deep links: no setState in the effect body.
    window.setTimeout(() => openEditTarget(editTarget), 0);
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

  const handleUsePreviewTemplate = () => {
    const template = previewTemplate;

    if (!template) {
      return;
    }

    setPreviewTemplate(null);
    startNewDocument(template);
  };

  const shareDocument = (document: UserDocument) =>
    setShareTarget({
      id: document.id,
      name: document.values.title?.trim() || document.name,
      recipientEmail: document.values.toEmail,
      senderSignature: requiresSenderSignature(document.templateSnapshot)
        ? {
            value:
              senderSignatureOf(sharedByMeBySource[document.id])?.value ??
              document.values.senderSignature ??
              "",
          }
        : undefined,
      signable: isSignableDocument(document.templateSnapshot),
    });

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
          back: { label: "My Documents", onClick: leaveSubPage },
          title:
            mode === "picker"
              ? "New document"
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

    // Fills the page height, so the action bar (mt-auto) sits at the bottom
    // even when every section is collapsed.
    return (
      <div className="flex w-full flex-1 flex-col pt-6">
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
          </div>

          {/* The live page on a grey desk, so it reads as the paper being filled. */}
          <div className="hidden rounded-box bg-base-200 p-6 lg:sticky lg:top-2 lg:block">
            <DocumentPaper>
              <TemplateDocument
                density="compact"
                highlightedFields={highlightedFields}
                showPlaceholders
                template={editorTemplate}
                values={draftValues}
              />
            </DocumentPaper>
          </div>
        </div>

        <DocumentEditorActions
          className="mt-auto pt-6"
          onDownload={() => setIsEditorExportOpen(true)}
          onPreview={() => setIsEditorPreviewOpen(true)}
          onSave={() => handleSave()}
          onShare={
            activeDocumentId && documentSharingEnabled
              ? () =>
                  setShareTarget({
                    id: activeDocumentId,
                    name: draftValues.title?.trim() || draftName,
                    recipientEmail: draftValues.toEmail,
                    senderSignature: editorSenderSignature,
                    signable: isEditorSignable,
                  })
              : undefined
          }
          saveDisabled={
            !activeDocumentId && (isCreatePending || isDuplicatePending)
          }
          saveLabel={
            activeDocumentId
              ? "Save changes"
              : duplicateSource
                ? isDuplicatePending
                  ? "Duplicating…"
                  : "Duplicate document"
                : isCreatePending
                  ? "Creating…"
                  : "Create document"
          }
        />

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
          <div className="min-h-full bg-base-200 p-4 sm:p-6">
            <DocumentPaper>
              <TemplateDocument
                density="compact"
                highlightedFields={highlightedFields}
                showPlaceholders
                template={editorTemplate}
                values={draftValues}
              />
            </DocumentPaper>
          </div>
        </SidePanel>

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
      </div>
    );
  }

  // --- Template picker ------------------------------------------------------
  if (mode === "picker") {
    return (
      <div className="flex w-full flex-col pt-6">
        {isSavedLoading ? (
          <TemplatePickerSkeleton />
        ) : ownedTemplates.length === 0 ? (
          <EmptyState
            action={
              <LinkButton
                href="/marketplace"
                icon={
                  <StorefrontIcon
                    aria-hidden
                    size={iconSize.control}
                    weight="bold"
                  />
                }
                iconPosition="left"
                size="sm"
                variant="accent"
              >
                Browse marketplace
              </LinkButton>
            }
            description="Save a template from the marketplace, then come back to create a document from it."
            icon={
              <StackIcon
                aria-hidden
                size={iconSize.feature}
                weight="bold"
              />
            }
            title="No templates yet"
          />
        ) : (
          <TemplatePicker
            contextLabel={pickerContextLabel}
            lastUsed={templateLastUsed}
            onClearContext={() => setPendingPrefill(null)}
            onPreview={setPreviewTemplate}
            onUse={startNewDocument}
            templates={ownedTemplates}
          />
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

  // Grows with its content (no `min-h-0`): the pinned tabs can only stick
  // while their parent is still on screen, so it must span every card.
  return (
    <div className="flex w-full flex-1 flex-col gap-2 pt-6">
      <Suspense fallback={null}>
        <ListTabLink onOpen={openListTab} />
      </Suspense>
      {/* Phones: pinned right under the sticky page header, so the tabs stay
          while only the cards scroll. Its panel-coloured band hides the cards
          passing underneath. */}
      <TabMenu
        ariaLabel="Document lists"
        className="mb-1 max-lg:sticky max-lg:top-[var(--mobile-page-header-height,4rem)] max-lg:z-40 max-lg:-mx-4 max-lg:bg-app-panel max-lg:px-4 max-lg:pt-3 max-lg:pb-2"
        fitOnPhones
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
              <UserIcon
                aria-hidden
                size={iconSize.tab}
                weight={navIconWeight(isActive)}
              />
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
          // CVs are about the user, not a client: their own tab, shown once
          // the user has one.
          ...(cvCount > 0 || listTab === "cvs"
            ? [
                {
                  icon: (isActive: boolean) => (
                    <IdentificationCardIcon
                      aria-hidden
                      size={iconSize.tab}
                      weight={navIconWeight(isActive)}
                    />
                  ),
                  badge: <span className="text-xs opacity-70">{cvCount}</span>,
                  id: "cvs",
                  label: "CVs",
                },
              ]
            : []),
        ]}
        onChange={(id) =>
          selectListTab(
            id === "shared" || id === "mine" || id === "cvs" ? id : "companies",
          )
        }
        value={listTab}
      />
      <ResponsiveHeaderControls
        desktopContent={showSharedTab ? null : toolbar}
        desktopHeader={headerSearch}
      >
        {toolbar}
      </ResponsiveHeaderControls>
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
          <CompanyDocumentGroupsSkeleton />
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
        !hasActiveFilters ? (
        <EmptyState
          description="Create a document from one of your saved templates to get started."
          icon={
            <FileTextIcon
              aria-hidden
              size={iconSize.feature}
              weight="bold"
            />
          }
          title="No documents yet"
        />
      ) : listTab === "companies" ? (
        <CompanyDocumentGroups
          groups={companyGroups}
          onDelete={setDeleteTarget}
          onDownload={handlePrintDocument}
          onDuplicate={handleDuplicate}
          onEdit={openDocument}
          onShare={documentSharingEnabled ? shareDocument : undefined}
          onViewShared={(document) => {
            const sharedId = sharedCopyIds[document.id];
            if (sharedId) router.push(`/my-documents/shared/${sharedId}`);
          }}
          onReset={resetControls}
          onOpenEntry={(entry) => {
            if (entry.document) setPreviewDocument(entry.document);
            else if (entry.shared)
              router.push(`/my-documents/shared/${entry.shared.id}`);
          }}
        />
      ) : visibleDocuments.length === 0 ? (
        <EmptyState
          action={
            hasActiveFilters ? (
              <Button
                onClick={resetControls}
                size="sm"
                variant="outline"
              >
                Clear filters
              </Button>
            ) : undefined
          }
          description={
            hasActiveFilters
              ? "Try another search, or clear the filters to see all your documents."
              : "CVs you create from a CV template appear here."
          }
          icon={
            hasActiveFilters ? (
              <MagnifyingGlassIcon
                aria-hidden
                size={iconSize.feature}
                weight="bold"
              />
            ) : (
              <IdentificationCardIcon
                aria-hidden
                size={iconSize.feature}
                weight="bold"
              />
            )
          }
          title={hasActiveFilters ? "No documents match" : "No CVs yet"}
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
          onDelete={setDeleteTarget}
          sharedCopyIds={sharedCopyIds}
          statuses={documentStatuses}
          onShare={documentSharingEnabled ? shareDocument : undefined}
        />
      )}

      <TemplatePreviewDialog
        details={
          previewDocument
            ? getDocumentDetails(previewDocument, sharedByMe)
            : undefined
        }
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

      <ConfirmDialog
        confirmLabel="Delete document"
        confirmVariant="danger"
        description={`Delete "${deleteTarget?.values.title?.trim() || deleteTarget?.name || "this document"}"? This action cannot be undone.`}
        icon={TrashIcon}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) handleRemove(deleteTarget.id);
          setDeleteTarget(null);
        }}
        open={Boolean(deleteTarget)}
        title="Delete document?"
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
