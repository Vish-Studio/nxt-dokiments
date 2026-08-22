import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { trackEvent } from "@/lib/analytics/track";
import { queryKeys } from "@/lib/query/keys";
import type { Client, ClientInput } from "@/types/client";

const fetchClients = async (): Promise<Client[]> => {
  const response = await fetch("/api/clients");

  if (!response.ok) {
    throw new Error("Unable to load your clients.");
  }

  const data = (await response.json()) as { clients: Client[] };
  return data.clients;
};

/**
 * The signed-in user's client book, newest first.
 *
 * Shared by every screen that reads clients (My Clients, the Dashboard snapshot
 * tile, and the document editor's client picker) — they all resolve to the same
 * cache entry, so adding or removing a client in one place is reflected in the
 * others without any explicit cross-component wiring.
 */
export const useClientsQuery = () =>
  useQuery({
    queryKey: queryKeys.clients.all(),
    queryFn: fetchClients,
    staleTime: 60_000,
  });

/** Error shape returned by the clients API on a non-2xx response. */
type ClientsApiError = { error: string };

/**
 * Marks a client that exists only in the cache while its `POST` is in flight.
 * The real ID is assigned by the server, so the optimistic row carries a
 * recognisable placeholder until `onSettled`'s refetch replaces it.
 */
const OPTIMISTIC_ID_PREFIX = "optimistic-client-";

/** `true` for a client that hasn't been persisted yet — its row should not offer actions. */
export const isOptimisticClient = (client: Client) =>
  client.id.startsWith(OPTIMISTIC_ID_PREFIX);

const postClient = async (input: ClientInput): Promise<Client> => {
  const response = await fetch("/api/clients", {
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const data = (await response.json()) as {
    client: Client;
  } & Partial<ClientsApiError>;

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to add this client.");
  }

  return data.client;
};

/**
 * Adds a client to the user's book.
 *
 * Optimistically prepends the new client so the list updates the moment the side
 * panel closes — the form already holds every field the row displays, so there's
 * nothing to wait for. The server-assigned ID arrives with the refetch in
 * `onSettled`; until then the row carries a placeholder ID (see
 * `isOptimisticClient`). Rolls back to the pre-mutation list on failure.
 */
export const useCreateClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postClient,
    onMutate: async (input) => {
      const key = queryKeys.clients.all();
      const previous = queryClient.getQueryData<Client[]>(key);
      const now = Date.now();

      const optimistic: Client = {
        ...input,
        createdAt: now,
        id: `${OPTIMISTIC_ID_PREFIX}${now}`,
        updatedAt: now,
      };

      queryClient.setQueryData<Client[]>(key, (current) => [
        optimistic,
        ...(current ?? []),
      ]);

      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(queryKeys.clients.all(), context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.clients.all(),
      });
    },
    onSuccess: (client) => {
      // Field *names* and presence flags only — a client's name, email and phone
      // are personal data and must not be sent to analytics.
      trackEvent("client_created", { has_address: Boolean(client.address) });
    },
  });
};

/** A partial update to an existing client. At least one field must be provided. */
export type UpdateClientInput = Partial<ClientInput>;

const patchClient = async (
  clientId: string,
  patch: UpdateClientInput,
): Promise<Client> => {
  const response = await fetch(`/api/clients/${clientId}`, {
    body: JSON.stringify(patch),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  });

  const data = (await response.json()) as {
    client: Client;
  } & Partial<ClientsApiError>;

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to save changes to this client.");
  }

  return data.client;
};

/**
 * Updates a client's details.
 *
 * Optimistically applies the patch to the cached list, rolling back on failure.
 * Keeping stored clients editable matters for the document editor: a client whose
 * phone number is stale would otherwise have to be deleted and re-added to make
 * future documents prefill correctly.
 */
export const useUpdateClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clientId,
      patch,
    }: {
      clientId: string;
      patch: UpdateClientInput;
    }) => patchClient(clientId, patch),
    onMutate: async ({ clientId, patch }) => {
      const key = queryKeys.clients.all();
      const previous = queryClient.getQueryData<Client[]>(key);

      queryClient.setQueryData<Client[]>(
        key,
        (current) =>
          current?.map((client) =>
            client.id === clientId ? { ...client, ...patch } : client,
          ) ?? [],
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKeys.clients.all(), context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.clients.all(),
      });
    },
    onSuccess: (_client, { patch }) => {
      trackEvent("client_updated", {
        fields_updated: Object.entries(patch)
          .filter(([, value]) => value !== undefined)
          .map(([field]) => field)
          .join(","),
      });
    },
  });
};

const deleteClientRequest = async (clientId: string): Promise<void> => {
  const response = await fetch(`/api/clients/${clientId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Unable to delete this client.");
  }
};

/**
 * Removes a client from the user's book.
 *
 * Optimistically drops it from the cached list, rolling back on failure. Documents
 * already prepared for this client are unaffected — their recipient details were
 * copied in at fill time rather than referenced.
 */
export const useDeleteClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) => deleteClientRequest(clientId),
    onMutate: async (clientId) => {
      const key = queryKeys.clients.all();
      const previous = queryClient.getQueryData<Client[]>(key);

      queryClient.setQueryData<Client[]>(
        key,
        (current) => current?.filter((client) => client.id !== clientId) ?? [],
      );

      return { previous };
    },
    onError: (_error, _clientId, context) => {
      queryClient.setQueryData(queryKeys.clients.all(), context?.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.clients.all(),
      });
    },
    onSuccess: () => {
      trackEvent("client_deleted", {});
    },
  });
};
