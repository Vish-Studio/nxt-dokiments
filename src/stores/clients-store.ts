"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Client, ClientInput } from "@/types/client";

type ClientsState = {
  addClient: (userId: string, input: ClientInput) => void;
  clientsByUser: Record<string, Client[]>;
  removeClient: (userId: string, clientId: string) => void;
};

const createClientId = () =>
  `client-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Local-only client list. Entries persist in browser storage and are grouped by
 * Firebase user ID so a future Firestore adapter can replace the actions without
 * changing the dashboard components.
 */
export const useClientsStore = create<ClientsState>()(
  persist(
    (set) => ({
      addClient: (userId, input) => {
        const client: Client = {
          ...input,
          createdAt: Date.now(),
          id: createClientId(),
        };

        set((state) => ({
          clientsByUser: {
            ...state.clientsByUser,
            [userId]: [client, ...(state.clientsByUser[userId] ?? [])],
          },
        }));
      },
      clientsByUser: {},
      removeClient: (userId, clientId) =>
        set((state) => ({
          clientsByUser: {
            ...state.clientsByUser,
            [userId]: (state.clientsByUser[userId] ?? []).filter(
              (client) => client.id !== clientId,
            ),
          },
        })),
    }),
    { name: "dokiments-clients-v1" },
  ),
);
