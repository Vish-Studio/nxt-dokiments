import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { documentSharingEnabled } from "@/lib/sharing/feature-flag";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import type { Client } from "@/types/client";
import type { TemplateSnapshot, UserDocument } from "@/types/template";

import { DocumentsView } from "../documents-view";

const toSnapshot = (templateId: string): TemplateSnapshot => {
  const template = getTemplateById(templateId);
  if (!template) throw new Error(`Unknown fixture template: ${templateId}`);
  return {
    description: template.description,
    documentType: template.documentType,
    fields: template.fields,
    name: template.name,
    style: template.style,
  };
};

/** The client the editor's `ClientPicker` offers, for prefill assertions. */
const northlineClient: Client = {
  address: "24 Market Street, Ebene",
  brn: "C09876543",
  companyName: "Northline Studio",
  createdAt: 1_755_000_000_000,
  email: "accounts@northline.com",
  id: "client_northline_01",
  name: "Maya Chen",
  nationalId: "",
  phone: "+230 5 987 6543",
  updatedAt: 1_755_000_000_000,
};

/**
 * Mocks `GET /api/saved-templates`, `GET /api/clients` and the full
 * `/api/documents` CRUD surface (`GET`/`POST`/`PATCH`/`DELETE`) so
 * `DocumentsView`'s queries and mutations all resolve against in-memory fixture
 * data, dispatching on request URL/method.
 */
/** Clients a story's "Save client" sent to `POST /api/clients`, newest last. */
const createdClients: Array<Record<string, string>> = [];

const mockDocumentsApi = (
  initialDocuments: UserDocument[],
  clients: Client[] = [northlineClient],
) => {
  let documents = initialDocuments;
  createdClients.length = 0;

  window.fetch = (async (url: string, init?: RequestInit) => {
    if (url.includes("/api/clients") && init?.method === "POST") {
      const input = JSON.parse((init.body as string) ?? "{}");
      createdClients.push(input);
      return new Response(
        JSON.stringify({
          client: { ...input, createdAt: 1, id: "client_new", updatedAt: 1 },
        }),
        { status: 201 },
      );
    }
    // Must precede the /api/documents handling below: the editor renders
    // `ClientPicker`, so this request fires as soon as the editor mounts.
    if (url.includes("/api/clients")) {
      return new Response(JSON.stringify({ clients }), { status: 200 });
    }

    if (url.includes("/api/saved-templates")) {
      return new Response(
        JSON.stringify({
          savedTemplates: [
            {
              savedAt: Date.now(),
              template: getTemplateById("classic-invoice"),
              templateId: "classic-invoice",
            },
          ],
        }),
        { status: 200 },
      );
    }

    const method = init?.method ?? "GET";
    const idMatch = /\/api\/documents\/([^/?]+)/.exec(url);

    if (method === "GET" && !idMatch) {
      return new Response(JSON.stringify({ documents }), { status: 200 });
    }

    if (method === "POST" && idMatch && url.endsWith("/duplicate")) {
      const source = documents.find((document) => document.id === idMatch[1]);
      if (!source?.templateSnapshot) {
        return new Response(JSON.stringify({ error: "Document not found." }), {
          status: 404,
        });
      }
      const body = JSON.parse((init?.body as string) ?? "{}") as {
        name: string;
        values: Record<string, string>;
      };
      const now = Date.now();
      const copy: UserDocument = {
        ...source,
        createdAt: now,
        id: `doc-copy-${now}`,
        name: body.name,
        updatedAt: now,
        values: body.values,
      };
      documents = [...documents, copy];
      return new Response(JSON.stringify({ document: copy }), { status: 201 });
    }

    if (method === "POST") {
      const body = JSON.parse((init?.body as string) ?? "{}") as {
        name: string;
        templateId: string;
        values: Record<string, string>;
      };
      const now = Date.now();
      const created: UserDocument = {
        createdAt: now,
        id: `doc-${now}`,
        name: body.name,
        templateId: body.templateId,
        templateSnapshot: toSnapshot(body.templateId),
        updatedAt: now,
        values: body.values,
      };
      documents = [...documents, created];
      return new Response(JSON.stringify({ document: created }), {
        status: 201,
      });
    }

    if (method === "PATCH" && idMatch) {
      const patch = JSON.parse(
        (init?.body as string) ?? "{}",
      ) as Partial<UserDocument>;
      documents = documents.map((document) =>
        document.id === idMatch[1]
          ? { ...document, ...patch, updatedAt: Date.now() }
          : document,
      );
      const updated = documents.find((document) => document.id === idMatch[1]);
      return new Response(JSON.stringify({ document: updated }), {
        status: 200,
      });
    }

    if (method === "DELETE" && idMatch) {
      documents = documents.filter((document) => document.id !== idMatch[1]);
      return new Response(null, { status: 204 });
    }

    return new Response(JSON.stringify({ error: "Unhandled in story mock" }), {
      status: 500,
    });
  }) as typeof window.fetch;
};

