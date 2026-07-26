"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { useState } from "react";

import { makeQueryClient } from "@/lib/query/query-client";

export type QueryProviderProps = {
  children: ReactNode;
};

/**
 * Root TanStack Query provider. Mount once, above `AuthProvider`, in the root layout.
 *
 * The client is created via `useState(() => makeQueryClient())` rather than a
 * module-level singleton, so exactly one `QueryClient` exists per browser session
 * and survives re-renders without leaking state across users on the server.
 *
 * Devtools are only rendered in development and excluded from the production
 * bundle by the `NODE_ENV` check below (dead-code-eliminated at build time).
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
};
