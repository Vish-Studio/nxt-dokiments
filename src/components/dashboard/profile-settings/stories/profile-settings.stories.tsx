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
      canvas.getByRole("heading", { name: "Personal information" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { name: "Business details" }),
    ).toBeVisible();
    // Read-only by default, with the email shown but never editable here.
    await expect(canvas.getAllByText("anthony@dokiments.com").length).toBeGreaterThan(0);
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};

export const SaveProfile: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit personal information" }),
    );
    await expect(canvas.getByDisplayValue("Anthony Alverizko")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: /save changes/i }),
    );
    // Confirmed by a toast at the bottom of the screen.
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "Personal information updated.",
    );
    // Back to the read-only view once saved.
    await expect(
      canvas.queryByRole("button", { name: /save changes/i }),
    ).not.toBeInTheDocument();
  },
};

/** The business card validates its email before saving. */
export const RejectsInvalidBusinessEmail: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit business details" }),
    );
    await userEvent.type(canvas.getByLabelText("Business email"), "not-an-email");
    await userEvent.click(canvas.getByRole("button", { name: /save changes/i }));

    // Still editing: the browser or the form stopped the save.
    await expect(canvas.getByLabelText("Business email")).toBeVisible();
    await expect(
      canvas.queryByText("Business details updated."),
    ).not.toBeInTheDocument();
  },
};

export const CancelEditing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit business details" }),
    );
    await userEvent.type(canvas.getByLabelText("Company name"), "Northline");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));

    await expect(canvas.queryByText("Northline")).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Edit business details" }),
    ).toBeVisible();
  },
};