const seedUser = () => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      // `address`/`companyName` are what `senderPrefillValues` reads to seed a new
      // document's From block. They don't affect the edit-an-existing-document
      // stories below, which load saved values rather than prefilling.
      address: "12 Studio Lane, Port Louis",
      companyName: "Dokiments Studio",
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.com",
      provider: "password",
      role: "silver",
      uid: "story-uid",
    },
  });
};

/** These stories exercise the flat list, which sits on the "My documents" tab. */
const showAllDocuments = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    await within(canvasElement).findByRole("tab", { name: "My documents" }),
  );
};

const meta = {
  title: "Dashboard/Documents View",
  component: DocumentsView,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <div className="min-h-screen bg-app-panel p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof DocumentsView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Rows keep their actions in the ⋮ menu (a popover on desktop, a sheet on
 * phones): opens the menu for `title` and clicks `action`.
 */
const openRowAction = async (
  canvasElement: HTMLElement,
  title: string,
  action: string,
) => {
  const canvas = within(canvasElement);
  await userEvent.click(
    await canvas.findByRole("button", { name: `More actions for ${title}` }),
  );
  await userEvent.click(
    await within(canvasElement.ownerDocument.body).findByRole("button", {
      name: action,
    }),
  );
};

export const Empty: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockDocumentsApi([]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText(/no documents yet/i)).toBeVisible();
    await expect(
      (await canvas.findAllByRole("button", { name: /new document/i })).length,
    ).toBeGreaterThan(0);
  },
};

/** Mocks a request that never resolves so both queries stay `isLoading` and the document-list skeleton renders. */
const mockDocumentsApiLoading = () => {
  window.fetch = (async () =>
    new Promise<Response>(() => {})) as typeof window.fetch;
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockDocumentsApiLoading();
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("status", { name: /loading your documents/i }),
    ).toBeInTheDocument();
  },
};

const withDocumentsFixture: UserDocument[] = [
  {
    createdAt: new Date("2026-06-18T09:30:00Z").getTime(),
    id: "doc-1",
    name: "March Invoice",
    templateId: "classic-invoice",
    templateSnapshot: toSnapshot("classic-invoice"),
    updatedAt: new Date("2026-06-18T09:30:00Z").getTime(),
    values: { invoiceNumber: "INV-0042", title: "Lumina Events Invoice" },
  },
  {
    createdAt: new Date("2026-06-12T11:00:00Z").getTime(),
    id: "doc-2",
    name: "Client Service Agreement",
    templateId: "classic-contract",
    templateSnapshot: toSnapshot("classic-contract"),
    updatedAt: new Date("2026-06-12T11:00:00Z").getTime(),
    values: {},
  },
];

export const WithDocuments: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockDocumentsApi(withDocumentsFixture);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    await showAllDocuments(canvasElement);
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Lumina Events Invoice"),
    ).toBeVisible();
    await expect(canvas.getByText("Invoice")).toBeVisible();
    await expect(canvas.getByText("18/06/26")).toBeVisible();
    // The row shows who it is for, not the template style.
    await expect(canvas.queryByText("Classic designs")).toBeNull();
    await expect(canvas.getAllByText("Not shared")[0]).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Open preview for Lumina Events Invoice",
      }),
    );
    await expect(
      canvas.getByRole("dialog", { name: "Invoice preview" }),
    ).toBeVisible();
  },
};

