import { headers } from 'next/headers'

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, '').toLowerCase()
}

const STATIC_ALLOWED = new Set([
  'https://tcplearn.com',
  'https://www.tcplearn.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
])

function allowedOriginsSet(): Set<string> {
  const s = new Set(STATIC_ALLOWED)
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '').toLowerCase()
  if (env) s.add(env)
  return s
}

export function isAllowedOAuthCallbackOrigin(origin: string): boolean {
  return allowedOriginsSet().has(normalizeOrigin(origin))
}

/** Base URL for Google OAuth redirectTo (must match Supabase + Google redirect URI allowlists). */
export async function resolveOAuthRedirectBaseUrl(): Promise<string | undefined> {
  const h = await headers()
  const host =
    h.get('x-forwarded-host')?.split(',')[0]?.trim() || h.get('host')
  if (!host) {
    return fallbackOAuthBaseUrl()
  }
  const proto =
    h.get('x-forwarded-proto')?.split(',')[0]?.trim() ||
    (host.startsWith('localhost') || host.startsWith('127.0.0.1')
      ? 'http'
      : 'https')
  const origin = normalizeOrigin(`${proto}://${host}`)
  if (isAllowedOAuthCallbackOrigin(origin)) {
    return origin
  }
  return fallbackOAuthBaseUrl()
}

function fallbackOAuthBaseUrl(): string | undefined {
  const env = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  if (env) return env
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000'
  return undefined
}
