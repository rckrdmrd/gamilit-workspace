import { QueryClient } from '@tanstack/react-query';

/**
 * Singleton QueryClient instance shared across the application.
 * Exported so non-React code (e.g. Zustand stores) can call
 * queryClient.invalidateQueries() without needing the hook context.
 *
 * Config mirrors the defaults in main.tsx — keep in sync.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache garbage collection (formerly cacheTime)
      retry: 2, // Retry failed requests 2 times
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: true, // Refetch when component mounts
    },
  },
});
