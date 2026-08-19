import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";

import { makeStoryQueryClient } from "@/lib/query/story-query-client";
import { useAuthStore } from "@/stores/auth-store";
import type { Client } from "@/types/client";

import { MyClientsView } from "../my-clients-view";

const seedUser = () => {
  useAuthStore.setState({
    status: "authenticated",
    user: {
      displayName: "Anthony Alverizko",
      email: "anthony@dokiments.com",
      provider: "password",
      role: "free",
      uid: "story-user",
    },
  });
};

const mayaChen: Client = {
  address: "12 Rue La Bourdonnais, Port Louis",
  brn: "C12345678",
  companyName: "Northline Studio",
  createdAt: 1_755_000_000_000,
  email: "maya@northline.com",
  id: "client_abc_123456",
  name: "Maya Chen",
  nationalId: "",
  phone: "+230 5 123 4567",
  updatedAt: 1_755_000_000_000,
};

/** Mocks `GET /api/clients` so `useClientsQuery` resolves with fixture data. */
const mockClients = (clients: Client[]) => {
  window.fetch = (async () =>
    new Response(JSON.stringify({ clients }), {
      status: 200,
    })) as typeof window.fetch;
};

const meta = {
  title: "Dashboard/My Clients View",
  component: MyClientsView,
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <QueryClientProvider client={makeStoryQueryClient()}>
        <div className="bg-app-panel p-6">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof MyClientsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockClients([]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("No clients yet")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Add client" }),
    ).toBeVisible();
  },
};

export const WithClients: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockClients([mayaChen]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("Maya Chen")).toBeVisible();
    await expect(canvas.getByText("maya@northline.com")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Delete Maya Chen" }),
    ).toBeVisible();
  },
};

/** Mocks a request that never resolves so `isLoading` stays `true` and the skeleton renders. */
const mockClientsLoading = () => {
  window.fetch = (async () =>
    new Promise<Response>(() => {})) as typeof window.fetch;
};

export const Loading: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockClientsLoading();
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("status", { name: /loading your clients/i }),
    ).toBeInTheDocument();
  },
};

/** Mocks a failing `GET /api/clients` so the error branch renders instead of the empty state. */
const mockClientsError = () => {
  window.fetch = (async () =>
    new Response(JSON.stringify({ error: "Nope." }), {
      status: 500,
    })) as typeof window.fetch;
};

export const LoadFailed: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockClientsError();
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText(/couldn't load your clients/i),
    ).toBeVisible();
    // The empty state must not stand in for a failed load — it would read as
    // "your clients are gone" rather than "we couldn't reach the server".
    await expect(canvas.queryByText("No clients yet")).not.toBeInTheDocument();
  },
};

/**
 * Fills and submits the add-client form, asserting the optimistic row appears.
 * `POST /api/clients` echoes the created client back with a server-assigned ID;
 * the subsequent `GET` refetch returns the persisted list.
 */
export const AddClient: Story = {
  decorators: [
    (Story) => {
      seedUser();
      const created: Client[] = [];

      window.fetch = (async (url: string, init?: RequestInit) => {
        if (init?.method === "POST") {
          const input = JSON.parse(String(init.body)) as Client;
          const client: Client = {
            ...input,
            createdAt: 1_755_000_100_000,
            id: "client_new_000001",
            updatedAt: 1_755_000_100_000,
          };
          created.push(client);
          return new Response(JSON.stringify({ client }), { status: 201 });
        }

        return new Response(JSON.stringify({ clients: created }), {
          status: 200,
        });
      }) as typeof window.fetch;

      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText("No clients yet")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add client" }));

    // Scoped to the panel: the floating action button and the panel's submit
    // button share the accessible name "Add client" while the panel is open.
    const panel = within(canvas.getByRole("dialog", { name: "Add client" }));

    await userEvent.type(panel.getByLabelText("Client name"), "Ravi Patel");
    await userEvent.type(panel.getByLabelText("Company"), "Blue Harbour Ltd");
    await userEvent.type(panel.getByLabelText("Email"), "ravi@blueharbour.mu");
    await userEvent.type(
      panel.getByLabelText("Phone number"),
      "+230 5 987 6543",
    );
    await userEvent.click(panel.getByRole("button", { name: "Add client" }));

    await expect(await canvas.findByText("Ravi Patel")).toBeVisible();
    await expect(canvas.getAllByText("Blue Harbour Ltd")).toHaveLength(2);
  },
};
