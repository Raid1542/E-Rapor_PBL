/**
 * Nama File: useAuthRedirect.ts
 * Fungsi: Hook klien untuk melindungi halaman yang memerlukan autentikasi.
 *         Memeriksa keberadaan token di localStorage, dan mengarahkan pengguna
 *         ke halaman login jika belum login. Menyimpan URL asal melalui query parameter
 *         agar setelah login pengguna dapat kembali ke halaman yang dituju.
 * Pembuat: Raid Aqil Athallah - NIM: 3312401022
 * Tanggal: 08 Januari 2026
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const useAuthRedirect = () => {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Hindari eksekusi di sisi server
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('token');
        if (!token) {
            const redirect = encodeURIComponent(pathname);
            router.push(`/login?redirect=${redirect}`);
        }
    }, [router, pathname]);
};