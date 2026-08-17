import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";
import { useClientsStore } from "@/stores/clients-store";

import { MyClientsView } from "../my-clients-view";

const meta = {
  title: "Dashboard/My Clients View",
  component: MyClientsView,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => {
      useAuthStore.setState({
        status: "authenticated",
        user: {
          displayName: "Anthony Alverizko",
          email: "anthony@dokiments.com",
          role: "free",
          uid: "story-user",
        },
      });
      useClientsStore.setState({ clientsByUser: {} });
      return <div className="bg-app-panel p-6"><Story /></div>;
    },
  ],
} satisfies Meta<typeof MyClientsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No clients yet")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Add client" })).toBeVisible();
  },
};