export const PrintableDocuments: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    await showAllDocuments(canvasElement);
    const canvas = within(canvasElement);
    await openRowAction(canvasElement, "Lumina Events Invoice", "Download PDF");
    await expect(
      canvas.getByRole("dialog", { name: "Prepare Lumina Events Invoice" }),
    ).toBeVisible();
    await expect(
      await canvas.findByRole(
        "button",
        { name: "Download PDF" },
        { timeout: 10000 },
      ),
    ).toBeVisible();
  },
};

export const EditDocument: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    await showAllDocuments(canvasElement);
    const canvas = within(canvasElement);
    await openRowAction(canvasElement, "Lumina Events Invoice", "Edit");
    await expect(
      canvas.getByRole("heading", { name: "Edit document" }),
    ).toBeVisible();
    // The editor is a sub-page: the top bar gets its title and back arrow.
    await expect(useUiStore.getState().pageHeader).toMatchObject({
      back: { label: "My Documents" },
      title: "Edit document",
    });
    // The bottom bar: actions on the draft, never Delete (that's in the row menu).
    const bar = canvas.getByRole("toolbar", { name: "Document actions" });
    await expect(
      within(bar).getByRole("button", { name: "Download PDF" }),
    ).toBeInTheDocument();
    await expect(
      within(bar).queryByRole("button", { name: /Delete/ }),
    ).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    // The sample invoice has empty fields, so save goes through the warning.
    await userEvent.click(
      await canvas.findByRole("button", { name: "Save anyway" }),
    );
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole("dialog", {
        name: "Document saved",
      }),
    ).toBeVisible();
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole("button", {
        name: "Back to documents",
      }),
    );
    await expect(
      await canvas.findByText("Lumina Events Invoice"),
    ).toBeVisible();
  },
};

export const DuplicateDocument: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    await showAllDocuments(canvasElement);
    const canvas = within(canvasElement);
    const openDraft = async () => {
      await userEvent.click(
        await canvas.findByRole("button", {
          name: "More actions for Lumina Events Invoice",
        }),
      );
      await userEvent.click(canvas.getByRole("button", { name: "Duplicate" }));
      await expect(
        await canvas.findByDisplayValue("Copy of March Invoice"),
      ).toBeVisible();
    };

    await openDraft();
    await expect(
      await canvas.findByDisplayValue("Copy of Lumina Events Invoice"),
    ).toBeVisible();

    // Leaving without confirming must not create anything.
    await expect(useUiStore.getState().pageHeader?.title).toBe(
      "Duplicate document",
    );
    // The top bar's back arrow (rendered by AppShell, not in this story).
    useUiStore.getState().pageHeader?.back?.onClick?.();
    await expect(
      await canvas.findByText("Lumina Events Invoice"),
    ).toBeVisible();
    await expect(
      canvas.queryByText("Copy of Lumina Events Invoice"),
    ).toBeNull();

    await openDraft();
    await userEvent.click(
      canvas.getByRole("button", { name: "Duplicate document" }),
    );
    await userEvent.click(
      await canvas.findByRole("button", { name: "Save anyway" }),
    );
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole("dialog", {
        name: "Document saved",
      }),
    ).toBeVisible();
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole("button", {
        name: "Back to documents",
      }),
    );
    await expect(
      await canvas.findByText("Copy of Lumina Events Invoice"),
    ).toBeVisible();
    await expect(canvas.getByText("Lumina Events Invoice")).toBeVisible();
  },
};

