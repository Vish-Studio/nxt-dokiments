import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";
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
const mockDocumentsApi = (
  initialDocuments: UserDocument[],
  clients: Client[] = [northlineClient],
) => {
  let documents = initialDocuments;

  window.fetch = (async (url: string, init?: RequestInit) => {
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
      canvas.getAllByRole("button", { name: /new document/i }).length,
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
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText("Lumina Events Invoice"),
    ).toBeVisible();
    await expect(canvas.getByText("Invoice")).toBeVisible();
    await expect(canvas.getByText("18 Jun 2026")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Open preview for Lumina Events Invoice",
      }),
    );
    await expect(
      canvas.getByRole("dialog", { name: "Standard Invoice preview" }),
    ).toBeVisible();
  },
};

export const PrintableDocuments: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", {
        name: "Print Lumina Events Invoice",
      }),
    );
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
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Edit Lumina Events Invoice" }),
    );
    await expect(
      canvas.getByRole("heading", { name: "Edit document" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Back to documents" }),
    ).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Delete" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(
      await canvas.findByRole("dialog", { name: "Document saved" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Continue" }));
    await expect(
      await canvas.findByText("Lumina Events Invoice"),
    ).toBeVisible();
  },
};

export const DeleteDocument: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Edit Lumina Events Invoice" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
    await expect(
      canvas.getByRole("dialog", { name: "Delete document?" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Delete document" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(
      canvas.getByRole("heading", { name: "Edit document" }),
    ).toBeVisible();
  },
};

export const SavedConfirmation: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Edit Lumina Events Invoice" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(
      await canvas.findByRole("dialog", { name: "Document saved" }),
    ).toBeVisible();
  },
};

export const DeleteConfirmation: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Edit Lumina Events Invoice" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Delete" }));
    await expect(
      canvas.getByRole("dialog", { name: "Delete document?" }),
    ).toBeVisible();
  },
};

export const EditorReady: Story = {
  decorators: WithDocuments.decorators,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Edit Lumina Events Invoice" }),
    );
    await expect(
      canvas.getByRole("heading", { name: "Edit document" }),
    ).toBeVisible();
  },
};

export const MobileEditorReady: Story = {
  decorators: WithDocuments.decorators,
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
  play: EditorReady.play,
};

export const MobileEditorPreview: Story = {
  decorators: WithDocuments.decorators,
  globals: {
    viewport: { value: "mobile1", isRotated: false },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: "Edit Lumina Events Invoice" }),
    );
    const previewButton = canvas.getByRole("button", {
      name: "Preview document",
    });
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
 * Walks the full new-document path — New document → template preview → Use
 * document — then prefills the recipient block from a saved client.
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
    await userEvent.click(
      await canvas.findByRole("button", {
        name: "Preview Standard Invoice, saved",
      }),
    );
    await userEvent.click(
      await canvas.findByRole("button", { name: "Use document" }),
    );

    // Sender block seeded from the signed-in user's profile, no interaction needed.
    await expect(
      await canvas.findByDisplayValue("Dokiments Studio"),
    ).toBeVisible();
    await expect(canvas.getByDisplayValue("12 Studio Lane, Port Louis")).toBeVisible();

    await userEvent.selectOptions(
      canvas.getByLabelText("Prefill from client (optional)"),
      "client_northline_01",
    );

    // companyName wins over the contact name for `toName`.
    await expect(
      await canvas.findByDisplayValue("Northline Studio"),
    ).toBeVisible();
    await expect(canvas.getByDisplayValue("24 Market Street, Ebene")).toBeVisible();
    await expect(canvas.getByDisplayValue("accounts@northline.com")).toBeVisible();
    await expect(canvas.getByDisplayValue("+230 5 987 6543")).toBeVisible();
    await expect(canvas.getByDisplayValue("C09876543")).toBeVisible();
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
    await userEvent.click(
      await canvas.findByRole("button", {
        name: "Preview Standard Invoice, saved",
      }),
    );
    await userEvent.click(
      await canvas.findByRole("button", { name: "Use document" }),
    );

    await expect(
      await canvas.findByRole("link", { name: "My clients" }),
    ).toBeVisible();
    await expect(
      canvas.queryByLabelText("Prefill from client (optional)"),
    ).not.toBeInTheDocument();
  },
};
