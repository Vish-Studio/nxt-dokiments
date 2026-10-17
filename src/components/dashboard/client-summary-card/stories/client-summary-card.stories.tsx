import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { ClientSummaryCard } from "../client-summary-card";

const meta = {
  title: "Dashboard/Client Summary Card",
  component: ClientSummaryCard,
  tags: ["ai-generated"],
  decorators: [
    (Story) => (
      <div className="max-w-md bg-base-100 p-6">
        <Story />
      </div>
    ),
  ],
  args: {
    client: {
      address: "24 Market Street, Ebene",
      brn: "C09876543",
      companyName: "Northline Studio",
      createdAt: 1_755_000_000_000,
      email: "accounts@northline.com",
      id: "client_northline_01",
      name: "Maya Chen",
      nationalId: "",
      phone: "+230 5 987 6543",
      updatedAt: 1_755_000_000_000,
    },
  },
} satisfies Meta<typeof ClientSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("region", { name: "Client: Northline Studio" }),
    ).toHaveTextContent("C09876543");
  },
};

/** Optional details the client doesn't have are left out rather than shown blank. */
export const MinimalDetails: Story = {
  args: {
    client: {
      address: "",
      brn: "",
      companyName: "",
      createdAt: 1_754_000_000_000,
      email: "ravi@blueharbour.mu",
      id: "client_ravi_02",
      name: "Ravi Patel",
      nationalId: "",
      phone: "+230 5 111 2222",
      updatedAt: 1_754_000_000_000,
    },
  },
};
