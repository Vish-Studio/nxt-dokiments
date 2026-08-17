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

/**
 * Mocks the full re-authentication flow: the first `update-password` call
 * fails with `REAUTH_REQUIRED`, `reauthenticate` then succeeds, and the
 * automatic retry of `update-password` afterward succeeds too.
 */
const mockReauthFlow = () => {
  let updatePasswordAttempts = 0;

  window.fetch = (async (url: string) => {
    if (url.includes("/api/auth/update-password")) {
      updatePasswordAttempts += 1;
      if (updatePasswordAttempts === 1) {
        return new Response(
          JSON.stringify({
            code: "REAUTH_REQUIRED",
            error:
              "For your security, please sign out and sign in again before changing your password.",
          }),
          { status: 403 },
        );
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    if (url.includes("/api/auth/reauthenticate")) {
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
          provider: "password",
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

export const RequiresReauthentication: Story = {
  decorators: [
    (Story) => {
      // Overrides the meta-level mock (which runs first) with the reauth-flow mock.
      mockReauthFlow();
      return <Story />;
    },
  ],
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

    await expect(
      await canvas.findByRole("heading", { name: /confirm your password/i }),
    ).toBeVisible();

    await userEvent.type(
      canvas.getByLabelText("Current password"),
      "old-secret-1",
    );
    await userEvent.click(canvas.getByRole("button", { name: /continue/i }));

    await expect(await canvas.findByText("Password changed.")).toBeVisible();
    await expect(
      canvas.queryByRole("heading", { name: /confirm your password/i }),
    ).not.toBeInTheDocument();
  },
};
