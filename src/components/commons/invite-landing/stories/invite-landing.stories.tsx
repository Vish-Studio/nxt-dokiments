import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";

import { InviteLanding } from "../invite-landing";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const user = {
  displayName: "Sam",
  email: "sam@example.com",
  emailVerified: false,
  provider: "password",
  role: "free",
  uid: "sam-uid",
};

const mockApi = ({
  accept,
  preview,
  signedIn,
}: {
  accept?: () => Response;
  preview: unknown;
  signedIn: boolean;
}) => {
  window.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/auth/me")) {
      return signedIn ? json({ user }) : json({ error: "No session" }, 401);
    }
    if (url.endsWith("/accept")) return accept ? accept() : json({}, 500);
    return json(preview);
  }) as typeof window.fetch;
};

const valid = {
  invite: {
    name: "Website redesign NDA",
    ownerEmail: "alex@example.com",
    ownerName: "Alex Morgan",
  },
  state: "valid",
};

const meta = {
  title: "Commons/Invite Landing",
  component: InviteLanding,
  tags: ["ai-generated"],
  args: { token: "story-token" },
  parameters: { nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <div className="max-w-md p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof InviteLanding>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A visitor without a session sees the preview and the way in. */
export const SignedOut: Story = {
  decorators: [
    (Story) => {
      mockApi({ preview: valid, signedIn: false });
      return <Story />;
    },
  ],
  play: async ({ canvas }) => {
    await expect(await canvas.findByText("Website redesign NDA")).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Sign up to sign" }),
    ).toHaveAttribute("href", "/sign-up?next=%2Fshared%2Fstory-token");
    await expect(canvas.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in?next=%2Fshared%2Fstory-token",
    );
  },
};

export const Expired: Story = {
  decorators: [
    (Story) => {
      mockApi({ preview: { state: "expired" }, signedIn: false });
      return <Story />;
    },
  ],
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("This invitation has expired"),
    ).toBeVisible();
  },
};

export const Invalid: Story = {
  decorators: [
    (Story) => {
      mockApi({ preview: { state: "invalid" }, signedIn: false });
      return <Story />;
    },
  ],
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("This invitation is no longer valid"),
    ).toBeVisible();
  },
};

/** Signed in as someone the invitation was not sent to. */
export const WrongAccount: Story = {
  decorators: [
    (Story) => {
      mockApi({
        accept: () =>
          json(
            {
              error: "This invitation was sent to a different email address.",
              invitedEmail: "j***@example.com",
            },
            403,
          ),
        preview: valid,
        signedIn: true,
      });
      return <Story />;
    },
  ],
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByText("This invitation is for someone else"),
    ).toBeVisible();
    await expect(canvas.getByText(/j\*\*\*@example\.com/)).toBeVisible();
  },
};
