import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "@/components/commons/button/button";
import { useToastStore } from "@/stores/toast-store";

import { Toaster } from "../toaster";

const ToasterDemo = () => {
  const showToast = useToastStore((state) => state.showToast);

  return (
    <div className="p-6">
      <Button
        onClick={() => showToast({ message: "Profile updated.", tone: "success" })}
      >
        Save
      </Button>
      <Toaster />
    </div>
  );
};

const meta = {
  title: "Commons/Toaster",
  component: ToasterDemo,
  tags: ["ai-generated"],
  parameters: { layout: "fullscreen", toaster: false },
  beforeEach: () => useToastStore.getState().clearToasts(),
} satisfies Meta<typeof ToasterDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShowsAndDismisses: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    await expect(await canvas.findByRole("status")).toHaveTextContent(
      "Profile updated.",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Dismiss notification" }),
    );
    await waitFor(() =>
      expect(canvas.queryByRole("status")).not.toBeInTheDocument(),
    );
  },
};
