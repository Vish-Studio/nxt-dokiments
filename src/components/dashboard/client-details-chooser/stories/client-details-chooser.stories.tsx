import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";

import { getTemplateById } from "@/lib/market-place";
import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import type { Client } from "@/types/client";
import type { MarketplaceTemplate } from "@/types/template";

import {
  ClientDetailsChooser,
  type ClientMode,
} from "../client-details-chooser";

const invoice = getTemplateById("classic-invoice") as MarketplaceTemplate;

const acme: Client = {
  address: "24 Market Street, Ebene",
  brn: "C09876543",
  companyName: "Acme Co.",
  createdAt: 1,
  email: "accounts@acme.co",
  id: "client_acme",
  name: "Jo Smith",
  nationalId: "",
  phone: "+230 5 987 6543",
  updatedAt: 1,
};

const mockClients = (data: Client[]) => {
  window.fetch = (async () =>
    new Response(JSON.stringify({ clients: data }), {
      status: 200,
    })) as typeof window.fetch;
};

/** Holds the mode like the editor does, so the switch works in the story. */
const Stateful = (props: {
  initialMode: ClientMode;
  onSelect: (client: Client) => void;
}) => {
  const [mode, setMode] = useState<ClientMode>(props.initialMode);
  return (
    <ClientDetailsChooser
      fields={invoice.fields}
      mode={mode}
      onModeChange={setMode}
      onSelect={props.onSelect}
    />
  );
};

const meta = {
  title: "Dashboard/Client Details Chooser",
  component: ClientDetailsChooser,
  tags: ["ai-generated"],
  args: {
    fields: invoice.fields,
    mode: "saved",
    onModeChange: fn(),
    onSelect: fn(),
  },
  parameters: { nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <div className="max-w-lg bg-app-panel p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof ClientDetailsChooser>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Saved client: the question, the switch, then "Choose a client". */
export const SavedClient: Story = {
  decorators: [
    (Story) => {
      mockClients([acme]);
      return <Story />;
    },
  ],
  render: (args) => (
    <Stateful
      initialMode="saved"
      onSelect={args.onSelect}
    />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("Who is this document for?")).toBeVisible();
    await userEvent.click(
      await canvas.findByRole("button", { name: "Choose a client" }),
    );
    await userEvent.click(
      canvas.getByRole("menuitemradio", { name: "Acme Co. accounts@acme.co" }),
    );
    await expect(args.onSelect).toHaveBeenCalledWith(acme);

    // Switching to New client swaps the picker for the save tip.
    await userEvent.click(canvas.getByRole("tab", { name: "New client" }));
    await expect(
      canvas.getByText(/When you press Next, you can save them/),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Choose a client" }),
    ).not.toBeInTheDocument();
  },
};

export const NewClient: Story = {
  args: { mode: "new" },
  decorators: [
    (Story) => {
      mockClients([acme]);
      return <Story />;
    },
  ],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("tab", { name: "New client" }),
    ).toHaveAttribute("aria-selected", "true");
    await userEvent.click(canvas.getByRole("tab", { name: "Saved client" }));
    await expect(args.onModeChange).toHaveBeenCalledWith("saved");
  },
};

/** An NDA-free template with no client block (meeting minutes): nothing shows. */
export const NoClientBlock: Story = {
  args: {
    fields: (
      getTemplateById(
        "classic-meeting-minutes-action-brief",
      ) as MarketplaceTemplate
    ).fields,
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText("Who is this document for?"),
    ).not.toBeInTheDocument();
  },
};

export const Phone: Story = {
  ...SavedClient,
  globals: { viewport: { value: "mobile1", isRotated: false } },
  play: undefined,
};
