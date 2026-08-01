import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";

import { PasswordSettings } from "../password-settings";

/** Mocks `POST /api/auth/update-password`. */
const mockUpdatePasswordApi = () => {
  window.fetch = (async (url: string) => {
    if (url.includes("/api/auth/update-password")) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Unhandled in story mock" }), {
      status: 500,
    });
  }) as typeof window.fetch;
};

const meta = {
  title: "Dashboard/Password Settings",
  component: PasswordSettings,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      useAuthStore.setState({
        status: "authenticated",
        user: {
          displayName: "Anthony Alverizko",
          email: "anthony@dokiments.com",
          role: "free",
          uid: "story-uid",
        },
      });
      mockUpdatePasswordApi();
      return (
        <QueryClientProvider client={makeStoryQueryClient()}>
          <div className="min-h-screen bg-app-panel p-6">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof PasswordSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: /password/i }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /change password/i }),
    ).toBeVisible();
  },
};

export const ChangePassword: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText("New password"), "new-secret-1");
    await userEvent.type(
      canvas.getByLabelText("Confirm new password"),
      "new-secret-1",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: /change password/i }),
    );
    await expect(await canvas.findByText("Password changed.")).toBeVisible();
  },
};
