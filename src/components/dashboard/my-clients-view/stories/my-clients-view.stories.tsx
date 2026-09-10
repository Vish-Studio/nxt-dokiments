import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClientProvider } from "@tanstack/react-query";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";

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

    await waitFor(() => {
      expect(canvas.getByText("Ravi Patel")).toBeVisible();
    });
    await expect(canvas.getAllByText("Blue Harbour Ltd")).toHaveLength(2);
  },
};

/**
 * The full preview flow: row -> detail panel -> edit in place -> back to detail
 * with the saved value. `PATCH /api/clients/:id` echoes the merged client back,
 * and the follow-up `GET` returns the persisted list.
 */
export const PreviewAndEditClient: Story = {
  decorators: [
    (Story) => {
      seedUser();
      let stored: Client = mayaChen;

      window.fetch = (async (url: string, init?: RequestInit) => {
        if (init?.method === "PATCH") {
          const patch = JSON.parse(String(init.body)) as Partial<Client>;
          stored = { ...stored, ...patch, updatedAt: 1_755_000_200_000 };
          return new Response(JSON.stringify({ client: stored }), {
            status: 200,
          });
        }

        return new Response(JSON.stringify({ clients: [stored] }), {
          status: 200,
        });
      }) as typeof window.fetch;

      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole("button", {
        name: "View details for Maya Chen",
      }),
    );

    // The core of the feature: fields held on the client but shown in no column.
    const detail = within(
      canvas.getByRole("dialog", { name: "Maya Chen details" }),
    );
    await expect(detail.getByText("C12345678")).toBeVisible();
    await expect(
      detail.getByText("12 Rue La Bourdonnais, Port Louis"),
    ).toBeVisible();

    await userEvent.click(detail.getByRole("button", { name: "Edit client" }));

    const edit = within(canvas.getByRole("dialog", { name: "Edit Maya Chen" }));
    const phone = edit.getByLabelText("Phone number");
    await expect(phone).toHaveValue("+230 5 123 4567");
    // `fireEvent.change`, not `userEvent`: react-hook-form seeds prefilled inputs
    // imperatively via its `ref`, and synthesized keystrokes then update the DOM
    // without React re-firing `onChange`, so the form would submit the old number.
    fireEvent.change(phone, { target: { value: "+230 5 000 1111" } });
    await userEvent.click(edit.getByRole("button", { name: "Save changes" }));

    // Back to detail, showing the new number rather than closing to the list.
    await waitFor(() => {
      expect(
        within(
          canvas.getByRole("dialog", { name: "Maya Chen details" }),
        ).getByText("+230 5 000 1111"),
      ).toBeVisible();
    });
  },
};

/**
 * Regression, end to end: clicking "Edit client" twice — as an impatient user does
 * when a panel seems slow — must land in edit mode and stay there. React reuses
 * that same DOM button for "Save changes", so the second click used to submit the
 * untouched form and drop straight back to detail.
 */
export const DoubleClickingEditStaysInEditMode: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockClients([mayaChen]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole("button", {
        name: "View details for Maya Chen",
      }),
    );

    const editButton = within(
      canvas.getByRole("dialog", { name: "Maya Chen details" }),
    ).getByRole("button", { name: "Edit client" });

    // Hold the same element across both clicks: that reuse is the bug.
    await userEvent.click(editButton);
    await userEvent.click(editButton);

    await expect(
      canvas.getByRole("dialog", { name: "Edit Maya Chen" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("dialog", { name: "Maya Chen details" }),
    ).not.toBeInTheDocument();
  },
};

/** Deleting from the panel closes it first, so only the confirm dialog is on screen. */
export const DeleteFromPanel: Story = {
  decorators: [
    (Story) => {
      seedUser();
      mockClients([mayaChen]);
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole("button", {
        name: "View details for Maya Chen",
      }),
    );
    await userEvent.click(
      within(
        canvas.getByRole("dialog", { name: "Maya Chen details" }),
      ).getByRole("button", { name: "Delete" }),
    );

    await waitFor(() => {
      expect(canvas.getByText("Delete client?")).toBeVisible();
    });
    // Two overlays at once would leave both competing for the Escape key.
    await expect(
      canvas.queryByRole("dialog", { name: "Maya Chen details" }),
    ).not.toBeInTheDocument();
  },
};
