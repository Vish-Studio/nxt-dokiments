import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { useAuthStore } from "@/stores/auth-store";
import { useTemplatesStore } from "@/stores/templates-store";

import { MyTemplatesView } from "../my-templates-view";

const seedUser = () => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.com",
      role: "silver",
      uid: "story-uid",
    },
  });
};

const meta = {
  title: "Dashboard/My Templates View",
  component: MyTemplatesView,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-app-panel p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyTemplatesView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [
    (Story) => {
      seedUser();
      useTemplatesStore.setState({ savedByUser: {} });
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(/no templates yet/i)).toBeVisible();
  },
};

export const WithTemplates: Story = {
  decorators: [
    (Story) => {
      seedUser();
      useTemplatesStore.setState({
        savedByUser: {
          "story-uid": [
            { savedAt: Date.now(), savedId: "saved-1", templateId: "modern-contract" },
          ],
        },
      });
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /preview contract/i })).toBeVisible();
  },
};
