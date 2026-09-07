import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent } from "storybook/test";

import { ClientList } from "../client-list";

const meta = {
  title: "Dashboard/Client List",
  component: ClientList,
  args: { onDelete: fn(), onPreview: fn() },
} satisfies Meta<typeof ClientList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { clients: [] },
};

export const WithClients: Story = {
  args: {
    clients: [
      {
        address: "12 Rue La Bourdonnais, Port Louis",
        brn: "C12345678",
        companyName: "Northline Studio",
        createdAt: Date.now(),
        email: "maya@northline.com",
        id: "client_abc_123456",
        name: "Maya Chen",
        nationalId: "A1234567890123",
        phone: "+230 5 123 4567",
        updatedAt: Date.now(),
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Maya Chen")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Delete Maya Chen" }),
    ).toHaveClass("btn-error");

    // The row itself opens the detail panel — the reason this list is clickable.
    await userEvent.click(
      canvas.getByRole("button", { name: "View details for Maya Chen" }),
    );
    await expect(meta.args.onPreview).toHaveBeenCalledOnce();
  },
};
