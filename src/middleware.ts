import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Create client with cookie handling for middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected Routes Logic
    const path = request.nextUrl.pathname

    // Bypass auth for localhost
    if (request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1') {
        return supabaseResponse
    }

    const isProtectedPath = path.startsWith('/dashboard') || path.startsWith('/courses') || path.startsWith('/profile')
    const isAuthPath = path === '/login' || path === '/signup'

    // Redirect to login if accessing protected route without user
    if (!user && isProtectedPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        // Optional: Add ?next=path to redirect back after login
        // url.searchParams.set('next', path) 
        return NextResponse.redirect(url)
    }

    // Redirect to dashboard if accessing login while already logged in
    if (user && isAuthPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
