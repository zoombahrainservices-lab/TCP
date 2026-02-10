import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Proxy runs on Node.js runtime by default (no edge runtime support)
// Configure which paths should be processed via the matcher below.
export const config = {
  matcher: [
    // Only run on routes that need auth/processing
    // Exclude: static assets, Next.js internals, API routes, images
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip proxy entirely for prefetch requests (huge win)
  const purpose = request.headers.get('purpose')
  const isNextData = request.headers.get('x-nextjs-data')
  
  if (purpose === 'prefetch' || isNextData) {
    return NextResponse.next()
  }

  const response = NextResponse.next({ request })

  // Public routes - no auth needed
  const publicPaths = [
    '/auth',
    '/onboarding',
    '/',
  ]
  
  const isPublic = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
  
  if (isPublic) {
    return response
  }

  // Protected routes that need auth
  const protectedPaths = ['/dashboard', '/chapter', '/admin', '/settings']
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))
  
  if (!isProtected) {
    // /read/* routes are public content - no auth required
    // This allows ISR caching to work
    return response
  }

  // ============================================
  // FAST PATH: Cookie-only check (1-2ms)
  // ============================================
  
  // Check for Supabase auth cookies (actual cookie names based on project ref)
  const cookieNames = request.cookies.getAll().map(c => c.name)
  const hasAuthToken = cookieNames.some(name => 
    name.includes('sb-') && name.includes('auth-token')
  )
  
  if (!hasAuthToken) {
    // No auth cookie found - redirect to login
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ============================================
  // SLOW PATH: Full validation (200ms) - only for sensitive operations
  // ============================================
  
  const needsValidation = 
    request.method === 'POST' || 
    pathname.includes('/admin') || 
    pathname.includes('/settings')

  if (needsValidation) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}
