import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, fn, screen, userEvent } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { MAX_FEEDBACK_MESSAGE } from "@/types/feedback";

import { FeedbackDialog } from "../feedback-dialog";

/** The submission the API echoes back on success. */
const storedFeedback = {
  createdAt: Date.parse("2026-09-12T09:00:00.000Z"),
  displayName: "Dev User",
  email: "dev@dokiments.local",
  id: "feedback_abc_123456",
  message: "The document editor is genuinely pleasant to use.",
  path: "/dashboard",
  type: "feedback",
};

/**
 * Mocks `POST /api/feedback` with a given status, and records the body so a story
 * can assert what was actually sent.
 */
const mockFeedbackApi = (status: number) => {
  const sent: unknown[] = [];

  window.fetch = (async (url: string, init?: RequestInit) => {
    if (url.includes("/api/feedback")) {
      sent.push(JSON.parse(String(init?.body)));

      if (status === 429) {
        return new Response(
          JSON.stringify({
            error:
              "Thanks — we just received your last message. Please wait a moment before sending another.",
          }),
          { status: 429 },
        );
      }

      if (status >= 400) {
        return new Response(
          JSON.stringify({ error: "Something went wrong. Please try again." }),
          { status },
        );
      }

      return new Response(JSON.stringify({ feedback: storedFeedback }), {
        status: 201,
      });
    }

    return new Response(JSON.stringify({ error: "Unhandled in story mock" }), {
      status: 500,
    });
  }) as typeof window.fetch;

  return sent;
};

const meta = {
  title: "Commons/Feedback Dialog",
  component: FeedbackDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  args: {
    onClose: fn(),
    open: true,
    path: "/dashboard",
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof FeedbackDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => {
      mockFeedbackApi(201);
      return <Story />;
    },
  ],
  play: async () => {
    await expect(
      screen.getByRole("heading", { name: /share your thoughts/i }),
    ).toBeVisible();
    // "Feedback" is preselected — the neutral option, so the default does not
    // nudge the user towards reporting a fault.
    await expect(screen.getByRole("radio", { name: "Feedback" })).toBeChecked();
    await expect(screen.getByRole("radio", { name: "Problem" })).not.toBeChecked();
    await expect(screen.getByText(`0 / ${MAX_FEEDBACK_MESSAGE}`)).toBeVisible();
  },
};

export const CounterTracksTyping: Story = {
  decorators: [
    (Story) => {
      mockFeedbackApi(201);
      return <Story />;
    },
  ],
  play: async () => {
    await userEvent.type(screen.getByLabelText("Message"), "Twelve chars");
    await expect(screen.getByText(`12 / ${MAX_FEEDBACK_MESSAGE}`)).toBeVisible();
  },
};

export const SendsGeneralFeedback: Story = {
  play: async ({ args }) => {
    const sent = mockFeedbackApi(201);

    await userEvent.type(
      screen.getByLabelText("Message"),
      "The document editor is genuinely pleasant to use.",
    );
    await userEvent.click(screen.getByRole("button", { name: /^send$/i }));

    // Confirmation replaces the form rather than the dialog closing, so the user
    // gets an acknowledgement instead of a dialog that simply vanishes.
    await expect(
      await screen.findByRole("heading", { name: /message sent/i }),
    ).toBeVisible();
    await expect(sent).toEqual([
      {
        message: "The document editor is genuinely pleasant to use.",
        path: "/dashboard",
        type: "feedback",
      },
    ]);
    // Still open — closing is the user's call, via Done.
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const SendsAProblemReport: Story = {
  play: async () => {
    const sent = mockFeedbackApi(201);

    await userEvent.click(screen.getByRole("radio", { name: "Problem" }));
    await userEvent.type(
      screen.getByLabelText("Message"),
      "Exporting a quotation gives me a blank second page.",
    );
    await userEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await expect(
      await screen.findByRole("heading", { name: /message sent/i }),
    ).toBeVisible();
    await expect(sent).toMatchObject([{ type: "problem" }]);
  },
};

export const RejectsAnEmptyMessage: Story = {
  play: async () => {
    const sent = mockFeedbackApi(201);

    await userEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await expect(
      await screen.findByText(/please write a message before sending/i),
    ).toBeVisible();
    // Nothing left the browser — the server never had to reject this.
    await expect(sent).toEqual([]);
  },
};

export const RejectsAWhitespaceOnlyMessage: Story = {
  play: async () => {
    const sent = mockFeedbackApi(201);

    await userEvent.type(screen.getByLabelText("Message"), "    ");
    await userEvent.click(screen.getByRole("button", { name: /^send$/i }));

    // Mirrors the server, where the Zod schema trims before checking the minimum.
    await expect(
      await screen.findByText(/please write a message before sending/i),
    ).toBeVisible();
    await expect(sent).toEqual([]);
  },
};

export const Throttled: Story = {
  decorators: [
    (Story) => {
      mockFeedbackApi(429);
      return <Story />;
    },
  ],
  play: async () => {
    await userEvent.type(
      screen.getByLabelText("Message"),
      "Sent a moment after the last one.",
    );
    await userEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await expect(
      await screen.findByText(/please wait a moment before sending another/i),
    ).toBeVisible();
    // The message survives, so the user can send it again in a minute rather than
    // retyping it — there is no draft persistence anywhere to fall back on.
    await expect(screen.getByLabelText("Message")).toHaveValue(
      "Sent a moment after the last one.",
    );
  },
};

export const ServerError: Story = {
  decorators: [
    (Story) => {
      mockFeedbackApi(500);
      return <Story />;
    },
  ],
  play: async () => {
    await userEvent.type(screen.getByLabelText("Message"), "Anything at all.");
    await userEvent.click(screen.getByRole("button", { name: /^send$/i }));

    await expect(
      await screen.findByText(/something went wrong/i),
    ).toBeVisible();
    await expect(screen.getByLabelText("Message")).toHaveValue(
      "Anything at all.",
    );
  },
};

/** Closed — renders nothing at all, rather than a hidden dialog. */
export const Closed: Story = {
  args: { open: false },
  play: async () => {
    await expect(
      screen.queryByRole("heading", { name: /share your thoughts/i }),
    ).toBeNull();
  },
};
