import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

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
    address: "19 Market Street, Ebene",
    brn: "C09876544",
    companyName: "Northline Studio",
    createdAt: 1_755_100_000_000,
    email: "maya@northline.com",
    id: "client_northline_02",
    name: "Maya Chen",
    nationalId: "",
    phone: "+230 5 987 6544",
    updatedAt: 1_755_100_000_000,
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

/** Stand-in for the recipient inputs `TemplateForm` passes in as children. */
const recipientInputs = (
  <label className="grid gap-1 text-sm">
    To
    <input
      className="input"
      defaultValue=""
    />
  </label>
);

/** Picking a saved client hides the recipient inputs and shows that client read-only. */
export const WithClients: Story = {
  args: { children: recipientInputs, onClear: fn() },
  decorators: [
    (Story) => {
      mockClients(clients);
      return <Story />;
    },
  ],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", {
      name: "Prefill from client (optional)",
    });

    // Saved client is the default side, so the inputs are not shown.
    await expect(canvas.queryByLabelText("To")).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await expect(
      canvas.getByRole("menuitemradio", {
        name: "Northline Studio accounts@northline.com",
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("menuitemradio", {
        name: "Northline Studio maya@northline.com",
      }),
    ).toBeInTheDocument();
    // Falls back to the contact name when the client has no company.
    await expect(
      canvas.getByRole("menuitemradio", {
        name: "Ravi Patel ravi@blueharbour.mu",
      }),
    ).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("menuitemradio", {
        name: "Northline Studio accounts@northline.com",
      }),
    );

    await expect(args.onSelect).toHaveBeenCalledWith(clients[0]);
    const summary = canvas.getByRole("region", {
      name: "Client: Northline Studio",
    });
    await expect(summary).toHaveTextContent("Maya Chen");
    await expect(summary).toHaveTextContent("accounts@northline.com");
    await expect(trigger).toHaveTextContent(
      "Northline Studio · accounts@northline.com",
    );
  },
};

/** A reopened document whose recipient matches a saved client starts with that client shown. */
export const MatchesSavedClient: Story = {
  args: {
    children: recipientInputs,
    values: { toEmail: "accounts@northline.com", toName: "Northline Studio" },
  },
  decorators: [
    (Story) => {
      mockClients(clients);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByRole("region", { name: "Client: Northline Studio" }),
    ).toBeVisible();
  },
};

/** With no saved clients the section starts on a new client: the inputs, no source cards. */
export const NoClients: Story = {
  args: { children: recipientInputs },
  decorators: [
    (Story) => {
      mockClients([]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByLabelText("To")).toBeVisible();
    await expect(
      canvas.queryByRole("radiogroup", { name: "Client source" }),
    ).not.toBeInTheDocument();
    // Nothing typed yet, so there is nothing to offer to save.
    await expect(
      canvas.queryByRole("button", { name: "Save client" }),
    ).not.toBeInTheDocument();
  },
};

/** Switching to New client clears the recipient and shows the inputs instead of the dropdown. */
export const SwitchToNewClient: Story = {
  args: { children: recipientInputs, onClear: fn() },
  decorators: [
    (Story) => {
      mockClients(clients);
      return <Story />;
    },
  ],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole("radio", { name: /new client/i }),
    );

    await expect(args.onClear).toHaveBeenCalledOnce();
    await expect(canvas.getByLabelText("To")).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Prefill from client (optional)" }),
    ).not.toBeInTheDocument();
  },
};

/** The client `POST /api/clients` returns in the save stories. */
const acme: Client = {
  address: "",
  brn: "",
  companyName: "Acme Co.",
  createdAt: 1_760_000_000_000,
  email: "hello@acme.co",
  id: "client_acme_03",
  name: "Acme Co.",
  nationalId: "",
  phone: "+230 5 555 0101",
  updatedAt: 1_760_000_000_000,
};

/** Mocks the client list (initially `initial`) plus `POST /api/clients`, recording what was sent. */
const mockClientsWithCreate = (initial: Client[], sent: unknown[]) => {
  let list = initial;
  window.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    if (init?.method === "POST") {
      sent.push(JSON.parse(String(init.body)));
      list = [acme, ...list];
      return new Response(JSON.stringify({ client: acme }), { status: 201 });
    }
    return new Response(JSON.stringify({ clients: list }), { status: 200 });
  }) as typeof window.fetch;
};

const sentClients: unknown[] = [];

/**
 * Once a new client's name, email and phone are typed, "Save client" asks for confirmation and
 * then saves straight away — the recipient name doubles as company and contact.
 */
export const SaveNewClient: Story = {
  args: {
    children: recipientInputs,
    onSelect: fn(),
    values: {
      toEmail: "hello@acme.co",
      toName: "Acme Co.",
      toPhone: "+230 5 555 0101",
    },
  },
  decorators: [
    (Story) => {
      sentClients.length = 0;
      mockClientsWithCreate([], sentClients);
      return <Story />;
    },
  ],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(
      await canvas.findByText("Save Acme Co. for next time?"),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Save client" }));

    const dialog = await body.findByRole("dialog", {
      name: "Save Acme Co. to My Clients?",
    });
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Save client" }),
    );

    await waitFor(() => expect(args.onSelect).toHaveBeenCalledWith(acme));
    await expect(sentClients[0]).toMatchObject({
      companyName: "Acme Co.",
      email: "hello@acme.co",
      name: "Acme Co.",
      phone: "+230 5 555 0101",
    });
    // Saved: the section switches to the client's read-only card.
    await expect(
      await canvas.findByRole("region", { name: "Client: Acme Co." }),
    ).toBeVisible();
  },
};

/** A client needs an email and phone to be saved; until then the prompt says what's missing. */
export const MissingDetailsToSave: Story = {
  args: { children: recipientInputs, values: { toName: "Acme Co." } },
  decorators: [
    (Story) => {
      mockClients([]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/add their email and phone above/i),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Save client" }),
    ).toBeDisabled();
  },
};

/** New-client details that already belong to a saved client get a confirmation, not a prompt. */
export const AlreadySaved: Story = {
  args: {
    children: recipientInputs,
    values: { toEmail: "accounts@northline.com", toName: "Northline Studio" },
  },
  decorators: [
    (Story) => {
      mockClients(clients);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole("radio", { name: /new client/i }),
    );
    // Switching sides clears the recipient (onClear), so the parent would re-render with empty
    // values; here `values` stays fixed, which is exactly the "typed an existing client" case.
    await expect(
      await canvas.findByText("Northline Studio is already in My Clients."),
    ).toBeVisible();
  },
};

/**
 * A template with no recipient field at all: the picker renders only its children rather
 * than offering a control that could never fill anything.
 */
export const UnsupportedTemplate: Story = {
  args: { children: recipientInputs, fields: meetingMinutes.fields },
  decorators: [
    (Story) => {
      mockClients(clients);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("To")).toBeVisible();
    await expect(
      canvas.queryByRole("radiogroup", { name: "Client source" }),
    ).not.toBeInTheDocument();
  },
};
