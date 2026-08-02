import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, fn, userEvent, within } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";

import { ReauthDialog } from "../reauth-dialog";

/** Mocks `POST /api/auth/reauthenticate`. `succeed=false` simulates a wrong password. */
const mockReauthenticateApi = (succeed: boolean) => {
  window.fetch = (async (url: string) => {
    if (url.includes("/api/auth/reauthenticate")) {
      return succeed
        ? new Response(JSON.stringify({ ok: true }), { status: 200 })
        : new Response(
            JSON.stringify({ error: "The email or password is incorrect." }),
            {
              status: 400,
            },
          );
    }

    return new Response(JSON.stringify({ error: "Unhandled in story mock" }), {
      status: 500,
    });
  }) as typeof window.fetch;
};

const meta = {
  title: "Commons/Reauth Dialog",
  component: ReauthDialog,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen" },
  args: {
    onClose: fn(),
    onReauthenticated: fn(),
    open: true,
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof ReauthDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => {
      mockReauthenticateApi(true);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: /confirm your password/i }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /continue/i }),
    ).toBeVisible();
  },
};

export const Success: Story = {
  decorators: [
    (Story) => {
      mockReauthenticateApi(true);
      return <Story />;
    },
  ],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByLabelText("Current password"),
      "correct-password",
    );
    await userEvent.click(canvas.getByRole("button", { name: /continue/i }));
    await expect(args.onReauthenticated).toHaveBeenCalled();
  },
};

export const WrongPassword: Story = {
  decorators: [
    (Story) => {
      mockReauthenticateApi(false);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByLabelText("Current password"),
      "wrong-password",
    );
    await userEvent.click(canvas.getByRole("button", { name: /continue/i }));
    await expect(
      await canvas.findByText("The email or password is incorrect."),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: /confirm your password/i }),
    ).toBeVisible();
  },
};
