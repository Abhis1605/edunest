import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async  function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // If not logged in redirect to login
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    //Role based protection
    if (pathname.startsWith('/dashboard/admin') && token.role !== 'admin'){
        return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    if (pathname.startsWith("/dashboard/teacher") && token.role !== 'teacher') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    if (pathname.startsWith("/dashboard/student") && token.role !== 'student') {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
    }

    if (pathname.startsWith("/dashboard/parent") && token.role !== 'parent') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/setup-profile',
    ]
}