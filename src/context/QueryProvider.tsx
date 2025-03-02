"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new client
    return new QueryClient();
  }
  if (!queryClient) {
    // Client: make a new client if we don't have one
    queryClient = new QueryClient();
  }
  return queryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}