export const SavedConfirmation: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    await showAllDocuments(canvasElement);
    const canvas = within(canvasElement);
    await openRowAction(canvasElement, "Lumina Events Invoice", "Edit");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    // The sample invoice has empty fields, so save goes through the warning.
    await userEvent.click(
      await canvas.findByRole("button", { name: "Save anyway" }),
    );
    const saved = await within(canvasElement.ownerDocument.body).findByRole(
      "dialog",
      { name: "Document saved" },
    );
    await expect(saved).toBeVisible();
    // Desktop is always a centred modal, never a bottom sheet.
    await expect(saved).toHaveAttribute("data-layout", "centered");
    // The warning closed before the confirmation opened.
    await expect(
      canvas.queryByRole("dialog", { name: "Some fields are empty" }),
    ).toBeNull();
  },
};

/**
 * Saving with empty fields highlights them in the preview, shows a warning
 * toast and asks to save anyway or fix the document first.
 */
export const EmptyFieldsWarning: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    await showAllDocuments(canvasElement);
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await openRowAction(canvasElement, "Lumina Events Invoice", "Edit");
    await expect(
      canvasElement.querySelector(".template-document-missing"),
    ).toBeNull();

    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    const warning = await canvas.findByRole("dialog", {
      name: "Some fields are empty",
    });
    await expect(warning).toBeVisible();
    // A decision, so centred even though it sits in the editor (never a sheet).
    await expect(warning).toHaveAttribute("data-layout", "centered");
    await expect(warning).toHaveAccessibleDescription(
      /these fields stay blank in the document/,
    );
    const toast = await page.findByText(/highlighted in the preview/);
    await expect(toast).toBeVisible();
    await expect(
      canvasElement.querySelector(".template-document-missing"),
    ).not.toBeNull();

    // The dialog names each empty field as a chip, and agrees with the toast's count.
    const chips = within(
      within(warning).getByRole("list", { name: "Empty fields" }),
    ).getAllByRole("listitem");
    const toastCount = /^(\d+) fields/.exec(toast.textContent ?? "")?.[1];
    await expect(chips.length).toBe(toastCount ? Number(toastCount) : 1);
    for (const chip of chips) {
      await expect(chip.textContent?.trim()).not.toBe("");
    }
    await expect(
      within(warning).getByRole("button", { name: "Save anyway" }),
    ).toBeEnabled();

    // "Fix document" keeps the user in the editor with the highlights on.
    await userEvent.click(canvas.getByRole("button", { name: "Fix document" }));
    await expect(
      canvas.queryByRole("dialog", { name: "Some fields are empty" }),
    ).toBeNull();
    await expect(
      canvas.getByRole("heading", { name: "Edit document" }),
    ).toBeVisible();
    await expect(
      canvasElement.querySelector(".template-document-missing"),
    ).not.toBeNull();
  },
};

/** After a save, "Download PDF" opens the export for the document just saved, without leaving the editor. */
export const SavedNextStepDownload: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    await showAllDocuments(canvasElement);
    const canvas = within(canvasElement);
    await openRowAction(canvasElement, "Lumina Events Invoice", "Edit");
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await userEvent.click(
      await canvas.findByRole("button", { name: "Save anyway" }),
    );
    const saved = await within(canvasElement.ownerDocument.body).findByRole(
      "dialog",
      {
        name: "Document saved",
      },
    );
    // "Share" is offered only when document sharing is switched on (CI runs
    // with it off, like `.env.example`).
    const share = within(saved).queryByRole("button", {
      name: "Share",
    });
    if (documentSharingEnabled) await expect(share).toBeVisible();
    else await expect(share).toBeNull();

    await userEvent.click(
      within(saved).getByRole("button", { name: "Download PDF" }),
    );
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole("dialog", {
        name: "Document saved",
      }),
    ).toBeNull();
    await expect(
      await canvas.findByRole("dialog", {
        name: "Prepare Lumina Events Invoice",
      }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "Edit document" }),
    ).toBeInTheDocument();
  },
};

export const EditorReady: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    await showAllDocuments(canvasElement);
    const canvas = within(canvasElement);
    await openRowAction(canvasElement, "Lumina Events Invoice", "Edit");
    await expect(
      canvas.getByRole("heading", { name: "Edit document" }),
    ).toBeVisible();
  },
};

