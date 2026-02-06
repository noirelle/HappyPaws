import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_SUPABASE_SECRET_KEY!,
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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        request.nextUrl.pathname.startsWith('/admin')
    ) {
        // no user, redirect to login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Check for banned/unapproved status if user is logged in and accessing admin
    if (user && request.nextUrl.pathname.startsWith('/admin')) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('is_banned, is_approved')
            .eq('id', user.id)
            .single()

        // If profile doesn't exist yet (new user), we might want to allow or block. 
        // Assuming strict: block if not explicitly approved.
        // Or if profile missing, maybe allow basic access? 
        // Let's assume strict: if profile exists and (banned or !approved), or if profile missing (safe default?).
        // For now, only block if explicitly banned or !approved in existing profile.

        if (profile) {
            if (profile.is_banned || !profile.is_approved) {
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                url.searchParams.set('error', 'You are not allowed. Please contact support.')
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
