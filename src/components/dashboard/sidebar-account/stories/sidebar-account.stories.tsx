import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";

import SidebarAccount from "../sidebar-account";

const meta = {
  title: "Dashboard/Sidebar Account",
  component: SidebarAccount,
  tags: ["ai-generated"],
  parameters: { layout: "centered" },
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
      return (
        <div className="w-60 bg-app-chrome p-4">
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof SidebarAccount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Anthony Alverizko")).toBeVisible();
    await expect(canvas.getByText("AA")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: /log out/i }),
    ).toBeVisible();
  },
};

export const Collapsed: Story = {
  args: { isCollapsed: true },
};

export const SignedOut: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({ status: "unauthenticated", user: null });
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Dokiments User")).toBeVisible();
    await expect(canvas.queryByText("AA")).not.toBeInTheDocument();
  },
};

/**
 * Regression test for a real bug: `SidebarAccount` is a direct child of a
 * `grid` container in `Sidebar.tsx` (not the fixed-width `w-60` div the other
 * stories decorate with). Grid items default to a content-based minimum
 * width, and `truncate`'s `whitespace-nowrap` makes that minimum unshrinkable
 * — so a long, unbroken name/email grew the whole box past the sidebar's
 * width instead of truncating, spilling into the page content beside it.
 * Fixed by adding `min-w-0` to the component's root element.
 */
export const LongUserDetails: Story = {
  decorators: [
    (Story) => {
      useAuthStore.setState({
        status: "authenticated",
        user: {
          displayName: "Divesh Heeramun Alexandropoulos-Whitfield",
          email:
            "divesh.heeramun.this.is.an.extremely.long.test.address@some-very-long-example-domain-name.com",
          provider: "password",
          role: "free",
          uid: "story-uid",
        },
      });
      return (
        <div className="grid w-60 bg-app-chrome p-4">
          <Story />
        </div>
      );
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nameElement = canvas.getByText(/Divesh Heeramun/);

    await expect(nameElement).toBeVisible();
    await expect(nameElement.scrollWidth).toBeGreaterThan(nameElement.offsetWidth);
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
