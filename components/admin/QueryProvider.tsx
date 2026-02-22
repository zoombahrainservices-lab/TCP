'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

// OPTIMIZED: React Query provider for client-side caching
export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30000, // Data is fresh for 30 seconds
        gcTime: 300000, // Cache for 5 minutes (formerly cacheTime)
        refetchOnWindowFocus: false, // Don't refetch on window focus
        retry: 1, // Only retry failed requests once
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
