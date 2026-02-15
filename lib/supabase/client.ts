import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/** Single shared client for the browser session. Avoids useMemo(createClient) in components and prevents hook-order issues on fast navigation. */
let browserClient: ReturnType<typeof createClient> | null = null
export function getClient() {
  if (!browserClient) browserClient = createClient()
  return browserClient
}
