import { NextRequest, NextResponse } from 'next/server';

// Daftar route yang wajib login
const protectedRoutes = [
    '/guru_kelas',
    '/guru_bidang_studi',
    '/admin',
];

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    const path = req.nextUrl.pathname;

    // Cek apakah ini route terlindungi
    const isProtected = protectedRoutes.some(route =>
        path.startsWith(route)
    );

    // Jika route terlindungi tapi tidak ada token → redirect ke login
    if (isProtected && !token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Jika sudah login, jangan izinkan akses login
    if (path === '/login' && token) {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.next();
}

// Hanya jalankan middleware untuk halaman (bukan API/asset)
export const config = {
    matcher: [
        '/((?!_next|favicon.ico|api|.*\\.(?:png|jpg|css|js)$).*)',
    ],
};