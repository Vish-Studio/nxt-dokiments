import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, fn, userEvent, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import type { Client } from "@/types/client";
import type { MarketplaceTemplate } from "@/types/template";

import { ClientPicker } from "../client-picker";

/** An invoice — one of the four billing types that also declare toEmail/toPhone/toBrn. */
const invoice = getTemplateById("classic-invoice") as MarketplaceTemplate;
/** Meeting minutes have no counterparty at all, so the picker must not render. */
const meetingMinutes = getTemplateById(
  "classic-meeting-minutes-action-brief",
) as MarketplaceTemplate;

const clients: Client[] = [
  {
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
  {
    // No companyName — the option label falls back to the contact name.
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
];

/** Mocks `GET /api/clients` so `useClientsQuery` resolves with fixture data. */
const mockClients = (data: Client[]) => {
  window.fetch = (async () =>
    new Response(JSON.stringify({ clients: data }), {
      status: 200,
    })) as typeof window.fetch;
};

const meta = {
  title: "Dashboard/Client Picker",
  component: ClientPicker,
  args: { fields: invoice.fields, onSelect: fn() },
  parameters: { nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <div className="max-w-md bg-app-panel p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof ClientPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithClients: Story = {
  decorators: [
    (Story) => {
      mockClients(clients);
      return <Story />;
    },
  ],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const select = await canvas.findByLabelText(
      "Prefill from client (optional)",
    );

    await expect(
      canvas.getByRole("option", { name: "Northline Studio" }),
    ).toBeInTheDocument();
    // Falls back to the contact name when the client has no company.
    await expect(
      canvas.getByRole("option", { name: "Ravi Patel" }),
    ).toBeInTheDocument();

    await userEvent.selectOptions(select, "client_northline_01");
    await expect(args.onSelect).toHaveBeenCalledWith(clients[0]);
  },
};

export const NoClients: Story = {
  decorators: [
    (Story) => {
      mockClients([]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("link", { name: "My clients" }),
    ).toBeVisible();
    await expect(
      canvas.queryByLabelText("Prefill from client (optional)"),
    ).not.toBeInTheDocument();
  },
};

/**
 * A template with no recipient field at all: the picker renders nothing rather
 * than offering a control that could never fill anything.
 */
export const UnsupportedTemplate: Story = {
  args: { fields: meetingMinutes.fields },
  decorators: [
    (Story) => {
      mockClients(clients);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByLabelText("Prefill from client (optional)"),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("link", { name: "My clients" }),
    ).not.toBeInTheDocument();
  },
};