/**
 * Phones have no Edit button on the row: Edit is in the ⋮ actions sheet.
 * Opens the editor that way.
 */
const openEditorOnPhone = async (canvasElement: HTMLElement) => {
  await showAllDocuments(canvasElement);
  await openRowAction(canvasElement, "Lumina Events Invoice", "Edit");
};

export const MobileEditorReady: Story = {
  decorators: WithDocuments.decorators,
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
  play: async ({ canvasElement }) => {
    await openEditorOnPhone(canvasElement);
    await expect(
      within(canvasElement).getByRole("heading", { name: "Edit document" }),
    ).toBeVisible();
  },
};

export const MobileEditorPreview: Story = {
  decorators: WithDocuments.decorators,
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
  play: async ({ canvasElement }) => {
    await openEditorOnPhone(canvasElement);
    const canvas = within(canvasElement);
    // The round eye button beside the editor's bottom bar.
    const previewButton = canvas.getByRole("button", { name: "Preview" });
    await expect(previewButton).toBeVisible();
    await userEvent.click(previewButton);
    await expect(
      canvas.getByRole("dialog", { name: "Document preview" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "Document preview" }),
    ).toBeVisible();
  },
};

/**
 * Walks the full new-document path — New document → pick a template row →
 * editor — then prefills the recipient block from a saved client.
 *
 * Uses `classic-invoice` because invoices are one of the four billing types that
 * carry `recipientContactFields`, so this also covers `toEmail`/`toPhone`/`toBrn`
 * being filled. On a contract those keys don't exist and are silently skipped.
 */
export const PrefillFromClient: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockDocumentsApi([]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      (await canvas.findAllByRole("button", { name: /new document/i }))[0],
    );
    // Enter on a picker row starts the document on every screen size (a click
    // only selects it on desktop).
    (await canvas.findAllByRole("button", { name: /^Invoice, / }))[0].focus();
    await userEvent.keyboard("{Enter}");

    // The form is an accordion that opens on Document details; open the sections under test.
    await userEvent.click(
      await canvas.findByRole("button", { name: /^Your details/ }),
    );

    // Sender block seeded from the signed-in user's profile, no typing needed.
    await expect(
      await canvas.findByDisplayValue("Dokiments Studio"),
    ).toBeVisible();
    await expect(
      canvas.getByDisplayValue("12 Studio Lane, Port Louis"),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: /^Client details/ }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Choose a client" }),
    );
    await userEvent.click(
      canvas.getByRole("menuitemradio", {
        name: "Northline Studio accounts@northline.com",
      }),
    );

    // companyName wins over the contact name for `toName`. Asserted via the "Client name"
    // label rather than `findByDisplayValue`, so this remains specific to the
    // recipient field rather than the picker trigger.
    await expect(await canvas.findByLabelText("Client name")).toHaveValue(
      "Northline Studio",
    );
    await expect(
      canvas.getByDisplayValue("24 Market Street, Ebene"),
    ).toBeVisible();
    await expect(
      canvas.getByDisplayValue("accounts@northline.com"),
    ).toBeVisible();
    await expect(canvas.getByDisplayValue("+230 5 987 6543")).toBeVisible();
    await expect(canvas.getByDisplayValue("C09876543")).toBeVisible();
  },
};

/**
 * Landing on `/my-documents?new=1` — the dashboard FAB's target — opens the
 * template picker directly, skipping the document list.
 *
 * `new=1` is added to the existing URL rather than replacing it: this runs inside
 * Storybook's `/iframe.html?id=…`, and dropping that `id` would unmount the story.
 */
export const NewDocumentDeepLink: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockDocumentsApi([]);
      // Runs during render, so it lands before the component's mount effect reads it.
      const url = new URL(window.location.href);
      url.searchParams.set("new", "1");
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole("heading", {
        name: "Choose your available templates",
      }),
    ).toBeVisible();
    // The picker replaced the list rather than stacking on top of it.
    await expect(
      canvas.queryByText(/no documents yet/i),
    ).not.toBeInTheDocument();
    // The param is consumed, so a refresh returns to the plain list.
    await expect(window.location.search).not.toContain("new=1");
  },
};

