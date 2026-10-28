import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, fn, screen, userEvent } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";

import { ShareDialog } from "../share-dialog";

type ShareOutcome = "success" | "error" | "limit" | "pending";

/** Mocks the two sharing endpoints and records the share request bodies. */
const mockShareApi = (outcome: ShareOutcome) => {
  const sent: unknown[] = [];

  window.fetch = (async (url: string, init?: RequestInit) => {
    if (url.includes("/api/clients")) {
      return new Response(
        JSON.stringify({
          clients: [
            {
              address: "",
              brn: "",
              companyName: "Acme",
              createdAt: 1,
              email: "ada@acme.com",
              id: "client_1",
              name: "Ada",
              nationalId: "",
              phone: "",
              updatedAt: 1,
            },
          ],
        }),
      );
    }

    if (url.includes("/share-recipients")) {
      return new Response(
        JSON.stringify({
          recipients: [
            {
              email: "sam@example.com",
              firstSharedAt: 1,
              lastSharedAt: 2,
            },
            {
              email: "priya@example.com",
              firstSharedAt: 1,
              lastSharedAt: 1,
            },
          ],
        }),
      );
    }

    if (url.endsWith("/share")) {
      sent.push(JSON.parse(String(init?.body)));

      if (outcome === "pending") {
        return new Promise<Response>(() => undefined);
      }

      if (outcome === "limit") {
        return new Response(
          JSON.stringify({
            error: "You have reached the sharing limit for your plan.",
          }),
          { status: 403 },
        );
      }

      if (outcome === "error") {
        return new Response(
          JSON.stringify({
            error:
              "This document is already shared with someone else. Sharing with more than one person is not available yet.",
          }),
          { status: 409 },
        );
      }

      const body = JSON.parse(String(init?.body)) as { email: string };
      return new Response(
        JSON.stringify({
          recipient: { email: body.email, status: "pending" },
          sharedDocumentId: "owner_doc-1",
        }),
        { status: 201 },
      );
    }

    return new Response(JSON.stringify({ error: "Unhandled in story mock" }), {
      status: 500,
    });
  }) as typeof window.fetch;

  return sent;
};

const meta = {
  title: "Dashboard/Share Dialog",
  component: ShareDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  args: {
    document: { id: "doc-1", name: "Website redesign NDA" },
    onClose: fn(),
    open: true,
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof ShareDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const typeAndShare = async (email: string) => {
  await userEvent.type(screen.getByLabelText("Recipient email"), email);
  await userEvent.click(screen.getByRole("button", { name: /^share$/i }));
};

export const Default: Story = {
  decorators: [
    (Story) => {
      mockShareApi("success");
      return <Story />;
    },
  ],
  play: async () => {
    await expect(
      screen.getByRole("heading", { name: /share this document/i }),
    ).toBeVisible();
    await expect(
      await screen.findByRole("button", { name: /sam@example.com/ }),
    ).toBeVisible();
  },
};

export const SuggestionFillsTheField: Story = {
  decorators: [
    (Story) => {
      mockShareApi("success");
      return <Story />;
    },
  ],
  play: async () => {
    await userEvent.click(
      await screen.findByRole("button", { name: /priya@example.com/ }),
    );
    await expect(screen.getByLabelText("Recipient email")).toHaveValue(
      "priya@example.com",
    );
  },
};

export const SuggestsClients: Story = {
  decorators: [
    (Story) => {
      mockShareApi("success");
      return <Story />;
    },
  ],
  play: async () => {
    await userEvent.click(
      await screen.findByRole("button", { name: /ada@acme.com/ }),
    );
    await expect(screen.getByLabelText("Recipient email")).toHaveValue(
      "ada@acme.com",
    );
  },
};

export const TypingNarrowsClients: Story = {
  decorators: [
    (Story) => {
      mockShareApi("success");
      return <Story />;
    },
  ],
  play: async () => {
    await screen.findByRole("button", { name: /ada@acme.com/ });
    await userEvent.type(screen.getByLabelText("Recipient email"), "zzz");
    await expect(
      screen.queryByRole("button", { name: /ada@acme.com/ }),
    ).toBeNull();
  },
};

export const PrefilledWithDocumentRecipient: Story = {
  args: {
    document: {
      id: "doc-1",
      name: "Website redesign NDA",
      recipientEmail: "Lee@Example.com",
    },
  },
  decorators: [
    (Story) => {
      mockShareApi("success");
      return <Story />;
    },
  ],
  play: async () => {
    await expect(screen.getByLabelText("Recipient email")).toHaveValue(
      "lee@example.com",
    );
    await expect(
      await screen.findByText("Recipient on this document"),
    ).toBeVisible();
  },
};

export const InvalidEmail: Story = {
  play: async () => {
    const sent = mockShareApi("success");

    await typeAndShare("not-an-email");

    await expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeVisible();
    await expect(sent).toEqual([]);
  },
};

export const Loading: Story = {
  play: async () => {
    mockShareApi("pending");

    await typeAndShare("sam@example.com");

    await expect(
      await screen.findByRole("button", { name: /sharing/i }),
    ).toBeDisabled();
  },
};

export const ApiError: Story = {
  play: async () => {
    mockShareApi("error");

    await typeAndShare("sam@example.com");

    await expect(
      await screen.findByText(/already shared with someone else/i),
    ).toBeVisible();
    // The typed address survives so it can be corrected rather than retyped.
    await expect(screen.getByLabelText("Recipient email")).toHaveValue(
      "sam@example.com",
    );
  },
};

export const LimitReached: Story = {
  play: async () => {
    mockShareApi("limit");

    await typeAndShare("sam@example.com");

    await expect(
      await screen.findByRole("heading", {
        name: /upgrade to share with more people/i,
      }),
    ).toBeVisible();
  },
};

export const Success: Story = {
  play: async ({ args }) => {
    const sent = mockShareApi("success");

    await typeAndShare("Sam@Example.com");

    await expect(
      await screen.findByRole("heading", { name: /document shared/i }),
    ).toBeVisible();
    await expect(sent).toEqual([{ email: "Sam@Example.com" }]);
    await userEvent.click(screen.getByRole("button", { name: /^done$/i }));
    await expect(args.onClose).toHaveBeenCalled();
  },
};

/** Closed — renders nothing at all, rather than a hidden dialog. */
export const Closed: Story = {
  args: { open: false },
  play: async () => {
    await expect(
      screen.queryByRole("heading", { name: /share this document/i }),
    ).toBeNull();
  },
};
