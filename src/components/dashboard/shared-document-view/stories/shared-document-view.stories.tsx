import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";
import type { SharedDocument } from "@/types/sharing";

import { SharedDocumentView } from "../shared-document-view";

const sharedDocument: SharedDocument = {
  createdAt: 1,
  id: "owner-1_doc-1",
  locked: false,
  name: "Website redesign NDA",
  ownerEmail: "alex@example.com",
  ownerId: "owner-1",
  ownerName: "Alex Morgan",
  recipients: [{ email: "sam@example.com", invitedAt: 1, status: "pending" }],
  signatures: {},
  sourceDocumentId: "doc-1",
  templateId: "nda",
  templateSnapshot: {
    description: "",
    documentType: "nda",
    fields: [
      { key: "title", label: "Title", type: "text" },
      {
        key: "recipientSignature",
        label: "Recipient signature",
        type: "text",
      },
    ],
    name: "NDA",
    style: { description: "", id: "classic", name: "Classic", tier: "free" },
  },
  updatedAt: 1,
  values: { title: "Website redesign NDA" },
};

const seedUser = (uid: string, email: string) => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      displayName: "Story user",
      email,
      provider: "password",
      role: "silver",
      uid,
    },
  });
};

/** Answers the detail request, and the sign request by locking the stored copy. */
const mockApi = (status: number) => {
  let current = sharedDocument;

  window.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (status !== 200) {
      return new Response(JSON.stringify({ error: "Not found." }), { status });
    }

    if (init?.method === "POST") {
      const { signature } = JSON.parse(String(init.body)) as {
        signature: string;
      };
      current = {
        ...current,
        locked: true,
        signatures: {
          "story-recipient": {
            email: "sam@example.com",
            signedAt: Date.now(),
            type: "typed",
            value: signature,
          },
        },
      };
      return new Response(JSON.stringify({ document: current }), {
        status: 200,
      });
    }

    return new Response(JSON.stringify({ document: current }), {
      status: 200,
    });
  }) as typeof window.fetch;
};

const meta = {
  title: "Dashboard/Shared Document View",
  component: SharedDocumentView,
  tags: ["ai-generated"],
  args: { id: "owner-1_doc-1" },
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
} satisfies Meta<typeof SharedDocumentView>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A recipient types a name, confirms, and the page flips to the locked copy. */
export const RecipientSigns: Story = {
  decorators: [
    (Story) => {
      seedUser("recipient-1", "sam@example.com");
      mockApi(200);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      await canvas.findByLabelText("Type your full name to sign"),
      "Sam Rivera",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Sign document" }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Sign and lock" }),
    );
    await expect(
      await canvas.findByText(/This copy is signed and locked/),
    ).toBeVisible();
  },
};

/** The owner of the document only watches. */
export const Owner: Story = {
  decorators: [
    (Story) => {
      seedUser("owner-1", "alex@example.com");
      mockApi(200);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/Shared copy of your document/),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Sign document" }),
    ).not.toBeInTheDocument();
  },
};

/** A missing or foreign share shows the same not-found message. */
export const NotFound: Story = {
  decorators: [
    (Story) => {
      seedUser("stranger-1", "stranger@example.com");
      mockApi(404);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText("Document not found"),
    ).toBeVisible();
  },
};
