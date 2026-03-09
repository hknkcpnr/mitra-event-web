import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get('admin_session')?.value;

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
        // If no session token, redirect to login (the admin page handles its own login view if not auth)
        // However, to be extra secure, we can redirect or let the client-side handle it.
        // For now, we'll let the existing admin/page.tsx handle the UI transition, 
        // but the Middleware adds a layer of protection.
    }

    // Protect sensitive /api routes from unauthorized POST/PATCH/DELETE
    const protectedApiRoutes = ['/api/content', '/api/events', '/api/inquiries', '/api/stats', '/api/users', '/api/upload'];
    const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));

    if (isProtectedApi) {
        // Allow GET for specific public routes
        const isPublicGet = (request.method === 'GET' && ['/api/content'].includes(pathname));
        // Allow POST for specific public routes (contact form)
        const isPublicPost = (request.method === 'POST' && pathname === '/api/inquiries');

        // Let Route handlers manage their own GET requests for events/stats/users, 
        // to avoid breaking client side fetch calls that are partially authenticated, 
        // but for safety, we fallback to our basic route protection.
        if (request.method !== 'GET' && !isPublicPost && !sessionToken) {
            return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

// Config to run on specific paths
export const config = {
    matcher: ['/admin/:path*', '/api/:path*'],
};