/** With no saved clients the picker offers a link to My Clients instead of an empty dropdown. */
export const PrefillWithNoClients: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockDocumentsApi([], []);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      (await canvas.findAllByRole("button", { name: /new document/i }))[0],
    );
    // Enter on a picker row starts the document on every screen size (a click
    // only selects it on desktop).
    (await canvas.findAllByRole("button", { name: /^Invoice, / }))[0].focus();
    await userEvent.keyboard("{Enter}");
    // The client picker lives in the collapsed Client details accordion section.
    await userEvent.click(
      await canvas.findByRole("button", { name: /^Client details/ }),
    );

    // No saved clients: the section starts on "New client", with a tip that
    // says what to type and that Next will offer to save them.
    await expect(
      await canvas.findByRole("tab", { name: "New client" }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      canvas.getByText(/When you press Next, you can save them/),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Choose a client" }),
    ).not.toBeInTheDocument();
  },
};

/**
 * A new client typed into Client details: Next asks once whether to save them
 * to My Clients. "Save client" posts them, then the next section (Items)
 * opens; a second Next doesn't ask again.
 */
export const SaveNewClientOnNext: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockDocumentsApi([], []);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      (await canvas.findAllByRole("button", { name: /new document/i }))[0],
    );
    (await canvas.findAllByRole("button", { name: /^Invoice, / }))[0].focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.click(
      await canvas.findByRole("button", { name: /^Client details/ }),
    );

    await userEvent.type(
      await canvas.findByLabelText("Client name"),
      "Blue Harbour",
    );
    await userEvent.type(canvas.getByLabelText("Email"), "ravi@blueharbour.mu");
    await userEvent.type(canvas.getByLabelText("Phone number"), "57120044");

    const section = canvas
      .getByRole("button", { name: /^Client details/ })
      .closest("fieldset") as HTMLElement;
    await expect(within(section).getByText("Items")).toBeVisible();
    await userEvent.click(
      within(section).getByRole("button", { name: "Next" }),
    );

    const dialog = await page.findByRole("dialog", {
      name: "Save this client?",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Save client" }),
    );

    await expect(
      await page.findByText("Blue Harbour saved to My Clients."),
    ).toBeVisible();
    await expect(createdClients.at(-1)).toMatchObject({
      companyName: "Blue Harbour",
      email: "ravi@blueharbour.mu",
      phone: "57120044",
    });
    await expect(
      canvas.getByRole("button", { name: /^Items/ }),
    ).toHaveAttribute("aria-expanded", "true");
  },
};

const at = (value: string) => new Date(value).getTime();

const companyDocument = (
  id: string,
  templateId: string,
  createdAt: string,
  values: Record<string, string>,
): UserDocument => ({
  createdAt: at(createdAt),
  id,
  name: values.title ?? id,
  templateId,
  templateSnapshot: toSnapshot(templateId),
  updatedAt: at(createdAt),
  values,
});

/** Documents for three companies (one in the client book) and one with no client. */
const byCompanyFixture: UserDocument[] = [
  companyDocument("nl-1", "classic-invoice", "2026-06-18T09:30:00", {
    title: "June retainer invoice",
    toName: "Northline Studio",
    total: "1250",
  }),
  companyDocument("nl-2", "classic-quotation", "2026-06-02T14:10:00", {
    title: "Brand refresh quotation",
    toName: "Northline Studio",
  }),
  companyDocument("nl-3", "classic-contract", "2026-05-12T11:00:00", {
    title: "Design services contract",
    toName: "Maya Chen",
  }),
  companyDocument("nl-4", "classic-invoice", "2026-04-28T08:45:00", {
    title: "April retainer invoice",
    toName: "Northline Studio",
  }),
  companyDocument("lu-1", "classic-invoice", "2026-06-10T10:00:00", {
    title: "Lumina Events invoice",
    toName: "Lumina Events",
  }),
  companyDocument("lu-2", "classic-nda", "2026-03-03T16:20:00", {
    partyTwo: "Lumina Events",
    title: "Event planning NDA",
  }),
  companyDocument("ha-1", "classic-proposal", "2026-05-20T12:00:00", {
    title: "Harbour fit-out proposal",
    toName: "Harbour Cafe",
  }),
  companyDocument("no-1", "classic-proposal", "2026-06-15T09:00:00", {
    title: "Website proposal draft",
  }),
  // A CV: lives in its own tab, never under a company.
  companyDocument("cv-1", "classic-cv", "2026-06-12T09:00:00", {
    title: "Product designer CV",
  }),
];

