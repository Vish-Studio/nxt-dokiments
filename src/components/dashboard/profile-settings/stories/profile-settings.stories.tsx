import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/types/auth";

import { ProfileSettings } from "../profile-settings";

const seedSession = () => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.com",
      provider: "password",
      role: "free",
      uid: "story-uid",
    },
  });
};

/** Mocks `POST /api/auth/update-profile`, echoing back the submitted fields merged onto the seeded user. */
const mockUpdateProfileApi = () => {
  window.fetch = (async (url: string, init?: RequestInit) => {
    if (url.includes("/api/auth/update-profile")) {
      const patch = JSON.parse(
        (init?.body as string) ?? "{}",
      ) as Partial<AuthUser>;
      const updated: AuthUser = {
        displayName: "Anthony Alverizko",
        email: "anthony@dokiments.com",
        provider: "password",
        role: "free",
        uid: "story-uid",
        ...patch,
      };
      return new Response(JSON.stringify({ user: updated }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Unhandled in story mock" }), {
      status: 500,
    });
  }) as typeof window.fetch;
};

const meta = {
  title: "Dashboard/Profile Settings",
  component: ProfileSettings,
  tags: ["ai-generated"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => {
      seedSession();
      mockUpdateProfileApi();
      return (
        <QueryClientProvider client={makeStoryQueryClient()}>
          <div className="min-h-screen bg-app-panel p-6">
            <Story />
          </div>
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof ProfileSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("heading", { name: /profile/i }),
    ).toBeVisible();
    await expect(canvas.getByDisplayValue("Anthony Alverizko")).toBeVisible();
    await expect(canvas.getByText("anthony@dokiments.com")).toBeVisible();
  },
};

export const SaveProfile: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: /save changes/i }),
    );
    await expect(await canvas.findByText("Profile updated.")).toBeVisible();
  },
};
