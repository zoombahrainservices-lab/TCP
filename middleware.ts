import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

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

  // This validates / refreshes the session if needed
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // DEBUG: Log middleware session state (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Session check:', {
      path: request.nextUrl.pathname,
      hasUser: !!user,
      userId: user?.id,
      hasCookies: request.cookies.getAll().length > 0,
      error: error?.message
    })
  }

  return response
}

export const config = {
  // Exclude API routes so /api/* is never touched by middleware (fixes 404 on Vercel)
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