/**
 * The default "Companies" tab: every document grouped by company (newest
 * activity first), with Status and Type filter chips.
 */
export const ByCompany: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockDocumentsApi(byCompanyFixture);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const northline = await canvas.findByRole("region", {
      name: "Northline Studio",
    });
    // Northline groups documents by company name and by contact name.
    await expect(
      within(northline).getAllByRole("button", { name: /^Preview / }),
    ).toHaveLength(4);
    await expect(
      canvas.getByRole("region", { name: "No client yet" }),
    ).toBeVisible();
    // The toolbar renders once for phones and once for desktop.
    await expect(
      canvas.getAllByText("3 companies · 8 documents").length,
    ).toBeGreaterThan(0);
    await expect(
      within(northline).getByRole("link", {
        name: "View company Northline Studio",
      }),
    ).toHaveAttribute(
      "href",
      "/my-documents/companies/client-client_northline_01",
    );
    await expect(
      within(northline).getByRole("link", {
        name: "New document for Northline Studio",
      }),
    ).toHaveAttribute("href", "/my-documents?new=1&client=client_northline_01");

    // Collapse and reopen a company.
    const toggle = within(northline).getByRole("button", {
      name: "Hide documents for Northline Studio",
    });
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    // Amounts at a glance; CVs stay out of the company groups.
    await expect(within(northline).getByText("1,250.00")).toBeVisible();
    await expect(canvas.queryByText("Product designer CV")).toBeNull();

    // Each row has a vertical menu.
    await expect(
      within(northline).getByRole("button", {
        name: "More actions for June retainer invoice",
      }),
    ).toBeVisible();

    // Filter chips: Status is its own chip, and the sort is not a filter.
    await expect(
      canvas.getAllByRole("button", { name: "Status: Any" }).length,
    ).toBeGreaterThan(0);
    await expect(
      canvas.queryAllByRole("button", { name: "Reset filters" }),
    ).toHaveLength(0);
  },
};

/**
 * Rows show the creation date as dd/mm/yy. Opening a row shows the preview
 * with a "Document" tab (client, amount, status, created) and a "Template" tab.
 */
