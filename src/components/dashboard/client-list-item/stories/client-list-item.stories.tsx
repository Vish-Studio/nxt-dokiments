import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { Client } from "@/types/client";

import { ClientListItem } from "../client-list-item";

const mayaChen: Client = {
  address: "12 Rue La Bourdonnais, Port Louis",
  brn: "C12345678",
  companyName: "Northline Studio",
  createdAt: 1_755_000_000_000,
  email: "maya@northline.com",
  id: "client_abc_123456",
  name: "Maya Chen",
  nationalId: "A1234567890123",
  phone: "+230 5 123 4567",
  updatedAt: 1_755_000_000_000,
};

const meta = {
  title: "Dashboard/Client List Item",
  component: ClientListItem,
  decorators: [
    (Story) => (
      <ul className="overflow-hidden rounded-box border border-steel-mist bg-base-100">
        <Story />
      </ul>
    ),
  ],
  args: {
    client: mayaChen,
    onDelete: fn(),
    onPreview: fn(),
  },
} satisfies Meta<typeof ClientListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Maya Chen")).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "View details for Maya Chen" }),
    );
    await expect(args.onPreview).toHaveBeenCalledOnce();

    // Delete sits above the row overlay, so it must fire without also previewing.
    await userEvent.click(
      canvas.getByRole("button", { name: "Delete Maya Chen" }),
    );
    await expect(args.onDelete).toHaveBeenCalledOnce();
    await expect(args.onPreview).toHaveBeenCalledOnce();
  },
};

/** A client with only the required fields — optional columns fall back to placeholders. */
export const MinimalDetails: Story = {
  args: {
    client: {
      ...mayaChen,
      address: "",
      brn: "",
      nationalId: "",
      phone: "",
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No phone")).toBeVisible();
  },
};

/**
 * A client whose `POST` is still in flight: its ID is a local placeholder, so
 * neither `PATCH` nor `DELETE` would resolve. The row offers no actions until the
 * refetch swaps in the server-assigned ID.
 */
export const Optimistic: Story = {
  args: {
    client: { ...mayaChen, id: "optimistic-client-1755000000000" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole("button", { name: "View details for Maya Chen" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Delete Maya Chen" }),
    ).toBeDisabled();
  },
};