export const ByCompanyPreviewDetails: Story = {
  decorators: ByCompany.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const northline = await canvas.findByRole("region", {
      name: "Northline Studio",
    });
    const date = within(northline).getByText("18/06/26");
    await expect(date.tagName).toBe("TIME");
    await expect(date).toHaveAttribute("title", "18 Jun 2026");

    await userEvent.click(
      within(northline).getByRole("button", {
        name: "Preview June retainer invoice",
      }),
    );
    const body = within(canvasElement.ownerDocument.body);
    const details = await body.findByRole("tabpanel", {
      name: "Document details",
    });
    await expect(within(details).getByText("Northline Studio")).toBeVisible();
    await expect(within(details).getByText("1,250.00")).toBeVisible();
    await expect(within(details).getByText("Not shared")).toBeVisible();
    await expect(within(details).getByText("18/06/26, 09:30")).toBeVisible();

    await userEvent.click(body.getByRole("tab", { name: "Template" }));
    const template = body.getByRole("tabpanel", { name: "Template details" });
    await expect(within(template).getByText("Invoice")).toBeVisible();
    await expect(body.getByRole("tab", { name: "Template" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

/** CVs have their own tab after "Shared with me", without a Type filter. */
export const CvsTab: Story = {
  decorators: ByCompany.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("region", { name: "Northline Studio" });
    await userEvent.click(canvas.getByRole("tab", { name: /CVs/ }));
    await expect(await canvas.findByText("Product designer CV")).toBeVisible();
    await expect(canvas.queryByText("June retainer invoice")).toBeNull();
    await expect(
      canvas.queryAllByRole("button", { name: /^Type:/ }),
    ).toHaveLength(0);

    // And "My documents" leaves the CV out.
    await userEvent.click(canvas.getByRole("tab", { name: /My documents/ }));
    await expect(
      await canvas.findByText("June retainer invoice"),
    ).toBeVisible();
    await expect(canvas.queryByText("Product designer CV")).toBeNull();
  },
};

/** Status filter: picking "Signed" leaves no unsigned documents and offers "Clear filters". */
export const ByCompanyStatusFilter: Story = {
  decorators: ByCompany.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("region", { name: "Northline Studio" });
    const [statusChip] = canvas
      .getAllByRole("button", { name: "Status: Any" })
      .filter((element) => element.checkVisibility());
    await userEvent.click(statusChip);
    await userEvent.click(
      await within(canvasElement.ownerDocument.body).findByRole(
        "menuitemradio",
        {
          name: "Signed",
        },
      ),
    );
    await expect(await canvas.findByText("No documents match")).toBeVisible();
    await expect(
      canvas
        .getAllByRole("button", { name: "Reset filters" })
        .filter((element) => element.checkVisibility()).length,
    ).toBeGreaterThan(0);
  },
};

/**
 * The toolbar never leaves the page: on "Shared with me" its search, filter
 * and sort stay in place but disabled, so the header keeps its height.
 */
export const SharedTabKeepsToolbar: Story = {
  decorators: ByCompany.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("region", { name: "Northline Studio" });
    // The phone toolbar is CSS-hidden at the test runner's width.
    const [search] = canvas.getAllByRole("searchbox", {
      hidden: true,
      name: "Search documents",
    });
    await expect(search).toBeEnabled();
    if (!documentSharingEnabled) return;

    await userEvent.click(canvas.getByRole("tab", { name: /Shared with me/ }));
    await expect(
      await canvas.findByText("Nothing shared with you yet"),
    ).toBeVisible();
    for (const box of canvas.getAllByRole("searchbox", {
      hidden: true,
      name: "Search documents",
    })) {
      await expect(box).toBeDisabled();
    }
  },
};

/** Delete from a row's ⋮ menu asks first; Cancel keeps the document. */
export const DeleteFromRowMenu: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    await showAllDocuments(canvasElement);
    await openRowAction(canvasElement, "Lumina Events Invoice", "Delete");
    const page = within(canvasElement.ownerDocument.body);
    const dialog = await page.findByRole("dialog", {
      name: "Delete document?",
    });
    await expect(dialog).toHaveTextContent('Delete "Lumina Events Invoice"?');
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Cancel" }),
    );
    await expect(
      page.queryByRole("dialog", { name: "Delete document?" }),
    ).toBeNull();
    await expect(
      within(canvasElement).getByText("Lumina Events Invoice"),
    ).toBeVisible();
  },
};

/**
 * The picker pushes one history entry, so the browser back button and the
 * phone back gesture return to the document list instead of leaving My
 * Documents.
 */
export const BackFromPickerReturnsToList: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockDocumentsApi([]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      (await canvas.findAllByRole("button", { name: /new document/i }))[0],
    );
    await expect(
      await canvas.findByRole("heading", {
        name: "Choose your available templates",
      }),
    ).toBeInTheDocument();

    window.history.back();

    await expect(await canvas.findByText(/no documents yet/i)).toBeVisible();
    await expect(
      canvas.queryByRole("heading", {
        name: "Choose your available templates",
      }),
    ).not.toBeInTheDocument();
  },
};
